# 🗄️ UV Netware Backend - Hardened Financial Infrastructure

This repository contains the full SQL-based backend infrastructure for the audit-ready SaaS financial reporting engine. The database is designed for **1:1 mathematical integrity** between the Ledger, Trading Account, P&L, and Balance Sheet.

---

## 🚀 Step-by-Step Setup Guide

To ensure your SaaS infrastructure is built correctly, please execute these files in their numerical order inside the **Supabase SQL Editor**.

| Step | File Name | Purpose | Key Hardening |
| :--- | :--- | :--- | :--- |
| **00** | `00_reset_database.sql` | **Fresh Start** | Safely drops all old tables, views, and triggers to prevent schema conflicts. |
| **01** | `01_auth_setup.sql` | **Identity Sync** | Automatically creates business profiles when users join via Google or Email. |
| **02** | `02_business_setup.sql` | **SaaS Multi-tenancy** | Implements non-recursive RLS policies to ensure no data leaks between businesses. |
| **03** | `03_account_setup.sql` | **Hierarchical Ledger** | Supports the **Category → Group → Sub-heading** professional hierarchy. |
| **04** | `04_transaction_setup.sql`| **Double-Entry Engine** | Sets up the core journal system. Validates all entries for mathematical existence. |
| **05** | `05_integrity_setup.sql`| **Audit Protection** | **Critical**: Database-level triggers that block any unbalanced transactions. |
| **06** | `06_reporting_analytics.sql`| **Reporting Views** | Optimized PostgreSQL views for real-time Trading, P&L, and Balance Sheet data. |

---

## 🛡️ Core Financial Integrity Rules

the following rules are enforced at the **Database Level** (Step 05):

1.  **Imbalance Blocking**: The database will throw an error and `ROLLBACK` any transaction where `SUM(debit) != SUM(credit)`.
2.  **Audit Locking**: Financial records are locked after 30 days. Any attempt to modify historically finalized audits is blocked at the schema level.
3.  **Cross-Check Validation**: The `06_reporting_analytics.sql` views prove that `Total Assets - Total Liabilities = Equity + Net Profit`.

---

## 📊 Chart of Accounts Standard
The frontend is optimized for this specific hierarchy. When setting up accounts, ensure you follow this categorization:

*   **Asset**: Current Assets (Cash/Bank/Receivable), Fixed Assets, Other Assets.
*   **Liability**: Current Liabilities, Long-Term Liabilities.
*   **Equity**: Capital & Reserves.
*   **Revenue**: Direct Income (Trading Account), Indirect Income (P&L).
*   **Expense**: Direct Expenses (Trading Account), Indirect Expenses (P&L).

---

## ⚠️ Important Deployment Note
**Run Step 00 ONLY if you wish to wipe the database.** For production updates, skip Step 00 and verify your current schema version before applying Step 05 or 06.

---

*This setup is part of the UV Netware P1 SaaS Financial Suite.*
