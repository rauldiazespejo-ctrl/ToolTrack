## 2026-06-23 - ARIA labels on Icon-only Core Layout Components
**Learning:** Found that core layout components like navigation and headers were using icon-only buttons (or generic inputs without visual labels) without `aria-label`s. These need clear Spanish screen-reader descriptions given the app's primary UI language.
**Action:** Added proper Spanish `aria-label` attributes to the search input, bell notification, mobile menu toggles, and logout buttons to ensure accessibility standards are met from the top-level layout.
