## 2024-08-27 - Layout Components Accessibility
**Learning:** Native HTML `<button>` and `<input>` elements used directly in layout components (like Header and Sidebar, which bypass global UI abstractions) frequently lack proper accessibility attributes in this app.
**Action:** When auditing layout components, manually verify and add `aria-label`s (using Spanish translations) and standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure full screen reader and keyboard accessibility.
