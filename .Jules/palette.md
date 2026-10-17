## 2024-07-06 - Modal and Button Keyboard Accessibility
**Learning:** Found that common UI components like Buttons and Modals were missing standardized keyboard focus indicators, and the Modal close button lacked an ARIA label in the required Spanish language.
**Action:** Applied the project standard focus ring classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) to interactive elements, and added `aria-label="Cerrar"` to the Modal close icon button to ensure full accessibility for screen readers and keyboard users.
