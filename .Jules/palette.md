## 2024-05-15 - Missing aria-labels on icon-only buttons
**Learning:** Found multiple instances of icon-only buttons in the application using `title` attributes but missing `aria-label` attributes, which impairs screen reader accessibility. The `title` attribute isn't always reliably read by assistive tech.
**Action:** Always add `aria-label` alongside or instead of `title` on icon-only buttons to ensure they are accessible. For UX consistency and standards, will update `Sidebar`, `Header`, `Modal`, `InventoryPage`, and `MaintenancePage` icon-only buttons.
