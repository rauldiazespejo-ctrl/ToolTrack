## 2026-07-17 - Standardize Focus Rings on Buttons
**Learning:** The application lacked clear focus indicators on interactive elements, which is a major accessibility issue for keyboard navigation.
**Action:** Applied standard Tailwind focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to the base Button component to ensure all buttons inherit accessible keyboard navigation support.
