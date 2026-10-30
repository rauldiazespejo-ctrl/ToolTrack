## 2026-10-30 - Layout Component Button Accessibility
**Learning:** Layout components (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML `<button>` elements. This pattern requires manual implementation of `aria-label`s and standard `focus-visible` utility classes for icon-only buttons to maintain accessibility.
**Action:** When auditing or modifying layout components for UX, explicitly check for native HTML buttons and ensure they meet the same accessibility standards (ARIA labels, focus states) as the global `<Button>` abstraction.
