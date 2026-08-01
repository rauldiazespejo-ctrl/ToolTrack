## 2023-10-27 - Layout Components Accessibility
**Learning:** Layout components in this app (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML `<button>` and `<input>` elements. This leads to missing ARIA labels and focus indicators.
**Action:** When working with layout components, manually implement `aria-label`s and the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure accessibility.
