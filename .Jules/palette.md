## 2024-05-24 - Layout Component Accessibility
**Learning:** Native layout components (like Header and Sidebar) in this app often bypass global UI abstractions, requiring manual implementation of accessibility attributes like `aria-label` for icon-only buttons and explicit focus-visible utility classes.
**Action:** Always check native `<button>` and `<input>` elements in layout components for missing ARIA labels and keyboard focus states.
