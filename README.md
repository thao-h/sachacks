# DDBA Local Delivery OS

A local delivery operations platform for restaurants — built as a modular monolith with Next.js, Prisma, and PostgreSQL.

## Backend-First Extension

Alongside the original `apps/web` monolith, the repo now includes incremental backend-first scaffolding:

- `apps/api` - standalone HTTP adapter (Next.js on port 4000)
- `packages/backend-core` - framework-agnostic service/repo interfaces
- `packages/contracts` - shared enums, schemas, and API envelope types
- `packages/db/src/repositories` - placeholder Prisma repository adapters

This was added without deleting existing working code so migration can happen step by step.

## Architecture

**Modular monolith** in a single Next.js app (`apps/web`), with domain logic organized into server-side modules. Shared types, enums, and schemas live in `packages/shared`. Database access is isolated in `packages/db`.

```
apps/web/src/
├── app/                    # Pages + API routes (Next.js App Router)
│   ├── (customer)/         # Customer-facing pages
│   ├── (restaurant)/       # Restaurant dashboard
│   ├── (dispatch)/         # Dispatch board
│   └── api/v1/             # Versioned REST API
├── server/
│   ├── modules/            # Domain modules (restaurants, menu, orders, dispatch, drivers)
│   │   └── <module>/       # Each: types.ts, schemas.ts, repo.ts, service.ts
│   ├── lib/                # errors, money (cents-safe), ids, logger
│   └── contracts/api.ts    # handleRoute(), ok(), fail() – route handler helpers
├── components/             # React components (ui, customer, restaurant, dispatch)
└── lib/                    # Client-side: api-client, format

packages/
├── db/                     # Prisma schema, client singleton, seed data
├── shared/                 # Enums, types, Zod schemas (cross-boundary)
└── config/                 # ESLint + TypeScript base configs
```

## Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm 9+, PostgreSQL

pnpm install
cp .env.example .env       # edit DB_URL
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/v1/restaurants/:id/menu` | Get restaurant menu |
| GET | `/api/v1/orders?restaurantId=` | List orders for restaurant |
| POST | `/api/v1/orders` | Create a new order |
| POST | `/api/v1/orders/:id/status` | Update order status |
| POST | `/api/v1/dispatch/assignments` | Assign driver to order |
| GET | `/api/v1/drivers` | List active drivers |

All routes use consistent `{ data }` / `{ error: { code, message, details } }` envelopes via `handleRoute()`.

## What's Stubbed

The scaffold is compile-safe but intentionally minimal:

- **Service logic**: Order creation works end-to-end; dispatch `updateStatus` is a TODO stub
- **Auth**: Mock session in `server/auth/session.ts` — returns `null` everywhere
- **UI**: Server-rendered pages with no client interactivity (no forms, no cart)
- **Validation**: Zod schemas cover basic fields; business constraints (e.g. max items) are TODO
- **Error codes**: Generic set (`VALIDATION_ERROR`, `NOT_FOUND`, etc.); domain-specific codes pending

## Next Implementation Order

1. **Create-order flow** — cart UI, checkout form, POST to `/api/v1/orders`
2. **Restaurant order status updates** — dashboard buttons to advance order state
3. **Dispatch assignment** — dispatch board driver-assign UI + status progression

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL + Prisma
- **Validation**: Zod
- **Monorepo**: pnpm workspaces + Turborepo
