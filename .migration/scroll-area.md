# scroll-area

2026-07-14, transformation engine (legacy new-york style: user's own file rewired, own classes kept). Migrated clean; part renames only, scrollbar visibility delta flagged.

## Changed

- `src/components/ui/scroll-area.tsx` — import `@radix-ui/react-scroll-area` (namespace) -> `import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"`; types -> `ScrollAreaPrimitive.X.Props`. Unused `import * as React from "react"` dropped.
  - `ScrollArea` (src/components/ui/scroll-area.tsx:7): anatomy unchanged (`Root > Viewport > children`, sibling `ScrollBar` + `Corner`); Root/Viewport/Corner part names identical in Base UI. All classes verbatim, including the Viewport focus ring.
  - `ScrollBar` (src/components/ui/scroll-area.tsx:30): `ScrollAreaPrimitive.ScrollAreaScrollbar` -> `ScrollAreaPrimitive.Scrollbar`, `ScrollAreaPrimitive.ScrollAreaThumb` -> `ScrollAreaPrimitive.Thumb` (per display-misc.md). `orientation` prop kept (same name/default in Base UI). All classes verbatim.
  - Radix Root `type` prop: dropped by Base UI. The wrapper did NOT surface it (no destructure/default), so no wrapper-level flag applies; consumers passing `type` through `...props` would no longer compile — none found in this project.
  - All exported symbols (`ScrollArea`, `ScrollBar`) and data-slot attributes preserved.
- Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/scroll-area.tsx` -> no matches.

## Left alone

- `src/components/tables/filter-components/filter-popover.tsx` — consumer (`<ScrollArea className="max-h-[80vh]">`); prop surface unchanged, no edits needed.
- Base UI's new `ScrollArea.Content` part (recommended for horizontal-overflow measurement) was NOT added — the wrapper keeps the project's exact anatomy; only vertical scrolling is used in this project.

## Behavior changes

- Scrollbar visibility: Radix default `type="hover"` showed scrollbars only on hover and hid them after `scrollHideDelay` (600ms). Base UI has no `type`/`scrollHideDelay`; the scrollbar mounts whenever content is scrollable and this wrapper adds no visibility styling, so scrollbars are now always visible while scrollable. To restore hover-style behavior, style Scrollbar opacity against `data-hovering`/`data-scrolling`. FLAGGED, not patched.
- Radix Scrollbar `data-state="visible"/"hidden"` attributes are gone (replaced by `data-hovering`/`data-scrolling`/`data-has-overflow-*`); no classes referenced them here.
- Horizontal `ScrollBar orientation="horizontal"` without a `ScrollArea.Content` wrapper may not measure horizontal overflow correctly in Base UI; no horizontal usage exists in this project today.

## Verify by hand

1. Open the table Filter popover and make its content exceed 80vh: content scrolls inside the popover.
2. Confirm the vertical scrollbar look (2.5 width, rounded thumb, border) matches pre-migration; note it no longer fades out after hover.
3. Drag the thumb and click the track: viewport scrolls; corner area renders without artifacts.
4. Keyboard-focus the viewport: focus ring (`focus-visible:ring-[3px]`) still appears.
