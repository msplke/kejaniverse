# tooltip

2026-07-14, transformation engine (legacy new-york style: user's own file rewired, own classes kept; arrow per-side offsets from wrapper-shapes.md). Migrated clean; content moved to Portal > Positioner > Popup.

## Changed

- `src/components/ui/tooltip.tsx` — import `@radix-ui/react-tooltip` (namespace) -> `import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"`; types -> `TooltipPrimitive.X.Props`. Unused `import * as React from "react"` dropped.
  - `TooltipProvider` (src/components/ui/tooltip.tsx:7): `delayDuration = 0` -> `delay = 0`, forwarded explicitly. Project's zero-delay customization preserved.
  - `TooltipContent` (src/components/ui/tooltip.tsx:32): Radix `Portal > Content` -> Base UI `Portal > Positioner > Popup`. Positioning props typed via `Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">`, destructured with defaults (`side="top"`, `sideOffset=0` — the project's own default, kept over the registry's 4 — `align="center"`, `alignOffset=0`) AND explicitly forwarded to `<TooltipPrimitive.Positioner>` (Pick-means-FORWARD). Positioner gets `className="isolate z-50"`, no data-slot; `data-slot="tooltip-content"` stays on the Popup.
  - Popup classes: `origin-(--radix-tooltip-content-transform-origin)` -> `origin-(--transform-origin)`; `animate-in fade-in-0 zoom-in-95` + `data-[state=closed]:animate-out/fade-out-0/zoom-out-95` -> `transition-[opacity,scale,translate] data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95`; per-side `slide-in-from-*-2` -> `data-[side=...]:data-starting-style:{-,}translate-{x,y}-2`. All other classes verbatim.
  - Arrow: kept the project's classes (`z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-primary fill-primary`) and added the Base UI per-side positioning classes from wrapper-shapes.md (`data-[side=bottom]:top-1 ... data-[side=top]:-bottom-2.5`) — Base UI Arrow renders a `<div>` and does not auto-position per side like Radix's `<svg>`.
  - All exported symbols (`Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`) and data-slot attributes preserved.
- Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/tooltip.tsx` -> no matches.

## Left alone

- `src/components/ui/sidebar.tsx` and `src/components/ui/back-button.tsx` — consumers already using the Base UI wrapper surface (`TooltipProvider delay={0}`, `TooltipTrigger render={...}`, `TooltipContent side/align/hidden`); all compatible with the migrated wrapper, no edits needed.

## Behavior changes

- `onOpenChange` signature gains `eventDetails`; Radix `data-state="delayed-open"/"instant-open"` distinction becomes `data-instant` (no classes used it here).
- Provider `skipDelayDuration` -> `timeout` (not surfaced; Base UI default 400 vs Radix 300) and `disableHoverableContent` -> per-Root `disableHoverablePopup` (not surfaced).
- `sideOffset` default stays 0 (project customization); note the shadcn base registry default is 4, so tooltips sit flush against triggers exactly as before, not registry-style.
- Positioner collision defaults differ from Radix (`collisionPadding` 0 -> 5, `arrowPadding` 0 -> 5); not surfaced by the wrapper, flagged only.

## Verify by hand

1. Hover the sidebar collapse-state icons and the BackButton: tooltip appears instantly (delay 0), on the correct side (`side="right"` in sidebar).
2. Arrow renders attached to the popup on all four sides without a gap or rotation glitch.
3. Move between adjacent tooltip triggers quickly: subsequent tooltips open instantly (provider timeout behavior).
4. Press Escape while a tooltip is open: it closes; opacity/scale exit transition plays.
