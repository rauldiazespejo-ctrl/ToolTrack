## 2025-10-25 - Icon-only layout buttons lack accessibility context
**Learning:** Layout components (Header, Sidebar) bypass the global `<Button>` abstraction and use native `<button>` elements for icons (Menu, Bell, Logout, Close) without `aria-label`s or keyboard focus states, rendering them invisible to screen readers and keyboard users.
**Action:** Always manually implement Spanish `aria-label`s and standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) on native layout controls.
