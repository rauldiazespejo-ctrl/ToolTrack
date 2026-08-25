## 2025-02-18 - Header and Sidebar Manual Accessibility
**Learning:** Layout components (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML `<button>` and `<input>` elements.
**Action:** When working with these layout components, manually implement `aria-label`s and the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure proper accessibility.
