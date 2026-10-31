## 2023-11-01 - Layout Components Missing Global UI Abstractions
**Learning:** Layout components (like Header and Sidebar) frequently bypass the global UI abstractions like `<Button>` and `<Input>` in favor of native HTML elements.
**Action:** When touching these components, always check for missing native accessibility attributes (like `aria-label`) and ensure standard focus styles (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) are manually implemented.
