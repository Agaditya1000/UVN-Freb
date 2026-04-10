-- MIGRATION: Enable Update and Delete for Chart of Accounts
-- Run this in your Supabase SQL Editor to patch your existing database.

-- 1. Enable UPDATE for Accounts
-- Allows Owners and Accountants to modify account names and classifications.
CREATE POLICY "Authorized users can update accounts"
ON public.accounts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = accounts.business_id 
    AND business_users.user_id = auth.uid()
    AND business_users.role IN ('Owner', 'Accountant')
  )
);

-- 2. Enable DELETE for Accounts
-- Allows Owners and Accountants to remove accounts from the ledger.
CREATE POLICY "Authorized users can delete accounts"
ON public.accounts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_users.business_id = accounts.business_id 
    AND business_users.user_id = auth.uid()
    AND business_users.role IN ('Owner', 'Accountant')
  )
);

-- NOTE: The frontend app enforces a 30-day "Audit Lock" rule on top of these permissions.
