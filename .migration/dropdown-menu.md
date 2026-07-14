# dropdown-menu

2026-07-14, transformation engine (legacy new-york style; no base golden pair exists, user's own file transformed, classes kept except mechanical rewrites). Verdict: migrated to `@base-ui/react/menu`, all 15 exports and data-slots preserved.

## Changed

- `src/components/ui/dropdown-menu.tsx` (whole file):
  - Import: `* as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"` -> `{ Menu as DropdownMenuPrimitive } from "@base-ui/react/menu"`. All prop types `React.ComponentProps<typeof X>` -> `DropdownMenuPrimitive.X.Props`. `import * as React from "react"` kept (still used by `DropdownMenuShortcut`'s `React.ComponentProps<"span">`).
  - `DropdownMenuContent` (dropdown-menu.tsx:30): Radix `Portal > Content` -> `Portal > Positioner > Popup`. `align`/`alignOffset`/`side`/`sideOffset` declared via `Pick<...Positioner.Props, ...>`, destructured, and explicitly forwarded to `Positioner` (Pick-means-FORWARD rule); `sideOffset = 4` default kept. Positioner gets `isolate z-50 outline-none` and no data-slot (wrapper-shapes convention); Popup keeps `data-slot="dropdown-menu-content"` and the file's original class list with mechanical rewrites only: `animate-in/out + fade/zoom/slide-*` -> `transition-[opacity,transform]` + `data-starting-style:`/`data-ending-style:` (opacity-0, scale-95, per-`data-[side=...]` starting translate), `max-h-(--radix-dropdown-menu-content-available-height)` -> `max-h-(--available-height)`, `origin-(--radix-dropdown-menu-content-transform-origin)` -> `origin-(--transform-origin)`.
  - `DropdownMenuLabel` -> `GroupLabel` part (exported name and data-slot unchanged).
  - `DropdownMenuCheckboxItem`/`DropdownMenuRadioItem`: `ItemIndicator` -> `CheckboxItemIndicator`/`RadioItemIndicator`; wrapper spans and lucide icons unchanged.
  - `DropdownMenuSub` -> `SubmenuRoot`; `DropdownMenuSubTrigger` -> `SubmenuTrigger` with `data-[state=open]:bg-accent data-[state=open]:text-accent-foreground` -> `data-popup-open:bg-accent data-popup-open:text-accent-foreground` (dropdown-menu.tsx:229).
  - `DropdownMenuSubContent` (dropdown-menu.tsx:255): rebuilt as `Portal > Positioner > Popup` keeping this file's own class list (shadow-lg/overflow-hidden variant), with golden SubContent positioning defaults `align="start" alignOffset={-3} side="right" sideOffset={0}` exposed via Pick and forwarded (wrapper-shapes; Radix SubContent's implicit side/align made explicit).
  - `focus:bg-accent focus:text-accent-foreground` on items/sub-trigger kept deliberately: Base UI 1.6.0 highlighted menu items receive real DOM focus (list-navigation focus management), so the focus-based highlight styling remains live. `data-[disabled]:`, `data-[inset]:`, `data-[variant=...]:` unchanged per class-mapping ("unchanged" rows / project-own attributes).
  - Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/dropdown-menu.tsx` -> no matches.

## Left alone

- Consumers (`src/components/dashboard/property-switcher.tsx`, `src/components/mode-toggle.tsx`, `src/components/tables/data-table.tsx`): out of scope for this wrapper-only pass. Known breaks/updates for the consumer sweep:
  - `property-switcher.tsx:62`: class `w-[--radix-dropdown-menu-trigger-width]` must become `w-(--anchor-width)` (var now set on the Positioner). Its `side`/`align`/`sideOffset` props keep working (hoisted + forwarded).
  - `DropdownMenuTrigger asChild` at `mode-toggle.tsx:19`, `property-switcher.tsx:44`, `data-table.tsx:109` and `DropdownMenuItem asChild` at `property-switcher.tsx:89`: `asChild` does not exist on Base UI parts; each becomes `render={<.../>}` (see consumer-props.md).
- Commented-out `DropdownMenuTrigger asChild` blocks in `src/components/tables/table-columns/{recent-payments,tenants,units}.tsx`: dead code, untouched.

## Behavior changes

- `DropdownMenuCheckboxItem` / `DropdownMenuRadioItem` no longer close the menu on click: Base UI `closeOnClick` defaults to `false` on these items (Radix closed by default). Directly visible in `data-table.tsx:117` column-visibility checkboxes — the menu now stays open while toggling columns. Flagged, not patched (skill hard rule).
- Focus looping: Radix `loop` (default false) is replaced by `loopFocus` on Root, default `true` — arrow-key navigation now wraps by default.
- Root/SubmenuRoot `onOpenChange` gains a second `eventDetails` argument; `onEscapeKeyDown`/`on*Outside` content callbacks no longer exist (branch on `eventDetails.reason`).
- `CheckboxItem` `checked` no longer accepts `'indeterminate'` (boolean only). `RadioGroup`/`RadioItem` `value` widens `string` -> `any`. Items: `onSelect` -> `onClick`, `textValue` -> `label`.
- Positioner defaults differ from Radix Content: `collisionPadding` 0 -> 5, `arrowPadding` 0 -> 5, `collisionBoundary` `[]` -> `'clipping-ancestors'` (equivalent in practice).
- `GroupLabel` (DropdownMenuLabel) is meant to sit inside a `Group` for `aria-labelledby` wiring; `property-switcher.tsx:67` uses it directly under Content (worked with Radix's free-floating Label). Renders fine, but the a11y association is absent — consider wrapping in `DropdownMenuGroup` during the consumer sweep.
- Trigger open-state hook changes for consumer CSS: `data-[state=open]` -> `data-popup-open` (presence) + `data-pressed`.
- Enter/exit animation is now CSS-transition-based (`data-starting-style`/`data-ending-style`) rather than tw-animate keyframes; visual intent (fade + 95% zoom + 2-unit slide-in) restated per class-mapping.md.

## Verify by hand

1. Open the property switcher in the sidebar: panel fades/zooms in, anchored to the right (bottom on mobile), 4px offset; after the consumer sweep confirm it matches the trigger width again (`w-(--anchor-width)`).
2. Arrow keys move highlight (accent background follows), wraps at the ends; typeahead jumps to items; Enter activates and closes; Esc closes and returns focus to the trigger.
3. Data table "Columns" menu: toggle two column checkboxes — EXPECT the menu to stay open between clicks (flagged closeOnClick default); check icons appear/disappear.
4. Mode toggle menu: theme items still switch theme and close the menu on click.
