
## 2024-10-24 - Layout Accessibility & Abstractions
**Learning:** Layout components in this application (such as `Header` and `Sidebar`) frequently bypass global UI abstractions like the shared `<Button>` component and use native HTML `<button>` and `<input>` elements directly for precise layout control.
**Action:** When working with layout components, manually implement `aria-label`s and the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure they meet keyboard and screen reader accessibility standards.
