## 2024-05-24 - Consistent Focus Visible States for Keyboard Navigation
**Learning:** Found that custom buttons, nav links, and interactive elements across layout components lacked consistent keyboard focus indicators, making the application hard to navigate without a mouse.
**Action:** Applied standard focus-visible styles (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to layout components (`Header.tsx`, `Sidebar.tsx`) and the shared `Button` component, and ensured icon-only layout buttons have corresponding `aria-label`s.
