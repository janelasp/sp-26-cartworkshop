---
name: frontend-lint-test
description: >-
  Lint and test the React + Vite + TypeScript frontend. Set up Vitest and React Testing Library
  if not already configured, run ESLint with auto-fix, write and run component/unit tests,
  interpret failures, and verify everything passes before commit. Trigger phrases include
  "lint frontend", "test frontend", "run frontend checks", "fix lint errors",
  "add tests for component", "frontend CI checks", "pre-commit frontend".
---

# Frontend Linting & Testing

Run ESLint and Vitest against the `frontend/` React + Vite + TypeScript app. Set up testing
infrastructure when missing, fix lint violations, write tests, and gate on green before commit.

---

## 1 — Verify Environment

```bash
cd frontend
node -v        # Must be ≥ 18
npm ls eslint   # Confirm ESLint is installed
npm ls vitest   # Check if Vitest is installed (may not be yet)
```

If `vitest` is **not** installed, proceed to **Step 2**. Otherwise skip to **Step 3**.

---

## 2 — Set Up Vitest (One-Time)

### 2.1 Install dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 2.2 Add Vite test config

In `vite.config.ts`, add the test block referencing the setup file:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
```

### 2.3 Create test setup file

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

### 2.4 Add tsconfig for tests

Create `tsconfig.test.json` (extends the app config but includes Vitest types):

```json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

### 2.5 Add npm scripts

Ensure `package.json` has:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 3 — Run ESLint

```bash
cd frontend
npm run lint
```

### Interpreting results

- **0 errors, 0 warnings** → Lint is green. Move on.
- **Errors present** → Attempt auto-fix first:

```bash
npx eslint . --fix
```

Then re-run `npm run lint`. For remaining errors:

| Common Error                           | Fix                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| `@typescript-eslint/no-unused-vars`    | Remove or prefix with `_`                                                     |
| `react-hooks/rules-of-hooks`           | Move hook call inside component/custom hook body                              |
| `react-hooks/exhaustive-deps`          | Add missing deps to the dependency array (or justify suppression)             |
| `react-refresh/only-export-components` | Ensure file default-exports a component; move non-component exports elsewhere |

**Do NOT blanket-disable rules.** Fix violations individually; suppress with inline comments only with a documented reason.

---

## 4 — Write Tests

Place test files next to the source file they test, using the naming convention `<Component>.test.tsx` or `<module>.test.ts`.

### Component test template

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders without crashing", () => {
    render(<MyComponent />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("responds to user interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### What to test

| Priority | What                                       | How                                             |
| -------- | ------------------------------------------ | ----------------------------------------------- |
| High     | Component renders correctly                | `render()` + query for key elements             |
| High     | User interactions produce expected results | `userEvent` + assert DOM changes                |
| Medium   | Props drive conditional rendering          | Render with different props, assert differences |
| Medium   | Error/loading/empty states                 | Render with edge-case props or mocked data      |
| Low      | Snapshot stability (use sparingly)         | `expect(container).toMatchSnapshot()`           |

### Mocking guidelines

- Use `vi.fn()` for callback props.
- Use `vi.mock()` for module-level mocks (API clients, etc.).
- Prefer dependency injection over global mocks when possible.

---

## 5 — Run Tests

```bash
cd frontend
npm test
```

### Interpreting failures

- **Test suite failed to run** → Usually an import or config error. Check the stack trace for the misconfigured module.
- **Assertion failure** → Read the expected vs. received diff. Fix the test or the component depending on which is wrong.
- **Act warnings** → Wrap state-changing code in `await` or use `waitFor` / `findBy` queries.

### Coverage (optional)

```bash
npm run test:coverage
```

Review uncovered lines. Focus coverage on business logic and user-facing behavior, not implementation details.

---

## 6 — Pre-Commit Verification

Run the full check suite before committing:

```bash
cd frontend
npm run lint && npm run build && npm test
```

All three must pass. If any fails, return to the relevant step above.

---

## Decision Tree

```
Start
  ├─ Is Vitest installed? ──No──→ Step 2 (setup)
  │                         Yes
  ├─ Run lint (Step 3)
  │   ├─ Errors? ──Yes──→ Auto-fix → manual fix → re-lint
  │   └─ Clean
  ├─ Write / update tests (Step 4)
  ├─ Run tests (Step 5)
  │   ├─ Failures? ──Yes──→ Debug → fix → re-run
  │   └─ Green
  └─ Pre-commit check (Step 6) → Done ✓
```
