# kejaniverse — Radix -> Base UI migration, project-level report

## Consumer sweep

2026-07-14. All app-code call sites updated to the Base UI wrapper surface. No file
in `src/components/ui/` was touched; no dependency changes.

### Files changed

- `src/app/(protected)/properties/[id]/units/page.tsx` — `Button asChild > Link` ->
  `Button render={<Link .../>} nativeButton={false}` (children stay on Button).
- `src/app/(protected)/properties/[id]/tenants/page.tsx` — same pattern.
- `src/components/tables/table-columns/tenants.tsx` — mailto `Button asChild` ->
  `render={<Link .../>} nativeButton={false}`; commented-out actions-column
  `DropdownMenuTrigger asChild` block rewritten to the `render` form (dead code kept
  accurate so a future uncomment compiles).
- `src/components/tables/table-columns/units.tsx`, `recent-payments.tsx` — same
  commented-block rewrite only.
- `src/components/mode-toggle.tsx` — `DropdownMenuTrigger asChild > Button` ->
  `render={<Button .../>}` with icon children moved onto the trigger.
- `src/components/tables/data-table.tsx` — Columns menu trigger `asChild` -> `render`.
- `src/components/tables/data-table-column-header.tsx` — vestigial
  `data-[state=open]:bg-accent` -> `data-popup-open:bg-accent` (inert both before and
  after: the sort button is not composed into any trigger; renamed for convention
  consistency only).
- `src/components/dashboard/property-switcher.tsx` —
  - trigger: `DropdownMenuTrigger asChild > SidebarMenuButton` ->
    `render={<SidebarMenuButton .../>}` with children on the trigger;
  - trigger classes `data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground`
    -> `data-popup-open:` equivalents;
  - `w-[--radix-dropdown-menu-trigger-width]` -> `w-(--anchor-width)`;
  - `DropdownMenuItem asChild > Link` -> `render={<Link .../>}`;
  - NEW (beyond the flagged list): `DropdownMenuLabel` + property items wrapped in
    `DropdownMenuGroup`. Required, not just an a11y nicety — Base UI 1.6.0
    `Menu.GroupLabel` THROWS ("Menu group parts must be used within <Menu.Group>")
    when rendered outside a Group; the dropdown-menu.md report's "renders fine"
    assessment was wrong for this version.
- `src/components/tables/filter-components/filter-popover.tsx` —
  - layering bug fixed: `import { ScrollArea } from "@radix-ui/react-scroll-area"`
    (raw Radix primitive, would break once the package is removed) -> project wrapper
    `~/components/ui/scroll-area`;
  - `PopoverTrigger asChild > Button` -> `render={<Button variant="outline" />}` with
    children on the trigger.
- `src/components/tables/filter-components/date-range-filter.tsx` — both calendar
  triggers: `PopoverTrigger asChild > FormControl > Button` ->
  `PopoverTrigger render={<FormControl render={<Button ...>...</Button>} />}` (trigger
  props flow through FormControl's mergeProps onto the Button, preserving the
  id/aria-describedby/aria-invalid wiring).
- `src/components/tables/filter-components/select-filter.tsx` — see Select decisions.
- `src/components/forms/add-tenant-form.tsx` — 4 Input FormControls -> `render`;
  Select block converted (see Select decisions).
- `src/components/forms/add-unit-form.tsx` — 1 Input FormControl -> `render`; Select
  block converted.
- `src/components/forms/create-unit-type-form.tsx` — 1 Input FormControl -> `render`;
  Select block converted.
- `src/components/forms/create-property-form.tsx` — 2 Input FormControls -> `render`;
  Select block converted.

### FormControl conversions (18 call sites, 6 files)

- 15 sites converted `<FormControl><X/></FormControl>` -> `<FormControl render={<X/>} />`.
- 3 sites REMOVED instead of converted: add-tenant-form, add-unit-form, and
  create-unit-type-form had a second, outer `<FormControl>` wrapping the whole
  `<Select>` root. Under Radix Slot this was a harmless no-op (Select.Root rendered no
  element and dropped the injected props); under the useRender-based FormControl it
  would render the Select into a literal `<input>` (runtime crash). The outer wrapper
  was deleted; the inner FormControl around SelectTrigger carries the label/aria
  wiring, matching the canonical shadcn pattern. Net: only the trigger-level
  FormControl per select remains.
- data-slot note (pre-existing parity): the injected `data-slot="form-control"`
  overrides `data-slot="select-trigger"` on trigger renders, exactly as Radix Slot did.

### Select consumers — SelectValue / items / null-boundary decisions

Base UI `SelectValue` renders the raw value unless `items` is supplied on the root,
and treats `""` as a real value (placeholder only shows for `null`).

- `add-tenant-form.tsx` (unitId: labels = unit names, values = ids):
  `items={units.map((u) => ({ label: u.name, value: u.id }))}`; boundary mapping
  `value={field.value || null}` / `onValueChange={(value) => field.onChange(value ?? "")}`
  so the RHF `""` default shows the placeholder. Redundant `defaultValue` removed
  (controlled select).
- `add-unit-form.tsx` (unitType: labels = "type - price", values = ids): same
  treatment, `items` built from `unitTypes` with the same label template as the
  SelectItems.
- `create-property-form.tsx` (bankCode: labels = bank names, values = codes): `items`
  from `banks`; converted from uncontrolled (`defaultValue`) to controlled with the
  null boundary mapping — required for the "Choose Bank" placeholder to show on the
  `""` default.
- `create-unit-type-form.tsx` (unitType enum): NO `items` — SelectItem labels equal
  values, so raw-value rendering is already correct; no null mapping — the field
  defaults to "Single-room" and can never be empty. Redundant `defaultValue` removed.
- `select-filter.tsx`: `items={options}` added on the root (covers the
  no-renderValue case); the `renderValue` prop is now adapted through SelectValue's
  supported function-children form:
  `{(value: string | null) => renderValue(value ?? "", options)}` (only when
  renderValue is provided; otherwise children stay undefined so placeholder/items
  labels apply). Null boundary mapping added — both filter fields default to `""`.
  The `renderValue` prop signature exported to callers is unchanged.

### Behavior flags (not silently patched)

- **closeOnClick delta (visible)**: the data-table "Columns" menu's
  `DropdownMenuCheckboxItem`s no longer close the menu per click — Base UI defaults
  `closeOnClick` to `false` on checkbox/radio items (Radix closed). The menu now stays
  open while toggling column visibility. Left as the new default per skill rule; add
  `closeOnClick` per item if the old feel is wanted.
- **forceMount**: zero app-code usages found; nothing removed.
- **GroupLabel/Group**: property-switcher's menu label now sits in a
  `DropdownMenuGroup` (see above) — this is a hard requirement in Base UI 1.6.0, and
  also restores the `aria-labelledby` association.
- **data-popup-open on data-table-column-header**: renamed class remains inert (the
  button is a plain sort toggle, not a menu trigger) — flagged so nobody assumes it
  does something.
- Other consumer-props.md renames (TooltipProvider delayDuration, Avatar delayMs,
  Separator decorative, ScrollArea type, disableHoverableContent, --radix-* CSS vars
  outside property-switcher): swept, zero remaining app-code occurrences.

### Final check status

- `pnpm typecheck` — clean (0 errors).
- `pnpm lint` — 1 warning: the pre-existing `react-hooks/incompatible-library` on
  `useReactTable` in data-table.tsx (kept per task rules). No new errors.
- `pnpm format:write` — run; formatting normalized.
- `grep -rn "asChild" src --include="*.tsx"` — 0 hits (including comments).
- `grep -rin "radix" src --include="*.tsx"` — 0 hits.
- `grep -rn -- "--radix" src` (all file types) — 0 hits.
