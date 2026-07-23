# Kejaniverse — Repo Audit (2026-07-14)

Scope: full repo after Next 15→16 / Clerk 6→7 / pnpm 11 / Radix→Base UI migration.
Verified with `pnpm lint` (1 known warning), `pnpm typecheck` (clean), `knip` (unused files/exports), `eslint --print-config` (drizzle rules active), git secret scan (clean). Findings marked "unverified suspicion" could not be confirmed without a running DB/deployment.

---

## CRITICAL

### ~~C1. Server-action layer has no authorization — full cross-landlord IDOR for any signed-in user~~
**Status: fixed** — every export in `actions/tenants.ts` and `actions/units.ts`, plus `getPropertyDashboardData`/`fetchBanks`/`createSubaccount` in `actions/properties.ts`, now resolves `auth()` and verifies `property.ownerId` (unit-scoped functions resolve unit → property → owner); the unauthenticated USSD flow no longer calls these actions — it queries the db directly inside its own route-handler modules.

The `"use server"` modules below do no `auth()` or ownership checks, and each module is pulled into the client graph by a form/hook import, so **every export becomes a POSTable endpoint** for any authenticated user:
- `src/server/actions/tenants.ts:11` (`getTenants`), `:31` (`getTenantByUnitId`), `:57` (`addTenant`) — exposed via `src/components/forms/add-tenant-form.tsx:30`. Any signed-in user can read any property's tenant PII (names, phones, emails) and insert tenants into any landlord's units (also flips `unit.occupied`).
- `src/server/actions/units.ts:13` (`getUnitTypes`), `:22` (`addUnit`), `:46` (`getUnits`), `:63` (`getUnitByName`), `:77` (`getUnitById`), `:91` (`getPropertyByUnitId`) — exposed via `src/components/forms/add-unit-form.tsx:29`. Cross-property reads and unit creation; `getPropertyByUnitId` leaks `subaccountCode`/bank details.
- `src/server/actions/properties.ts:166` (`getPropertyDashboardData` — revenue, recent payments, tenant names) and `:25` (`fetchBanks`) — exposed via `src/components/forms/create-unit-type-form.tsx:41` (`createProperty` at `:95` is the only export that checks auth).
Remediation: in every action, `await auth()`, then join to `property` and filter `eq(property.ownerId, userId)`; or route all client-reachable operations through `protectedProcedure` with ownership checks and stop importing these modules from client code.

### ~~C2. Page-level IDOR — /properties/[id]/* renders any property to any signed-in user~~
**Status: fixed** — `properties/[id]/layout.tsx` now checks the id against `api.property.getAllUnderOwner()` (owner-filtered) and calls `notFound()` on miss, covering all child pages centrally.

- `src/app/(protected)/properties/[id]/page.tsx:18-27` — existence check only (no `ownerId`), then `getUnits(id)` + dashboard data.
- `src/app/(protected)/properties/[id]/tenants/page.tsx:14` — `getTenants(id)`: tenant PII for arbitrary property UUIDs.
- `src/app/(protected)/properties/[id]/units/page.tsx:14`, `tenants/new/page.tsx:9`, `units/new/page.tsx:10` — same pattern.
Remediation: verify `property.ownerId === userId` once in `src/app/(protected)/properties/[id]/layout.tsx` (currently no check, `layout.tsx:20`) and `notFound()` otherwise.

### ~~C3. tRPC IDOR — procedures keyed by id without ownership filter~~
**Status: fixed** — `property.getPropertyDashboardData`, `tenant.addTenant`, `tenant.getTenantByUnitId`, and `unit.addUnit` now apply the same `property.ownerId = ctx.auth.userId` join/filter as `payment.getAllPropertyPayments`.

All are live endpoints under `/api/trpc` for any authenticated user (several are unused by the UI but still exposed):
- `src/server/api/routers/property.ts:108-111` — `getPropertyDashboardData` checks the property *exists* but not `eq(property.ownerId, userId)`; leaks revenue/payments/tenant names.
- `src/server/api/routers/tenant.ts:15-34` — `addTenant` verifies the unit exists but not that its property belongs to `ctx.auth.userId`.
- `src/server/api/routers/tenant.ts:113-124` — `getTenantByUnitId` has no ownership check; unit ids are 6-char uppercase-alphanumeric (enumerable) → tenant PII oracle.
- `src/server/api/routers/unit.ts:19-22` — `addUnit` inserts into any `propertyId`.
Remediation: add the `property.ownerId = ctx.auth.userId` join/filter to each (as `payment.getAllPropertyPayments` already does, `routers/payment.ts:18-24`).

### ~~C4. USSD callback: unauthenticated third-party charge initiation + unit oracle~~
**Status: fixed** — the route now requires a `?token=` shared secret (`USSD_CALLBACK_TOKEN`, compared with `crypto.timingSafeEqual`, 401 before any parsing) and rate-limits to 10 requests/phone number/minute via the existing Upstash Redis (INCR + EXPIRE, `END`-terminated message on exceed); `input-handlers.ts` now uses the validated `~/env`. **Operator follow-up:** `USSD_CALLBACK_TOKEN` is set in Vercel (done); append `?token=<value>` to the callback URL in the Africa's Talking dashboard.

`src/middleware.ts:7` makes `/api/callbacks/ussd` public and `src/app/api/callbacks/ussd/route.ts:25` accepts any POST — there is no Africa's Talking source verification (no shared secret, no IP allowlist) and no rate limiting. `input-handlers.ts:118-160` then calls Paystack `/charge`, sending M-Pesa STK-push prompts to **arbitrary +254 numbers for attacker-chosen amounts** billed against real tenants' units; `input-validators.ts:39-70` doubles as a unit-id existence oracle.
Remediation: authenticate the AT origin (shared header secret and/or IP allowlist), rate-limit per phoneNumber/sessionId with the existing Upstash Redis, and return a uniform message for unknown unit ids.

---

## HIGH

### H1. Paystack webhook swallows persistence failures and ACKs 200 — payments silently lost
`src/app/api/webhooks/paystack/route.ts:68-70` — `updateDbOnRentPayment(...).catch(console.error)` then `return defaultResponse` (200). A transient DB failure means Paystack never retries and the rent payment is never recorded.
Remediation: let the error propagate and return 5xx so Paystack retries; treat a unique-violation on `payment.referenceNumber` (the PK, `schema.ts:153`, which is what currently gives replay-idempotency) as success.

### H2. Latent unauthenticated `createSubaccount` action
`src/server/actions/paystack.ts:46` has no auth; `src/hooks/paystack.ts:15-25` would expose it as a client mutation. Both files are currently dead (knip: unused, no importers), so it is not reachable today — but one import away from letting any user create arbitrary Paystack subaccounts.
Remediation: delete both files (see M6); if ever revived, add `auth()`.

### H3. No rate limiting anywhere
Upstash Redis (`src/server/redis/index.ts`) is used only for USSD session storage; there is no `@upstash/ratelimit` (or equivalent) on the public USSD callback, the webhooks, or tRPC/server actions.
Remediation: add sliding-window limits at least to `/api/callbacks/ussd` and the webhook routes; consider per-user limits on mutations.

---

## MEDIUM

### M1. Raw `process` env import bypasses validated env
`src/app/api/callbacks/ussd/input-handlers.ts:1` — `import { env } from "process"`; if `PAYSTACK_SECRET_KEY` is unset this silently sends `Authorization: Bearer undefined` to Paystack (`:156`).
Remediation: `import { env } from "~/env"`.

### M2. Clerk webhook verifies a re-serialized body
`src/app/api/webhooks/clerk/route.ts:27-28` — `JSON.stringify(await req.json())` before `wh.verify`; byte-level differences (unicode escapes, number formatting) can make valid Clerk signatures fail. Not forgeable, but fragile.
Remediation: verify `await req.text()` verbatim, or use Clerk 7's `verifyWebhook` from `@clerk/nextjs/webhooks`.

### M3. Clerk webhook not idempotent; user lifecycle ignored
`src/app/api/webhooks/clerk/route.ts:66-74` — plain insert; a svix retry of `user.created` hits the PK and throws an unhandled 500 (triggering more retries). `route.ts:50` ignores `user.updated`/`user.deleted`, so `propertyOwner` rows go stale/orphaned.
Remediation: `.onConflictDoNothing()` (or upsert) and handle update/delete events.

### M4. Owners get FORBIDDEN on legitimately empty lists
`src/server/api/routers/unit.ts:61-81` and `:162-183`, `src/server/api/routers/tenant.ts:82-103` — authorization is inferred from `rows.length === 0`, so a property with zero units/unit-types/tenants throws FORBIDDEN at its own owner.
Remediation: check ownership with an explicit property query first, then return `[]`.

### M5. Triplicated/duplicated data layer
Three `fetchBanks` (`actions/paystack.ts:17`, `actions/properties.ts:25`, `routers/paystack.ts:11`), two `createSubaccount` (`actions/paystack.ts:46`, `actions/properties.ts:67`), duplicate `createProperty` (`routers/property.ts:14` — unused — vs `actions/properties.ts:95` — used), duplicate `addTenant`/`getTenantByUnitId`/`addUnit`/`getUnits`-equivalents across actions and routers.
Remediation: pick one path per operation (suggest: tRPC for everything client-reachable), delete the rest.

### M6. Dead code inventory (knip, spot-verified)
- Unused files: `src/components/properties-breadcrumb.tsx`, `src/hooks/paystack.ts`, `src/server/actions/payments.ts` (**empty file**), `src/server/actions/paystack.ts`.
- Unused exports: `actions/properties.ts:25` `fetchBanks`, `:151` `getProperties`; `actions/units.ts:63` `getUnitByName`; `input-handlers.ts` `chargeUser` re-export surface; per-key getters in `ussd-session-handler.ts:12,23,34`.
- Unused tRPC procedures: `property.create`, `property.getPropertyByUnitId`, and the **entire `tenant` and `unit` routers** are never called by the UI — yet remain exposed endpoints (see C3).
- `src/trpc/react.tsx:26` — client `api` is never used (all data fetching is RSC); `TRPCReactProvider` (`src/app/layout.tsx:39`) ships tRPC client + react-query provider for nothing.
Remediation: delete unused files/exports; either use or remove the unused routers (removing shrinks the attack surface from C3).

### M7. Vercel deploys are not gated on type errors
`next.config.ts:11` — `typescript: { ignoreBuildErrors: true }`; GitHub CI runs lint+typecheck but Vercel builds/deploys independently, so a type-broken commit can deploy.
Remediation: gate Vercel deploys on CI (Vercel "ignored build step" / required checks) or drop the flag.

### M8. `uuid_generate_v7()` default requires a Postgres extension (unverified suspicion)
`src/server/db/schema.ts:26-27` — `default(sql\`uuid_generate_v7()\`)` needs the `pg_uuidv7` extension (not built into Postgres ≤17); `start-database.sh` does not install it, so fresh local setups likely fail on first insert.
Remediation: document/install the extension in setup, or switch to app-generated UUIDv7.

---

## LOW

### L1. `paystack.fetchBanks` is a `publicProcedure`
`src/server/api/routers/paystack.ts:11` — only the middleware matcher keeps it from anonymous use; it proxies a secret-key Paystack call. Make it `protectedProcedure` (defense in depth).

### L2. Non-constant-time webhook signature comparison
`src/app/api/webhooks/paystack/route.ts:35` — `hash !== header` string compare. Use `crypto.timingSafeEqual`.

### L3. Webhook trusts event name only
`src/app/api/webhooks/paystack/route.ts:44-49,107` — `charge.success` handled without checking `data.status`, currency (KES assumed), or that the charge targeted this app's subaccount before crediting `Math.round(amount/100)` (integer-KES rounding is a known TODO in the code comment at `:103-106`).

### L4. PII/secrets-adjacent data in production logs
`src/app/api/callbacks/ussd/route.ts:54-55,66-67` (phone numbers, session data), `input-handlers.ts:150` (full charge payload: email+phone), `webhooks/clerk/route.ts:76` (full user row), `webhooks/paystack/route.ts:48` (custom fields). Strip or gate behind `NODE_ENV === "development"`.

### L5. Unit-id collision handling inconsistent
`src/server/api/routers/unit.ts:17` generates a 6-char id with no retry (`actions/units.ts:27-41` has the retry loop). Collision → raw 500. Unify on the retrying implementation (or DB-generated ids).

### L6. Property-existence oracle
`src/server/api/routers/unit.ts:64-80` and `tenant.ts:85-102` — NOT_FOUND vs FORBIDDEN distinction tells non-owners whether a property UUID exists. Return NOT_FOUND uniformly.

### L7. env validation gaps
`.env.example:16-20` documents `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and the Clerk redirect URLs, but `src/env.js:8-25` validates none of them (Clerk reads them from raw `process.env`). Add them to `env.js` for fail-fast boots.

### L8. `add-unit-form` UX bugs
`src/components/forms/add-unit-form.tsx:64-67` resets the form before the mutation settles, and `:119` disables the submit only on `unitTypes.length === 0`, not `isPending` (double-submit possible; compare `add-tenant-form.tsx:158`).

### L9. Schema smells
`src/server/db/schema.ts:153-157` — `paymentReference` duplicates `referenceNumber` (drop one); `amount` is integer KES (see L3); `varchar(16)` for names (`schema.ts:30-31`) is tight for real names.

---

## INFO

### I1. Known/expected lint warning — do not "fix"
`src/components/tables/data-table.tsx:67` — `react-hooks/incompatible-library` on `useReactTable`: React Compiler intentionally skips memoizing this component (TanStack Table v8 returns non-memoizable functions). This is the only lint finding; expected until TanStack Table ships compiler support.

### I2. Drizzle ESLint rules confirmed active in the new flat config
`eslint.config.js:33-40` — `drizzle/enforce-delete-with-where` and `enforce-update-with-where` resolve to severity *error* for `db`/`ctx.db` (verified via `--print-config`); zero violations. Caveat: transaction handles (`tx`) are not covered by the `drizzleObjectName` list — add `"tx"` if you want coverage inside transactions.

### I3. components.json legacy style caveat
`components.json:3` — `"style": "new-york"` (legacy registry). A future `pnpm dlx shadcn add <x>` fetches **Radix-based** variants that no longer match the Base UI wrappers in `src/components/ui/`. Add new components by hand (or from a Base UI registry) until this is reconciled.

### I4. `middleware.ts` uses the deprecated convention (Next 16 → `proxy.ts`)
`src/middleware.ts` still uses the `middleware` file convention that Next 16 deprecates in favor of `proxy.ts`. Follow-up, not urgent. Before renaming, verify: (1) current `@clerk/nextjs` 7.x docs bless `clerkMiddleware` exported from `proxy.ts` (naming/export shape), (2) the `config.matcher` (`middleware.ts:29-36`) carries over unchanged, (3) post-rename re-test the public routes (`/api/webhooks/*`, `/api/callbacks/ussd`) and the signed-out redirect.

### I5. Base UI migration behavior deltas worth a manual pass (.migration/ reports)
- Data-table "Columns" menu checkbox items no longer close the menu per click (Base UI `closeOnClick` default; `.migration/project.md:103-107`) — intentional, add `closeOnClick` per item to restore the old feel.
- All separators are now semantic `role="separator"` and visible to assistive tech (Radix `decorative` rendered `role="none"`; `.migration/separator.md:20`).
- Scroll-area scrollbars are now always visible while content is scrollable (no hover-fade; `.migration/scroll-area.md:21`).
- Menu arrow-key navigation now wraps (`loopFocus` defaults true; `.migration/dropdown-menu.md`).

### I6. Commented-out actions-column blocks (inventory)
`src/components/tables/table-columns/units.tsx:55-92`, `tenants.tsx:84-107`, `recent-payments.tsx:58-78` — dropdown "actions" columns kept as comments (rewritten to Base UI syntax during migration so a future uncomment compiles; no stray imports left). Delete or implement.

### I7. Dependency verification
- `date-fns` (`package.json:35`) — **zero imports in src**; it only satisfies `@base-ui/react`'s *optional* peer (react-day-picker 10 bundles its own copy). Safe to remove; re-run install to confirm.
- Verified used: `nanoid` (`actions/units.ts:6`, `routers/unit.ts:3`), `svix` (`webhooks/clerk/route.ts:3`), `zod-form-data` (`ussd/input-validators.ts:2`), `@upstash/redis` (`server/redis/index.ts:1`).

### I8. Hygiene checks — clean
No `dangerouslySetInnerHTML`, no `target="_blank"` (so no missing `rel`), no open-redirect patterns, no raw `sql\`\`` outside parameterized Drizzle fragments. Secret scan of tracked files clean; `.env` untracked and gitignored (`.gitignore:36-38`). No TODO/FIXME markers in src. `pnpm typecheck` clean.

### I9. README was stock create-t3-app boilerplate (NextAuth/Prisma)
Rewritten as part of this audit — see README.md.
