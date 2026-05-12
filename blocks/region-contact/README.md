# Region Contact Block

The `region-contact` block renders a region dropdown and swaps contact details based on the selected region.

## Why one block

Selector and details are coupled behavior, so this block keeps them together for simpler authoring and reliable UX.

## Authoring format

Author one table with optional config rows first, then one row per region.

- Config rows (optional):
  - `Label | Select a region`
  - `Default Region | virginia` (matches region key from col 3 or region label)

- Region rows:
  - `Region Label | Region Details HTML/markup | Region Key (optional)`
  - For 2-column regions: `Region Label | Left Column HTML/markup | Right Column HTML/markup | Region Key (optional)`

## Example

| Label | Select a region |
| Default Region | virginia |
| Norte de California | `<h3>Norte de California</h3><p>Contact details...</p>` | norcal |
| Sur de California | `<h3>Sur de California</h3><p>Contact details...</p>` | socal |
| Virginia | `<h3>Virginia</h3><p>Contact details...</p>` | virginia |

## Two-column region example

| Region Label | Left Column HTML/markup | Right Column HTML/markup | Region Key |
| Washington | `<h3>Outside Vancouver/Longview area</h3><p>...left content...</p>` | `<h3>Southwest Washington</h3><p>...right content...</p>` | washington |

## Notes

- If no `Default Region` is provided, the first region row is selected.
- Region details cell supports authored rich text/links.
- Use 4 columns on a region row when you want a 2-column layout inside the selected region content.
- Links open in the same window by default.
- Dropdown and selected details are fully client-side.

## Recommended usage

Use in the right column of your 3/9 section layout:

- `region-contact (slot-right)`

