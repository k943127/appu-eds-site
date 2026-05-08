# Sidebar 3/9 Layout

Use this when a section needs a left rail (3 columns) and main content (9 columns).

## How to author

1. In the target section, add a **Section Metadata** block.
2. Add row: `Style | sidebar-3-9`
3. Add blocks/content in the same section.
4. For any block that should render in the left rail, add the block option: `slot-left`.
5. For right rail blocks, either:
   - add `slot-right`, or
   - leave unassigned (defaults to right rail).

## Example

- `left-nav (slot-left)`
- `alert (slot-left)`
- `region-selector (slot-right)`
- paragraphs / headings (default to right rail)
- `contact-list` (defaults to right rail)

## Notes

- You can use multiple left-rail blocks; they stack vertically.
- You can use the same block type on both sides by authoring two instances with different options.
  - Example: `alert (slot-left)` and `alert (slot-right)`.
- On mobile, rails collapse into one column.
- On desktop (`>= 900px`), layout is 3/9.

