# separator

2026-07-14, transformation engine (legacy new-york style: user's own file transformed, classes kept verbatim). Migrated to the callable `@base-ui/react/separator` primitive; the `decorative` prop is dropped (flagged below).

## Changed

- `src/components/ui/separator.tsx`
  - `import * as SeparatorPrimitive from "@radix-ui/react-separator"` -> `import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"`; `<SeparatorPrimitive.Root>` -> callable `<SeparatorPrimitive>` (single-part primitive, no `.Root`).
  - `decorative = true` default and the `decorative={decorative}` pass-through removed — Base UI's Separator has no such prop (always semantic; see Behavior changes).
  - Props type: `React.ComponentProps<typeof SeparatorPrimitive.Root>` -> `SeparatorPrimitive.Props`; the now-unused `import * as React from "react"` dropped.
  - `data-slot="separator-root"` (this project's original attribute value), the exported `Separator` name, `orientation` default `"horizontal"`, `"use client"`, and the exact class string (`data-[orientation=...]` variants are identical on both sides) kept verbatim.
  - Leftover scan clean: `grep -in "radix" src/components/ui/separator.tsx` -> no matches.

## Left alone

- Consumers `src/app/(protected)/properties/new/unit-types/page.tsx` and `src/components/ui/sidebar.tsx` need no call-site changes: no consumer passes `decorative` or `orientation` props that changed (verified by grep).

## Behavior changes

- FLAGGED, not patched: Radix with `decorative={true}` (this wrapper's default) rendered `role="none"`, hiding every Separator from the accessibility tree. Base UI's Separator is always semantic (`role="separator"` with `aria-orientation`), so all separators in the app are now exposed to assistive technology. Visual output is unchanged. If a purely decorative rule is required somewhere, the documented replacement is a plain `<div aria-hidden="true">` or a CSS border — a per-consumer decision, not made here.
- Any future caller passing `decorative` becomes a type error (none exist today).

## Verify by hand

1. Look at a page with a Separator (e.g. `properties/new/unit-types`) — a 1px `bg-border` line renders identically horizontal and (in the sidebar) vertical.
2. Inspect the element: `role="separator"` and `data-orientation` present; classes resolve to `h-px w-full` (horizontal) / `h-full w-px` (vertical).
3. Quick screen-reader pass (or accessibility tree in devtools): separators now appear as separators — confirm this is acceptable noise for the app.
