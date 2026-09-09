## 2026-09-09 - Layout Icon Accessibility
**Learning:** Found a pattern where interactive icon buttons in core layout components (Header, Sidebar) lacked ARIA labels and focus-visible indicators, impacting screen reader and keyboard users.
**Action:** Always verify custom native `<button>` and `<input>` elements outside of the global `<Button>` or `<Input>` abstractions for proper `aria-label`s and the project's standard `focus-visible` utility classes.
