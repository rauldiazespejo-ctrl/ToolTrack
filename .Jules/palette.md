
## 2024-05-24 - Layout Component Accessibility
**Learning:** Native `<button>` and `<input>` elements in layout components (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>`. These require manual implementation of `aria-label`s and standard `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]` classes to ensure accessibility.
**Action:** Always check layout components for naked, icon-only native buttons or inputs and manually apply standard ARIA labels and focus states.
