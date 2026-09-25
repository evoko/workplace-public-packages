/**
 * A Figma vector's outlines, as the fetcher (fetch-rest.mjs) records them: in the layer's box, as
 * Figma draws them. Its own module, so the codegen's tests reach it without running the fetch.
 */

/**
 * A vector's outlines as Figma draws them in the layer's box. REST gives each in the node's own
 * coordinates, before its transform: a rotated vector (Tooltip's left arrow, its bottom arrow
 * turned a quarter) would draw unturned. Where the node's transform turns or flips it, each point
 * is turned by it and the outline moved to the box's corner, so the path draws as Figma shows it.
 * The paths are `M L C H V Z`, absolute, as the codegen accepts; `H` and `V` become `L` where
 * they are turned.
 */
export function drawnPath(path, n) {
  const t = n.relativeTransform;
  if (!t) return path;
  const [[a, b], [c, d]] = t;
  const turned =
    Math.abs(a - 1) > 1e-6 ||
    Math.abs(b) > 1e-6 ||
    Math.abs(c) > 1e-6 ||
    Math.abs(d - 1) > 1e-6;
  if (!turned) return path;
  const turn = (x, y) => [a * x + b * y, c * x + d * y];
  // Where the box's corner lands once turned: the outline is moved back to it.
  const w = n.size?.x ?? 0;
  const h = n.size?.y ?? 0;
  const corners = [turn(0, 0), turn(w, 0), turn(0, h), turn(w, h)];
  const dx = Math.min(...corners.map(([x]) => x));
  const dy = Math.min(...corners.map(([, y]) => y));
  const num = (v) => {
    const r = Math.round(v * 1e5) / 1e5;
    return Object.is(r, -0) ? '0' : String(r);
  };
  const out = [];
  let at = [0, 0];
  const tokens = path.match(/[MLCHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  let i = 0;
  const next = () => Number(tokens[i++]);
  let cmd = null;
  while (i < tokens.length) {
    if (/^[A-Z]$/i.test(tokens[i])) cmd = tokens[i++];
    const point = (x, y) => {
      const [px, py] = turn(x, y);
      return `${num(px - dx)} ${num(py - dy)}`;
    };
    if (cmd === 'Z') {
      out.push('Z');
      continue;
    }
    if (cmd === 'M' || cmd === 'L') {
      const x = next();
      const y = next();
      at = [x, y];
      out.push(`${cmd}${point(x, y)}`);
    } else if (cmd === 'H' || cmd === 'V') {
      const v = next();
      at = cmd === 'H' ? [v, at[1]] : [at[0], v];
      out.push(`L${point(...at)}`);
    } else if (cmd === 'C') {
      const p = [next(), next(), next(), next(), next(), next()];
      at = [p[4], p[5]];
      out.push(
        `C${point(p[0], p[1])} ${point(p[2], p[3])} ${point(p[4], p[5])}`,
      );
    } else throw new Error(`${n.name}: path command ${cmd} cannot be turned`);
  }
  return out.join('');
}
