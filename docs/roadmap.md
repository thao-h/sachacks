# Roadmap

## Phase 0: Foundation (done when scaffold complete)
- [x] Monorepo scaffold
- [x] Prisma schema and seed data
- [x] API route stubs
- [x] Shared types and enums

## Phase 1: Vertical Slice
- [ ] Customer menu browsing with cart
- [ ] Order creation flow
- [ ] Restaurant dashboard with status updates

## Phase 2: Dispatch
- [ ] Manual driver assignment
- [ ] Dispatch board UI
- [ ] Driver status tracking

## Phase 3: Hardening
- [ ] Zod validation on all endpoints
- [ ] Role-based route protection
- [ ] Comprehensive seed data
- [ ] Error handling polish

## Phase 4: Demo Polish
- [ ] UX improvements
- [ ] Order status timeline view
- [ ] Event logging

## Future
- Real authentication (OAuth/SSO)
- Payment processing
- Real-time updates (WebSockets/SSE)
- Maps integration and route optimization
- Auto-dispatch algorithm
- Multi-restaurant support per order
- Analytics and reporting
- Mobile-responsive design

## Backend-First Scaffold TODOs

- [ ] Wire apps/api routes to backend-core services
- [ ] Add CommunityGroup and RoutePost models to Prisma schema
- [ ] Implement delivery strategy selector logic
- [ ] Add integration tests for backend-core services
- [ ] Wire Prisma repos to backend-core via dependency injection
