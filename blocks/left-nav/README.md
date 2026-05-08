# Left Nav Block

The `left-nav` is a reusable sidebar navigation block for the left rail (3-column) layout.

## Features

- **Desktop Sidebar**: Displays as a vertical navigation list in the left rail of a `sidebar-3-9` section
- **Mobile Integration**: Items are injected into the `kp-header` hamburger menu on mobile
- **Active State Detection**: Automatically marks the current page as active
- **Accessibility**: Semantic navigation with proper ARIA labels and keyboard support
- **Responsive Design**: Auto-hides on mobile (content moves to hamburger menu)

## Authoring Content

The left-nav block expects authored content as a table with one navigation item per row:

### Structure

```
| Label | Link | Active |
| Label | Link |         |
```

- **Column 1**: Navigation item label/text
- **Column 2**: URL or link to page
- **Column 3** (optional): Marker to indicate this item is selected/active (any non-empty value, e.g., "yes", "✓", "true")

### Example

Row 1:
- Cell 1: `Home`
- Cell 2: https://www.example.com/
- Cell 3: (empty — not active)

Row 2:
- Cell 1: `Statements`
- Cell 2: https://www.example.com/statements
- Cell 3: `yes` ← **This item will be highlighted**

Row 3:
- Cell 1: `Frequently asked questions`
- Cell 2: https://www.example.com/faq
- Cell 3: (empty — not active)

## Markup

In AEM CMS, author content as a table with:
- **Column 1**: Navigation item label/text
- **Column 2**: URL or link to page
- **Column 3** (optional): Mark as active by adding any non-empty value (e.g., "yes", "✓", "active", "x")

## Styling

The block uses CSS custom properties from global styles:
- `--text-color`: Link text color
- `--link-color`: Active/hover text color
- `--body-font-size-xs`: Font size for nav items

### Active State

The active/selected item is determined by the author in the **third column** of the authoring table. Any non-empty value marks that item as active.

The active item automatically gets:
- `color: #131313` (dark text)
- `font-weight: 600` (bold)
- Left border: `3px solid #3b63fb` (blue)
- `background-color: #f8f8f8` (light gray background)
- `aria-current="page"` attribute for accessibility

## Responsive Behavior

- **Desktop (≥ 600px)**: Displays as vertical sidebar list in left rail
- **Mobile (< 600px)**: Hidden from view; items injected into kp-header mobile menu

## Usage in Layout

Use with `sidebar-3-9` section style:

1. Add a section with **Section Metadata**: `Style | sidebar-3-9`
2. Add the `left-nav (slot-left)` block
3. Add other content/blocks `(slot-right)` or no slot (defaults right)

Example structure:
```
--- Section with sidebar-3-9 style
[left-nav (slot-left)]
[other blocks like alert, region-selector, etc.]
```

## CSS Classes

All selectors are properly scoped to the block:

```
.left-nav                  /* Block container */
├── .left-nav-container    /* Nav semantic element */
│   └── .left-nav-list     /* ul element */
│       └── .left-nav-item [.active]
│           └── .left-nav-link
```

Mobile menu injection:
```
.kp-mobile-menu
└── .kp-mobile-nav-section
    └── .kp-mobile-nav-list
        └── .kp-mobile-nav-item
            └── a.kp-mobile-nav-link
```

## Accessibility

- Semantic `<nav>` and `<ul>` / `<li>` elements
- `aria-label` on nav element
- `aria-current="page"` on active link
- Keyboard accessible links
- Focus visible states
- Proper color contrast

## Notes

- Links open in the same window (no target="_blank")
- No scroll behavior modification; user's browser scroll handling applies
- **Active state is author-defined** via the third column in the authoring table
- Only one item should be marked as active per nav block (author responsibility)
- Mobile injection waits up to 5 seconds for kp-header to be ready
- Any non-empty value in the third column marks an item as active (e.g., "yes", "✓", "true", "x", "1")

## Testing

Test with a section that has `sidebar-3-9` style and add the left-nav block with slot-left option.

On desktop: verify navigation displays in left sidebar with proper styling and active state.
On mobile: open hamburger menu and verify nav items appear in the menu.

