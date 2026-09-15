## 2024-05-24 - Layout Component ARIA Labels
**Learning:** Layout components in this app (like Header and Sidebar) frequently bypass global UI abstractions like `<Button>` and use native HTML `<button>` and `<input>` elements. Because of this, they often miss out on built-in accessibility features from the abstracted components.
**Action:** When working with layout-level components or custom native elements in this design system, manually check and implement `aria-label`s for icon-only interactive elements and ensure standard focus-visible utility classes are applied.
