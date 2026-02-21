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
