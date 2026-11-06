## 2024-11-06 - Layout Component Accessibility
**Learning:** Core layout components (like Header and Sidebar) bypass global UI button abstractions and use native HTML elements (`<button>`, `<input>`), requiring manual implementation of `aria-label`s and consistent keyboard focus states using the `focus-visible:outline-[var(--accent)]` pattern.
**Action:** Always manually check and implement ARIA labels and focus-visible utilities for icon-only native buttons in layout or specialized components that do not consume the generic `<Button>` abstraction.
