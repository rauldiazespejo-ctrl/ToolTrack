## 2026-07-15 - Navigation Accessibility Improvements
**Learning:** Primary layout components (Sidebar, Header) were missing consistent keyboard focus indicators on icon-only buttons and navigation links, making them hard to use for keyboard-only users.
**Action:** Applied standard focus visibility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) and added descriptive Spanish ARIA labels to ensure these core layout pieces are both visually and semantically accessible.
