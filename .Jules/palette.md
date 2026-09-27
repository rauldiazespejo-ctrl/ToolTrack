## 2024-05-15 - Missing ARIA Labels in Layout Components
**Learning:** Native `<button>` and `<input>` elements in layout components (like Header and Sidebar) frequently bypass the global UI abstractions (e.g., `<Button>`) and thus lack built-in accessibility features such as `aria-label`s for icon-only buttons and standard focus states.
**Action:** Always manually verify and add `aria-label`s and `outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]` to interactive elements in layout components that do not use the central UI wrappers.
