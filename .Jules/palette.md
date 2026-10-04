## 2024-05-14 - Manual Accessibility Attributes on Layout Components
**Learning:** Some layout components in this app (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML `<button>` and `<input>` elements.
**Action:** When working with these components, manually implement `aria-label`s and the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure accessibility.
