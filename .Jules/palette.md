
## 2024-05-18 - Accessibility on Native HTML Elements in Layout Components
**Learning:** Layout components in this app (like Header and Sidebar) bypass global UI abstractions (like the `<Button>` component) and use raw native HTML `<button>` and `<input>` elements. Consequently, they lack automatic ARIA attributes and focus styles applied at the global level.
**Action:** When making UX enhancements or working with layout components, manually implement `aria-label`s for icon-only buttons/inputs and append the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure keyboard accessibility.
