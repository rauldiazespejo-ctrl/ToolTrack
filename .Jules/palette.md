## 2024-10-24 - Layout Components Missing A11y Abstractions
**Learning:** Native elements used directly in layout components (like Header and Sidebar) frequently lack the standard accessibility abstractions (ARIA labels, focus states) built into reusable UI components (like Button).
**Action:** When auditing global UX, explicitly check top-level layout files where global UI component abstractions are typically bypassed.
