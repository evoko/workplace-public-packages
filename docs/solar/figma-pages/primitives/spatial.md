# Spatial

> Verbatim text of the Figma page `Spatial` (id `27:298`, section primitives, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `6728940bf23a`. Curated chapter: [12-spatial-borders-radius.md](../../12-spatial-borders-radius.md).

## Size Scale

Size scale tokens define the foundational measurement system used throughout the SOLAR Design System. They provide a consistent set of rem-based values that underpin spacing, layout, and component sizing across the interface.

These primitives are referenced by semantic tokens such as stack, inset, radius, borders, and grid spacing, ensuring consistent rhythm and predictable scaling across components, layouts, and responsive breakpoints.

Using a shared size scale helps maintain visual balance and alignment across products while simplifying implementation for design and engineering.

**Token**

**Value, px**

****spatial/scale/0****

**0**

****spatial/scale/1****

**4**

****spatial/scale/2****

**8**

****spatial/scale/3****

**12**

****spatial/scale/4****

**16**

****spatial/scale/5****

**20**

****spatial/scale/6****

**24**

****spatial/scale/7****

**28**

****spatial/scale/8****

**32**

****spatial/scale/9****

**36**

****spatial/scale/10****

**40**

****spatial/scale/11****

**44**

****spatial/scale/12****

**48**

****spatial/scale/13****

**52**

****spatial/scale/14****

**56**

****spatial/scale/15****

**64**

****spatial/scale/16****

**72**

****spatial/scale/17****

**80**

****spatial/scale/18****

**96**

****spatial/scale/19****

**112**

****spatial/scale/20****

**128**

****spatial/scale/21****

**144**

****spatial/scale/22****

**160**

## Border Width

Border width tokens define the available stroke thickness values used across interface components. They ensure consistent visual weight for outlines, dividers, and control boundaries throughout the system.

These tokens help maintain predictable emphasis and hierarchy between UI elements while ensuring borders scale consistently across components and layouts.

Border width values should be applied through semantic tokens such as component borders, separators, and focus indicators rather than directly using raw pixel values.

**Token**

**Width, px**

****spatial/border-width/none****

**0**

****spatial/border-width/sm****

**1**

****spatial/border-width/md****

**2**

****spatial/border-width/lg****

**4**

## Border Radius

Border radius tokens define the curvature used across interface components. They ensure consistent corner rounding for elements such as buttons, inputs, cards, and containers.

Using a shared radius scale helps maintain a cohesive visual language and predictable component styling across products. Radius values range from sharp corners to fully rounded shapes and should be applied through semantic tokens rather than hard-coded values.

**Token**

**Radius, px**

****spatial/border-radius/none****

**0**

****spatial/border-radius/sm****

**4**

****spatial/border-radius/md****

**6**

****spatial/border-radius/lg****

**8**

****spatial/border-radius/xl****

**12**

****spatial/border-radius/full****

**9999**

## Viewport

Viewport tokens define the responsive breakpoints used across the SOLAR Design System. These values establish the screen widths at which layouts adapt to different device sizes.

Breakpoints provide a consistent framework for responsive behavior, allowing components and layouts to scale predictably across mobile, tablet, desktop, and large displays.

Using shared viewport tokens ensures responsive layouts remain aligned across products and implementations.

**Token**

**Width, px**

****viewport/xs****

**393**

****viewport/sm****

**768**

****viewport/md****

**1024**

****viewport/lg****

**1440**

****viewport/xl****

**1920**

## Spatial / Inset

Inset tokens define the internal spacing within components. They control the padding between a container’s boundary and its content, ensuring consistent spacing inside elements such as buttons, inputs, cards, and panels.

Using inset tokens helps maintain balanced layouts and predictable component sizing while preventing inconsistent padding values across the interface.

**Token**

**Base token**

**Value**

****inset/none****

****spatial/scale/0****

**0px**

****inset/2xs****

****spatial/scale/1****

**4px**

****inset/xs****

****spatial/scale/2****

**8px**

****inset/sm****

****spatial/scale/3****

**12px**

****inset/md****

****spatial/scale/4****

**16px**

****inset/lg****

****spatial/scale/5****

**20px**

****inset/xl****

****spatial/scale/6****

**24px**

****inset/2xl****

****spatial/scale/7****

**28px**

****inset/3xl****

****spatial/scale/10****

**40px**

## Spatial / Stack

Stack tokens define the vertical spacing between elements arranged in a column. They provide a consistent rhythm for spacing between components such as text blocks, form fields, cards, and layout sections.

Using stack tokens helps maintain predictable vertical alignment and visual hierarchy across screens. Instead of manually setting margins, designers and engineers should apply stack tokens to ensure consistent spacing throughout the interface.

**Token**

**Base token**

**Value**

****stack/none****

****spatial/scale/0****

**0px**

****stack/2xs****

****spatial/scale/1****

**4px**

****stack/xs****

****spatial/scale/2****

**8px**

****stack/sm****

****spatial/scale/3****

**12px**

****stack/md****

****spatial/scale/4****

**16px**

****stack/lg****

****spatial/scale/5****

**20px**

****stack/xl****

****spatial/scale/6****

**24px**

****stack/2xl****

****spatial/scale/7****

**28px**

****stack/3xl****

****spatial/scale/10****

**40px**

## Swatches bound to variables

Containers on this page whose fill is bound to a Figma variable, with their labels. Variable ids are local to the Foundations file; names come from [../../tokens/figma-variables.json](../../tokens/figma-variables.json).

| Labels                     | Rendered  | Variable id          |
| -------------------------- | --------- | -------------------- |
| Token                      | `#f5f5f5` | `VariableID:27:723`  |
| Value, px                  | `#f5f5f5` | `VariableID:27:723`  |
| spatial/scale/0            | `#00b600` | `VariableID:34:3281` |
| spatial/scale/1            | `#00b600` | `VariableID:34:3281` |
| spatial/scale/2            | `#00b600` | `VariableID:34:3281` |
| spatial/scale/3            | `#00b600` | `VariableID:34:3281` |
| spatial/scale/4            | `#00b600` | `VariableID:34:3281` |
| spatial/scale/5            | `#00b600` | `VariableID:34:3281` |
| spatial/scale/6            | `#00b600` | `VariableID:34:3281` |
| spatial/scale/7            | `#00b600` | `VariableID:34:3281` |
| spatial/scale/8            | `#00b600` | `VariableID:34:3281` |
| spatial/scale/9            | `#00b600` | `VariableID:34:3281` |
| spatial/scale/10           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/11           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/12           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/13           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/14           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/15           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/16           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/17           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/18           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/19           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/20           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/21           | `#00b600` | `VariableID:34:3281` |
| spatial/scale/22           | `#00b600` | `VariableID:34:3281` |
| Token                      | `#f5f5f5` | `VariableID:27:723`  |
| Width, px                  | `#f5f5f5` | `VariableID:27:723`  |
| spatial/border-width/none  | `#00b600` | `VariableID:34:3281` |
| spatial/border-width/sm    | `#00b600` | `VariableID:34:3281` |
| spatial/border-width/md    | `#00b600` | `VariableID:34:3281` |
| spatial/border-width/lg    | `#00b600` | `VariableID:34:3281` |
| Token                      | `#f5f5f5` | `VariableID:27:723`  |
| Radius, px                 | `#f5f5f5` | `VariableID:27:723`  |
| spatial/border-radius/none | `#00b600` | `VariableID:34:3281` |
| spatial/border-radius/sm   | `#00b600` | `VariableID:34:3281` |
| spatial/border-radius/md   | `#00b600` | `VariableID:34:3281` |
| spatial/border-radius/lg   | `#00b600` | `VariableID:34:3281` |
| spatial/border-radius/xl   | `#00b600` | `VariableID:34:3281` |
| spatial/border-radius/full | `#00b600` | `VariableID:34:3281` |
| Token                      | `#f5f5f5` | `VariableID:27:723`  |
| Width, px                  | `#f5f5f5` | `VariableID:27:723`  |
| viewport/xs                | `#00b600` | `VariableID:34:3281` |
| viewport/sm                | `#00b600` | `VariableID:34:3281` |
| viewport/md                | `#00b600` | `VariableID:34:3281` |
| viewport/lg                | `#00b600` | `VariableID:34:3281` |
| viewport/xl                | `#00b600` | `VariableID:34:3281` |
| Token                      | `#f5f5f5` | `VariableID:27:723`  |
| Base token                 | `#f5f5f5` | `VariableID:27:723`  |
| Value                      | `#f5f5f5` | `VariableID:27:723`  |
| inset/none                 | `#00b600` | `VariableID:34:3281` |
| spatial/scale/0            | `#00b600` | `VariableID:34:3281` |
| inset/2xs                  | `#00b600` | `VariableID:34:3281` |
| spatial/scale/1            | `#00b600` | `VariableID:34:3281` |
| inset/xs                   | `#00b600` | `VariableID:34:3281` |
| spatial/scale/2            | `#00b600` | `VariableID:34:3281` |
| inset/sm                   | `#00b600` | `VariableID:34:3281` |
| spatial/scale/3            | `#00b600` | `VariableID:34:3281` |
| inset/md                   | `#00b600` | `VariableID:34:3281` |
| spatial/scale/4            | `#00b600` | `VariableID:34:3281` |
| inset/lg                   | `#00b600` | `VariableID:34:3281` |
| spatial/scale/5            | `#00b600` | `VariableID:34:3281` |
| inset/xl                   | `#00b600` | `VariableID:34:3281` |
| spatial/scale/6            | `#00b600` | `VariableID:34:3281` |
| inset/2xl                  | `#00b600` | `VariableID:34:3281` |
| spatial/scale/7            | `#00b600` | `VariableID:34:3281` |
| inset/3xl                  | `#00b600` | `VariableID:34:3281` |
| spatial/scale/10           | `#00b600` | `VariableID:34:3281` |
| Token                      | `#f5f5f5` | `VariableID:27:723`  |
| Base token                 | `#f5f5f5` | `VariableID:27:723`  |
| Value                      | `#f5f5f5` | `VariableID:27:723`  |
| stack/none                 | `#00b600` | `VariableID:34:3281` |
| spatial/scale/0            | `#00b600` | `VariableID:34:3281` |
| stack/2xs                  | `#00b600` | `VariableID:34:3281` |
| spatial/scale/1            | `#00b600` | `VariableID:34:3281` |
| stack/xs                   | `#00b600` | `VariableID:34:3281` |
| spatial/scale/2            | `#00b600` | `VariableID:34:3281` |
| stack/sm                   | `#00b600` | `VariableID:34:3281` |
| spatial/scale/3            | `#00b600` | `VariableID:34:3281` |
| stack/md                   | `#00b600` | `VariableID:34:3281` |
| spatial/scale/4            | `#00b600` | `VariableID:34:3281` |
| stack/lg                   | `#00b600` | `VariableID:34:3281` |
| spatial/scale/5            | `#00b600` | `VariableID:34:3281` |
| stack/xl                   | `#00b600` | `VariableID:34:3281` |
| spatial/scale/6            | `#00b600` | `VariableID:34:3281` |
| stack/2xl                  | `#00b600` | `VariableID:34:3281` |
| spatial/scale/7            | `#00b600` | `VariableID:34:3281` |
| stack/3xl                  | `#00b600` | `VariableID:34:3281` |
| spatial/scale/10           | `#00b600` | `VariableID:34:3281` |
