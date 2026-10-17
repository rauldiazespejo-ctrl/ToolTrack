## 2023-10-27 - Global Navigation Accessibility
**Learning:** Icon-only interactive elements in core navigation components (like headers and sidebars) often miss screen reader labels and lack consistent keyboard focus states in this app.
**Action:** Always verify that raw `<button>` elements with only icons receive explicit `aria-label`s in Spanish and the standard Tailwind focus ring utilities (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`).
