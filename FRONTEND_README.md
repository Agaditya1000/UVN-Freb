# SaaS Accounting & Business Management - Frontend

Welcome to the frontend repository for the **SaaS Accounting & Business Management Platform**. This project is built using modern web technologies to provide a highly responsive, scalable, and intuitive interface for businesses to manage their accounting operations, generate financial statements, and ensure multi-region compliance.

## 🚀 Tech Stack

- **Framework:** [React](https://react.dev/) (via [Vite](https://vitejs.dev/))
- **Styling:** CSS Modules / TailwindCSS (depending on setup)
- **Backend Services:** [Supabase](https://supabase.com/) (Auth, Database, API)
- **State Management:** React Context / Redux Toolkit / Zustand
- **Form Handling:** React Hook Form + Zod

## ✨ Key Features

### 1. User Authentication & Role Management
- Secure signup, login, and password recovery via Supabase Auth.
- Role-based access control (Owner, Accountant, Viewer).
- Multi-org/multi-tenant switching for different businesses.

### 2. Business Setup & Configuration
- Create and manage businesses with region-specific configurations (USA, EU, India).
- Configure financial year and base currencies.
- Set up tax details (EIN, VAT, GST).

### 3. Chart of Accounts & General Ledger
- Predefined hierarchical templates for Assets, Liabilities, Equity, Revenue, and Expenses.
- Customizable accounts per region/business.
- Real-time ledger updates using Supabase subscriptions.

### 4. Transaction Management
- Double-entry accounting system interfaces for Income, Expenses, and Journal Entries.
- Interactive transaction logs and reconciliation tools.

### 5. Automated Financial Reports
- Real-time Balance Sheet generation.
- Profit & Loss, Cash Flow, and Trial Balance reports.
- Multi-region standard compliance checks: USA (GAAP), EU (IFRS), and India (IND-AS/GST).
- Export capabilities (PDF, Excel).

## 🛠️ Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:
- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd UVN-P1_SAAS
   git checkout feat/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and configure the following variables connecting to Supabase:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## 📁 Project Structure

```
├── src/
│   ├── components/   # Reusable UI components (Buttons, Inputs, Modals)
│   ├── pages/        # Route components (Dashboard, Login, Setup)
│   ├── hooks/        # Custom React hooks (e.g., useAuth, useBusinessData)
│   ├── services/     # API calls, Supabase client configurations
│   ├── utils/        # Helper functions, formatters (currency, dates)
│   ├── styles/       # Global styles and theme configurations
│   ├── assets/       # Static assets (images, icons)
│   └── App.jsx       # Root component and Routing
└── public/           # Public assets
```

## 🤝 Contribution Guidelines

This branch (`feat/frontend`) is dedicated specifically to the frontend development cycle.
- Create feature-specific sub-branches from this branch if necessary (e.g., `feat/frontend/auth-ui`).
- Ensure all components are fully responsive and follow the core design principles.
- Use explicit and semantic HTML alongside accessible ARIA labels for UI elements.
- Write unit tests for your core utilities and main components.

## 📄 License

This project is proprietary and confidential.

---
*Built with ❤️ by the Frontend Team.*
