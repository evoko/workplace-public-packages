# Link

> SOLAR Web · Figma page `↳ 🟢 Link` (id `2163:3675`) · section `components/navigation` · raw data: [`raw/components/navigation/link.json`](../../raw/components/navigation/link.json)

## Component set: Link

Inline text link for navigating within or across the product. Renders as `<a>` and binds to color/text/link/\* tokens. 15 variants: size (xs 12px, sm 14px, md 16px) × state (default, hover, pressed, focus, disabled). The label is underlined in every state, so the affordance never relies on colour alone; hover changes the colour. focus carries shadow/focus/default. Optional leading and trailing icons. For actions with a side effect (save, submit) use Button, not Link.

### Props

| Prop                 | Type    | Options / default                                |
| -------------------- | ------- | ------------------------------------------------ |
| `size`               | variant | xs · sm · **md**                                 |
| `state`              | variant | **default** · hover · disabled · pressed · focus |
| `show leading icon`  | boolean | default `true`                                   |
| `show trailing icon` | boolean | default `true`                                   |

Default variant: `size=md, state=default` · 15 variants · default size 127×24px

### Anatomy (default variant)

- **size=md, state=default** · component · row gap 8 pad 0/0/0/0 HUG/HUG · 127×24  
  itemSpacing `stack.xs`
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 24×24  
    width `icon.lg` · prop visible←show leading icon
  - **Label** · text `link/lg/default` "Link text" · HUG/HUG · 63×12  
    fill `color.text.link.default` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 24×24  
    width `icon.lg` · prop visible←show trailing icon

### Tokens used

| Role            | Tokens                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| Text color      | `color.text.link.active`, `color.text.link.default`, `color.text.link.disabled`, `color.text.link.hover` |
| Icon color      | `color.icon.link.active`, `color.icon.link.default`, `color.icon.link.disabled`, `color.icon.link.hover` |
| Spacing         | `stack.xs`                                                                                               |
| Sizes           | `icon.lg`                                                                                                |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.lg`, `type.size.body.lg`        |
| Effects         | `shadow/focus/default`                                                                                   |
| Text styles     | `link/lg/default`                                                                                        |

### Slots and prop-controlled layers

| Layer     | Controlled property | Prop                 |
| --------- | ------------------- | -------------------- |
| Icon/None | visible             | `show leading icon`  |
| Icon/None | visible             | `show trailing icon` |

### Composes

- Icon/None

### Variant matrix

| size | state    | size   | fill | stroke | effect                 | text                       | icon                       |
| ---- | -------- | ------ | ---- | ------ | ---------------------- | -------------------------- | -------------------------- |
| md   | default  | 127×24 |      |        |                        | `color.text.link.default`  | `color.icon.link.default`  |
| md   | hover    | 127×24 |      |        |                        | `color.text.link.hover`    | `color.icon.link.hover`    |
| md   | pressed  | 127×24 |      |        |                        | `color.text.link.active`   | `color.icon.link.active`   |
| md   | disabled | 127×24 |      |        |                        | `color.text.link.disabled` | `color.icon.link.disabled` |
| md   | focus    | 127×24 |      |        | `shadow/focus/default` | `color.text.link.default`  | `color.icon.link.default`  |
| sm   | default  | 103×16 |      |        |                        | `color.text.link.default`  | `color.icon.link.default`  |
| sm   | hover    | 103×16 |      |        |                        | `color.text.link.hover`    | `color.icon.link.hover`    |
| sm   | pressed  | 103×16 |      |        |                        | `color.text.link.active`   | `color.icon.link.active`   |
| sm   | disabled | 103×16 |      |        |                        | `color.text.link.disabled` | `color.icon.link.disabled` |
| sm   | focus    | 103×16 |      |        | `shadow/focus/default` | `color.text.link.default`  | `color.icon.link.default`  |
| xs   | default  | 88×12  |      |        |                        | `color.text.link.default`  | `color.icon.link.default`  |
| xs   | hover    | 88×12  |      |        |                        | `color.text.link.hover`    | `color.icon.link.hover`    |
| xs   | pressed  | 88×12  |      |        |                        | `color.text.link.active`   | `color.icon.link.active`   |
| xs   | disabled | 88×12  |      |        |                        | `color.text.link.disabled` | `color.icon.link.disabled` |
| xs   | focus    | 88×12  |      |        | `shadow/focus/default` | `color.text.link.default`  | `color.icon.link.default`  |

## Documentation card

**Sizes**

xs (12px) Inline with helper text or metadata captions.  
sm (14px) Inline within body copy and dense lists.  
md (16px) Standalone links and larger reading contexts.

**Icons**

Leading icon signals internal navigation (chevron, arrow-left). Trailing icon signals outbound or new-tab (arrow-up-right, external-link). Icon size tracks text size via icon/size/\* tokens. If both icons are on, the link is overloaded — keep one.

**Rules**

Do  
• Use for navigation — internal or outbound  
• Keep link text descriptive ("Read the release notes", not "click here")  
• Pair outbound links with a trailing external-link icon  
• Underline on hover to meet color-alone guidance

Don't  
• Don't use Link for actions that mutate state — use Button  
• Don't wrap full paragraphs — link the phrase, not the sentence  
• Don't rely on color alone to signal a link  
• Don't use Link for persistent selection — use a Nav Item
