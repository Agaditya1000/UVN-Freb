-- ==========================================
-- STEP 00: DATABASE RESET (CLEAN SLATE)
-- WARNING: This will DELETE all your data! 
-- ==========================================

-- 1. DROP ALL VIEWS
DROP VIEW IF EXISTS public.vw_detailed_audit_logs CASCADE;
DROP VIEW IF EXISTS public.account_balances CASCADE;

-- 2. DROP ALL TRIGGERS
DROP TRIGGER IF EXISTS trg_validate_balance ON public.transactions;
DROP TRIGGER IF EXISTS trg_audit_transactions ON public.transactions;
DROP TRIGGER IF EXISTS trg_audit_accounts ON public.accounts;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. DROP ALL FUNCTIONS
DROP FUNCTION IF EXISTS public.check_transaction_balance() CASCADE;
DROP FUNCTION IF EXISTS public.proc_audit_log() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_business_owner(uuid) CASCADE;

-- 4. DROP ALL TABLES
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.business_users CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
