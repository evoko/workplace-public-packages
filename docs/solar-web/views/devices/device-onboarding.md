# Device Onboarding

> SOLAR Web · Figma page `↳ 🟢 Device Onboarding` (id `6133:4`) · section `views/devices` · raw data: [`raw/views/devices/device-onboarding.json`](../../raw/views/devices/device-onboarding.json)

## Compositions and examples on this page

### Dialog (instance of Dialog, 480×464)

Uses: Step ×5, Icon/None ×4, Radio ×3, Button ×2, Spinner ×2, Counter ×2, Dialog ×1, Icon/Empty ×1, Icon Button ×1, Icon/Close ×1, Stepper ×1, Button Group ×1

- **Dialog** · instance of **Dialog** (type=wizard) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 480×464  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

> Make sure the device is powered on and connected to the same network. Discovery uses mDNS and AVB neighbor packets.

### Dialog (instance of Dialog, 480×464)

Uses: Icon/None ×6, Step ×5, Button ×3, Spinner ×3, Counter ×3, Dialog ×1, Icon/Empty ×1, Icon Button ×1, Icon/Close ×1, Stepper ×1, Button Group ×1

- **Dialog** · instance of **Dialog** (type=wizard) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 480×464  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

> Press Blink LED and confirm you see the indicator flashing on the physical hardware.

### Dialog (instance of Dialog, 480×464)

Uses: Icon/None ×6, Step ×5, Select ×2, Icon/ChevronDown ×2, Button ×2, Spinner ×2, Counter ×2, Dialog ×1, Icon/Empty ×1, Icon Button ×1, Icon/Close ×1, Stepper ×1, Text Input ×1, Button Group ×1

- **Dialog** · instance of **Dialog** (type=wizard) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 480×464  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

> Give this device a name and a location. You can change these later.

### Dialog (instance of Dialog, 480×464)

Uses: Step ×5, Icon/None ×4, Button ×2, Spinner ×2, Counter ×2, Dialog ×1, Icon/Empty ×1, Icon Button ×1, Icon/Close ×1, Stepper ×1, Button Group ×1

- **Dialog** · instance of **Dialog** (type=wizard) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 480×464  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

## Documentation card

**Description**

The guided flow to add and provision a new device — discovery, identity, network and confirmation. First-run entry from Device List.

**Layout**

Multi-step Wizard: discover / scan → identify (name · location) → network / config → review → success. Progress indicator + per-step actions.

**Responsive**

Desktop centered wizard; mobile full-screen steps.

**States**

per step: default, validating, error, retry (discovery fail); submitting; success → Device Detail.

**Accessibility**

Steps announce progress (step X of N); each step is a labelled form; errors linked; back / next keyboard-operable.

**Rules**

Show clear step progress  
Validate per step  
Allow back without data loss  
Confirm on success

Skip the review step  
Lose entries on back  
Dead-end on discovery failure  
Over-ask up front
