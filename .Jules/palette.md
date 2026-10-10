## 2024-05-23 - Accessibility of Native Elements in Layout Components
**Learning:** In this project, layout components (like Header and Sidebar) frequently bypass global abstractions like `<Button>` and use native HTML `<button>` and `<input>` elements directly.
**Action:** When working on these components, always manually implement `aria-label`s and apply the standard keyboard focus utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure they meet basic accessibility standards.
