# popover

2026-07-14, transformation engine (legacy new-york style: user's own file rewired, own classes kept). Migrated with one flagged gap: PopoverAnchor is now an inert passthrough (Base UI has no Anchor part).

## Changed

- `src/components/ui/popover.tsx` — import `@radix-ui/react-popover` (namespace) -> `import { Popover as PopoverPrimitive } from "@base-ui/react/popover"`; types -> `PopoverPrimitive.X.Props`.
  - `PopoverContent` (src/components/ui/popover.tsx:16): Radix `Portal > Content` -> Base UI `Portal > Positioner > Popup`. Positioning props typed via `Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">`, destructured with defaults (`align="center"`, `sideOffset=4` — the project's existing defaults — plus `side="bottom"`, `alignOffset=0` matching Radix Content defaults) AND explicitly forwarded to `<PopoverPrimitive.Positioner>` (Pick-means-FORWARD). Positioner gets `className="isolate z-50"`, no data-slot; `data-slot="popover-content"` stays on the Popup.
  - Popup classes: `origin-(--radix-popover-content-transform-origin)` -> `origin-(--transform-origin)`; `data-[state=open]:animate-in/fade-in-0/zoom-in-95` + `data-[state=closed]:animate-out/fade-out-0/zoom-out-95` -> `transition-[opacity,scale,translate] data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95`; per-side `slide-in-from-*-2` -> `data-[side=...]:data-starting-style:{-,}translate-{x,y}-2`. All other classes (`z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden`) verbatim.
  - `PopoverAnchor` (src/components/ui/popover.tsx:59): FLAGGED. Base UI has no `Popover.Anchor` part; the export is kept as an inert `<div data-slot="popover-anchor">` passthrough (typed `React.ComponentProps<"div">`) so consumers still compile, with an in-file comment. The real replacement is the `anchor` prop on `Popover.Positioner`, not surfaced by this wrapper. No consumers use PopoverAnchor today (project-wide grep).
  - The wrapper did not surface `openDelay`/`closeDelay` (Radix popover has none), so no Root->Trigger delay relocation applied.
  - All exported symbols (`Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`) and data-slot attributes preserved.
- Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/popover.tsx` -> no matches.

## Left alone

- `src/components/tables/filter-components/filter-popover.tsx` and `src/components/tables/filter-components/date-range-filter.tsx` — consumers; out of this task's scope. NOTE for the consumer sweep: all three `<PopoverTrigger asChild>` call sites (filter-popover.tsx:151, date-range-filter.tsx:45, date-range-filter.tsx:78) must become `render={<Button .../>}` — `asChild` does not exist on Base UI Trigger and will not compile. Their `PopoverContent align="start"/"end"` props keep working (forwarded to Positioner by the wrapper).

## Behavior changes

- `PopoverAnchor` no longer re-anchors the popover — it renders a plain div. Any future use needs `Positioner anchor` instead. FLAGGED, not patched.
- `onOpenChange` signature gains `eventDetails`; `onOpenAutoFocus`/`onCloseAutoFocus`/`onInteractOutside` etc. no longer exist as Content props (Popup `initialFocus`/`finalFocus` and Root `onOpenChange` reasons replace them). Consumers passing `avoidCollisions`, `collisionPadding`, etc. through `...props` would now land on the Popup instead of positioning logic — none found in this project.
- Positioner collision defaults differ from Radix (`collisionPadding` 0 -> 5, `arrowPadding` 0 -> 5, `collisionBoundary` default `'clipping-ancestors'`); may shift popovers a few px near viewport edges.
- Base UI popover `modal` defaults to `false` like Radix; no delta.

## Verify by hand

1. Open the table Filter popover (filter-popover.tsx): panel opens below the button, aligned to the end, 4px offset, scale/fade enter transition.
2. Open the date-range popovers: `align="start"` respected; calendar renders inside at `w-auto p-0`.
3. Click outside and press Escape: popover closes, focus returns to the trigger button.
4. Scroll the page with a popover open near the viewport edge: it flips/shifts sensibly (collision defaults changed slightly).
