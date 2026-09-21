# Accessibility

> Verbatim text of the Figma page `Accessibility` (id `763:47332`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `0aad1e252312`. Curated chapter: [03-accessibility.md](../../03-accessibility.md).

## Slide 1

Accessibility

## Accessibility at Biamp

#### Accessibility improves the experience for everyone. When products are accessible, they are easier to understand, easier to use, and more resilient across devices, environments, and user abilities. In SOLAR, accessibility is not an add-on — it is embedded in tokens, components, patterns, and implementation standards as a core quality of product design and engineering.

An accessible product enables people of all abilities to:\
Interact with content and controls\
Understand information and feedback\
Navigate confidently and independently

SOLAR components are designed to meet WCAG 2.1 Level AA by default. Keyboard support, semantic structure, focus management, contrast-safe color tokens, and motion standards are built into the system foundation.

However, accessibility is only achieved when these foundations are applied correctly. Components, content, flows, and implementation must work together end-to-end to remove barriers rather than introduce them.

## Accessibility principles

#### These principles guide how we design and build accessible experiences across all Biamp products. They help turn accessibility from a requirement into everyday practice.

##### Access without barriers

##### Multiple ways to perceive

##### Predictable and navigable

##### Respect user preferences and needs

All functionality and information must be reachable by people using assistive technologies or alternative input methods. No interaction, content, or state should be locked behind vision, sound, color, motion, or precise motor control.

Information must never rely on a single sensory channel. Visual, auditory, and motion-based cues must always be reinforced with text, structure, or other perceivable alternatives so meaning is preserved across assistive technologies.

Accessible experiences rely on clear, semantic structure that allows users to navigate efficiently. Headings, landmarks, focus order, and interaction patterns must be logical, consistent, and machine-readable.

Users must remain in control of how they experience Biamp products. Interfaces must respect system-level preferences such as reduced motion, text scaling, and contrast, and adapt gracefully across devices and environments.

## WCAG & ARIA

#### SOLAR accessibility is built on two complementary standards. WCAG defines what accessible experiences must achieve — contrast, keyboard access, focus order, semantic structure. ARIA defines how custom components communicate their role, state, and behavior to assistive technologies when native HTML semantics are not sufficient.

##### Level AA (Required)

Covers the most common and impactful accessibility barriers\
Required for all Biamp products and experiences\
Enforced through design system components, patterns, and acceptance criteria

##### Level AAA (Aspirational)

Addresses additional, more specialized accessibility needs\
Applied selectively where context, audience, or product goals justify it\
Considered a quality enhancement, not a default requirement

##### ARIA in SOLAR

Use native HTML semantics first — ARIA supplements, never replaces\
Every interactive component exposes its role (button, dialog, listbox, etc.)\
State changes are announced via attributes (aria-expanded, aria-checked, aria-selected)\
Dynamic content uses live regions (aria-live) so screen readers announce updates\
Focus is managed explicitly for overlays, dialogs, and disclosure patterns\
Full component-to-ARIA mappings are documented in the Component ARIA Reference

_[image: image 1]_

## Acceptance Criteria

#### WCAG success criteria define the measurable requirements that ensure our products meet accessibility standards. They turn principles into concrete, testable outcomes that guide design and engineering. In SOLAR, they act as non-negotiable quality benchmarks for inclusive and compliant experiences.

##### Access without barriers

##### Multiple ways to perceive

##### Predictable and navigable

Respect user preferences and needs

###### WCAG success criteria

###### WCAG success criteria

###### WCAG success criteria

WCAG success criteria

2.1.1 Keyboard — All functionality is operable through a keyboard\
2.1.2 No Keyboard Trap — Users can move focus freely\
2.5.1 Pointer Gestures — No complex gestures required\
2.5.5 Target Size (AAA) — Adequate hit areas for controls\
1.1.1 Text Alternatives — Non-text content has text alternatives

1.3.1 Info and Relationships — Meaning conveyed through structure, not visuals alone\
1.4.1 Use of Color — Color is not the only way to communicate meaning\
1.4.3 Contrast (Minimum) — Text meets contrast requirements\
1.4.5 Images of Text — Text is real text, not images\
1.2.1–1.2.5 Time-based Media — Captions, transcripts, and audio descriptions

1.3.2 Meaningful Sequence — Logical reading and navigation order\
2.4.1 Bypass Blocks — Skip navigation and landmarks\
2.4.2 Page Titled — Pages have clear, descriptive titles\
2.4.3 Focus Order — Focus moves in a predictable order\
2.4.6 Headings and Labels — Clear and descriptive structure

1.4.4 Resize Text — Content remains usable when text is scaled\
1.4.10 Reflow — Layout adapts without loss of content or function\
2.2.2 Pause, Stop, Hide — Users control moving content\
2.3.3 Animation from Interactions — Motion can be reduced (AAA)\
3.2.1 On Focus / 3.2.2 On Input — No unexpected context changes

###### What this prevents

###### What this prevents

###### What this prevents

What this prevents

Mouse-only or touch-only interactions\
Vision-dependent controls\
Precision-based or time-sensitive actions

Color-only status indicators\
Audio-only instructions\
Motion-only feedback

Screen-reader confusion\
Lost focus or trapped navigation\
Flat or purely visual hierarchies

Motion-induced discomfort\
Broken layouts at high zoom\
Surprising or disorienting behavior

## Responsibilities

#### Accessibility at Biamp is a shared responsibility. The Design System provides accessible foundations, but accessibility is achieved only when product and engineering teams apply, implement, and validate it throughout the entire experience.

##### Design System teams

##### Product Teams

##### Engineering Teams

##### QA / Validation teams

Designs and maintains accessible components, tokens, and patterns that meet WCAG 2.1 AA by default. Documents expected behavior and prevents accessibility regressions at the component level.

Design complete flows that use system components correctly and ensure accessibility is maintained across real user journeys, content, and edge cases.

Implement components using proper semantics, preserve keyboard and assistive-technology support, and treat accessibility requirements as part of the definition of done.

Test experiences across input methods and assistive technologies, verify compliance with accessibility standards, and prevent regressions before release.

Provides accessible components and tokens\
Documents accessibility behavior and constraints\
Prevents regressions at component level

Use components correctly\
Ensure full flows are accessible\
Validate content, patterns, and integrations

Preserves semantics and focus behavior\
Includes accessibility in acceptance criteria\
Prevents regressions during refactoring

Verifies accessibility through manual and automated testing\
Confirms keyboard navigation, focus work as intended\
Prevents accessibility regressions before release

## Tooling & Validation

#### Accessibility at Biamp is supported by both automated tooling and manual validation. While tools help identify issues early and prevent regressions, real testing ensures experiences work reliably across input methods and assistive technologies.

##### Automated Testing

##### Manual Testing

##### Design Validation

Automated tools help identify common accessibility issues early in development and prevent regressions over time. They provide scalable, repeatable validation across components and flows, but should always be complemented by manual testing.

Manual testing validates real interaction behavior across input methods and assistive technologies. It ensures focus order, keyboard support, screen reader output, and responsive behavior work reliably in real-world conditions.

Accessibility begins in design decisions. Validating contrast, motion, typography, and token usage early reduces rework and ensures accessibility is built into the system rather than corrected later.

axe-core / axe DevTools\
Accessibility Insights\
Lighthouse\
CI accessibility checks

Keyboard-only navigation\
Screen reader testing (NVDA, VoiceOver)\
Zoom to 200%\
Reduced motion enabled

Contrast plugins in Figma\
Token-level contrast enforcement\
Motion review

## Definition of Done

#### A feature is not complete until it meets the accessibility bar. Every item below must be verified before a component, flow, or page is considered shippable. Accessibility issues are treated as quality defects — not enhancements, not backlog items.

##### Automated

##### Keyboard & Focus

##### Screen Reader

##### Visual

Passes axe-core / Accessibility Insights with zero violations\
Lighthouse accessibility score ≥ 95\
No SOLAR validation rule errors (see Ch.09 Compliance Validation Rules)

All functionality is operable via keyboard alone\
Focus order follows a logical reading sequence\
Focus ring is visible on every interactive element and not clipped by overflow\
Dialogs trap focus; focus returns to trigger on close

Component roles and states are announced correctly (per Component ARIA Reference)\
Dynamic content updates are announced via live regions\
Form inputs have associated labels and error descriptions

Text contrast meets WCAG 2.1 AA (≥ 4.5:1 normal, ≥ 3:1 large)\
Non-text contrast meets WCAG 2.1 AA (≥ 3:1)\
Color is never the sole means of conveying information\
Layout remains usable at 200% zoom without horizontal scrolling

## Design System Guarantees

_[image: Rectangle 5]_

#### SOLAR Design System provides accessible foundations by default. These guarantees apply when components and tokens are used as documented.

The Design System guarantees:\
Core components meet WCAG 2.1 Level AA at baseline\
Keyboard support is built into interactive components\
Focus states are standardized and visible\
Color tokens meet minimum contrast requirements\
Motion tokens respect reduced-motion preferences\
Semantic structure is preserved in component implementation

Custom components must meet the same standards.

## Accessibility Checklist (AA Baseline)

#### This checklist supports validation across design and engineering. All Biamp products are expected to meet WCAG 2.1 Level AA unless otherwise specified.

##### Perceivable

##### Operable

##### Understandable

##### Robust

Non-text content has meaningful text alternatives\
Color is not the only way to convey meaning\
Text and UI elements meet contrast requirements (4.5:1 / 3:1)\
Content reflows correctly at 200% zoom\
Captions or transcripts are provided for media

All functionality is keyboard accessible\
Focus order is logical and visible\
No keyboard traps exist\
Interactive targets are sufficiently large\
Users can pause or control moving content

Language is clear and consistent\
Navigation behaves predictably\
Inputs have clear labels and error messaging\
Users can recover from errors

Semantic HTML and correct roles are used\
ARIA is applied correctly and only when necessary\
Content works with screen readers and assistive technologies

## Component ARIA Reference

#### This table defines the required HTML semantics and ARIA attributes for each SOLAR component. Implementations must follow these mappings to ensure assistive technology compatibility.

##### Inputs

Input components are the primary way users enter data. Each input type has specific HTML semantics and ARIA requirements to ensure screen readers announce the element's role, current value, and validation state correctly.

| Component     | HTML Element               | ARIA Role           | Required Attributes            | Notes                                      |
| ------------- | -------------------------- | ------------------- | ------------------------------ | ------------------------------------------ |
| Button        | &lt;button>                | implicit button     | —                              | Use type="button" unless submitting a form |
| Button (link) | &lt;a>                     | implicit link       | href                           | Use when action navigates                  |
| IconButton    | &lt;button>                | implicit button     | aria-label                     | Label mandatory for icon-only              |
| TextInput     | &lt;input>                 | implicit textbox    | aria-describedby, aria-invalid | Always pair with visible &lt;label>        |
| TextArea      | &lt;textarea>              | implicit textbox    | aria-describedby, aria-invalid | Same as TextInput                          |
| NumberInput   | &lt;input type="number">   | implicit spinbutton | aria-valuemin/max/now          | —                                          |
| SearchField   | &lt;input type="search">   | searchbox           | aria-label or visible label    | Wrap in role="search"                      |
| PasswordInput | &lt;input type="password"> | implicit textbox    | aria-describedby               | Add show/hide toggle                       |

##### Selection

Selection components let users choose from a set of options. Proper ARIA implementation is critical here because custom select dropdowns and comboboxes replace native browser controls and must replicate their accessibility behavior.

| Component      | HTML Element               | ARIA Role         | Required Attributes                                                    | Notes                     |
| -------------- | -------------------------- | ----------------- | ---------------------------------------------------------------------- | ------------------------- |
| SelectDropdown | &lt;div>                   | listbox           | aria-expanded, aria-activedescendant, aria-labelledby                  | Options use role="option" |
| Combobox       | &lt;input>                 | combobox          | aria-expanded, aria-autocomplete, aria-activedescendant, aria-controls | Listbox popup             |
| Checkbox       | &lt;input type="checkbox"> | implicit checkbox | aria-checked, aria-describedby                                         | Native preferred          |
| Radio          | &lt;input type="radio">    | implicit radio    | aria-checked                                                           | Group with radiogroup     |
| Switch         | &lt;button>                | switch            | aria-checked                                                           | Use role="switch"         |
| Slider         | &lt;input type="range">    | implicit slider   | aria-valuemin/max/now, aria-label                                      | —                         |

##### Navigation & Disclosure

Navigation and disclosure components organize content spatially and reveal it progressively. These rely on landmark roles and expansion state attributes so assistive technology can convey page structure and content visibility.

| Component   | HTML Element           | ARIA Role                   | Required Attributes                      | Notes                        |
| ----------- | ---------------------- | --------------------------- | ---------------------------------------- | ---------------------------- |
| Tabs        | &lt;div>               | tablist                     | role="tab", aria-selected, aria-controls | Arrow key navigation         |
| Accordion   | &lt;div>               | —                           | aria-expanded, aria-controls             | Use &lt;button> for triggers |
| Breadcrumbs | &lt;nav>               | navigation                  | aria-label="Breadcrumb"                  | Current: aria-current="page" |
| Navbar      | &lt;nav>               | navigation                  | aria-label                               | —                            |
| Sidebar     | &lt;aside> or &lt;nav> | complementary or navigation | aria-label                               | Use navigation if nav links  |
| Pagination  | &lt;nav>               | navigation                  | aria-label="Pagination"                  | aria-current="page"          |
| Stepper     | &lt;ol>                | —                           | aria-current="step"                      | Use &lt;li> per step         |

##### Overlays & Feedback

Overlays interrupt the current workflow to demand attention, while feedback components communicate status non-destructively. Focus management and live-region announcements are the key accessibility concerns for this group.

| Component      | HTML Element | ARIA Role       | Required Attributes                                  | Notes                                   |
| -------------- | ------------ | --------------- | ---------------------------------------------------- | --------------------------------------- |
| Dialog         | &lt;dialog>  | dialog          | aria-labelledby, aria-describedby, aria-modal="true" | Trap focus; return on close             |
| Drawer         | &lt;dialog>  | dialog          | aria-labelledby, aria-modal="true"                   | Same as Dialog                          |
| Popover        | &lt;div>     | —               | aria-describedby on trigger                          | Dismiss on Escape                       |
| Tooltip        | &lt;div>     | tooltip         | aria-describedby on trigger                          | Hover AND focus; no interactive content |
| Menu           | &lt;div>     | menu            | role="menuitem", aria-expanded on trigger            | Arrow + Escape navigation               |
| Alert / Banner | &lt;div>     | alert or status | role="alert" for urgent                              | Alert fires on render                   |
| Toast          | &lt;div>     | status          | role="status", aria-live="polite"                    | Sufficient reading time                 |

##### Data & Status

Data and status components display information rather than collect it. Accessibility for these centers on proper labeling, semantic structure (like &lt;th scope> for tables), and ensuring decorative elements are hidden from the accessibility tree.

| Component   | HTML Element             | ARIA Role      | Required Attributes                      | Notes                           |
| ----------- | ------------------------ | -------------- | ---------------------------------------- | ------------------------------- |
| Table       | &lt;table>               | implicit table | aria-label or aria-labelledby            | Use &lt;th scope> for headers   |
| Card        | &lt;article> or &lt;div> | —              | aria-labelledby if heading               | Interactive: wrap in &lt;a>     |
| Badge       | &lt;span>                | status         | aria-label if icon-only                  | Decorative: aria-hidden         |
| ProgressBar | &lt;div>                 | progressbar    | aria-valuenow/min/max, aria-label        | —                               |
| Spinner     | &lt;div>                 | status         | aria-label="Loading", aria-live="polite" | Hidden when done                |
| Skeleton    | &lt;div>                 | —              | aria-hidden="true"                       | Announce loaded content         |
| Divider     | &lt;hr>                  | separator      | aria-orientation if vertical             | Decorative: role="presentation" |
| FileInput   | &lt;input type="file">   | implicit       | aria-describedby                         | Style the label, not input      |

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Accessibility
domain: Inclusive Design & WCAG Compliance
version: 1.0
updated: 2026-03-23

[ROLE]
You are the SOLAR accessibility guardian. Every design and implementation decision must meet WCAG 2.1 AA as a minimum baseline. Aim for AAA where practical. Accessibility is never an afterthought — it is a core design requirement.

[SCOPE]
- WCAG 2.1 AA/AAA compliance targets
- Color contrast requirements
- Focus management and keyboard navigation
- Screen reader and assistive technology support
- Touch target sizing
- Motion and vestibular considerations
- Inclusive design principles

[CONTRAST_REQUIREMENTS]
text/normal: ≥ 4.5:1 foreground-to-background ratio
text/large: ≥ 3:1 (18px+ regular or 14px+ bold)
ui_components: ≥ 3:1 for borders, icons, controls against adjacent colors
graphical_objects: ≥ 3:1 for meaningful non-text visuals
focus_indicator: ≥ 3:1 against both the component and surrounding background
disabled: exempt from contrast requirements but must remain perceivable

[KEYBOARD]
tab_order: follows logical reading/DOM flow — no jumps or traps
focus_visible: all interactive elements show a high-contrast focus ring
enter: activates buttons, links, and primary actions
space: activates buttons, toggles, checkboxes
escape: closes overlays, dialogs, dropdowns
arrow_keys: navigates within composite widgets (tabs, menus, listboxes)
skip_links: provide "skip to main content" for page-level navigation

[SCREEN_READERS]
images: alt text for meaningful images; aria-hidden for decorative
icon_buttons: aria-label or visually-hidden text — never icon-only without a name
live_regions: aria-live="polite" for dynamic updates; "assertive" for errors
form_inputs: every input has an associated <label> or aria-label
headings: semantic heading hierarchy (h1 → h2 → h3) — no skipped levels
landmarks: use <main>, <nav>, <aside>, <header>, <footer> for page structure
tables: use <th> with scope; provide <caption> for data tables

[TOUCH_TARGETS]
minimum: 44×44px for all interactive elements on touch interfaces
spacing: ≥ 8px between adjacent touch targets to prevent mis-taps
icon_buttons: visual icon may be smaller but tap area must meet minimum

[MOTION]
prefers-reduced-motion: all animations must have a reduced/disabled variant
auto-play: never auto-play video or audio without user consent
parallax: avoid or provide alternative — triggers vestibular discomfort
flashing: no content flashes more than 3 times per second (seizure risk)
duration_cap: decorative animations ≤ 5 seconds unless user-initiated

[AGENT_BEHAVIOR]
- When reviewing any design or code, check accessibility criteria FIRST
- Flag violations with severity: critical (blocks access) | major (degrades experience) | minor (improvement opportunity)
- Always provide a concrete fix alongside each violation
- If a component lacks accessible markup, provide the complete ARIA pattern
- Test recommendations against multiple assistive technologies conceptually
- Never approve a design that fails contrast or keyboard requirements

[CONSTRAINTS]
- never remove focus outlines without providing an equivalent indicator
- never use color alone to convey meaning — pair with text, icon, or pattern
- never auto-play media or trigger motion without user control
- never block keyboard access to any interactive element
- never skip heading levels in semantic hierarchy
- disabled elements must remain perceivable (opacity ≥ 0.38)
@END:PAGE_CONTEXT
```
