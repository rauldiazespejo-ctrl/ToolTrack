## 2023-10-25 - Layout components using native inputs and buttons missing accessibility attributes
**Learning:** Layout components in this app (Header, Sidebar) bypass the global `<Button>` component and use native `<button>` and `<input>` elements, which often lack `aria-label`s (in Spanish) and standard focus-visible styles.
**Action:** Always check layout components and manual UI elements for missing native accessibility properties like `aria-label` and `focus-visible` states, and add them explicitly.
