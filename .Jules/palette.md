## 2026-09-12 - Layout Components Missing A11y Attributes
**Learning:** Layout components (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML `<button>` and `<input>` elements, leading to missed `aria-label`s and focus states.
**Action:** When working with or creating layout components, manually verify and implement `aria-label`s and the standard `focus-visible` utility classes for accessibility.
