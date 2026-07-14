# Kejaniverse

Property management for Kenyan landlords. Landlords sign up, register properties (with unit types, rent prices, and a bank account that becomes a Paystack subaccount for payouts), add units, and assign tenants. Tenants pay rent via M-Pesa through a USSD flow (Africa's Talking callback) that initiates a Paystack mobile-money charge; a Paystack webhook records payments and updates each tenant's cumulative rent. The dashboard shows revenue, occupancy, and recent payments per property, with filterable payment/tenant/unit tables.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19
- **API:** tRPC 11 + React Server Components; server actions for mutations
- **Auth:** Clerk 7 (`clerkMiddleware`, svix-verified `user.created` webhook)
- **Database:** PostgreSQL + Drizzle ORM (`drizzle-kit` for migrations)
- **Cache/sessions:** Upstash Redis (USSD session state)
- **Payments:** Paystack (subaccounts, mobile-money charges, webhooks); Africa's Talking USSD callback
- **UI:** Base UI (`@base-ui/react`) via shadcn-style wrappers in `src/components/ui`, Tailwind CSS 4, TanStack Table, react-hook-form + Zod
- **Tooling:** TypeScript, ESLint 9 (flat config, `eslint-config-next` + typescript-eslint + eslint-plugin-drizzle), Prettier, pnpm 11

## Prerequisites

- Node.js 24 LTS
- pnpm 11 (`corepack enable` — pinned via `packageManager`)
- Docker or Podman (for the local Postgres container)

## Setup

```bash
git clone https://github.com/peterkibuchi/kejaniverse
cd kejaniverse
pnpm install
cp .env.example .env   # then fill in Clerk, Paystack, and Upstash credentials
./start-database.sh    # local Postgres in Docker/Podman
pnpm db:push           # push the Drizzle schema
pnpm dev
```

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Build + start locally |
| `pnpm start` | Start a production build |
| `pnpm check` | Lint + typecheck |
| `pnpm lint` / `pnpm lint:fix` | ESLint (optionally with fixes) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format:check` / `pnpm format:write` | Prettier |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:push` | Push schema directly to the DB |
| `pnpm db:studio` | Drizzle Studio |

## Notes

- **Deployment:** Vercel builds and deploys the app. GitHub Actions CI runs lint + typecheck only — it does not build or gate deploys (`next.config.ts` also sets `typescript.ignoreBuildErrors` since typechecking happens in CI).
- **Dependency policy:** pnpm `minimumReleaseAge: 1440` (packages must be ≥24h old to install) with **no exclusions**; all install-time build scripts are denied (`allowBuilds` all `false` in `pnpm-workspace.yaml`) — review before flipping any to `true`.
- **Pinned versions:** TypeScript is held at 5.9 (typescript-eslint support ceiling) and ESLint at 9 (`eslint-config-next` compatibility). Bump them together, not independently.
- **UI components:** the `src/components/ui` wrappers are Base UI, not Radix. `components.json` still declares the legacy `new-york` style, so `shadcn add` would fetch Radix-based variants that no longer match — add new components manually. Per-component migration reports (API/behavior deltas, verify-by-hand checklists) live in `.migration/`.
- **Env vars:** validated in `src/env.js` (t3-env). `SKIP_ENV_VALIDATION=1` skips validation for tooling/builds.
