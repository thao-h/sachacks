# State Machines

## Order Status

```
PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED

Cancel path (from PENDING, CONFIRMED, or PREPARING):
  → CANCELED
```

### Valid Transitions

| From | To |
|------|----|
| PENDING | CONFIRMED, CANCELED |
| CONFIRMED | PREPARING, CANCELED |
| PREPARING | READY_FOR_PICKUP, CANCELED |
| READY_FOR_PICKUP | OUT_FOR_DELIVERY |
| OUT_FOR_DELIVERY | DELIVERED |
| DELIVERED | (terminal) |
| CANCELED | (terminal) |

## Dispatch Status

```
UNASSIGNED → ASSIGNED → PICKED_UP → DROPPED_OFF
```

### Valid Transitions

| From | To |
|------|----|
| UNASSIGNED | ASSIGNED |
| ASSIGNED | PICKED_UP |
| PICKED_UP | DROPPED_OFF |
| DROPPED_OFF | (terminal) |

## Implementation

Transitions are enforced by `canTransitionOrder()` and `canTransitionDispatch()` from `@ddba/shared`. Invalid transitions throw `InvalidStateError` (HTTP 409).
