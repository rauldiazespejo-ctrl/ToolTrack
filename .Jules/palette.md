## 2024-03-20 - Missing ARIA Labels and Focus States in Layout Components
**Learning:** Native `<button>` and `<input>` elements in custom layout components (Header, Sidebar) frequently lack `aria-label` attributes for icon-only usage and omit explicit `focus-visible` states, which degrades keyboard accessibility.
**Action:** Always verify that layout components bypass abstractions appropriately but manual `aria-label` and `focus-visible` utility classes are strictly implemented.
