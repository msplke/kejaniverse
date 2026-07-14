# select

2026-07-14, transformation engine (legacy new-york style; no base golden pair, user's own file transformed, classes kept except mechanical rewrites; anatomy per wrapper-shapes.md). Verdict: migrated to `@base-ui/react/select`, all 10 exports preserved; `position` prop replaced by `alignItemWithTrigger`.

## Changed

- `src/components/ui/select.tsx` (whole file):
  - Import: `* as SelectPrimitive from "@radix-ui/react-select"` -> `{ Select as SelectPrimitive } from "@base-ui/react/select"`. Prop types -> `SelectPrimitive.X.Props`. `import * as React from "react"` removed (no React types remain in the file after the `Root` re-export change).
  - `Select` (select.tsx:8): now a bare re-export `const Select = SelectPrimitive.Root` per wrapper-shapes (`Root.Props` is generic `<Value, Multiple>`, which breaks the ComponentProps wrapper pattern). The former `data-slot="select"` is gone — note it never reached the DOM (Radix Root rendered no element), so no consumer selector could depend on it.
  - `SelectTrigger` (select.tsx:18): `Icon asChild` -> `render={<ChevronDownIcon .../>}`; `size` prop, `data-size`, and the full class list unchanged (trigger is still a native button, so `disabled:`/`aria-invalid:` variants stay live; `data-[placeholder]:` attribute unchanged in Base UI; `*:data-[slot=select-value]:*` selectors stay live because the SelectValue wrapper keeps its data-slot).
  - `SelectContent` (select.tsx:47): Radix `Portal > Content > (ScrollUp, Viewport, ScrollDown)` -> `Portal > Positioner > Popup > (ScrollUpArrow, List, ScrollDownArrow)`. `position="popper"|"item-aligned"` dropped; `alignItemWithTrigger` (boolean, on Positioner) exposed instead, **default `false`** to preserve this wrapper's `position = "popper"` default (flipping it would restyle every existing select). `align`/`alignOffset`/`side`/`sideOffset`/`alignItemWithTrigger` declared via `Pick<...Positioner.Props, ...>`, destructured, and explicitly forwarded to Positioner (Pick-means-FORWARD); `align = "start"` default added because Radix Content defaulted `align="start"` while Base Positioner defaults `'center'` (form-controls.md). Positioner carries no class (wrapper-shapes: select keeps z-handling on the Popup, which retains `relative z-50`).
  - Popup classes: mechanical rewrites only — `animate-in/out + fade/zoom/slide-*` -> `transition-[opacity,transform]` + `data-starting-style:`/`data-ending-style:` (opacity/scale + per-`data-[side=...]` starting translate); `max-h-(--radix-select-content-available-height)` -> `max-h-(--available-height)`; `origin-(--radix-select-content-transform-origin)` -> `origin-(--transform-origin)`. The popper-only 1-unit offset translate classes are kept, now keyed to `!alignItemWithTrigger` (sideOffset intentionally NOT defaulted, matching the original which relied on the translate classes for the gap).
  - `Viewport` -> `List` (select.tsx:87): `p-1` kept; popper-only classes keyed to `!alignItemWithTrigger` with `h-[var(--radix-select-trigger-height)]`/`min-w-[var(--radix-select-trigger-width)]` -> `h-[var(--anchor-height)]`/`min-w-[var(--anchor-width)]` (vars inherit from Positioner).
  - `SelectLabel` -> `GroupLabel` part (NOT Base UI's new `Select.Label`, which labels the trigger; name and data-slot unchanged).
  - `SelectItem` (select.tsx:117): structure kept (indicator span + ItemText). Class rewrite `*:[span]:last:*` -> `*:[div]:last:*` because Base UI `ItemText` renders a `<div>` (Radix rendered `<span>`); without this the layout styling of the item text would silently die (class-mapping element-change principle). `focus:bg-accent`/`focus:text-accent-foreground` kept: Base UI 1.6.0 highlighted select items receive real DOM focus.
  - `SelectScrollUpButton`/`SelectScrollDownButton` (names and data-slots kept) -> `ScrollUpArrow`/`ScrollDownArrow` with `top-0 w-full` / `bottom-0 w-full` added per wrapper-shapes — Base UI arrows are absolutely positioned, so without offsets/width they would float unplaced.
  - Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/select.tsx` -> no matches.

## Left alone

- Consumers (`src/components/forms/{add-tenant,add-unit,create-property,create-unit-type}-form.tsx`, `src/components/tables/filter-components/select-filter.tsx`): out of scope for this wrapper-only pass; see Behavior changes for the call-site issues they will hit.
- `label.tsx`, `form.tsx`: separate migrations (form.tsx migrated in this run, own report).

## Behavior changes

- **`onValueChange` widens**: Radix `(value: string) => void` -> Base UI `(value: Value | null, eventDetails) => void`. `value`/`defaultValue` are now nullable (`null` = placeholder shown). All five consumer call sites (`add-unit-form.tsx:96`, `add-tenant-form.tsx:140`, `create-unit-type-form.tsx:119`, `create-property-form.tsx:94`, `select-filter.tsx:50`) pass `field.onChange` directly — works at runtime (RHF reads the first arg) but the value type now admits `null` against string schemas. Flagged, not patched.
- **`SelectValue` rendering**: Radix rendered the selected item's `ItemText` content; Base UI renders the raw value string unless `items` is supplied on Root or a `children` function on Value. Placeholder-only usages (`add-unit-form.tsx:102`, `add-tenant-form.tsx:146`, `create-unit-type-form.tsx:125`, `create-property-form.tsx`) will show raw values (e.g. a unit-type id) instead of item labels until `items` is provided. `select-filter.tsx:53` passes plain-ReactNode children via `renderValue` — Base UI `Value` children as ReactNode overrides display, but the function form `(value) => ReactNode` is the supported dynamic API; review during the consumer sweep. Flagged, not patched.
- `position` prop is gone from `SelectContent`; any consumer passing `position` must switch to `alignItemWithTrigger` (project grep found no call sites passing `position`).
- Scroll arrows are now absolutely positioned overlays (Radix buttons were in-flow flex children) and do not render on touch devices; list content scrolls beneath them (no background class added, to keep the original styling).
- `Root.onOpenChange` gains `eventDetails`; `onEscapeKeyDown`/`onPointerDownOutside` interception moves to `onOpenChange` reasons. Item `textValue` -> `label`. Item `value` widens `string` -> `any`.
- Consumer CSS hooks: Trigger `data-state="open"` -> `data-popup-open`; Item `data-state="checked"` -> `data-selected` (presence); Popup/Positioner use `data-open`/`data-closed`.
- Positioner defaults vs Radix Content: `collisionPadding` 10 -> 5, `collisionBoundary` viewport -> `'clipping-ancestors'`, `sticky` semantics differ (boolean, viewport-keeping).
- Base UI Root is `modal` by default (scroll lock + outside-pointer blocking); Radix behaved similarly, `modal={false}` now available if needed.

## Verify by hand

1. Open the unit-type select in Add Unit: popup drops below the trigger, left-aligned, ~4px visual gap (popper translate preserved), fades/zooms in.
2. Trigger label after choosing an option: EXPECT the raw-value regression on the form selects (see Behavior changes) — decide on `items`/`children` fix in the consumer sweep; check select-filter's `renderValue` path still displays.
3. Keyboard: arrows move highlight (accent bg), typeahead by option text, Enter selects and closes, Esc closes; selected item shows the check icon on the right.
4. Long option list (tenants/units): scroll arrows appear at top/bottom edges, full-width, and scroll the list on hover; confirm the overlay-over-items look is acceptable.
