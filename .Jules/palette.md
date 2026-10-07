## 2024-10-07 - Layout Components Bypass UI Abstractions
**Learning:** Layout components like `Header` and `Sidebar` frequently bypass global UI abstractions (like `<Button>` or `<Input>`) and use native HTML `<button>` and `<input>` elements.
**Action:** When working with these layout components, always remember to manually implement `aria-label`s and the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure proper accessibility.
