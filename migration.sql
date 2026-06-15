-- AuraHR SaaS Schema Migration Script
-- Run this in your Supabase SQL Editor to add multi-tenancy columns and indices to your existing tables.

-- 1. Add company_id column with default value 'company_aura' to all tables
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS company_id TEXT DEFAULT 'company_aura';
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS company_id TEXT DEFAULT 'company_aura';
ALTER TABLE public.leaves ADD COLUMN IF NOT EXISTS company_id TEXT DEFAULT 'company_aura';
ALTER TABLE public.claims ADD COLUMN IF NOT EXISTS company_id TEXT DEFAULT 'company_aura';
ALTER TABLE public.payslips ADD COLUMN IF NOT EXISTS company_id TEXT DEFAULT 'company_aura';
ALTER TABLE public.kpis ADD COLUMN IF NOT EXISTS company_id TEXT DEFAULT 'company_aura';

-- 2. Create indices on company_id for fast tenant queries and data isolation
CREATE INDEX IF NOT EXISTS idx_emp_company ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_att_company ON public.attendance(company_id);
CREATE INDEX IF NOT EXISTS idx_leaves_company ON public.leaves(company_id);
CREATE INDEX IF NOT EXISTS idx_claims_company ON public.claims(company_id);
CREATE INDEX IF NOT EXISTS idx_payslips_company ON public.payslips(company_id);
CREATE INDEX IF NOT EXISTS idx_kpis_company ON public.kpis(company_id);
