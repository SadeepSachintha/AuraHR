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

-- 3. Create Projects and Tasks tables for work tracking
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    deadline DATE NOT NULL,
    progress NUMERIC DEFAULT 0,
    company_id TEXT DEFAULT 'company_aura',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    emp_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo',
    due_date DATE NOT NULL,
    company_id TEXT DEFAULT 'company_aura',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_company ON public.projects(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_emp ON public.tasks(emp_id);
