# label

2026-07-14, transformation engine (legacy new-york style: user's own file transformed, classes kept verbatim). Radix Label has no Base UI counterpart; replaced with a native `<label>` element.

## Changed

- `src/components/ui/label.tsx`
  - `import * as LabelPrimitive from "@radix-ui/react-label"` removed; `<LabelPrimitive.Root>` -> native `<label>` (per the mapping: Label has no Base UI primitive; `Field.Label` only applies inside `Field.Root`, which this generic wrapper is not).
  - Props type: `React.ComponentProps<typeof LabelPrimitive.Root>` -> `React.ComponentProps<"label">`; the React import became type-only (`import type * as React from "react"`).
  - `data-slot="label"`, the exported `Label` name, `"use client"`, and the exact class string (including `select-none`, `group-data-[disabled=true]:*`, `peer-disabled:*`) kept verbatim.
  - Leftover scan clean: `grep -in "radix" src/components/ui/label.tsx` -> no matches.

## Left alone

- The single consumer importing `~/components/ui/label` needs no changes: the public API (`htmlFor`, `className`, children) is identical on a native `<label>`.

## Behavior changes

- Radix Label's only behavioral extra was preventing text selection on rapid double-click via JS. The wrapper's existing `select-none` class covers the same outcome in CSS, so no user-visible difference is expected; noting it because the JS-level `preventDefault` on mousedown is gone.

## Verify by hand

1. Double-click a form label rapidly — text should not get selected (CSS `select-none`).
2. Click a label wired via `htmlFor` — focus must move to its input.
3. A label next to a disabled peer input still shows `cursor-not-allowed` + `opacity-50`.
