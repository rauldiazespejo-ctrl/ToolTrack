## 2024-10-18 - App Shell Accessibility
**Learning:** Global app shell components (like `Header.tsx` and `Sidebar.tsx`) often bypass generic UI abstractions (e.g., `<Button>`) and use native HTML elements, which can lead to omitted `aria-label`s and missing standardized keyboard focus styles on interactive elements.
**Action:** Always manually implement standard keyboard focus-visible utilities (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) and `aria-label`s for interactive elements when working with raw layout components.
