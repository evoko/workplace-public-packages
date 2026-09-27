/**
 * The workbench service's state and operations (scripts/workbench.mjs serves them over HTTP): one
 * at a time, every effect injected, so a test runs it on files in memory. Any component may be
 * inspected; what may be changed, reported and approved follows the circles
 * (docs/engineering/architecture.md, The workbench), and the bar offers Inspect on the
 * same terms: a component 🟡 on both platforms (or absent from one) may be changed and reported on;
 * 🟢 on either is locked; 🔴 on either waits on the components it uses.
 *
 * A look change is one overlay `set` entry, written with the placeholder reason and previewed with
 * `solar:codegen --pending`, until Keep writes a person's reason or Undo puts the file back byte for
 * byte. One such pending edit exists at a time, saved before the overlay is written, with the
 * file's bytes before it, as Set wrote it (`placeholder`) and as Keep left it (`after`), so Undo
 * survives a restart and nothing the session does overwrites an edit someone else made since.
 */

import { parse } from 'yaml';
import { entryText, lookupCell } from '../explain/index.mjs';
import { PLATFORMS } from '../approvals/graph.mjs';
import { PLACEHOLDER } from '../normalize/overlay.mjs';
import {
  withApproval,
  withdrawnBy,
  withoutApprovals,
} from './approvals-edit.mjs';
import { capFailures, MAX_FAILURES } from './checks.mjs';
import { noteFile, noteText } from './feedback.mjs';
import { builtOf, inspect as inspectOf, revisionOf } from './inspect.mjs';
import { borrowersOf, readSetEntry, writeSetEntry } from './overlay-edit.mjs';
import { scopesFor } from './scopes.mjs';

/** A refusal, with the HTTP status the service answers it with. */
export class WorkbenchError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const refuse = (message, status = 409) => {
  throw new WorkbenchError(status, message);
};

const TITLES = { web: 'web', flutter: 'Flutter' };
const VIEWER = { web: 'Storybook', flutter: 'Widgetbook' };

/** Whether an IR entry says what a set value says. */
const same = (entry, value) =>
  Boolean(
    entry &&
    ((value.token !== undefined && entry.token === value.token) ||
      (value.keyword !== undefined && entry.keyword === value.keyword) ||
      (value.none === true && entry.none === true)),
  );

/** The IR entry at a scope's path, for one layer and cell, or undefined. */
const entryAt = (spec, layer, cell, path) =>
  path.reduce((node, key) => node?.[key], spec.style[layer])?.[cell];

/** A set value as exactly one of `{ token }`, `{ keyword }` or `{ none: true }`. */
const plainValue = (value) =>
  value.token !== undefined
    ? { token: value.token }
    : value.keyword !== undefined
      ? { keyword: value.keyword }
      : { none: true };

/** The longest note a person may write, in characters. */
export const MAX_NOTE = 10_000;

const FAILURE_TEXT = ['variant', 'layer', 'property', 'message'];
const FAILURE_SEEN = ['figma', 'drawn'];

/** A small JSON value a check measured: a scalar, or a list of them (a dash pattern, the fills). */
const isScalar = (v) =>
  v === null ||
  typeof v === 'string' ||
  typeof v === 'boolean' ||
  (typeof v === 'number' && Number.isFinite(v));
const isSeen = (v) =>
  isScalar(v) ||
  (Array.isArray(v) && v.every((x) => x !== null && isScalar(x)));

/** Whether `f` is a Failure of the HTTP contract, with no key it lacks. */
const isFailure = (f) =>
  f !== null &&
  typeof f === 'object' &&
  !Array.isArray(f) &&
  ['web', 'flutter', 'parity'].includes(f.platform) &&
  Object.entries(f).every(
    ([k, v]) =>
      k === 'platform' ||
      (FAILURE_TEXT.includes(k) && typeof v === 'string') ||
      (FAILURE_SEEN.includes(k) && isSeen(v)),
  );

/** The last lines of a command's output, as one line. */
const tail = (output) =>
  String(output ?? '')
    .trim()
    .split('\n')
    .slice(-5)
    .join(' ');

/**
 * @param {object} deps every effect the session has:
 * @param {{read: (path: string) => string | null, write: (path: string, text: string) => void,
 *   remove: (path: string) => void, list: (dir: string) => string[]}} deps.files the repository's
 *   files, by path from its root (`list`: the names of a directory's files, none where it is absent)
 * @param {(name: string) => string} deps.overlayPath a component's overlay file
 * @param {string} deps.approvalsPath spec/approvals.yaml
 * @param {string} deps.pendingPath where the pending edit is saved
 * @param {string} deps.feedbackDir spec/feedback, where a Report or Send to agent note is written
 * @param {() => {built: object[], tokens: object}} deps.build `stage.build()` as the files are now
 * @param {(o: {pending: boolean}) => Promise<{ok: boolean, output: string}>} deps.codegen
 *   `solar:codegen`, with `--pending` while an edit is pending
 * @param {() => Promise<{coloured: object, approvals: object}>} deps.status `solar:status`'s colours
 *   (`colour(scan(), approvals)`) and the approvals record
 * @param {(name: string) => Promise<{ok: boolean, failures: object[]}>} deps.checks a component's
 *   own checks
 * @param {() => void} deps.reload tells the viewers to reload what was regenerated
 * @param {() => string | null} deps.userName who approves (`git config user.name`), null where unset
 * @param {() => string} deps.today the date, `YYYY-MM-DD`
 * @param {(event: {type: string, message?: string}) => void} deps.emit tells the viewers
 */
export function createSession(deps) {
  const { files } = deps;
  let queue = Promise.resolve();
  let busy = null;
  let pending = (() => {
    const text = files.read(deps.pendingPath);
    if (!text) return null;
    const unreadable = (why) =>
      new Error(
        `${deps.pendingPath} is not the workbench's pending edit (${why}): restore the overlay it names from git if needed, then delete this file`,
      );
    let p;
    try {
      p = JSON.parse(text);
    } catch (error) {
      throw unreadable(error.message);
    }
    const missing = [
      'component',
      'key',
      'before',
      'placeholder',
      'after',
    ].filter((field) => typeof p?.[field] !== 'string');
    if (missing.length) throw unreadable(`no ${missing.join(', ')}`);
    return p;
  })();

  /** Tells the viewers; a viewer that cannot be told never changes an operation's outcome. */
  const tell = (event) => {
    try {
      deps.emit(event);
    } catch {
      // The viewers refetch on their next event or poll.
    }
  };

  /**
   * Runs `fn` after every earlier operation, telling the viewers while it runs, and why it failed
   * where it did. A failed operation never holds up the next.
   */
  const serial = (message, fn) => {
    const run = queue.then(async () => {
      try {
        busy = message;
        tell({ type: 'busy', message });
        return await fn();
      } catch (error) {
        tell({ type: 'failed', message: error.message });
        throw error;
      } finally {
        busy = null;
        tell({ type: 'changed' });
      }
    });
    queue = run.catch(() => {});
    return run;
  };

  /** The pending edit, on disk first, so the session never holds one the disk does not. */
  const savePending = (p) => {
    if (p) files.write(deps.pendingPath, `${JSON.stringify(p, null, 2)}\n`);
    else files.remove(deps.pendingPath);
    pending = p;
  };

  /** What a component may do, from its colours on both platforms. */
  const gateOf = (coloured, name) => {
    const colours = Object.fromEntries(
      PLATFORMS.map((p) => [
        p,
        coloured[p]?.find((c) => c.name === name) ?? null,
      ]),
    );
    const green = PLATFORMS.filter((p) => colours[p]?.colour === 'green');
    const red = PLATFORMS.filter((p) => colours[p]?.colour === 'red');
    let locked = null;
    if (green.length)
      locked = `approved on ${green.map((p) => TITLES[p]).join(' and ')}: undo its approval in ${green.map((p) => VIEWER[p]).join(' and ')} to change it`;
    else if (red.length)
      locked = red
        .map((p) => `waits on ${colours[p].waitsOn.join(', ')} on ${TITLES[p]}`)
        .join('; ');
    return {
      web: colours.web?.colour ?? null,
      flutter: colours.flutter?.colour ?? null,
      waitsOn: Object.fromEntries(
        PLATFORMS.map((p) => [p, colours[p]?.waitsOn ?? []]),
      ),
      editable: locked === null && PLATFORMS.some((p) => colours[p]),
      locked,
    };
  };

  const statusNow = async () => {
    const { coloured } = await deps.status();
    const names = [
      ...new Set(
        PLATFORMS.flatMap((p) => (coloured[p] ?? []).map((c) => c.name)),
      ),
    ];
    return {
      busy,
      pending: pending && {
        component: pending.component,
        key: pending.key,
        value: pending.value,
        deletes: pending.deletes,
        previousReason: pending.previousReason,
        borrowers: pending.borrowers ?? [],
        failing: pending.failing ?? null,
      },
      components: Object.fromEntries(
        names.map((n) => [n, gateOf(coloured, n)]),
      ),
    };
  };

  const mustEdit = async (name) => {
    const { coloured } = await deps.status();
    const gate = gateOf(coloured, name);
    if (!PLATFORMS.some((p) => gate[p]))
      refuse(`${name} is not a component either viewer shows`, 400);
    if (!gate.editable) refuse(`${name}: ${gate.locked}`);
    return coloured;
  };

  /** Refuses a platform other than the two. */
  const mustBePlatform = (platform) => {
    if (!PLATFORMS.includes(platform))
      refuse(`${platform} is not a platform: web or flutter`, 400);
  };

  /** The approvals that hold in `coloured`, as `Name (platform)`. */
  const heldIn = (coloured) =>
    PLATFORMS.flatMap((p) =>
      (coloured[p] ?? [])
        .filter((c) => c.colour === 'green')
        .map((c) => `${c.name} (${p})`),
    );

  const overlayText = (name) => files.read(deps.overlayPath(name)) ?? '';

  /** Refuses to write over an overlay someone else changed since the session wrote it. */
  const changedOnDisk = (path) =>
    refuse(
      `${path} changed on disk since the edit: reload, or resolve it by hand and delete ${deps.pendingPath}`,
    );

  /**
   * Puts the overlay back as it was before the pending edit, and regenerates: only where it holds
   * one of the texts the session wrote (`wrote`), or is already back.
   */
  const restore = async (p, wrote) => {
    const path = deps.overlayPath(p.component);
    const disk = files.read(path);
    if (disk !== p.before && !wrote.includes(disk)) changedOnDisk(path);
    files.write(path, p.before);
    const generated = await deps.codegen({ pending: false });
    if (!generated.ok)
      refuse(
        `the overlay is back, but regenerating failed: ${tail(generated.output)}; press Undo again`,
        500,
      );
    deps.reload();
  };

  /**
   * The pending edit on `name`, and its overlay as it is on disk: refused where there is none, or
   * where the file holds neither text the edit left (an editor or an agent changed it since), which
   * Keep and Undo would overwrite. Undo also takes a file already back as it was (a restore whose
   * regeneration failed, or a Set stopped before it wrote); Keep says to press it.
   */
  const pendingOn = (name, { undoing = false } = {}) => {
    if (!pending || pending.component !== name)
      refuse(`${name} has no pending edit`);
    const path = deps.overlayPath(name);
    const disk = files.read(path);
    if (disk !== pending.placeholder && disk !== pending.after) {
      if (disk !== pending.before) changedOnDisk(path);
      if (!undoing)
        refuse(`the edit is no longer in ${path}: press Undo to clear it`);
    }
    return { p: pending, path, disk };
  };

  /** A component's inspection; a variant it lacks is the request's fault. */
  const inspectNow = (build, name, index, text) => {
    try {
      return inspectOf(build, name, Number(index), { overlayText: text });
    } catch (error) {
      return refuse(error.message, 400);
    }
  };

  /**
   * Refuses a value the inspection does not offer for the cell: a token not among its choices, a
   * keyword not among its keywords, `none` where it says none may not be set, and anything at all
   * on a raw value the overlay allows (its note says so).
   */
  const mustOffer = (at, found, value) => {
    const nothing =
      !found.none && !found.choices.length && !found.keywords.length;
    if (nothing)
      refuse(`${at} is ${found.note ?? 'not a cell a set may change'}`, 400);
    if (value?.token !== undefined) {
      if (!found.choices.some((t) => t.name === value.token))
        refuse(`${value.token} is not offered for ${at}`, 400);
    } else if (value?.keyword !== undefined) {
      if (!found.keywords.includes(value.keyword))
        refuse(`${value.keyword} is not offered for ${at}`, 400);
    } else if (value?.none === true) {
      if (!found.none) refuse(`none is not offered for ${at}`, 400);
    } else refuse('a value is a token, a keyword or none', 400);
  };

  return {
    status: statusNow,

    inspect: (name, variant) =>
      inspectNow(deps.build(), name, variant, overlayText(name)),

    set: (body) =>
      serial('Regenerating…', async () => {
        const {
          component: name,
          variant: index,
          layer,
          cell,
          scope,
          revision,
        } = body;
        if (pending)
          refuse(`keep or undo the pending edit on ${pending.component} first`);
        const coloured = await mustEdit(name);
        const path = deps.overlayPath(name);
        const before = files.read(path);
        // Every component has one; which name heads a new one (its Figma address) is a person's call.
        if (before === null)
          refuse(`${name} has no overlay file: add one by hand first`);
        if (revisionOf(before) !== revision)
          refuse(`${path} changed on disk since the panel read it: reload`);

        // What the panel was offered, read again: the cell, its scopes and its values.
        const build = deps.build();
        const inspection = inspectNow(build, name, index, before);
        const at = `${layer}.${cell}`;
        const found = inspection.layers
          .find((l) => l.name === layer)
          ?.cells.find((c) => c.cell === cell);
        if (!found)
          refuse(`${name} has no ${at} in variant ${inspection.variant}`, 400);
        if (!found.scopes.some((s) => s.key === scope))
          refuse(`${scope} is not a scope offered for ${at}`, 400);
        mustOffer(at, found, body.value);
        const value = plainValue(body.value);
        const { spec, oracle } = builtOf(build, name);
        const variant = oracle.variants[inspection.variant];
        const chosen = scopesFor(
          spec,
          parse(before),
          layer,
          cell,
          variant,
        ).find((s) => s.key === scope);

        // Choosing what Figma has, where a rule changed it, deletes the rule.
        const existing = readSetEntry(before, scope);
        const there = entryAt(spec, layer, cell, chosen.path);
        const deletes = Boolean(
          existing && there?.replaced && same(there.replaced, value),
        );
        // Nothing to decide where the chosen look already has exactly that entry.
        if (!deletes && same(there, value))
          refuse(`${at} already draws ${entryText(there)} there`);
        // A rule that borrows the entry's reason (`reason: { as: set <key> }`) blocks deleting it,
        // and takes the new reason on a replace, which the viewer says.
        const borrowers = borrowersOf(before, scope);
        let text;
        try {
          text = deletes
            ? writeSetEntry(before, scope, null)
            : writeSetEntry(before, scope, value, PLACEHOLDER);
        } catch (error) {
          refuse(error.message);
        }
        const held = heldIn(coloured);

        // Saved before the file is written, so a placeholder is never on disk without the record
        // that undoes it, whatever happens next.
        savePending({
          component: name,
          key: scope,
          value,
          deletes,
          before,
          placeholder: text,
          after: text,
          // A borrowed reason (`{ as: … }`) is no sentence to rewrite.
          previousReason:
            typeof existing?.reason === 'string' ? existing.reason : null,
          borrowers,
          held,
          failing: null,
        });
        let regenerating = false;
        try {
          files.write(path, text);
          // Prove the rule reaches the variant in view before regenerating anything.
          let now;
          try {
            const after = builtOf(deps.build(), name);
            now = lookupCell(
              after.spec,
              layer,
              cell,
              after.oracle.variants[inspection.variant],
            );
          } catch (error) {
            refuse(`the build refused the edit: ${error.message}`, 400);
          }
          if (!deletes && !same(now?.entry, value))
            refuse(
              `the rule changes nothing in this variant: ${now?.at ?? 'another entry'} wins; choose a narrower scope`,
            );
          regenerating = true;
          const generated = await deps.codegen({ pending: true });
          if (!generated.ok)
            refuse(
              `the build refused the edit, which is undone: ${tail(generated.output)}`,
              400,
            );
        } catch (error) {
          // Put back only what the session wrote; someone else's edit since stays, with the record.
          const disk = files.read(path);
          if (disk !== text && disk !== before) changedOnDisk(path);
          files.write(path, before);
          savePending(null);
          if (regenerating) {
            try {
              await deps.codegen({ pending: false });
              deps.reload();
            } catch {
              // Best effort: the file is back, and the next regeneration catches up.
            }
          }
          throw error instanceof WorkbenchError
            ? error
            : new WorkbenchError(
                500,
                `the edit failed, and is undone: ${error.message}`,
              );
        }
        deps.reload();
        // The operation is finishing, and nothing else runs until it has.
        return { ...(await statusNow()), busy: null };
      }),

    keep: ({ component: name, reason }) =>
      serial('Keeping…', async () => {
        const { p, path, disk } = pendingOn(name);
        if (!p.deletes) {
          const why = String(reason ?? '').trim();
          if (!why || why.startsWith(PLACEHOLDER))
            refuse('write a reason a reviewer can check', 400);
          if (/[\r\n]/.test(why)) refuse('write the reason on one line', 400);
          const previous = p.previousReason;
          if (typeof previous === 'string' && why === previous.trim())
            refuse('the rule changed, so rewrite its reason', 400);
          let text;
          try {
            text = writeSetEntry(disk, p.key, p.value, why);
          } catch (error) {
            refuse(error.message, 400);
          }
          savePending({ ...p, after: text });
          files.write(path, text);
        }
        const generated = await deps.codegen({ pending: false });
        if (!generated.ok)
          refuse(
            `the build failed: ${tail(generated.output)}; the edit is still pending: Undo, or fix and Keep again`,
            400,
          );
        const now = new Set(heldIn((await deps.status()).coloured));
        const lost = (pending.held ?? []).filter((a) => !now.has(a));
        if (lost.length) {
          await restore(pending, [pending.after]);
          savePending(null);
          refuse(
            `kept, this would cancel ${lost.join(', ')}; the edit is undone`,
          );
        }
        const result = await deps.checks(name);
        if (!result.ok) {
          // Capped, so the status and a Send of them stay within the contract's limit.
          const failing = capFailures(result.failures, name);
          savePending({ ...pending, failing });
          deps.reload();
          return { ok: false, failures: failing };
        }
        savePending(null);
        deps.reload();
        return { ok: true };
      }),

    undo: ({ component: name }) =>
      serial('Undoing…', async () => {
        const { p } = pendingOn(name, { undoing: true });
        await restore(p, [p.placeholder, p.after]);
        savePending(null);
        return { ...(await statusNow()), busy: null };
      }),

    // A note touches only spec/feedback/, so a pending edit does not hold it up.
    report: ({ component: name, platform, controls, layer, variant, note }) =>
      serial('Saving the note…', async () => {
        mustBePlatform(platform);
        if (
          controls !== undefined &&
          (controls === null ||
            typeof controls !== 'object' ||
            Array.isArray(controls))
        )
          refuse("the controls are an object of each control's value", 400);
        for (const [field, value] of Object.entries({ layer, variant }))
          if (
            value !== undefined &&
            value !== null &&
            typeof value !== 'string'
          )
            refuse(`the ${field} is a name`, 400);
        const words = typeof note === 'string' ? note.trim() : '';
        if (!words) refuse('write the note', 400);
        if (words.length > MAX_NOTE)
          refuse(`the note is over ${MAX_NOTE} characters`, 400);
        const coloured = await mustEdit(name);
        if (!coloured[platform]?.some((c) => c.name === name))
          refuse(
            `${platform === 'web' ? 'Web' : 'Flutter'} has no ${name}`,
            400,
          );
        const dir = deps.feedbackDir;
        const file = `${dir}/${noteFile(files.list(dir), name)}`;
        files.write(
          file,
          noteText({
            component: name,
            platform,
            controls,
            layer,
            variant,
            note: words,
            on: deps.today(),
          }),
        );
        return { file };
      }),

    /**
     * Send to agent: a note carrying the failing checks where the person judged the component
     * right. From a failing Keep, the checks are the pending edit's, and the edit is then kept as
     * Keep wrote it, its reason and all; from a refused Approve, they are the failures the viewer
     * was given. On the same terms as Report: the agent works on components that may change.
     */
    send: ({ component: name, platform, note, failures }) =>
      serial('Saving the note…', async () => {
        mustBePlatform(platform);
        if (note !== undefined && note !== null && typeof note !== 'string')
          refuse('the note is words', 400);
        const words = (note ?? '').trim();
        if (words.length > MAX_NOTE)
          refuse(`the note is over ${MAX_NOTE} characters`, 400);
        // After a failing Keep, the pending edit's own are sent, and the body's are not read.
        const fromKeep = Boolean(
          pending?.component === name && pending.failing?.length,
        );
        if (
          !fromKeep &&
          failures !== undefined &&
          failures !== null &&
          !(Array.isArray(failures) && failures.every(isFailure))
        )
          refuse(
            'the failures are a list of failing checks: each a platform (web, flutter or parity), and at most a variant, layer, property and message as words, and what Figma draws and what was drawn',
            400,
          );
        if (!fromKeep && failures?.length > MAX_FAILURES)
          refuse(`a note carries at most ${MAX_FAILURES} failing checks`, 400);
        const carried = fromKeep ? pending.failing : failures;
        if (!carried?.length)
          refuse(`${name} has no failing checks to send`, 400);
        const coloured = await mustEdit(name);
        if (!coloured[platform]?.some((c) => c.name === name))
          refuse(
            `${platform === 'web' ? 'Web' : 'Flutter'} has no ${name}`,
            400,
          );
        const dir = deps.feedbackDir;
        const file = `${dir}/${noteFile(files.list(dir), name)}`;
        files.write(
          file,
          noteText({
            component: name,
            platform,
            controls: {},
            // The rule the person kept, as Keep wrote it (none where the edit removed it).
            ...(fromKeep && {
              layer: pending.key.split('.')[0],
              rule: pending.key,
              value: pending.deletes ? null : pending.value,
            }),
            note:
              words ||
              'The checks failed where the person judged the component right.',
            failures: carried,
            on: deps.today(),
          }),
        );
        if (fromKeep) savePending(null);
        return { file };
      }),

    approve: ({ component: name, platform }) =>
      serial('Checking before approving…', async () => {
        mustBePlatform(platform);
        // The checks and the fingerprint read the generated files, which a pending edit changes.
        if (pending)
          refuse(`keep or undo the pending edit on ${pending.component} first`);
        const by = deps.userName();
        if (!by)
          refuse(
            'set your name with `git config user.name` first: an approval records who gave it',
          );
        const { coloured } = await deps.status();
        const c = coloured[platform]?.find((x) => x.name === name);
        if (!c) refuse(`${TITLES[platform]} has no ${name}`, 400);
        if (c.colour === 'green')
          refuse(`${name} is already approved on ${TITLES[platform]}`);
        if (c.colour === 'red')
          refuse(
            `${name} waits on ${c.waitsOn.join(', ')}: approve those first`,
          );
        const result = await deps.checks(name);
        if (!result.ok)
          return { ok: false, failures: capFailures(result.failures, name) };
        // The checks write nothing the fingerprint reads; it is read again after them regardless.
        const again = (await deps.status()).coloured[platform]?.find(
          (x) => x.name === name,
        );
        if (again?.colour !== 'yellow')
          refuse(`${name} changed on ${TITLES[platform]} while it was checked`);
        files.write(
          deps.approvalsPath,
          withApproval(files.read(deps.approvalsPath) ?? '', name, platform, {
            fingerprint: again.fingerprint,
            by,
            on: deps.today(),
          }),
        );
        return { ok: true };
      }),

    unapprovePreview: async ({ component: name, platform }) => {
      mustBePlatform(platform);
      const { coloured, approvals } = await deps.status();
      if (!approvals?.[name]?.[platform])
        refuse(`${name} is not approved on ${TITLES[platform]}`);
      return { withdraws: withdrawnBy(coloured, approvals, name, platform) };
    },

    unapprove: ({ component: name, platform }) =>
      serial('Withdrawing…', async () => {
        mustBePlatform(platform);
        if (pending)
          refuse(`keep or undo the pending edit on ${pending.component} first`);
        const { coloured, approvals } = await deps.status();
        if (!approvals?.[name]?.[platform])
          refuse(`${name} is not approved on ${TITLES[platform]}`);
        const withdraws = withdrawnBy(coloured, approvals, name, platform);
        files.write(
          deps.approvalsPath,
          withoutApprovals(
            files.read(deps.approvalsPath) ?? '',
            withdraws.map((n) => ({ name: n, platform })),
          ),
        );
        return { withdraws };
      }),
  };
}
