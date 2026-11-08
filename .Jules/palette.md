## 2024-11-08 - Layout Component Accessibility
**Learning:** Layout components (like Header and Sidebar) frequently bypass global UI abstractions like <Button> and use native HTML <button> and <input> elements. When working with these components, we must manually implement aria-labels and the standard focus-visible utility classes.
**Action:** Always verify if native elements are used in layout components and manually apply aria-labels and standard focus-visible classes.
