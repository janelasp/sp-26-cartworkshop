## Frontend AI Agent Guide

These instructions are for AI coding agents working in the React + TypeScript frontend under `frontend/`.

For a high-level project overview, see the root [AGENTS.md](../AGENTS.md).

---

## Stack & Architecture

- React 18 + TypeScript, bundled with Vite.
- Dev server: `http://localhost:5173`.
- Backend API is proxied via Vite to `/api/...` (see [vite.config.ts](vite.config.ts)).

---

## Project Layout

Key frontend directories in [src](src):

- [src/components](src/components): Reusable UI components.
- [src/pages](src/pages): Route-level pages (Product list, detail, cart).
- [src/contexts](src/contexts): React Context providers (e.g., CartContext).
- [src/reducers](src/reducers): Reducer logic (e.g., cartReducer).
- [src/api](src/api): API helper functions (e.g., products.ts).
- [src/types](src/types): Shared TypeScript types (product, cart).

Component convention:

- Each component gets its own folder under [src/components](src/components):
	- `ComponentName/ComponentName.tsx`
	- `ComponentName/ComponentName.module.css`
- Components use **named exports**; pages use **default exports**.

---

## TypeScript & State

- Strict TypeScript: always type props and state.
- Use `interface` for props and object shapes; `type` for unions.
- Destructure props in the function signature.
- Use `useState` for simple local state.
- Use `useReducer` + Context for shared/feature state (cart, auth).

Cart specifics:

- Cart types live in [src/types/cart.ts](src/types/cart.ts).
- Reducer lives in [src/reducers/cartReducer.ts](src/reducers/cartReducer.ts).
- Context/provider in [src/contexts/CartContext.tsx](src/contexts/CartContext.tsx).
- Reducer actions should form a **discriminated union**; do **not** add a `default` case.

---

## Styling & Accessibility

- Use CSS Modules only (`*.module.css`).
- Import as `import styles from './ComponentName.module.css'`.
- Reserve global CSS files ([src/index.css](src/index.css), [src/App.css](src/App.css)) for resets/layout, not feature styles.
- All interactive elements that are not self-describing (icons, etc.) must have an `aria-label`.

---

## API Usage

- Put fetch logic in [src/api](src/api) modules, not directly in components.
- Follow the pattern in [src/api/products.ts](src/api/products.ts) when adding new calls.
- Components that call APIs must handle:
	- Loading (e.g., simple text or spinner placeholder).
	- Error state with a friendly message (no raw errors).

---

## Do Nots

- Do **not** add class-based React components; use functional components only.
- Do **not** use inline styles for core layout; prefer CSS Modules.
- Do **not** introduce external global state libraries (Redux, etc.) unless explicitly requested.
- Do **not** bypass types with `any` or `as any`.

These guidelines apply to all AI-generated frontend code unless the user explicitly says otherwise.

