## 2026-11-03 - Layout Components Bypassing Global Abstractions
**Learning:** Layout components (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML `<button>` and `<input>` elements. Because they bypass these global, accessible components, they are more prone to missing crucial accessibility attributes.
**Action:** When working on layout components, always double-check for native interactive elements and manually implement `aria-label`s and standard focus-visible utility classes to ensure accessibility.
