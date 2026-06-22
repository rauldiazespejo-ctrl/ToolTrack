## 2026-06-22 - [Add ARIA labels to Icon Buttons]
**Learning:** Found multiple icon-only buttons (notifications, menu toggle, logout, modal close) missing accessible labels in core UI components (Header, Sidebar, Modal). Screen readers require aria-labels for these interactions.
**Action:** Next time, actively scan new or modified layout components for icon-only interactive elements and ensure appropriate aria-labels or sr-only text is included.
