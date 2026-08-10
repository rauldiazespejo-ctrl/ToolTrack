## 2024-08-10 - Layout Component Accessibility
**Learning:** Core layout components (`Header`, `Sidebar`) in this design system often bypass global UI abstractions like `<Button>` and instead use native HTML elements (`<button>`, `<input>`) directly.
**Action:** When auditing or enhancing these layout components, check for missing `aria-label`s on icon-only buttons and ensure standard focus classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) are manually applied to maintain keyboard navigation consistency.
