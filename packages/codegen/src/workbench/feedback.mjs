/**
 * A Report note: what the workbench writes for `/solar-feedback` (.claude/skills/solar-feedback/)
 * to act on, one file per note in spec/feedback/, deleted once resolved.
 */

import { stringify } from 'yaml';

/** A component's name as a file name's stem: `Text Input` is `text-input`. */
const slugOf = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** The next note's file name for a component, after the files already in spec/feedback/. */
export function noteFile(existing, component) {
  const slug = slugOf(component);
  const numbers = existing
    .map((f) => f.match(new RegExp(`^${slug}-(\\d+)\\.yaml$`))?.[1])
    .filter(Boolean)
    .map(Number);
  return `${slug}-${Math.max(0, ...numbers) + 1}.yaml`;
}

const HEADER =
  '# A note for /solar-feedback (docs/engineering/workflows.md, Fix a component in the viewer),\n' +
  '# written by the workbench. The agent resolves it and deletes this file.\n';

/** The note as YAML: what, where, the person's words, the controls set, and any failing check. */
export function noteText({
  component,
  platform,
  controls,
  layer,
  variant,
  note,
  failures,
  on,
}) {
  const data = {
    component,
    platform,
    on,
    note,
    ...(layer && { layer }),
    ...(variant && { variant }),
    controls: controls ?? {},
    ...(failures?.length && { failures }),
  };
  return HEADER + stringify(data, { lineWidth: 100 });
}
