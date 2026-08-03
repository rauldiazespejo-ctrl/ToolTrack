## 2026-08-03 - Layout Components Accessibility
**Learning:** Layout components in this app (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and instead use native HTML `<button>` and `<input>` elements.
**Action:** When working with these core layout components, manually implement `aria-label` attributes using Spanish translations and strictly add the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure keyboard accessibility.
