# FAQ Block

The `faq` block renders an accessible expand/collapse accordion styled after the Kaiser Permanente failover FAQ page.

## Authoring

Create a two-column table.

### Optional config rows

| Open First | true |
| Single Expand | false |

- `Open First`: opens the first FAQ item by default when set to `true`.
- `Single Expand`: when `true`, opening one item closes any other open item.

### FAQ rows

| Question | Answer |
| What is happening? | We are currently experiencing a network outage affecting kp.org. |
| When will this be resolved? | Our technical teams are engaged and working to resolve this issue as quickly as possible. |

The answer cell supports rich text, lists, and links.

## Behavior

- Clicking `+` opens the answer.
- Clicking `−` closes the answer.
- Uses proper `aria-expanded`, `aria-controls`, and region labeling for accessibility.

## Recommended usage

Use `faq (slot-right)` in the main content area of your 3/9 layout.

