## 2025-02-12 - Layout Components Accessibility
**Learning:** Layout components (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML `<button>` and `<input>` elements. This leads to missing ARIA labels for icon-only buttons and lack of standardized focus states.
**Action:** Always manually implement `aria-label`s and the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) on interactive native HTML elements in these components.
