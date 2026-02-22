# Community + Bulk Order MVP

## Data model

Added Prisma enums:

- `CommunityVisibility`: `PUBLIC | PRIVATE`
- `CommunityRole`: `OWNER | ADMIN | MEMBER`
- `BulkOrderStatus`: `OPEN | LOCKED | PLACED | DELIVERED | CANCELLED`

Added Prisma models:

- `Community`
  - Core fields: `name`, `area`, `description`, `visibility`, `createdByUserId`
- `CommunityMember`
  - Membership link with role and uniqueness on `(communityId, userId)`
- `CommunityInvite`
  - Invite code storage with active/inactive state and optional expiration
- `BulkOrder`
  - Bulk order metadata: community, restaurant, host, title, deadline, notes, status
- `BulkOrderParticipant`
  - Participant link with uniqueness on `(bulkOrderId, userId)`

Session user was extended with optional `areaPreference` and login now uses a stable mock user id derived from the identifier to keep membership continuity across sessions.

## New endpoints

### Communities

- `GET /api/v1/communities`
  - Query params: `search`, `area`
  - Returns communities with membership state, counts, and area-priority sorting.
- `POST /api/v1/communities`
  - Body: `{ name, area, description?, visibility }`
  - Creates community and owner membership.
- `POST /api/v1/communities/[communityId]/join`
  - Body: `{ inviteCode? }`
  - Public communities can be joined directly; private communities require invite code.
- `POST /api/v1/communities/[communityId]/invite`
  - Body: `{ expiresAt? }`
  - Owner/admin can reissue an invite code.
- `POST /api/v1/communities/preferences/area`
  - Body: `{ area: string | null }`
  - Stores area preference in current session cookie.

### Bulk orders

- `GET /api/v1/bulk-orders`
  - Query params: `communityId`, `status`
  - Returns bulk orders scoped to communities where current user is a member.
- `POST /api/v1/bulk-orders`
  - Body: `{ communityId, restaurantId, title, orderDeadline, deliveryNotes? }`
  - Creates an `OPEN` bulk order and auto-joins host as participant.
- `POST /api/v1/bulk-orders/[bulkOrderId]/join`
  - Adds current user as participant for `OPEN` order.
- `POST /api/v1/bulk-orders/[bulkOrderId]/lock`
  - Host or community manager (`OWNER/ADMIN`) can lock an `OPEN` bulk order.

## Manual test checklist

1. Log in with an identifier from the landing page.
2. Open `/communities`.
3. Set area preference and refresh community listing.
4. Create a public community and verify it appears as joined with owner role.
5. Create a private community and verify invite code is shown in UI.
6. In another session/user, join the public community directly.
7. In another session/user, attempt joining private community without code (expect error), then with code (expect success).
8. Start a bulk order from joined community with future deadline.
9. Join the bulk order from another member account.
10. Lock the order as host/admin and verify status changes to `LOCKED`.

## Curl examples

```bash
# Create community
curl -X POST http://localhost:3000/api/v1/communities \
  -H "Content-Type: application/json" \
  -d '{"name":"West Davis Night Bites","area":"West Davis","visibility":"PRIVATE"}'

# Join community
curl -X POST http://localhost:3000/api/v1/communities/<communityId>/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"AB12CD34"}'

# Create bulk order
curl -X POST http://localhost:3000/api/v1/bulk-orders \
  -H "Content-Type: application/json" \
  -d '{"communityId":"<communityId>","restaurantId":"<restaurantId>","title":"Dinner group order","orderDeadline":"2026-02-22T23:30:00.000Z"}'

# Join bulk order
curl -X POST http://localhost:3000/api/v1/bulk-orders/<bulkOrderId>/join \
  -H "Content-Type: application/json" \
  -d '{}'

# Lock bulk order
curl -X POST http://localhost:3000/api/v1/bulk-orders/<bulkOrderId>/lock \
  -H "Content-Type: application/json" \
  -d '{}'
```
