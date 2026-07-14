# button

2026-07-14, transformation engine (legacy new-york style: user's own file transformed, classes kept verbatim). Migrated cleanly to the real `@base-ui/react/button` primitive; `asChild` removed in favor of the native `render` prop.

## Changed

- `src/components/ui/button.tsx`
  - `import { Slot } from "@radix-ui/react-slot"` and the `const Comp = asChild ? Slot : "button"` idiom removed. Replaced with `import { Button as ButtonPrimitive } from "@base-ui/react/button"`, rendered directly (per the SKILL hard rule: real Button primitive, never a hand-rolled useRender wrapper).
  - Props type: `React.ComponentProps<"button"> & VariantProps<...> & { asChild?: boolean }` -> `ButtonPrimitive.Props & VariantProps<typeof buttonVariants>`. The `asChild` prop is gone; polymorphism now comes from Base UI's native `render` prop (included in `ButtonPrimitive.Props`).
  - The unused `import * as React from "react"` was dropped (nothing references React after the type change).
  - `buttonVariants` cva definition, all variant/size classes, `data-slot="button"`, and both exported symbol names (`Button`, `buttonVariants`) kept exactly as they were (this project's `default`/`secondary` variants intentionally lack `shadow-xs`; NOT restyled to match the base registry).
  - Leftover scan clean: `grep -in "radix" src/components/ui/button.tsx` -> no matches.

## Left alone

- Consumer call sites that pass `asChild` to Button — out of scope for this wrapper-only pass, flagged for the consumer sweep (they will fail typecheck until repointed to `render`):
  - `src/app/(protected)/properties/[id]/units/page.tsx:20` — `<Button asChild><Link ...>...</Link></Button>`
  - `src/app/(protected)/properties/[id]/tenants/page.tsx:20` — same pattern
  - `src/components/tables/table-columns/tenants.tsx:42` — `<Button asChild variant="link" className="p-0"><Link ...>...</Link></Button>`
  - Target shape: `<Button render={<Link href={...} />} nativeButton={false}>children</Button>` (Base UI Button's `nativeButton` defaults to `true`; set `false` when the rendered element is not a native button).
- `src/components/ui/sidebar.tsx` imports `Button` but never passes `asChild` to it (its own internal Slot idiom is a separate migration).

## Behavior changes

- `asChild` no longer exists on Button; any runtime/JS consumer passing it would previously slot-render and now would leak an unknown prop. All known usages are listed above and break at typecheck, so nothing silent.
- Ref type widens: Base UI's Button forwards `React.Ref<HTMLElement>` (not `HTMLButtonElement`). Refs typed as `RefObject<HTMLButtonElement>` may need a type adjustment.
- Base UI Button adds keyboard/ARIA button semantics when `render` swaps in a non-button element (with `nativeButton={false}`) — richer than Radix Slot, which only merged props. New capability `focusableWhenDisabled` is available but unused.

## Verify by hand

1. Click a default Button (e.g. any form submit) — styles and hover state unchanged.
2. After the consumer sweep converts the three `asChild` sites: the "Add Unit"/"Add Tenant" buttons must navigate as links (middle-click opens new tab) and still look like buttons.
3. Tab to a Button and press Enter and Space — both must activate.
4. A `disabled` Button must be skipped in the tab order and show `opacity-50`.
