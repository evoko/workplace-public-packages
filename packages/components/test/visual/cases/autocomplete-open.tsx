import Box from '@mui/material/Box';
import { solarAutocompleteOpenStyle } from '@bwp-web/styles/mui';
import oracle from '../../../../../spec/verify/autocomplete-open.json';
import { Autocomplete } from '../../../src/Autocomplete.js';
import { DropdownGroupLabel } from '../../../src/DropdownGroupLabel.js';
import { DropdownItem } from '../../../src/DropdownItem.js';
import { DropdownMenu } from '../../../src/DropdownMenu.js';
import type { VisualCase } from './types.js';

// An open Autocomplete, as Figma composes it (no component of its own): its frame, from its
// recipe, the Autocomplete at rest (its overlay's decision) with no label, helper or icons, as
// Figma's instance hides them (the oracle's hides), and the Dropdown Menu under it by the frame's
// gap, which an Autocomplete floats its suggestions by; the menu's heading and the five rows
// Figma's instance shows.
export default {
  oracle,
  render: () => (
    <Box sx={solarAutocompleteOpenStyle()}>
      <Autocomplete<string>
        data-layer="autocomplete"
        options={[]}
        placeholder="Search"
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
        ].map((name) => (
          <DropdownItem key={name} data-layer={name}>
            Label
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Box>
  ),
} satisfies VisualCase;
