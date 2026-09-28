/**
 * The workbench service's state and operations (scripts/workbench.mjs serves them over HTTP): one
 * at a time, every effect injected, so a test runs it on files in memory. Any component may be
 * inspected; what may be changed, reported and approved follows the circles
 * (docs/engineering/architecture.md, The workbench), and the bar offers Inspect on the
 * same terms: a component 🟡 on both platforms (or absent from one) may be changed and reported on;
 * 🟢 on either is locked; 🔴 on either waits on the components it uses.
 *
 * A look change is one overlay `set` entry, which the viewer drafts without a request and Apply
 * writes whole, its reason and all, then regenerates and checks in one job: nothing is written
 * while a person is still choosing, so no regeneration reloads a viewer under a reason being typed.
 * Where the checks fail, the edit stays pending, as Apply wrote it: saved before the overlay is
 * written, with the file's bytes before it and as Apply left it (`after`), so Undo survives a
 * restart and nothing the session does overwrites an edit someone else made since. Keep runs the
 * regeneration and the checks again; Send to agent keeps the edit and hands the failures on.
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

/**
 * A reason a reviewer can check, or why it is not: none, the proposer's placeholder, on more than
 * one line, or the reason of the rule it replaces unchanged.
 */
function reasonOf(reason, previous) {
  const why = String(reason ?? '').trim();
  if (!why || why.startsWith(PLACEHOLDER))
    refuse('write a reason a reviewer can check', 400);
  if (/[\r\n]/.test(why)) refuse('write the reason on one line', 400);
  if (typeof previous === 'string' && why === previous.trim())
    refuse('the rule changed, so rewrite its reason', 400);
  return why;
}

/** How long the status names where a viewer reopens its dialog, in milliseconds. */
export const REOPEN_MS = 60_000;

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
 * @param {() => Promise<{ok: boolean, output: string}>} deps.codegen `solar:codegen`
 * @param {() => Promise<{coloured: object, approvals: object}>} deps.status `solar:status`'s colours
 *   (`colour(scan(), approvals)`) and the approvals record
 * @param {(name: string) => Promise<{ok: boolean, failures: object[]}>} deps.checks a component's
 *   own checks
 * @param {() => void} deps.reload restarts the viewer the service can restart (Widgetbook) on what
 *   was regenerated; the session also sends the event `reload`, on which Storybook's bar reloads
 * @param {() => string} deps.today the date, `YYYY-MM-DD`
 * @param {() => number} [deps.now] the clock, in milliseconds (`Date.now`)
 * @param {(event: {type: string, message?: string}) => void} deps.emit tells the viewers
 */
export function createSession(deps) {
  const { files } = deps;
  let queue = Promise.resolve();
  let busy = null;
  // While Apply runs, its record is on disk but no edit is pending yet: it is one only where the
  // checks fail (or the service stopped mid-way, when the record is read back at the start).
  let applying = false;
  // Where the viewer that applied, kept or undid an edit reopens its dialog once it has reloaded,
  // for REOPEN_MS after (its page may load several times as the regenerated files arrive), and
  // until the next operation starts.
  let reopen = null;
  let reopenSince = 0;
  const now = deps.now ?? (() => Date.now());
  const reopenHere = (r) => {
    reopen = r;
    reopenSince = now();
  };
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
    const missing = ['component', 'key', 'before', 'after'].filter(
      (field) => typeof p?.[field] !== 'string',
    );
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
        reopen = null;
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
      reopen:
        reopen && now() - reopenSince <= REOPEN_MS
          ? { ...reopen, age: now() - reopenSince }
          : null,
      pending:
        !applying && pending
          ? {
              component: pending.component,
              key: pending.key,
              value: pending.value,
              was: pending.was ?? null,
              reason: pending.reason ?? null,
              deletes: pending.deletes,
              previousReason: pending.previousReason,
              borrowers: pending.borrowers ?? [],
              failing: pending.failing ?? null,
            }
          : null,
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
   * Where the viewer on `platform` reopens its dialog after the reload: at the pending edit's
   * variant, layer and cell (none for a record an older service wrote, which lacks them).
   */
  const reopenAt = (p, platform) =>
    Number.isInteger(p?.variant) && p.layer && p.cell
      ? {
          platform,
          component: p.component,
          variant: p.variant,
          layer: p.layer,
          cell: p.cell,
        }
      : null;

  /** The viewers reload what was regenerated: Widgetbook restarted, Storybook told. */
  const reloaded = () => {
    try {
      deps.reload();
    } finally {
      tell({ type: 'reload' });
    }
  };

  /** The texts of an edit's overlay the session wrote: Apply's, and an older record's placeholder. */
  const wroteOf = (p) =>
    [p.after, p.placeholder].filter((t) => t !== undefined);

  /**
   * Puts the overlay back as it was before the pending edit, and regenerates: only where it holds
   * one of the texts the session wrote, or is already back.
   */
  const restore = async (p) => {
    const path = deps.overlayPath(p.component);
    const disk = files.read(path);
    if (disk !== p.before && !wroteOf(p).includes(disk)) changedOnDisk(path);
    files.write(path, p.before);
    const generated = await deps.codegen();
    if (!generated.ok)
      refuse(
        `the overlay is back, but regenerating failed: ${tail(generated.output)}; press Undo again`,
        500,
      );
  };

  /** Refuses where regenerating the edit would cancel an approval, putting it back first. */
  const mustKeepApprovals = async (p, done) => {
    const now = new Set(heldIn((await deps.status()).coloured));
    const lost = (p.held ?? []).filter((a) => !now.has(a));
    if (!lost.length) return;
    await restore(p);
    savePending(null);
    // Regenerated again, back as it was: the viewers reload once more.
    reloaded();
    refuse(`${done}, this would cancel ${lost.join(', ')}; the edit is undone`);
  };

  /**
   * Runs the component's checks on the edit as it is regenerated: passing, the edit is kept and no
   * longer pending; failing, it stays pending with the failures, capped so the status and a Send
   * of them stay within the contract's limit. The viewers have reloaded already, once the regeneration was done.
   */
  const checked = async (name) => {
    const result = await deps.checks(name);
    if (!result.ok) {
      const failing = capFailures(result.failures, name);
      savePending({ ...pending, failing });
      return { ok: false, failures: failing };
    }
    savePending(null);
    return { ok: true };
  };

  /**
   * The pending edit on `name`, and its overlay as it is on disk: refused where there is none, or
   * where the file holds neither text the edit left (an editor or an agent changed it since), which
   * Keep and Undo would overwrite. Undo also takes a file already back as it was (a restore whose
   * regeneration failed, or an Apply stopped before it wrote); Keep says to press it.
   */
  const pendingOn = (name, { undoing = false } = {}) => {
    if (!pending || pending.component !== name)
      refuse(`${name} has no pending edit`);
    const path = deps.overlayPath(name);
    const disk = files.read(path);
    if (!wroteOf(pending).includes(disk)) {
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

    /**
     * Apply: the viewer's draft, written with its reason, regenerated and checked in one job. The
     * draft is validated as the inspection offered it: the cell, the scope, the value, and a reason
     * a reviewer can check (none where Figma's own value is chosen, which deletes the rule).
     */
    apply: (body) =>
      serial('Saving…', async () => {
        const {
          component: name,
          variant: index,
          layer,
          cell,
          scope,
          revision,
          platform,
        } = body;
        mustBePlatform(platform);
        if (pending)
          refuse(`keep or undo the pending edit on ${pending.component} first`);
        const coloured = await mustEdit(name);
        const path = deps.overlayPath(name);
        const before = files.read(path);
        // Every component has one; which name heads a new one (its Figma address) is a person's call.
        if (before === null)
          refuse(`${name} has no overlay file: add one by hand first`);
        if (revisionOf(before) !== revision)
          refuse(`${path} changed on disk since the dialog read it: reload`);

        // What the dialog was offered, read again: the cell, its scopes and its values.
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
        // A borrowed reason (`{ as: … }`) is no sentence to rewrite.
        const previousReason =
          typeof existing?.reason === 'string' ? existing.reason : null;
        const reason = deletes ? null : reasonOf(body.reason, previousReason);
        // A rule that borrows the entry's reason (`reason: { as: set <key> }`) blocks deleting it,
        // and takes the new reason on a replace, which the viewer says.
        const borrowers = borrowersOf(before, scope);
        let text;
        try {
          text = deletes
            ? writeSetEntry(before, scope, null)
            : writeSetEntry(before, scope, value, reason);
        } catch (error) {
          refuse(error.message);
        }
        // What the variant in view draws before the edit, as explain reads it: the strip's "was".
        const was = entryText(lookupCell(spec, layer, cell, variant)?.entry);

        applying = true;
        try {
          // Saved before the file is written, so the edit is never on disk without the record that
          // undoes it, whatever happens next.
          savePending({
            component: name,
            key: scope,
            value,
            was,
            deletes,
            reason,
            before,
            after: text,
            previousReason,
            borrowers,
            held: heldIn(coloured),
            // Where the person was, so the viewer that undoes or keeps it again reopens there too.
            variant: inspection.variant,
            layer,
            cell,
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
            const generated = await deps.codegen();
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
                // A failed regeneration writes nothing; one that threw may have: built back.
                await deps.codegen();
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
          // The viewer that saved reopens its dialog here once it has reloaded, which it does as
          // soon as the regeneration is done: the checks' outcome comes after, as a change.
          reopenHere(reopenAt(pending, platform));
          reloaded();
          await mustKeepApprovals(pending, 'saved');
          return await checked(name);
        } finally {
          applying = false;
        }
      }),

    /** Keep again: the pending edit regenerated as it is and its checks run again, after a fix. */
    keep: ({ component: name, platform }) =>
      serial('Checking again…', async () => {
        mustBePlatform(platform);
        pendingOn(name);
        const generated = await deps.codegen();
        if (!generated.ok)
          refuse(
            `the build failed: ${tail(generated.output)}; the edit is still pending: Undo, or fix and Keep again`,
            400,
          );
        reopenHere(reopenAt(pending, platform));
        reloaded();
        await mustKeepApprovals(pending, 'kept');
        return checked(name);
      }),

    undo: ({ component: name, platform }) =>
      serial('Undoing…', async () => {
        mustBePlatform(platform);
        const { p } = pendingOn(name, { undoing: true });
        await restore(p);
        reopenHere(reopenAt(p, platform));
        savePending(null);
        reloaded();
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
     * right. From a failing Apply or Keep, the checks are the pending edit's, and the edit is then
     * kept as Apply wrote it, its reason and all; from a refused Approve, they are the failures the viewer
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
        // After failing checks on an edit, the pending edit's own are sent, and the body's are not read.
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
            // The rule the person kept, as Apply wrote it (none where the edit removed it).
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
