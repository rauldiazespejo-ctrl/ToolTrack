## 2026-09-16 - Focus State Conventions
**Learning:** Found that standard focus-visible styles in this app (outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]) are missing from native `<button>` and `<input>` tags in layout components like Header.tsx and Sidebar.tsx.
**Action:** Always add keyboard accessibility standard classes to native interactive elements when used outside of the global UI components.
