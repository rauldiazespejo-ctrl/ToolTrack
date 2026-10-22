## 2024-10-22 - Layout Component Accessibility
**Learning:** Native layout elements like `Header` and `Sidebar` often lack standard accessibility features (like `aria-label` and `focus-visible`) because they bypass global UI abstractions like `<Button>` or `<Input>`.
**Action:** When working on native layout elements, manually ensure they include necessary ARIA labels for screen readers and `focus-visible` utility classes for keyboard navigation.
