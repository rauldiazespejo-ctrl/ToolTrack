## 2026-09-24 - Layout Component Accessibility Defaults
**Learning:** Layout components in this app (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML elements (`<button>`, `<input>`) directly.
**Action:** Always manually implement `aria-label`s and the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) when modifying these components to ensure keyboard accessibility.
