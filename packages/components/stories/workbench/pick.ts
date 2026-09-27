/**
 * Where a layer is in the Inspect dialog's preview (preview.tsx), and which layer a click there
 * points at, found as the visual check finds a layer (test/visual/components.spec.mjs): the element
 * a case marks with `data-layer="<layer>"`, else the one the layer's `selector` from the inspection
 * finds (the web recipe's slot table: `&` the component's root element, `& .MuiButton-startIcon`
 * or `& > :nth-child(2)` one under it), else, where an inspection gives no selector, its class. A
 * text MUI draws in the root (Button's label) shares the root's element, so a click on it points at
 * `root`, and the label, chosen in the tree, is outlined on the root's box. An element inside a
 * composed child a case marks is the child's, never one of the parent's layers.
 */

/** What pick needs of an element: the DOM's, or a test's stand-in. */
export interface Node {
  parentElement: Node | null;
  hasAttribute(name: string): boolean;
  querySelector(selector: string): Node | null;
  querySelectorAll(selector: string): Iterable<Node>;
}

export interface Locatable {
  name: string;
  className: string | null;
  selector?: string | null;
}

/** The selector a layer is found by: its own, else its class's, `&` for the root. */
export const selectorOf = (layer: Locatable) =>
  layer.selector ??
  (layer.className
    ? `& .${layer.className}`
    : layer.name === 'root'
      ? '&'
      : null);

/** A recipe selector as a query under the root element: `& .x` → `:scope .x`; null for `&`. */
export const queryOf = (selector: string) =>
  selector === '&' ? null : selector.replace(/^&\s*/, ':scope ');

/** Whether `el` sits in a composed child a case marks, below `root`. */
const inChild = (el: Node, root: Node) => {
  for (let e = el.parentElement; e && e !== root; e = e.parentElement)
    if (e.hasAttribute('data-layer')) return true;
  return false;
};

/** Every element of `root` that is the layer: the one a case marks, else the selector's. */
function elementsOf<T extends Node>(root: T, layer: Locatable): T[] {
  const marked = root.querySelector(
    `:scope [data-layer=${JSON.stringify(layer.name)}]`,
  );
  if (marked) return [marked as T];
  const selector = selectorOf(layer);
  if (!selector) return [];
  const query = queryOf(selector);
  if (query === null) return [root];
  return [...root.querySelectorAll(query)].filter(
    (e) => !inChild(e, root),
  ) as T[];
}

/** The layer's element in the component whose root element is `root`, or null. */
export const layerElement = <T extends Node>(root: T, layer: Locatable) =>
  elementsOf(root, layer)[0] ?? null;

/**
 * The layer a click on `target` points at: the nearest element, from the target up to the
 * component's root element, that is a layer's, the root's first where several layers share one
 * element; else (the target outside the component, or in no layer) the root.
 */
export function layerAt(target: Node, root: Node, layers: Locatable[]): string {
  const ordered = [
    ...layers.filter((l) => l.name === 'root'),
    ...layers.filter((l) => l.name !== 'root'),
  ];
  const owner = new Map<Node, string>();
  for (const l of ordered)
    for (const el of elementsOf(root, l))
      if (!owner.has(el)) owner.set(el, l.name);
  for (let n: Node | null = target; n; n = n.parentElement) {
    const hit = owner.get(n);
    if (hit) return hit;
    if (n === root) break;
  }
  return 'root';
}
