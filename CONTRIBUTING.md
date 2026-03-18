# Contributing to Atom Suit

Thank you for your interest in contributing to the Atom Suit Frontend! This document provides guidelines to ensure code quality and consistency.

## 🚀 Getting Started

1.  **Prerequisites**:
    - Node.js v20.0+ (LTS recommended)
    - npm v10+

2.  **Setup**:

    ```bash
    npm install
    # If issues arise: npm install --legacy-peer-deps
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🛠 Developement Workflow

### Git Flow

We use **Conventional Commits** for clear history.

| **Type**     | **Usage**                                       | **Example Commit Message**                                  |
| ------------ | ----------------------------------------------- | ----------------------------------------------------------- |
| **feat**     | A new feature                                   | `feat(user): add user export API endpoint`                  |
| **fix**      | A bug fix                                       | `fix(order): correct invalid status code on approval`       |
| **docs**     | Documentation only changes                      | `docs(contributing): add guidelines for new contributors`   |
| **style**    | Code style changes (formatting, spacing, etc.)  | `style: apply Pint fixes to inventory module`               |
| **refactor** | Code refactoring (no bug fix or new feature)    | `refactor(batch): optimize FIFO stock retrieval logic`      |
| **perf**     | Performance improvements                        | `perf(sale): improve sale item lookup performance`          |
| **test**     | Adding or fixing tests                          | `test(item): add unit tests for stockOnHand calculation`    |
| **build**    | Build system or dependency changes              | `build: update npm dependencies`                            |
| **ci**       | CI/CD pipeline or automation related changes    | `ci(github): add CI workflow for PR validation`             |
| **chore**    | Routine tasks, maintenance (non-code affecting) | `chore: clean up unused services`                           |
| **revert**   | Reverting a previous commit                     | `revert: revert 'feat(user): add user export API endpoint'` |

### Branch Naming

- `feature/your-feature-name`
- `fix/your-bug-fix`
- `refactor/component-name`

## 📐 Coding Standards

### 1. File Organization

- **Co-locate components**: Place feature-specific components in `src/app/[feature]/_components`.
- **Absolute Imports**: Always use `@/` (e.g., `import Button from '@/components/ui/Button'`).

### 2. TypeScript

- **No `any`**: Strictly define interfaces for Props and API responses.
- **Explicit Types**: Return types for complex functions are encouraged.

### 3. State Management

- Prefer **TanStack Query** for server state.
- Use `useState`/`useReducer` for local UI state.
- Use `Context` only for truly global state (Theme, Auth).

### 4. Linting & Formatting

Before pushing, ensure your code passes:

```bash
npm run lint    # Check for errors
npm run format  # Fix code style
npm run build   # Verify production build
```

## 🧪 Testing

_(Add testing guidelines here when tests are implemented)_

## 📚 Documentation

- Update `ARCHITECTURE.md` if you introduce major pattern changes.
- Update `README.md` if setup instructions change.
