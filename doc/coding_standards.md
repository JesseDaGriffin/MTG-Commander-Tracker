# Arcane Ledger - Coding Standards

## 1. Component-Driven Architecture

- **Break It Down:** Large pages (`.vue` files in `pages/`) should act as orchestrators, not dumping grounds for UI markup. If a section of a page (like a form, a complex card, or a list) grows beyond 50 lines, it should be extracted into a dedicated component in the `components/` directory.
- **Reusability:** Even if a component is currently only used on one page, extracting it improves readability and makes future reuse trivial. Examples: `DeckCard`, `PlayerListItem`, `GameHistoryItem`.
- **Props and Emits:** Use props to pass data down to components and emits to bubble events back up. Components should remain as stateless as possible regarding domain data unless they are explicitly designed to be smart/connected components.

## 2. Composables for State and Logic

- **Extract Logic:** Do not bloat component `<script setup>` tags with complex API calls, data transformations, or shared state.
- **Use Composables:** Move reusable logic into the `composables/` directory (e.g., `useDb()`, `useAuth()`). Any feature that requires fetching data or managing complex state across multiple components should be abstracted behind a composable.

## 3. Styling Definitions (Tailwind CSS)

- **Utility-First:** Use Tailwind CSS utility classes directly in the template to style components.
- **Avoid Scoped CSS:** Avoid using `<style scoped>` blocks unless absolutely necessary for deeply complex animations or overriding third-party styles that Tailwind cannot easily reach.
- **Consistency:** Use the custom design tokens defined in `tailwind.config.js` (e.g., `bg-primary`, `text-accent-primary`) to maintain the "arcane" theme. Avoid hardcoding random hex values or standard Tailwind colors if a custom token exists for that purpose.

## 4. Nuxt 4 & Vue 3 Conventions

- **Composition API:** Exclusively use the Vue 3 Composition API with `<script setup>`. Do not use the Options API (`export default { data() ... }`).
- **Auto-Imports:** Nuxt 4 automatically imports components and composables. Do not explicitly import `.vue` files from `~/components` or functions from `~/composables` unless Nuxt's auto-import fails to resolve them.
- **Strong Typing (TypeScript):** Always use TypeScript. Rely on generated Supabase types (`database.types.ts`) for all database operations.

## 5. Security & Data Fetching

- **Row Level Security (RLS):** All data fetching and mutations MUST occur within the context of an authenticated user. Ensure `user_id` is automatically handled by Postgres `DEFAULT auth.uid()` or explicitly passed when creating records.
- **Soft Deletes:** Where possible, prefer "Soft Deletes" (updating a `deleted_at` timestamp) over hard deletes (`DELETE FROM table`) to preserve historical constraints, such as game records referencing deleted decks.
