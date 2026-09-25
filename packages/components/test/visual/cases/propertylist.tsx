import { Fragment } from 'react';
import oracle from '../../../../../spec/verify/propertylist.json';
import { Divider } from '../../../src/Divider.js';
import {
  PropertyList,
  type PropertyListProps,
} from '../../../src/PropertyList.js';
import { propertyRow } from './propertyrow.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { component?: string; variant?: Record<string, string> };

/** The rows and dividers Figma draws in the variant, in its order, each with its layer. */
const held = (v: OracleVariant) =>
  Object.entries(v.layers as Record<string, ChildLayer>).filter(
    ([, l]) => l.component === 'PropertyRow' || l.component === 'Divider',
  );

// Figma's rows and dividers, each marked with its layer, so the list draws none of its own; each
// row given the control its trailing names, as the PropertyRow case gives it.
export default {
  oracle,
  render: (v) => (
    <PropertyList
      {...(v.props as Pick<PropertyListProps, 'inCard'>)}
      dividers={false}
    >
      {held(v).map(([name, l]) =>
        l.component === 'Divider' ? (
          <Divider key={name} data-layer={name} />
        ) : (
          <Fragment key={name}>
            {propertyRow(l.variant?.trailing ?? 'none', { 'data-layer': name })}
          </Fragment>
        ),
      )}
    </PropertyList>
  ),
} satisfies VisualCase;
