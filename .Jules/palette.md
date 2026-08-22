## 2024-05-15 - Layout Component Accessibility
**Learning:** Layout components (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML `<button>` elements.
**Action:** When working with layout components, manually implement `aria-label`s and the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure keyboard and screen reader accessibility.
