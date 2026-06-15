# AuraHR - Premium SaaS HR Portal & Mobile Simulator (Serverless Edition)

AuraHR is a high-fidelity, interactive, multi-tenant SaaS HR management dashboard and simulated mobile self-service app built side-by-side. It features a secure serverless backend running on **Netlify Functions** and **Supabase**, allowing you to host and scale the entire system for **completely $0**.

---

## ⚡ Architecture & Security Features

* **Secure Backend API**: The client browser no longer connects directly to Supabase. All database reads and writes are routed through a secure Node.js serverless controller (`netlify/functions/api.js`). Your Supabase URL and service role keys are kept **100% hidden on the server** as Netlify environment variables.
* **Multi-Tenant Isolation**: Multiple companies can use the same database. By switching the **Tenant Selector** in the header, the frontend includes a custom `X-Company-ID` request header. The serverless backend automatically filters all database transactions by company ID.
* **Graceful Sandbox Fallback**: If the app is run locally without Node/Netlify serverless servers (e.g. double-clicking `index.html`), it automatically falls back to **Local Sandbox Mode** using the browser's `localStorage`. The app remains fully functional for offline pitches.

---

## 🛠️ Technology Stack
* **Frontend UI**: Native HTML5, Vanilla CSS3 (Custom Glassmorphism, animations, dark theme), FontAwesome.
* **Visual Libraries**: Chart.js (Interactive charts), Leaflet.js (Interactive maps).
* **Backend API**: Netlify Serverless Functions (Node.js).
* **Database**: Supabase PostgreSQL Cloud.

---

## 🚀 Setup & Deployment

### 1. Local Offline Sandbox (Zero Configuration)
Simply double-click the `index.html` file or run it via XAMPP Apache:
```
http://localhost/HR App/
```
The application will automatically detect that the serverless API is not active and run in **Local Sandbox Mode** using `localStorage`.

---

### 2. Configure Supabase PostgreSQL

1. Create a free project at [supabase.com](https://supabase.com).
2. Open your project's **SQL Editor** tab and execute the following SQL script to create and configure all multi-tenant tables:

```sql
-- 1. Create Tables
CREATE TABLE public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    dept TEXT NOT NULL,
    salary NUMERIC NOT NULL,
    allowance NUMERIC NOT NULL,
    phone TEXT,
    epf_no TEXT,
    avatar TEXT,
    status TEXT DEFAULT 'offline',
    leave_balances JSONB DEFAULT '{"Annual":12,"Casual":7,"Medical":10}'::jsonb,
    company_id TEXT DEFAULT 'company_aura',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.attendance (
    id SERIAL PRIMARY KEY,
    emp_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TEXT NOT NULL,
    clock_out TEXT DEFAULT '',
    hours NUMERIC DEFAULT 0,
    location TEXT NOT NULL,
    device TEXT NOT NULL,
    company_id TEXT DEFAULT 'company_aura',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.leaves (
    id TEXT PRIMARY KEY,
    emp_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    "start" DATE NOT NULL,
    "end" DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    applied_on DATE NOT NULL,
    decider TEXT DEFAULT '',
    company_id TEXT DEFAULT 'company_aura',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.claims (
    id TEXT PRIMARY KEY,
    emp_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT NOT NULL,
    receipt TEXT,
    status TEXT DEFAULT 'Pending',
    decider TEXT DEFAULT '',
    company_id TEXT DEFAULT 'company_aura',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.payslips (
    id TEXT PRIMARY KEY,
    emp_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    basic NUMERIC NOT NULL,
    allowances NUMERIC NOT NULL,
    deductions NUMERIC NOT NULL,
    epf_employee NUMERIC NOT NULL,
    tax NUMERIC NOT NULL,
    net NUMERIC NOT NULL,
    epf_employer NUMERIC NOT NULL,
    etf_employer NUMERIC NOT NULL,
    company_id TEXT DEFAULT 'company_aura',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.kpis (
    emp_id TEXT PRIMARY KEY REFERENCES public.employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completion INTEGER DEFAULT 0,
    score NUMERIC DEFAULT 3.0,
    feedback TEXT,
    company_id TEXT DEFAULT 'company_aura',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create indices for fast multi-tenant lookup
CREATE INDEX IF NOT EXISTS idx_emp_company ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_att_company ON public.attendance(company_id);
CREATE INDEX IF NOT EXISTS idx_leaves_company ON public.leaves(company_id);
CREATE INDEX IF NOT EXISTS idx_claims_company ON public.claims(company_id);
CREATE INDEX IF NOT EXISTS idx_payslips_company ON public.payslips(company_id);
CREATE INDEX IF NOT EXISTS idx_kpis_company ON public.kpis(company_id);
```

---

### 3. Deploy to Netlify (SaaS Cloud Mode)

1. Log in to [Netlify](https://app.netlify.com).
2. Deploy the project folder by dragging and dropping it into Netlify manual deploy console.
3. In your Netlify dashboard, navigate to **Site Settings** > **Environment Variables** and add the following two variables:
   * **`SUPABASE_URL`**: Your Supabase Project API URL (e.g. `https://xxxx.supabase.co`).
   * **`SUPABASE_SERVICE_KEY`**: Your Supabase **`service_role`** key (from settings > API).
4. Save and trigger a new deployment. Your site is now fully live and securely connected to your cloud backend database!
