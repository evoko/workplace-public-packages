/**
 * Resolves a shadow node's layers for one mode, turning the `{color.shadow.subtle}` alias in
 * each layer into the concrete colour for that mode. `index` is a Map of token name to token.
 */
export function shadowLayers(index, node, mode) {
  return node.$value.map((layer) => {
    const ref = /^\{(.+)\}$/.exec(layer.color);
    if (!ref) return { ...layer };
    const token = index.get(ref[1]);
    if (!token) throw new Error(`shadow references unknown token: ${ref[1]}`);
    return { ...layer, color: token.modes?.[mode] ?? token.value };
  });
}

export const shadowToCss = (layers) =>
  layers
    .map((l) => `${l.offsetX} ${l.offsetY} ${l.blur} ${l.spread} ${l.color}`)
    .join(', ');
