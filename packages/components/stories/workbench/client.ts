/**
 * The workbench service's client, for the bar (Bar.tsx): the HTTP contract in
 * docs/engineering/architecture.md, The workbench, as types and one function per route.
 * Dev only: nothing calls it in a static build (adapter.tsx).
 */

export type Colour = 'green' | 'yellow' | 'red';
export type Platform = 'web' | 'flutter';

export interface Failure {
  platform: Platform | 'parity';
  variant?: string;
  layer?: string;
  property?: string;
  figma?: unknown;
  drawn?: unknown;
  message?: string;
}

export type SetValue =
  { token: string } | { keyword: 'FILL' | 'HUG' } | { none: true };

export interface Pending {
  component: string;
  key: string;
  value: SetValue;
  /** What the variant in view drew before the edit, as `solar:explain` names it. */
  was: string | null;
  /** The reason written with it (none for a deleted rule). */
  reason: string | null;
  deletes: boolean;
  previousReason: string | null;
  failing: Failure[] | null;
  /** The rules whose reason is borrowed from the entry, whose reason therefore changes too. */
  borrowers: string[];
}

export interface ComponentStatus {
  web: Colour | null;
  flutter: Colour | null;
  waitsOn: Record<Platform, string[]>;
  editable: boolean;
  locked: string | null;
}

/**
 * Where the viewer that applied, kept again or undid an edit was: named for 60 s after the service
 * regenerated (every start of the page in that time reopens it), `age` in milliseconds.
 */
export interface Reopen {
  platform: Platform;
  component: string;
  variant: number;
  layer: string;
  cell: string;
  age: number;
}

export interface Status {
  busy: string | null;
  /** The last event sent before the status was read (GET /status alone): where polling starts. */
  seq?: number;
  /** An edit Apply wrote whose checks failed (or, after a restart mid-Apply, never checked). */
  pending: Pending | null;
  reopen: Reopen | null;
  components: Record<string, ComponentStatus>;
}

/** Where a cell's entry comes from: Figma's variant, an overlay rule, or the shared defaults. */
export type Origin = 'figma' | 'rule' | 'defaults';

/**
 * A scope a rule may be keyed on: its plain words (`every md`, `primary · at rest`), its key, how
 * many variants that draw the layer a set there would change (`count`), the recipe position of the
 * entry that overrides it in the variant in view (`wins`) and that entry's scope in plain words
 * (`winsLabel`), or null, and whether today's value is set at it (`current`).
 */
export interface Scope {
  label: string;
  key: string;
  count: number;
  wins: string | null;
  winsLabel: string | null;
  current: boolean;
  /**
   * The `set` rule the overlay has at this scope, where one is: its reason (null where it borrows
   * another's), the rules borrowing it, and Figma's own value there, which chosen deletes the rule.
   */
  rule: {
    reason: string | null;
    borrowers: string[];
    figma: SetValue | null;
  } | null;
}

export interface Cell {
  cell: string;
  /** How many variants the component draws, which a scope's count is out of. */
  total: number;
  entry: string;
  /** The entry as a person reads it: a token's value, a literal, a keyword, `none`. */
  value: string;
  at: string | null;
  origin: Origin;
  /** The rule's or the defaults' reason, where one sets it. */
  reason: string | null;
  scopes: Scope[];
  choices: { name: string; value: string }[];
  keywords: string[];
  none: boolean;
  /** Why the cell offers nothing (a raw value the overlay allows). */
  note?: string;
}

export interface Inspection {
  component: string;
  revision: string;
  /** Each variant axis in Figma's spelling, its values in the order the variants draw them. */
  axes: { name: string; values: string[] }[];
  variants: { index: number; name: string; parts: Record<string, string> }[];
  variant: number;
  layers: {
    name: string;
    className: string | null;
    /**
     * Where the web draws it, as the recipe's slot table has it: `&` the component's root element
     * (which a text MUI draws in the root shares), else a selector under it (`& .MuiButton-startIcon`).
     */
    selector: string | null;
    /** The nearest layer the variant draws that it sits in; null for the root. */
    parent: string | null;
    hidden: boolean;
    cells: Cell[];
  }[];
}

export type Outcome = { ok: true } | { ok: false; failures: Failure[] };

export interface WorkbenchEvent {
  seq: number;
  type: 'busy' | 'changed' | 'failed' | 'reload';
  message?: string;
}

/** What Save sends: the draft, the inspection's revision, and the reason. */
export interface ApplyBody {
  component: string;
  platform: Platform;
  variant: number;
  layer: string;
  cell: string;
  scope: string;
  value: SetValue;
  revision: string;
  reason: string;
}

/** A Report note: the Playground's values, the layer and variant chosen in Inspect, if any. */
export interface ReportBody {
  component: string;
  platform: Platform;
  controls: Record<string, unknown>;
  layer?: string;
  variant?: string;
  note: string;
}

/** A Send to agent note: the person's words, even none, and the failing checks shown. */
export interface SendBody {
  component: string;
  platform: Platform;
  note: string;
  failures: Failure[];
}

export interface WorkbenchClient {
  health(): Promise<boolean>;
  status(): Promise<Status>;
  inspect(component: string, variant: number): Promise<Inspection>;
  /**
   * Save: writes the rule at the scope with its reason ("" for a removal), regenerates and runs the
   * checks; the service then tells the viewers to reload.
   */
  apply(body: ApplyBody): Promise<Outcome>;
  /** Keep again: runs a pending edit's checks again. */
  keep(component: string, platform: Platform): Promise<Outcome>;
  undo(component: string, platform: Platform): Promise<Status>;
  approve(component: string, platform: Platform): Promise<Outcome>;
  unapprovePreview(component: string, platform: Platform): Promise<string[]>;
  unapprove(component: string, platform: Platform): Promise<string[]>;
  /** Saves a note for an agent in spec/feedback/: the file written. */
  report(body: ReportBody): Promise<{ file: string }>;
  /**
   * Send to agent: a note carrying the failing checks shown (a failing Keep's, or a refused
   * Approve's), in spec/feedback/: the file written. After a Keep, the edit is then no longer
   * pending.
   */
  send(body: SendBody): Promise<{ file: string }>;
  /** The events after `after`, within 25 s; `signal` ends the wait (the bar unmounted). */
  events(
    after: number,
    signal?: AbortSignal,
  ): Promise<{ seq: number; events: WorkbenchEvent[] }>;
}

/** A refusal: the service's sentence, and the HTTP status it came with. */
export class WorkbenchRefusal extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Whether an error is the service saying it is still starting (its session not yet built). */
export const isStarting = (error: unknown) =>
  error instanceof WorkbenchRefusal && error.status === 503;

export const WORKBENCH_URL = 'http://127.0.0.1:6011';

/** The client over HTTP; a refusal throws its sentence, as a WorkbenchRefusal. */
export function httpClient(base = WORKBENCH_URL): WorkbenchClient {
  const call = async <T>(
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> => {
    const r = await fetch(`${base}${path}`, {
      signal,
      method: body === undefined ? 'GET' : 'POST',
      headers:
        body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    // An answer that is not JSON, a 2xx one too, is no answer of the service's (as Widgetbook's
    // client says it).
    const answered = `the workbench answered ${r.status}`;
    let data: { error?: string };
    try {
      data = (await r.json()) as { error?: string };
    } catch {
      throw new WorkbenchRefusal(r.status, answered);
    }
    if (!r.ok) throw new WorkbenchRefusal(r.status, data?.error ?? answered);
    return data as T;
  };
  return {
    health: async () => {
      try {
        return (
          (await call<{ service: string }>('/health')).service ===
          'solar-workbench'
        );
      } catch {
        return false;
      }
    },
    status: () => call('/status'),
    inspect: (component, variant) =>
      call(
        `/component?name=${encodeURIComponent(component)}&variant=${variant}`,
      ),
    apply: (body) => call('/apply', body),
    keep: (component, platform) => call('/keep', { component, platform }),
    undo: (component, platform) => call('/undo', { component, platform }),
    approve: (component, platform) => call('/approve', { component, platform }),
    unapprovePreview: async (component, platform) =>
      (
        await call<{ withdraws: string[] }>('/unapprove/preview', {
          component,
          platform,
        })
      ).withdraws,
    unapprove: async (component, platform) =>
      (
        await call<{ withdraws: string[] }>('/unapprove', {
          component,
          platform,
        })
      ).withdraws,
    report: (body) => call('/report', body),
    send: (body) => call('/send', body),
    events: (after, signal) =>
      call(`/events?after=${after}`, undefined, signal),
  };
}
