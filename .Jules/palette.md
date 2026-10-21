## 2024-05-15 - Layout Components Bypass UI Abstractions
**Learning:** Layout components (Header, Sidebar) frequently use raw HTML `<button>` and `<input>` elements rather than global UI components like `<Button>`. This results in missing ARIA labels for icon-only buttons and missing keyboard focus states.
**Action:** When working on layout patterns, manually implement `aria-label`s and the standard Tailwind focus pattern (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to ensure accessibility compliance.
