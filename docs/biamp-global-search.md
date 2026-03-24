# BiampGlobalSearch

A searchable autocomplete component with support for icons, subtitles, associated-item chips, keyboard navigation hints, and click handlers. Built on MUI's `Autocomplete` in `freeSolo` mode.

> **Important:** This component uses `freeSolo` mode with `filterOptions={(x) => x}` — it does **not** filter options internally. Consumers must provide their own filtering logic and pass already-filtered options.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/styles` >= 1.0.3
- `@bwp-web/assets` >= 1.0.1
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Types

### `BiampGlobalSearchOption`

| Property          | Type                  | Required | Description                                                          |
| ----------------- | --------------------- | -------- | -------------------------------------------------------------------- |
| `title`           | `string`              | Yes      | Primary label for the option                                         |
| `icon`            | `React.ReactNode`     | No       | Leading icon (rendered in a 24x24 container)                         |
| `subtitle`        | `string`              | No       | Secondary text shown on hover/focus                                  |
| `associatedItems` | `{ label: string }[]` | No       | Chip labels shown on hover/focus (max 3 displayed, overflow counted) |
| `endIcon`         | `React.ReactNode`     | No       | Trailing icon shown on hover/focus                                   |
| `onClick`         | `() => void`          | No       | Called when the option is selected — useful for navigation           |

## Props

`BiampGlobalSearchProps` extends MUI `AutocompleteProps<BiampGlobalSearchOption, false, false, true>` (minus `renderInput`, `renderOption`, and `PaperComponent`).

| Prop            | Type                                      | Default              | Description                                        |
| --------------- | ----------------------------------------- | -------------------- | -------------------------------------------------- |
| `options`       | `BiampGlobalSearchOption[]`               | `[]`                 | The list of (pre-filtered) options to display      |
| `inputValue`    | `string`                                  | —                    | Controlled input value                             |
| `onInputChange` | `(event, value, reason) => void`          | —                    | Called when the input value changes                |
| `onChange`      | `(event, value, reason, details) => void` | —                    | Called when an option is selected                  |
| `loading`       | `boolean`                                 | `false`              | Shows a loading indicator in the dropdown          |
| `placeholder`   | `string`                                  | `'Search...'`        | Placeholder text for the input                     |
| `noResultsText` | `string`                                  | `'No results found'` | Text shown when `options` is empty and not loading |
| `clearOnSelect` | `boolean`                                 | `true`               | Clears the input after an option is selected       |
| `inputSx`       | `SxProps<Theme>`                          | —                    | Additional styles for the input field              |
| _...rest_       | `AutocompleteProps`                       | —                    | All other MUI Autocomplete props are forwarded     |

## Basic Usage

```tsx
import { useState, useMemo } from 'react';
import {
  BiampGlobalSearch,
  BiampGlobalSearchOption,
} from '@bwp-web/components';

const allOptions: BiampGlobalSearchOption[] = [
  { title: 'Conference Room A' },
  { title: 'Conference Room B' },
  { title: 'Lobby' },
];

function Search() {
  const [inputValue, setInputValue] = useState('');

  const filtered = useMemo(
    () =>
      allOptions.filter((o) =>
        o.title.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    [inputValue],
  );

  return (
    <BiampGlobalSearch
      options={filtered}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
    />
  );
}
```

## In-Header Usage

```tsx
import {
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderActions,
  BiampGlobalSearch,
} from '@bwp-web/components';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);

  return (
    <BiampHeader>
      <BiampHeaderTitle title="Workplace" subtitle="Booking" />
      <BiampGlobalSearch
        sx={{ flexGrow: 1 }}
        options={options}
        inputValue={inputValue}
        onInputChange={(_, value) => {
          setInputValue(value);
          setOptions(filterOptions(value));
        }}
      />
      <BiampHeaderActions>{/* ... */}</BiampHeaderActions>
    </BiampHeader>
  );
}
```

## onClick Navigation

Use the `onClick` property on options to navigate when an option is selected:

```tsx
const options: BiampGlobalSearchOption[] = [
  {
    title: 'Settings',
    icon: <SettingsIcon />,
    onClick: () => navigate('/settings'),
  },
  {
    title: 'Profile',
    icon: <PersonIcon />,
    onClick: () => navigate('/profile'),
  },
];

<BiampGlobalSearch
  options={options}
  inputValue={inputValue}
  onInputChange={(_, value) => setInputValue(value)}
/>;
```

When `clearOnSelect` is `true` (the default), the input is cleared after selection, making it easy to use as a navigation launcher.

## Async Loading

```tsx
function AsyncSearch() {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<BiampGlobalSearchOption[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = async (_: unknown, value: string) => {
    setInputValue(value);
    if (!value) {
      setOptions([]);
      return;
    }
    setLoading(true);
    const results = await fetchSearchResults(value);
    setOptions(results);
    setLoading(false);
  };

  return (
    <BiampGlobalSearch
      options={options}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      loading={loading}
    />
  );
}
```

## Exports

- `BiampGlobalSearch` — The search autocomplete component.
- `BiampGlobalSearchOption` — TypeScript interface for option objects.
- `BiampGlobalSearchProps` — TypeScript type for component props.
