## 2026-08-30 - Focus States and Labels for Native Elements
**Learning:** Layout components like Header and Sidebar frequently bypass global abstractions (e.g. `<Button>`) and use native HTML `<button>` and `<input>` directly.
**Action:** When adding accessibility, manually apply standard focus classes (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`) and translation-appropriate (Spanish) `aria-label`s to these native elements.
