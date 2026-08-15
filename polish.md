# Prompt untuk Polish Full Responsive

Polish this entire dashboard app (sidebar + all 14 Purchasing pages) to be **fully responsive** across mobile, tablet, and desktop. Don't change the data/logic — this pass is purely visual/layout. Apply the rules below consistently to every page, every widget, every table, and every component — nothing should overflow, get cut off, or become unusably small/large at any screen size.

## Breakpoints to design for

- **Mobile**: 375px–639px
- **Tablet**: 640px–1023px
- **Desktop**: 1024px+

Test the layout mentally (or actually resize) at all three, especially the narrowest (375px) and a common laptop width (1366px).

## Sidebar

- Desktop/tablet: fixed sidebar, always visible.
- Mobile: collapse into a hamburger-triggered off-canvas drawer (slide-in), with an overlay backdrop that closes it on tap-outside. Never let the sidebar squeeze the main content into an unreadably narrow column on small screens.

## Typography

- Use a proper fluid type scale, not fixed px everywhere: headings and big widget numbers should shrink gracefully on mobile (e.g. a widget's big Rupiah number: ~28-32px desktop → ~20-22px mobile), body/table text ~14px desktop → ~13px mobile, never below 12px anywhere.
- Line-height and letter-spacing stay comfortable at every size — no cramped or overly loose text.
- Truncate long text (long item names, supplier names) with ellipsis + a tooltip/title attribute on hover, rather than letting it wrap awkwardly or break layout.

## Spacing

- Use a consistent spacing scale (e.g. 4/8/12/16/24/32px) throughout — no arbitrary one-off margins/paddings.
- Reduce outer page padding and gaps between sections on mobile (e.g. desktop 24-32px page padding → mobile 12-16px) so content isn't cramped against the edges but also doesn't waste space.
- Card/widget internal padding scales down proportionally on mobile too.

## Stat overview widgets (the 4-6 cards on each page)

- Desktop: multi-column grid (e.g. 4-6 across depending on the page).
- Tablet: wrap to 2-3 columns.
- Mobile: stack to 1-2 columns (2 columns is fine if numbers stay readable; otherwise 1 column, full width).
- Cards must never let the big number or label overflow/clip — shrink font size before allowing overflow.
- Equal height across a row on every breakpoint (no jagged card heights).

## Tables

This is the trickiest part — apply one of these two strategies consistently per table, whichever fits better, but pick deliberately (don't just let tables silently overflow the viewport with no indication):

1. **Horizontal scroll container**: wrap the table in a scrollable div with a subtle scroll-shadow/fade hint on the edges so users know it's scrollable, sticky first column (e.g. Nama Supplier / Nama Item) so context isn't lost while scrolling right.
2. **Responsive card list on mobile**: below a chosen breakpoint (e.g. <640px), transform each table row into a stacked card showing label:value pairs instead of a horizontal table.
Choose strategy 1 for pages where users need to compare many columns at once (Purchase Summary's full table with the column picker), and strategy 2 is acceptable for simpler tables (e.g. Purchase by Supplier, Supplier Ranking).

- Column picker dropdown, search box, and pagination controls must also stack/wrap cleanly on mobile — never overlap or get squeezed off-screen.
- Pagination: show fewer page number buttons on mobile (e.g. just Prev / current / Next + a page indicator) instead of a long row of page numbers.

## Filters (date range picker, item dropdown, category toggle, etc.)

- Desktop: filters sit in a horizontal row.
- Mobile: stack vertically, full width, with adequate tap target height (min 44px) for date pickers/dropdowns/buttons.

## Charts

- Charts (bar, line, histogram) must resize fluidly to their container width — never fixed pixel width.
- On mobile: reduce axis label density (e.g. skip every other label) and font size so labels don't overlap; consider switching a horizontal bar chart's height to accommodate longer supplier names without truncation, or truncate + tooltip.

## Buttons, badges, and inputs

- All interactive elements keep a minimum comfortable tap target (~44x44px) on touch devices, even if visually smaller on desktop.
- Badges (e.g. Supplier Scorecard rating) and small UI chrome stay legible — don't let text shrink below 12px inside them.

## General polish

- No horizontal scroll on the page itself at any breakpoint (only intentional horizontal scroll inside table containers as described above).
- No content ever gets clipped/hidden without a scroll affordance.
- Consistent border-radius, shadow, and color usage across all cards/tables/buttons — reuse the same design tokens everywhere rather than page-specific one-offs.
- Do a final pass across all 14 pages to confirm every page follows the same responsive patterns — the goal is visual consistency, not each page reinventing its own breakpoint behavior.
