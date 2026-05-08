# Warning Block

The `warning` block renders the emergency notice card used in the failover layout.

## Authoring

Use either of these patterns.

### Pattern A (recommended key/value)

| Title | In case of an emergency |
| Body | If you think you or someone you care for is having a medical or mental health emergency, call 911 or go to the nearest hospital. |
| Icon | (optional image) |

### Pattern B (simple rows)

| In case of an emergency |
| If you think you or someone you care for is having a medical or mental health emergency, call 911 or go to the nearest hospital. |
| (optional image row) |

## Behavior

- If no icon is authored, the block uses `icons/alertsolid.svg`.
- If no title/body is authored, a safe emergency fallback message is used.
- Links in the body open in the same window by default.

## Usage in layout

For the 3/9 layout:

- `warning (slot-left)` for sidebar placement
- `warning (slot-right)` for main content placement

