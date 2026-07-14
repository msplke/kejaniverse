# sheet

2026-07-14, transformation engine (legacy new-york style: user's own file rewired, own classes kept). Migrated clean; slide animations rewritten to transition-based starting/ending styles.

## Changed

- `src/components/ui/sheet.tsx` — import `@radix-ui/react-dialog` (namespace) -> `import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"`; all prop types `React.ComponentProps<typeof SheetPrimitive.X>` -> `SheetPrimitive.X.Props`.
  - `SheetOverlay` (src/components/ui/sheet.tsx:25): `Overlay` -> `Backdrop`; `data-[state=*]:animate-in/out fade-in/out-0` -> `transition-opacity data-starting-style:opacity-0 data-ending-style:opacity-0`. `data-slot="sheet-overlay"` kept.
  - `SheetContent` (src/components/ui/sheet.tsx:38): `Content` -> `Popup` (dialog family: no Positioner). Added `data-side={side}` on the Popup so per-side variants can key off it (Base UI dialog Popup has no native data-side). Slide keyframes (`slide-in-from-* / slide-out-to-*` inside the per-side conditionals) rewritten to parameterized `data-[side=...]:data-starting-style:*` / `data-[side=...]:data-ending-style:*` translates in the base class string; `data-[state=closed]:duration-300 / data-[state=open]:duration-500` -> `data-closed:duration-300 data-open:duration-500`. Per-side layout classes (inset/border/width) kept verbatim in the conditionals. Inline close button: `data-[state=open]:bg-secondary` -> `data-open:bg-secondary`.
  - `Sheet`/`SheetTrigger`/`SheetClose`/`SheetPortal`/`SheetTitle`/`SheetDescription`: part names unchanged, type rewrites only. `SheetHeader`/`SheetFooter` untouched (plain divs).
  - All exported symbols and data-slot attributes preserved.
- Leftover scan clean: `grep -n "radix-ui\|@radix-ui" src/components/ui/sheet.tsx` -> no matches.

## Left alone

- `src/components/ui/sidebar.tsx` — consumer of Sheet* (`SheetContent side={side}` keeps working; `side` remains a wrapper prop). Not part of this component's scope.
- `package.json` / lockfile — per task rules, dependency removal not performed here.

## Behavior changes

- `onOpenChange` signature: Radix `(open) => void` -> Base UI `(open, eventDetails) => void`; per-interaction dismiss callbacks (`onEscapeKeyDown`, `onPointerDownOutside`, `onInteractOutside`) no longer exist as props — consumers passing them through `...props` would now land on the Popup as unknown DOM props. None found in this project.
- `modal` prop widened to `boolean | 'trap-focus'`; `forceMount` on Portal/Overlay/Content is gone (`keepMounted` on Portal is the Base UI knob). Not surfaced by the wrapper.
- Enter/exit is now CSS-transition-driven instead of keyframe-driven; `data-open:bg-secondary` on the inline Close is likely inert in Base UI (Close only documents `data-disabled`), kept as a mechanical class rewrite.
- Radix focused behavior deltas (focus trap implementation, scroll lock) are Base UI defaults; not patched.

## Verify by hand

1. Open the mobile sidebar (sheet, side="left" via sidebar.tsx): panel slides in from the left over ~500ms, backdrop fades in.
2. Close via the X button, Escape, and backdrop click: panel slides out (~300ms), focus returns to the trigger.
3. Check each `side` value renders on the correct edge with the correct border (quick storybook/scratch page if available).
4. Tab through an open sheet: focus stays trapped inside; body scroll is locked.
