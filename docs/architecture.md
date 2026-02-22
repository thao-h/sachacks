# Architecture

## Overview

DDBA Local Delivery OS is a **modular monolith** built with Next.js. All business logic lives in a single deployable app (`apps/web`), but is organized into domain modules with clear boundaries.

## Why Modular Monolith?

- **Speed**: Single deployable, single TypeScript runtime, shared types
- **Simplicity**: No inter-service auth, CORS, or deployment pipelines
- **Future-proof**: Domain modules can be extracted into services when needed

## Domain Modules

Each module under `apps/web/src/server/modules/` follows the same structure:

```
module/
  ├── types.ts     # DTOs and domain types
  ├── schemas.ts   # Zod validation schemas
  ├── repo.ts      # Database access (Prisma queries)
  └── service.ts   # Business logic
```

### Module Boundaries
- Services call repos (same module) or other services (cross-module)
- Repos never call other repos or services
- API routes call services only
- UI components use the API client, never import server code directly

## Data Flow

```
Client → API Route → Service → Repo → Prisma → PostgreSQL
```

## Shared Packages

- `@ddba/shared`: Cross-boundary types, enums, Zod schemas
- `@ddba/db`: Prisma client singleton, schema, seed data
- `@ddba/config`: ESLint and TypeScript base configs

## Backend-First Extension (v2)

The project now includes a backend-first architecture layer alongside the original monolith:

- **`packages/backend-core`** - Framework-agnostic business logic with dependency-injected repos
- **`packages/contracts`** - Shared enums, Zod schemas, and API envelope types
- **`packages/db/src/repositories`** - Prisma implementations of backend-core repo interfaces
- **`apps/api`** - Standalone Next.js HTTP adapter (port 4000) consuming backend-core services

This enables the domain logic to be tested and used independently of any web framework.
