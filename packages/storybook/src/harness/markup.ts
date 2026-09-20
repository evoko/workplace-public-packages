import type { CompareRow, CompareSpec } from './spec';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The raw HTML the CSS and Tailwind cells render for one row. */
export function cssMarkup(
  spec: CompareSpec,
  prefix: string,
  row: CompareRow,
): string {
  const root = `${prefix}-${spec.name}`;
  const attrs = [`class="${root}"`];
  for (const axis of spec.axes) {
    attrs.push(`data-${axis.name}="${escapeHtml(row.axes[axis.name])}"`);
  }
  const state = spec.states.find((s) => s.name === row.state);
  if (state && state.kind === 'attribute') {
    for (const [name, value] of Object.entries(state.attributes)) {
      attrs.push(`${name}="${escapeHtml(value)}"`);
    }
  }
  const slots = spec.slots
    .map(
      (s) =>
        `<${s.element} class="${root}__${s.name}">${escapeHtml(s.content)}</${s.element}>`,
    )
    .join('');
  const label = spec.labelSlot
    ? `<${spec.labelElement} class="${root}__${spec.labelSlot}">${escapeHtml(spec.label)}</${spec.labelElement}>`
    : escapeHtml(spec.label);
  return `<${spec.rootElement} ${attrs.join(' ')}>${slots}${label}</${spec.rootElement}>`;
}
