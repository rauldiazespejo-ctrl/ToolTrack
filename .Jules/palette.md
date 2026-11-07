## 2024-11-07 - Add accessibility to layout components
**Learning:** Layout components (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML `<button>` and `<input>` elements. Because of this, they are prone to missing essential accessibility features.
**Action:** When working with layout components, manually implement `aria-label`s for icon-only buttons and add standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure keyboard accessibility.
