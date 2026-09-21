---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/accessibility: 0aad1e252312
---

# 03 · Accessibility

> Source: Figma page "Accessibility" (Accessibility at Biamp, Principles, WCAG & ARIA,
> Acceptance Criteria, Responsibilities, Tooling & Validation, Definition of Done,
> Design System Guarantees, Checklist, Component ARIA Reference) plus the page's
> `@SOLAR:PAGE_CONTEXT` block.

## Position

Accessibility improves the experience for everyone. In SOLAR it is not an add-on; it is
embedded in tokens, components, patterns, and implementation standards as a core
quality of product design and engineering.

SOLAR components are designed to meet **WCAG 2.1 Level AA by default**. Keyboard
support, semantic structure, focus management, contrast-safe color tokens, and motion
standards are built into the system foundation. Accessibility is only achieved when
these foundations are applied correctly end-to-end.

## Principles

| Principle                              | Meaning                                                                                                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Access without barriers**            | All functionality and information reachable with assistive technologies or alternative input. Nothing locked behind vision, sound, color, motion, or precise motor control. |
| **Multiple ways to perceive**          | Never rely on one sensory channel. Visual, auditory, and motion cues are reinforced with text, structure, or other perceivable alternatives.                                |
| **Predictable and navigable**          | Clear semantic structure: headings, landmarks, focus order, and interaction patterns are logical, consistent, and machine-readable.                                         |
| **Respect user preferences and needs** | Honour system preferences such as reduced motion, text scaling, and contrast; adapt gracefully across devices and environments.                                             |

## WCAG and ARIA

WCAG defines _what_ accessible experiences must achieve; ARIA defines _how_ custom
components communicate role, state, and behaviour when native HTML is not enough.

- **Level AA is required** for all Biamp products; enforced through components,
  patterns, and acceptance criteria.
- **Level AAA is aspirational**: applied selectively where context justifies it, as a
  quality enhancement rather than a default requirement.

ARIA in SOLAR:

- Use native HTML semantics first; ARIA supplements, never replaces.
- Every interactive component exposes its role (button, dialog, listbox…).
- State changes are announced via attributes (`aria-expanded`, `aria-checked`,
  `aria-selected`).
- Dynamic content uses live regions (`aria-live`).
- Focus is managed explicitly for overlays, dialogs, and disclosure patterns.

## Numeric requirements

| Requirement                | Value                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| Text contrast (normal)     | ≥ 4.5:1                                                                                                  |
| Text contrast (large)      | ≥ 3:1 (18 px+ regular, or 14 px+ bold)                                                                   |
| UI components and graphics | ≥ 3:1 against adjacent colors (borders, icons, controls, meaningful non-text visuals)                    |
| Focus indicator            | ≥ 3:1 against both the component and the surrounding background; 2 px offset ring                        |
| Disabled elements          | Exempt from contrast, but must remain perceivable (opacity ≥ 0.38)                                       |
| Touch targets              | ≥ 44 × 44 px on touch interfaces; ≥ 8 px between adjacent targets; icon may be smaller than its tap area |
| Zoom                       | Layout usable at 200 % zoom without horizontal scrolling                                                 |
| Flashing                   | Nothing flashes more than 3 times per second                                                             |
| Decorative animation       | ≤ 5 s unless user-initiated; every animation has a reduced-motion variant                                |
| Lighthouse                 | Accessibility score ≥ 95                                                                                 |

## Keyboard model

| Key           | Behaviour                                                                         |
| ------------- | --------------------------------------------------------------------------------- |
| Tab order     | Follows logical reading / DOM flow; no jumps, no traps; never positive `tabindex` |
| Enter         | Activates buttons, links, primary actions                                         |
| Space         | Activates buttons, toggles, checkboxes                                            |
| Escape        | Closes overlays, dialogs, dropdowns                                               |
| Arrow keys    | Navigate within composite widgets (tabs, menus, listboxes)                        |
| Skip links    | Provide "skip to main content" for page-level navigation                          |
| Focus visible | Every interactive element shows a high-contrast focus ring (`:focus-visible`)     |
| Dialogs       | Trap focus; Escape closes and returns focus to the trigger                        |
| Disabled      | Removed from the tab order                                                        |

## Screen-reader model

- Meaningful images have alt text; decorative images are `aria-hidden`.
- Icon buttons have `aria-label` or visually hidden text; never icon-only without a name.
- Live regions: `aria-live="polite"` for dynamic updates, `"assertive"` for errors.
- Every input has an associated `<label>` or `aria-label`.
- Semantic heading hierarchy (h1 → h2 → h3) with no skipped levels.
- Landmarks: `<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`.
- Data tables use `<th scope>` and a `<caption>`.

## Acceptance criteria (WCAG success criteria SOLAR treats as non-negotiable)

| Principle                 | Success criteria                                                                                                                        | Prevents                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Access without barriers   | 2.1.1 Keyboard · 2.1.2 No Keyboard Trap · 2.5.1 Pointer Gestures · 2.5.5 Target Size (AAA) · 1.1.1 Text Alternatives                    | Mouse-only or touch-only interactions; vision-dependent controls; precision or time-sensitive actions |
| Multiple ways to perceive | 1.3.1 Info and Relationships · 1.4.1 Use of Color · 1.4.3 Contrast (Minimum) · 1.4.5 Images of Text · 1.2.1–1.2.5 Time-based Media      | Color-only status indicators; audio-only instructions; motion-only feedback; screen-reader confusion  |
| Predictable and navigable | 1.3.2 Meaningful Sequence · 2.4.1 Bypass Blocks · 2.4.2 Page Titled · 2.4.3 Focus Order · 2.4.6 Headings and Labels                     | Lost focus or trapped navigation; flat or purely visual hierarchies                                   |
| Respect user preferences  | 1.4.4 Resize Text · 1.4.10 Reflow · 2.2.2 Pause, Stop, Hide · 2.3.3 Animation from Interactions (AAA) · 3.2.1 On Focus / 3.2.2 On Input | Motion-induced discomfort; broken layouts at high zoom; surprising or disorienting behaviour          |

## Responsibilities

| Team                  | Responsibility                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Design System teams   | Provide accessible components, tokens and patterns that meet AA by default; document behaviour and constraints; prevent regressions at component level |
| Product teams         | Use components correctly; ensure full flows are accessible; validate content, patterns and integrations                                                |
| Engineering teams     | Preserve semantics and focus behaviour; include accessibility in acceptance criteria; prevent regressions during refactoring                           |
| QA / Validation teams | Verify through manual and automated testing; confirm keyboard navigation and focus; prevent regressions before release                                 |

## Tooling and validation

| Automated               | Manual                                  | Design validation                |
| ----------------------- | --------------------------------------- | -------------------------------- |
| axe-core / axe DevTools | Keyboard-only navigation                | Contrast plugins in Figma        |
| Accessibility Insights  | Screen reader testing (NVDA, VoiceOver) | Token-level contrast enforcement |
| Lighthouse              | Zoom to 200 %                           | Motion review                    |
| CI accessibility checks | Reduced motion enabled                  | SOLAR Lint rules (A11Y-001…008)  |

Tools identify issues early and prevent regressions; they never replace manual
testing.

## Definition of done

A feature is not complete until it meets the accessibility bar. Accessibility issues are
quality defects, not enhancements or backlog items.

**Automated**

- Passes axe-core / Accessibility Insights with zero violations
- Lighthouse accessibility score ≥ 95
- No SOLAR validation rule errors

**Keyboard and focus**

- All functionality operable via keyboard alone
- Focus order follows a logical reading sequence
- Focus ring visible on every interactive element and not clipped by overflow
- Dialogs trap focus; focus returns to the trigger on close

**Screen reader**

- Component roles and states announced correctly (per the ARIA reference below)
- Dynamic updates announced via live regions
- Form inputs have associated labels and error descriptions

**Visual**

- Text contrast ≥ 4.5:1 normal, ≥ 3:1 large
- Non-text contrast ≥ 3:1
- Color is never the sole means of conveying information
- Layout usable at 200 % zoom without horizontal scrolling

## Design system guarantees

When components and tokens are used as documented, SOLAR guarantees that core
components meet WCAG 2.1 AA at baseline, keyboard support is built in, focus states are
standardized and visible, color tokens meet minimum contrast, motion tokens respect
reduced motion, and semantic structure is preserved. **Custom components must meet the
same standards.**

## AA baseline checklist

| Perceivable                                          | Operable                                   | Understandable                               | Robust                                               |
| ---------------------------------------------------- | ------------------------------------------ | -------------------------------------------- | ---------------------------------------------------- |
| Non-text content has meaningful text alternatives    | All functionality is keyboard accessible   | Language is clear and consistent             | Semantic HTML and correct roles are used             |
| Color is not the only way to convey meaning          | Focus order is logical and visible         | Navigation behaves predictably               | ARIA is applied correctly and only when necessary    |
| Text and UI meet contrast requirements (4.5:1 / 3:1) | No keyboard traps exist                    | Inputs have clear labels and error messaging | Content works with screen readers and assistive tech |
| Content reflows correctly at 200 % zoom              | Interactive targets are sufficiently large | Users can recover from errors                |                                                      |
| Captions or transcripts are provided for media       | Users can pause or control moving content  |                                              |                                                      |

## Component ARIA reference

Required HTML semantics and ARIA attributes for each SOLAR component. Implementations
must follow these mappings.

### Inputs

| Component     | HTML element              | ARIA role           | Required attributes                | Notes                                    |
| ------------- | ------------------------- | ------------------- | ---------------------------------- | ---------------------------------------- |
| Button        | `<button>`                | implicit button     | —                                  | `type="button"` unless submitting a form |
| Button (link) | `<a>`                     | implicit link       | `href`                             | Use when the action navigates            |
| IconButton    | `<button>`                | implicit button     | `aria-label`                       | Label mandatory for icon-only            |
| TextInput     | `<input>`                 | implicit textbox    | `aria-describedby`, `aria-invalid` | Always pair with a visible `<label>`     |
| TextArea      | `<textarea>`              | implicit textbox    | `aria-describedby`, `aria-invalid` | Same as TextInput                        |
| NumberInput   | `<input type="number">`   | implicit spinbutton | `aria-valuemin/max/now`            | —                                        |
| SearchField   | `<input type="search">`   | searchbox           | `aria-label` or visible label      | Wrap in `role="search"`                  |
| PasswordInput | `<input type="password">` | implicit textbox    | `aria-describedby`                 | Add show/hide toggle                     |
| FileInput     | `<input type="file">`     | implicit            | `aria-describedby`                 | Style the label, not the input           |

### Selection

| Component      | HTML element              | ARIA role         | Required attributes                                                            | Notes                       |
| -------------- | ------------------------- | ----------------- | ------------------------------------------------------------------------------ | --------------------------- |
| SelectDropdown | `<div>`                   | listbox           | `aria-expanded`, `aria-activedescendant`, `aria-labelledby`                    | Options use `role="option"` |
| Combobox       | `<input>`                 | combobox          | `aria-expanded`, `aria-autocomplete`, `aria-activedescendant`, `aria-controls` | Listbox popup               |
| Checkbox       | `<input type="checkbox">` | implicit checkbox | `aria-checked`, `aria-describedby`                                             | Native preferred            |
| Radio          | `<input type="radio">`    | implicit radio    | `aria-checked`                                                                 | Group with `radiogroup`     |
| Switch         | `<button>`                | switch            | `aria-checked`                                                                 | Use `role="switch"`         |
| Slider         | `<input type="range">`    | implicit slider   | `aria-valuemin/max/now`, `aria-label`                                          | —                           |

### Navigation and disclosure

| Component   | HTML element         | ARIA role                   | Required attributes                            | Notes                                |
| ----------- | -------------------- | --------------------------- | ---------------------------------------------- | ------------------------------------ |
| Tabs        | `<div>`              | tablist                     | `role="tab"`, `aria-selected`, `aria-controls` | Arrow-key navigation                 |
| Accordion   | `<div>`              | —                           | `aria-expanded`, `aria-controls`               | Use `<button>` for triggers          |
| Breadcrumbs | `<nav>`              | navigation                  | `aria-label="Breadcrumb"`                      | Current: `aria-current="page"`       |
| Navbar      | `<nav>`              | navigation                  | `aria-label`                                   | —                                    |
| Sidebar     | `<aside>` or `<nav>` | complementary or navigation | `aria-label`                                   | Use navigation if it holds nav links |
| Pagination  | `<nav>`              | navigation                  | `aria-label="Pagination"`                      | `aria-current="page"`                |
| Stepper     | `<ol>`               | —                           | `aria-current="step"`                          | `<li>` per step                      |

### Overlays and feedback

| Component      | HTML element | ARIA role       | Required attributes                                        | Notes                                   |
| -------------- | ------------ | --------------- | ---------------------------------------------------------- | --------------------------------------- |
| Dialog         | `<dialog>`   | dialog          | `aria-labelledby`, `aria-describedby`, `aria-modal="true"` | Trap focus; return on close             |
| Drawer         | `<dialog>`   | dialog          | `aria-labelledby`, `aria-modal="true"`                     | Same as Dialog                          |
| Popover        | `<div>`      | —               | `aria-describedby` on trigger                              | Dismiss on Escape                       |
| Tooltip        | `<div>`      | tooltip         | `aria-describedby` on trigger                              | Hover AND focus; no interactive content |
| Menu           | `<div>`      | menu            | `role="menuitem"`, `aria-expanded` on trigger              | Arrow + Escape navigation               |
| Alert / Banner | `<div>`      | alert or status | `role="alert"` for urgent                                  | Alert fires on render                   |
| Toast          | `<div>`      | status          | `role="status"`, `aria-live="polite"`                      | Sufficient reading time                 |

### Data and status

| Component   | HTML element           | ARIA role      | Required attributes                          | Notes                             |
| ----------- | ---------------------- | -------------- | -------------------------------------------- | --------------------------------- |
| Table       | `<table>`              | implicit table | `aria-label` or `aria-labelledby`            | `<th scope>` for headers          |
| Card        | `<article>` or `<div>` | —              | `aria-labelledby` if it has a heading        | Interactive: wrap in `<a>`        |
| Badge       | `<span>`               | status         | `aria-label` if icon-only                    | Decorative: `aria-hidden`         |
| ProgressBar | `<div>`                | progressbar    | `aria-valuenow/min/max`, `aria-label`        | —                                 |
| Spinner     | `<div>`                | status         | `aria-label="Loading"`, `aria-live="polite"` | Hidden when done                  |
| Skeleton    | `<div>`                | —              | `aria-hidden="true"`                         | Announce loaded content           |
| Divider     | `<hr>`                 | separator      | `aria-orientation` if vertical               | Decorative: `role="presentation"` |

## Agent behaviour (from the page context)

- Check accessibility criteria **first** when reviewing any design or code.
- Flag violations with severity: critical (blocks access), major (degrades experience),
  minor (improvement opportunity), and always provide a concrete fix.
- If a component lacks accessible markup, provide the complete ARIA pattern.
- Never approve a design that fails contrast or keyboard requirements.
- Never remove focus outlines without an equivalent indicator; never use color alone;
  never auto-play media or trigger motion without user control; never block keyboard
  access; never skip heading levels.
