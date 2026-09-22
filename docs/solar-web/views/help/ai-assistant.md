# AI Assistant

> SOLAR Web · Figma page `↳ 🟢 AI Assistant` (id `6312:3`) · section `views/help` · raw data: [`raw/views/help/ai-assistant.json`](../../raw/views/help/ai-assistant.json)

## Component set: AI Assistant / Chat Message

### Props

| Prop     | Type    | Options / default    |
| -------- | ------- | -------------------- |
| `sender` | variant | **assistant** · user |

Default variant: `sender=assistant` · 2 variants · default size 316×48px

### Anatomy (default variant)

- **sender=assistant** · component · row gap 12 pad 0/0/0/0 FIXED/HUG · 316×48  
  itemSpacing `stack.sm`
  - **Avatar** · instance of **Avatar** (size=md, type=photo, color=neutral, Shade=Image) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
    fill `IMAGE` ⚠️ hard-coded · stroke `color.border.feedback.focus.subtle` 1px · effect `shadow/focus/default` · strokeWeight `border.default` · radius `radius.pill`
  - **Content** · frame · column gap 16 pad 12/0/0/0 FILL/HUG · 272×48  
    itemSpacing `stack.md` · padding `stack.sm`
    - **Sender** · text `body/md/medium` "Workplace AI" · FILL/HUG · 272×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Message** · text `body/md/regular` "Message text" · FILL/HUG · 272×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Strokes         | `color.border.feedback.focus.subtle`                                                                                      |
| Text color      | `color.text.primary`                                                                                                      |
| Spacing         | `stack.md`, `stack.sm`                                                                                                    |
| Radius          | `radius.pill`                                                                                                             |
| Border width    | `border.default`                                                                                                          |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md` |
| Effects         | `shadow/focus/default`                                                                                                    |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                       |

### Composes

- Avatar

### Variant matrix

| sender    | size   | fill | stroke | effect | text                 | icon |
| --------- | ------ | ---- | ------ | ------ | -------------------- | ---- |
| assistant | 316×48 |      |        |        | `color.text.primary` |      |
| user      | 316×34 |      |        |        | `color.text.primary` |      |

### Issues detected

- Component description is empty.

## Component set: AI Assistant / Conversation Event

### Props

| Prop   | Type    | Options / default |
| ------ | ------- | ----------------- |
| `type` | variant | **status** · date |

Default variant: `type=status` · 2 variants · default size 316×25px

### Anatomy (default variant)

- **type=status** · component · row gap 0 pad 8/0/8/0 FIXED/HUG · 316×25  
  padding `stack.xs`
  - **Event** · text `body/sm/medium` "Event" · HUG/HUG · 32×9  
    fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Text color      | `color.text.secondary`, `color.text.tertiary`                                                     |
| Spacing         | `stack.xs`                                                                                        |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.sm`, `type.size.body.sm` |
| Text styles     | `body/sm/medium`                                                                                  |

### Variant matrix

| type   | size   | fill | stroke | effect | text                   | icon |
| ------ | ------ | ---- | ------ | ------ | ---------------------- | ---- |
| status | 316×25 |      |        |        | `color.text.tertiary`  |      |
| date   | 316×25 |      |        |        | `color.text.secondary` |      |

### Issues detected

- Component description is empty.

## Component: AI Assistant

### Anatomy (default variant)

- **AI Assistant** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 348×800  
  fill `color.surface.raised` · stroke `color.border.surface` mixedpx · effect `shadow/overlay` · strokeWeight `border.default` · radius `radius.dialog`
  - **Header** · frame · row gap 12 pad 8/20/8/20 FILL/FIXED · 348×56  
    stroke `color.border.surface` mixedpx · itemSpacing `stack.sm` · padding `inset.lg`, `inset.xs` · strokeWeight `border.default`
    - **Icon/Sparkling** · instance of **Icon/Sparkling** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`
    - **Title** · text `body/lg/medium` "Workplace AI" · FILL/HUG · 244×12  
      fill `color.text.primary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
    - **Icon/Close** · instance of **Icon/Close** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`
  - **content** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 348×600  
    itemSpacing `stack.none` · padding `inset.none`
    - **Conversation** · frame · column gap 16 pad 16/16/16/16 FILL/HUG · 348×210  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.md` · padding `stack.md` · strokeWeight `border.default`
      - **Hi Anatoliy — ask me about device health, firmware, room status, or how to configure a system.** · text `body/md/regular` "Hi Anatoliy — ask me about device health, firmware, room status, or how to confi" · FILL/HUG · 316×50  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
      - **Suggested prompts** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 316×112  
        itemSpacing `inset.xs`
        - **Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 FILL/FIXED · 316×32  
          stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`
        - **Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 FILL/FIXED · 316×32  
          stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`
        - **Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 FILL/FIXED · 316×32  
          stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`
    - **Exchange** · frame · column gap 16 pad 16/16/16/16 FILL/HUG · 348×379  
      itemSpacing `inset.md` · padding `stack.md`
      - **AI Assistant / Conversation Event** · instance of **AI Assistant / Conversation Event** (type=date) · row gap 0 pad 8/0/8/0 FILL/HUG · 316×25  
        padding `stack.xs`
      - **AI Assistant / Chat Message** · instance of **AI Assistant / Chat Message** (sender=user) · row gap 0 pad 0/0/0/0 FILL/HUG · 316×54
      - **Turn / AI Assistant** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 316×236  
        itemSpacing `stack.md`
        - **AI Assistant / Chat Message** · instance of **AI Assistant / Chat Message** (sender=assistant) · row gap 12 pad 0/0/0/0 FILL/HUG · 316×108  
          itemSpacing `stack.sm`
        - **Extras** · frame · column gap 12 pad 0/0/0/40 FILL/HUG · 316×112  
          itemSpacing `stack.sm` · padding `stack.3xl`
          - **Insight Card** · instance of **Insight Card** (severity=danger, state=default) · row gap 16 pad 8/16/8/8 FILL/HUG · 276×68  
            fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `stack.md` · padding `inset.xs`, `inset.md` · strokeWeight `border.default` · radius `radius.container`
          - **Actions** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 186×32  
            itemSpacing `inset.xs`
            - **Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 98×32  
              stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`
            - **Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 80×32  
              stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`
  - **Composer** · frame · column gap 8 pad 12/12/12/12 FILL/HUG · 348×144  
    stroke `color.border.surface` mixedpx · itemSpacing `inset.xs` · padding `stack.sm` · strokeWeight `border.default`
    - **Text Area** · instance of **Text Area** (size=md, state=default) · column gap 8 pad 0/0/0/0 FILL/HUG · 324×120  
      itemSpacing `stack.xs`

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.raised`                                                                                                                               |
| Strokes         | `color.action.secondary.border.default`, `color.border.subtle`, `color.border.surface`                                                                                     |
| Text color      | `color.text.primary`                                                                                                                                                       |
| Spacing         | `inset.lg`, `inset.md`, `inset.none`, `inset.xs`, `stack.3xl`, `stack.md`, `stack.none`, `stack.sm`, `stack.xs`                                                            |
| Radius          | `radius.container`, `radius.control`, `radius.dialog`                                                                                                                      |
| Border width    | `border.default`                                                                                                                                                           |
| Sizes           | `icon.md`                                                                                                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.lg`, `type.line-height.body.md`, `type.size.body.lg`, `type.size.body.md` |
| Effects         | `shadow/control`, `shadow/overlay`, `shadow/raised`                                                                                                                        |
| Text styles     | `body/lg/medium`, `body/md/regular`                                                                                                                                        |

### Composes

- AI Assistant / Chat Message
- AI Assistant / Conversation Event
- Button
- Icon/Close
- Icon/Sparkling
- Insight Card
- Text Area

### Issues detected

- Component description is empty.

## Documentation card

**Description**

A conversational assistant panel for in-product help and actions — prompt input, streamed responses and suggested actions. Static docs live in Help Center.

**Layout**

Panel / drawer: message thread (user + assistant turns) · streaming response · suggested prompts / actions · input with send · disclaimers.

**Responsive**

Desktop side drawer / panel; mobile full-screen sheet.

**States**

idle, empty (suggested prompts), thinking / streaming, response, error / retry, rate-limited.

**Accessibility**

Thread is a log (aria-live=polite for new turns); input labelled; streaming announced without spamming; actions keyboard-reachable.

**Rules**

Show suggested prompts when empty  
Stream responses  
Label AI content + its limits  
Keep actions reversible / confirmed

Auto-run destructive actions  
Hide that it's AI  
Spam screen readers on every token  
Block input while streaming
