## 2026-06-19 - Adding aria-label to Icon-Only Buttons
**Learning:** Found an accessibility issue pattern specific to this app's components: Action buttons (like Edit, Delete, Adjust Stock) in table rows were missing `aria-label` attributes, relying solely on `title` which is not always reliably read by screen readers without proper aria labels.
**Action:** Always verify icon-only buttons have descriptive `aria-label` attributes for screen readers alongside any visual tooltips/titles.
