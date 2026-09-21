# Keyboard Shortcuts

> SOLAR Web · Figma page `↳ 🟢 Keyboard Shortcuts` (id `5066:24`) · section `views/help` · raw data: [`raw/views/help/keyboard-shortcuts.json`](../../raw/views/help/keyboard-shortcuts.json)

## Component: Keyboard Shortcuts

### Anatomy (default variant)

- **Keyboard Shortcuts** · component · 1200×760
  - **Scrim** · instance of **Scrim** · 1200×760  
    fill `color.surface.scrim`
  - **Dialog** · instance of **Dialog** (type=default) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 480×464  
    fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

### Tokens used

| Role    | Tokens                                        |
| ------- | --------------------------------------------- |
| Fills   | `color.surface.dialog`, `color.surface.scrim` |
| Radius  | `radius.dialog`                               |
| Effects | `shadow/dialog`                               |

### Composes

- Dialog
- Scrim

### Issues detected

- Component description is empty.

## Documentation card

**Description**

A reference overlay listing available keyboard shortcuts, grouped by area — usually opened with '?'. For discoverability of power-user keys.

**Layout**

Dialog / overlay: grouped sections · rows of action + Kbd keys · search / filter · close.

**Responsive**

Desktop dialog; mobile full-screen (or hidden where there's no keyboard).

**States**

open, closed, search / no-results; scrollable groups.

**Accessibility**

role=dialog, labelled, focus-trapped, Esc closes; shortcuts as a description list; keys shown via Kbd as text. Keyboard-complete.

**Rules**

Open with '?'  
Group by area  
Use Kbd for keys  
Make it searchable

Hide it from discovery  
List unavailable shortcuts  
Rely on icons for keys  
Trap without Esc
