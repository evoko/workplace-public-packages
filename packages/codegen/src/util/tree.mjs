/**
 * A component's layer tree, from its IR: each layer's children, in Figma's order. Both platforms'
 * recipes carry it (`solar<Name>Tree`, `Solar<Name>Recipe.tree`), and the shells, written by hand,
 * import it, so a layer Figma adds reaches every shell with no edit to it.
 */
export const treeOf = (spec) => {
  const tree = {};
  for (const [name, l] of Object.entries(spec.layers))
    if (l.parent !== null) (tree[l.parent] ??= []).push(name);
  return tree;
};
