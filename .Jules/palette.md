## 2024-05-18 - Accessibility on Layout Components
**Learning:** The layout components like Header and Sidebar use native HTML `<button>` tags instead of the shared UI `<Button>` component, meaning they lack built-in accessibility features.
**Action:** When auditing layout components, manually verify and add `aria-label`s and focus states (`focus-visible`) to icon-only buttons.
