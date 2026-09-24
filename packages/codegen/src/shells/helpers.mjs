/** What the shell templates (src/components/<name>.mjs) share. */

import { dartEnumValue } from '../emit/flutter.mjs';

/** The MUI prop each slot type becomes; a slot type with no entry here has no template. */
export const MUI_SLOT_PROPS = {
  iconLeading: 'startIcon',
  iconTrailing: 'endIcon',
};

/** A Dart constructor parameter for one API prop, with the IR's default. */
export function dartParam(component, prop, def) {
  if (def.type === 'boolean') return `this.${prop} = ${def.default}`;
  if (def.type === 'color') return `this.${prop}`;
  const id = dartEnumValue(def.default);
  return `this.${prop} = Solar${component}${prop[0].toUpperCase()}${prop.slice(1)}.${id}`;
}

/** A Dart field for one API prop. */
export function dartField(component, prop, def) {
  if (def.type === 'color') return `  final Color? ${prop};`;
  const type =
    def.type === 'boolean'
      ? 'bool'
      : `Solar${component}${prop[0].toUpperCase()}${prop.slice(1)}`;
  return `  final ${type} ${prop};`;
}
