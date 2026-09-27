/**
 * The Storybook adapter for a Playground builder: the component's controls (PLAYGROUND, from the
 * codegen, extras included) as args and argTypes, synced both ways through `useArgs`, and around
 * the component a Reset button, the width box and the event log, with the workbench bar above
 * them in `storybook dev` (stories/workbench/). The only code here that knows Storybook;
 * everything viewer-free is core.tsx, and a builder sees the `Playground` interface alone
 * (types.ts).
 */

import Typography from '@mui/material/Typography';
import type { ArgTypes, Args } from '@storybook/react-vite';
import { useMemo, useRef, useState } from 'react';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';
import { PLAYGROUND } from 'virtual:solar';
import { Button } from '../../src/Button.js';
import { SolarProvider } from '../../src/SolarProvider.js';
import { WorkbenchBar } from '../workbench/Bar.js';
import { httpClient } from '../workbench/client.js';
import {
  BuilderHost,
  WidthBox,
  argTypesOf,
  columnStyle,
  controlsOf,
  defaultsOf,
  logLine,
  makePlayground,
  startSync,
  syncArgs,
  withLine,
  type ArgsSync,
} from './core.js';
import type { ControlValue, PlaygroundBuilder } from './types.js';

/**
 * The workbench, in `storybook dev` alone (Vite's `import.meta.env.DEV`): a static build never
 * draws or calls it.
 */
const DEV = (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

/** Storybook controls for a component's Playground. */
export const argTypesFor = (component: string): ArgTypes =>
  argTypesOf(PLAYGROUND, component);

/** Every control at its default: the Playground's first args, and what Reset restores. */
export const argsFor = (component: string): Record<string, ControlValue> =>
  defaultsOf(controlsOf(PLAYGROUND, component));

/**
 * The Playground around the builder's component. It takes the args and their setter from the
 * story function, which is where Storybook allows `useArgs`.
 *
 * The builder reads a local copy of the args, not the args themselves: `updateArgs` reaches the
 * story only after a round trip through Storybook's channel, so a controlled input rendered from
 * the args would be put back to its old words while the event that changed it is still running,
 * moving the cursor and dropping keystrokes. `set` writes the copy at once and remembers the value
 * as pending; when the args arrive, a pending value is dropped once the args carry it, and a
 * control with none pending takes the args' value (the panel changed it, or Reset): core.tsx
 * `syncArgs`.
 */
export function PlaygroundView({
  component,
  builder,
  args,
  updateArgs,
}: {
  component: string;
  builder: PlaygroundBuilder;
  args: Args;
  updateArgs: (args: Args) => void;
}) {
  const controls = controlsOf(PLAYGROUND, component);
  const [log, setLog] = useState<string[]>([]);
  const [sync, setSync] = useState<ArgsSync>(() => startSync(args));
  // New args (a round trip ended, the panel changed a control, or Reset): adjust the copy while
  // rendering, React's way of deriving state from a prop, so the builder never sees stale values.
  let current = sync;
  if (sync.seen !== args) {
    current = syncArgs(sync, args, controls);
    setSync(current);
  }
  const local = current.local;

  const playground = makePlayground({
    data: PLAYGROUND,
    controls,
    values: local,
    set: (name, value) => {
      // A value the args already hold needs no round trip, and would never be confirmed.
      const roundTrip =
        name in current.pending || !Object.is(current.seen[name], value);
      setSync((s) => ({
        ...s,
        local: { ...s.local, [name]: value },
        pending: roundTrip ? { ...s.pending, [name]: value } : s.pending,
      }));
      if (roundTrip) updateArgs({ [name]: value });
    },
    log: (event, detail) => {
      setLog((lines) => withLine(lines, logLine(event, detail), PLAYGROUND));
      if (detail === undefined || detail === null) action(event)();
      else action(event)(detail);
    },
  });

  // The workbench bar's service, in dev alone, and the box it points into.
  const box = useRef<HTMLDivElement>(null);
  const client = useMemo(() => (DEV ? httpClient() : null), []);

  const reset = () => {
    const defaults = argsFor(component);
    setSync((s) => ({ ...s, local: defaults, pending: {} }));
    updateArgs(defaults);
    setLog([]);
  };

  return (
    <SolarProvider>
      <div style={columnStyle}>
        {client && (
          <WorkbenchBar
            component={component}
            platform="web"
            controls={local}
            client={client}
            box={box}
          />
        )}
        <Button prio="tertiary" size="sm" onClick={reset}>
          Reset
        </Button>
        <WidthBox width={local.width} boxRef={box}>
          <BuilderHost key={component} builder={builder} p={playground} />
        </WidthBox>
        <Typography
          component="ol"
          variant="bodyXsRegular"
          aria-label="Event log"
          style={events}
        >
          {log.map((l, i) => (
            // Lines repeat (two clicks log the same words), so the position is the identity.
            <li key={`${i}:${l}`}>{l}</li>
          ))}
        </Typography>
      </div>
    </SolarProvider>
  );
}

/**
 * The Playground story's render function for a builder. It is the story function, so it may call
 * Storybook's `useArgs`, which a component it renders may not.
 */
export function playgroundRender(
  component: string,
  builder: PlaygroundBuilder,
) {
  return function PlaygroundStory() {
    const [args, updateArgs] = useArgs();
    return (
      <PlaygroundView
        component={component}
        builder={builder}
        args={args}
        updateArgs={updateArgs}
      />
    );
  };
}

const events = {
  margin: 0,
  paddingLeft: 'var(--solar-inset-md)',
  color: 'var(--solar-color-text-secondary)',
};
