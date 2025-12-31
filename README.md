# Atom Suit

This is the **frontend** for the **Atom Suit**, built with **React**, **Vite**, **TailwindCSS**, and **TypeScript**.

## System Requirements

- **Node.js** v20.0 or higher (**LTS recommended**)
- **npm** v10.x.x

## Key Features

- Modular architecture for Inventory Management, Procurement, Sales, and Accounting.
- Dynamic Role & Permission-based access control.
- Real-time Inventory Adjustments & Transfers.
- Comprehensive Reports & Analytics.
- Fully Responsive UI built with TailwindCSS.
- Fast & efficient with Vite’s blazing dev server.

## Installation

### 1. Install Dependencies:

```bash
npm install
# or
yarn install
```

> **Tip:** If you face dependency resolution issues, try:
>
> ```bash
> npm install --legacy-peer-deps
> ```

### 2. Start Development Server:

```bash
npm run dev
# or
yarn dev
```

## Contribution Guidelines

To maintain code quality and consistency, please adhere to the following guidelines when contributing to the project.

### General Principles

- **Keep it DRY:** Don't repeat yourself. Utilize existing services, components, and helpers where possible.
- **Permissions over Roles:** Whenever checking for authorization, prefer using specific permissions, hasPermissions("update-customer"). This makes the system more flexible.

### Git Workflow & Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for clear commit history.

#### Commit and PR Types Guide (Conventional Commits)

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

#### Branch Naming Conventions

```bash
git checkout -b feature/user-export-endpoint
git checkout -b bug/fix-status-code
git checkout -b enhancement/optimize-export-performance
```

### Coding Standards

- Run **ESLint** before pushing code:
  ```bash
  npm run lint
  ```
- Run **Tests** before pushing code:
  ```bash
  npm run test
  ```
- Run **Prettier** to fix formatting:
  ```bash
  npm run format
  ```
- Maintain UI consistency by following patterns defined in `/components` and `/layouts`.

---

## 🗂️ Recommended Sidebar Structure

### 1. Dashboard

🔔 Alerts / Notifications

### 2. Inventory Management

- 📦 Items
- 🗂️ Categories
- 🏷️ Units of Measurement
- 🏪 Warehouses
- 🔄 Inventory Transfers
- ✏️ Inventory Adjustments

### 3. Procurement

- 📥 Purchase Orders
- ✅ Goods Received Notes (GRNs)
- 🧾 Purchase Invoices
- 💳 Debit Notes
- 👨‍💼 Vendors

### 4. Sales

- 🛒 Sales Orders
- 📤 Delivery Notes
- 📄 Sales Invoices
- 💸 Credit Notes
- 👩‍💼 Customers

### 5. Accounting

- 📚 Chart of Accounts
- 💰 Journal Entries
- 💹 Taxes
  - Tax Rates
  - Tax Groups
  - Item Tax Mapping
- 💱 Currency Management
- 🏢 Cost Centers

### 6. Reports 📑

- Inventory Reports
- Purchase Reports
- Sales Reports
- Tax Reports
- Profit & Loss
- Stock Valuation
- Customer/Vendor Statements

### 7. Settings ⚙️

- System Settings
- User Management
- Roles & Permissions
- Company Info

---

## 📄 License

[MIT](LICENSE)

---

## 🤝 Contributing

Feel free to fork, submit PRs, and raise issues. For major changes, please open an issue first to discuss what you'd like to change.

---

## ✨ Made with ❤️ by the Atom Suit Team ✨
