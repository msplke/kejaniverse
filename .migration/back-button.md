# back-button

2026-07-14, transformation engine (custom app component, not a shadcn wrapper). Fixed a layering bug (direct `@radix-ui/react-tooltip` import) and converted `asChild` to the Base UI `render` convention.

## Changed

- `src/components/ui/back-button.tsx`
  - `import { TooltipTrigger } from "@radix-ui/react-tooltip"` (a bug: it bypassed the project's wrapper and pulled the raw Radix part) -> `TooltipTrigger` from `~/components/ui/tooltip`, merged into the existing import alongside `Tooltip` and `TooltipContent`. The tooltip wrapper is being migrated to Base UI in parallel; its public export names are stable, so this file only depends on the wrapper API.
  - `<TooltipTrigger asChild><Button ...>{children}</Button></TooltipTrigger>` -> `<TooltipTrigger render={<Button variant="link" onClick={...} className="cursor-pointer" />}>{children}</TooltipTrigger>` per the Base UI asChild->render pattern (children move to the trigger; element props stay on the rendered Button).
  - Button props (`variant="link"`, `onClick={() => router.back()}`, `className="cursor-pointer"`), the icon + `sr-only` children, and the exported `BackButton` name kept verbatim.
  - Leftover scan clean: `grep -in "radix" src/components/ui/back-button.tsx` -> no matches.

## Left alone

- `src/components/ui/tooltip.tsx` — owned by the parallel tooltip migration; not touched here.
- `~/components/icons` — no Radix content.

## Behavior changes

- None from this file itself. The trigger now composes the project's own migrated Button (Base UI Button primitive), which accepts `render` natively, so the merge is prop-level identical. Tooltip-family deltas (delay feel, positioning defaults) belong to the tooltip.tsx migration report.
- Note: this file will not typecheck until tooltip.tsx's migration lands, since its `TooltipTrigger` must accept the Base UI `render` prop (the old Radix wrapper trigger only knew `asChild`).

## Verify by hand

1. Hover the back arrow — "Go back" tooltip appears; delay feel is governed by the tooltip wrapper.
2. Click the back button — `router.back()` navigates to the previous page.
3. Tab to the button — focus ring visible, tooltip opens on focus, and a screen reader announces "Back" (sr-only span).
