/**
 * Which layer a click in the Playground's box points at: the nearest element, from the one clicked
 * up to the box, carrying a layer's class (util/classes.mjs: `Solar<Name>-<slot>` or
 * `Solar<Name>--<layer>`), else the root, the component's own element.
 */

interface Node {
  classList: { contains(name: string): boolean };
  parentElement: Node | null;
}

export function layerAt(
  target: Node,
  box: Node,
  classes: Record<string, string | null>,
): string {
  const byClass = Object.entries(classes).filter(
    (entry): entry is [string, string] => entry[1] !== null,
  );
  for (let n: Node | null = target; n && n !== box; n = n.parentElement) {
    const here = n;
    const hit = byClass.find(([, c]) => here.classList.contains(c));
    if (hit) return hit[0];
  }
  return 'root';
}
