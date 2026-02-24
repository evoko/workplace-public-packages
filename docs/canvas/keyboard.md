# Keyboard

Keyboard shortcut utilities for the canvas.

## `enableKeyboardShortcuts(canvas): () => void`

Enables default keyboard shortcuts. Currently supports:

| Key | Action |
|---|---|
| **Delete** | Delete selected objects |
| **Backspace** | Delete selected objects |
| **Escape** | Deselect all objects |

```typescript
import { enableKeyboardShortcuts } from '@bwp-web/canvas';

const cleanup = enableKeyboardShortcuts(canvas);
```

> Enabled by default in `useEditCanvas` when `keyboardShortcuts` option is `true` (default).

---

## `deleteObjects(canvas, ...objects)`

Programmatically delete one or more objects from the canvas.

```typescript
import { deleteObjects } from '@bwp-web/canvas';

// Delete specific objects
deleteObjects(canvas, rect1, rect2);

// Delete all selected objects
const selected = canvas.getActiveObjects();
deleteObjects(canvas, ...selected);
```
