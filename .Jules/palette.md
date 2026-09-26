## 2026-09-26 - Missing Accessibility on Layout Components
**Learning:** Layout components (like Header/Sidebar) often bypass the global `<Button>` abstraction, meaning standard focus rings (`focus-visible:...`) and `aria-label`s on icon-only buttons must be manually implemented to preserve accessibility.
**Action:** Always manually check and apply focus-visible styles and aria-labels on native `<button>` and `<input>` elements in layout components.
