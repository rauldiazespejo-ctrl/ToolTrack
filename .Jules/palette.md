## 2024-05-24 - Layout Components Missing A11y Attributes
**Learning:** Layout components (like Header and Sidebar) that bypass global UI abstractions often miss `aria-label`s and project-standard focus states because they rely on native `<button>` and `<input>` elements rather than the pre-configured `<Button>` or `<Input>` components.
**Action:** When working on layout components or components bypassing global abstractions, always manually verify and implement `aria-label`s for icon-only buttons and the standard `focus-visible` utility classes.
