## 2025-02-21 - Focus states and ARIA labels on layout buttons
**Learning:** Native `<button>` and `<input>` elements in layout components (like Header and Sidebar) frequently bypass the global UI abstractions and miss standard focus states and screen reader labels.
**Action:** Always manually implement `aria-label`s and the standard `outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]` classes on raw interactive elements in layout files.
