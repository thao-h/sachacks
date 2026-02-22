# API Documentation

Base URL: `/api/v1`

## Error Format

All errors follow this envelope:

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order with id 'abc123' not found",
    "details": {}
  }
}
```

## Endpoints

### Health Check

```
GET /api/health
Response: { "status": "ok", "timestamp": "..." }
```

### Menu

```
GET /api/v1/restaurants/:restaurantId/menu
Response: { "data": [...menuItems] }
```

### Orders

```
GET /api/v1/orders?restaurantId=xxx
Response: { "data": [...orders] }

POST /api/v1/orders
Body: {
  "restaurantId": "string",
  "items": [{ "menuItemId": "string", "quantity": number }],
  "customerName": "string",
  "customerPhone": "string",
  "deliveryAddress": "string"
}
Response: { "data": order }
Status: 201

POST /api/v1/orders/:orderId/status
Body: { "status": "CONFIRMED" | "PREPARING" | ... }
Response: { "data": order }
```

### Dispatch

```
POST /api/v1/dispatch/assignments
Body: { "orderId": "string", "driverId": "string" }
Response: { "data": assignment }
Status: 201
```

### Drivers

```
GET /api/v1/drivers
Response: { "data": [...drivers] }
```

## v2 API Endpoints (apps/api)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/restaurants` | List restaurants |
| GET | `/api/v1/restaurants/:id/menu` | Restaurant menu |
| GET | `/api/v1/menus` | List menu items |
| GET | `/api/v1/orders` | List orders |
| POST | `/api/v1/orders` | Create order |
| GET | `/api/v1/orders/:id` | Get order |
| PATCH | `/api/v1/orders/:id` | Update order |
| GET | `/api/v1/deliveries` | List deliveries |
| POST | `/api/v1/deliveries` | Create delivery |
| GET | `/api/v1/deliveries/:id` | Get delivery |
| PATCH | `/api/v1/deliveries/:id` | Update delivery |
| GET | `/api/v1/drivers` | List drivers |
| GET | `/api/v1/community-groups` | List community groups |
| POST | `/api/v1/community-groups` | Create community group |
| GET | `/api/v1/route-posts` | List route posts |
| POST | `/api/v1/route-posts` | Create route post |

All routes return `{ data }` / `{ error: { code, message, details } }` envelopes.
