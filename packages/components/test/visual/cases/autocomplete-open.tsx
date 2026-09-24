import Box from '@mui/material/Box';
import { solarAutocompleteOpenStyle } from '@bwp-web/styles/mui';
import oracle from '../../../../../spec/verify/autocomplete-open.json';
import { Autocomplete } from '../../../src/Autocomplete.js';
import { DropdownGroupLabel } from '../../../src/DropdownGroupLabel.js';
import { DropdownItem } from '../../../src/DropdownItem.js';
import { DropdownMenu } from '../../../src/DropdownMenu.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// An open Autocomplete, as Figma composes it (no component of its own): its frame, from its
// recipe, the Autocomplete at rest (its overlay's decision), every slot filled, and the Dropdown
// Menu under it by the
// frame's gap, which an Autocomplete floats its suggestions by; the menu's heading and rows as
// Figma's Dropdown Menu draws them.
export default {
  oracle,
  render: () => (
    <Box sx={solarAutocompleteOpenStyle()}>
      <Autocomplete<string>
        data-layer="autocomplete"
        options={[]}
        label="Label"
        mandatory
        helper="Helper text"
        placeholder="Search"
        leadingIcon={icon}
        trailingIcon={icon}
      />
      <DropdownMenu data-layer="dropdownMenu">
        <DropdownGroupLabel data-layer="dropdownGroupLabel">
          Group Label
        </DropdownGroupLabel>
        {[
          'dropdownItem',
          'dropdownItem2',
          'dropdownItem3',
          'dropdownItem4',
          'dropdownItem5',
          'dropdownItem6',
        ].map((name) => (
          <DropdownItem key={name} data-layer={name}>
            Label
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Box>
  ),
} satisfies VisualCase;
