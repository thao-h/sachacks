# DDBA Local Delivery OS

A local delivery operations platform for restaurants — built as a modular monolith with Next.js, Prisma, and PostgreSQL.

## Architecture

**Modular monolith** in a single Next.js app (`apps/web`), with domain logic organized into server-side modules. Shared types, enums, and schemas live in `packages/shared`. Database access is isolated in `packages/db`.

This structure enables fast MVP development while keeping a clean extraction path to microservices later.

## Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm 9+, PostgreSQL

# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database URL

# 3. Generate Prisma client & push schema
pnpm db:generate
pnpm db:push

# 4. Seed sample data
pnpm db:seed

# 5. Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
├── apps/web/              # Next.js app (UI + API routes)
│   └── src/
│       ├── app/           # Pages and API routes (App Router)
│       ├── server/        # Server-side domain modules
│       │   ├── modules/   # restaurants, menu, orders, dispatch, drivers
│       │   └── lib/       # errors, money, ids, logger
│       ├── components/    # React components
│       └── lib/           # Client-side utilities
├── packages/
│   ├── db/                # Prisma schema, client, seed
│   ├── shared/            # Shared enums, types, schemas (Zod)
│   └── config/            # ESLint and TypeScript configs
└── docs/                  # Architecture and API documentation
```

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

## MVP Scope

### Included
- Restaurant menu browsing
- Order creation with item snapshots and cent-based totals
- Order status progression (state machine)
- Restaurant dashboard for order management
- Dispatch board with manual driver assignment
- Mock auth (role-based)

### Deferred
- Real authentication (SSO, OAuth)
- Payments integration
- Real-time updates (WebSockets)
- Maps and route optimization
- Auto-dispatch and ETA prediction
- Multi-currency support
- Coupons and promotions
- Analytics dashboard

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL + Prisma
- **Validation**: Zod
- **Monorepo**: pnpm workspaces + Turborepo
