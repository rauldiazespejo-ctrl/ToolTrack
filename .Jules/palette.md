## 2024-10-20 - Layout Element Accessibility
**Learning:** Native layout elements (like `Header` and `Sidebar` icons/toggles) frequently bypass the global `<Button>` abstraction in this project. As a result, they often lack standard `aria-label`s and focus states necessary for keyboard and screen reader accessibility.
**Action:** When working on layout components, manually add `aria-label`s for icon-only buttons and include the standard focus-visible utility classes (`outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`).
