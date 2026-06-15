# AuraHR - Premium SaaS HR Portal & Mobile Simulator (Serverless & PHP Proxy Edition)
A Product of [SS Labz](https://ss-labz.pages.dev/)

AuraHR is a high-fidelity, interactive, multi-tenant SaaS HR management dashboard and simulated mobile self-service app built side-by-side. It features a secure dual-mode backend (Netlify Serverless Functions for production, and local PHP Proxy for XAMPP environments) connected to a Supabase Cloud PostgreSQL database.

---

## ⚡ Architecture & Security Features

* **Dual-Mode Backend Routing**: 
  * **Production (Netlify)**: Routes `/api/*` requests to serverless Node.js handlers (`netlify/functions/api.js`).
  * **Local Development (XAMPP)**: Automatically routes requests to a local PHP proxy (`api/index.php`) via `.htaccess` URL rewrites, eliminating the need to install Node.js/npm or Netlify CLI locally.
* **100% Secret Database Keys**: Supabase URL and keys are stored securely in a local `.env` file (ignored by Git) or within Netlify Site environment variables. They are never exposed to the client browser.
* **Multi-Tenant Isolation**: Multiple companies share the same database. By changing the **Tenant Selector** in the header, the frontend includes a custom `X-Company-ID` request header, and the backend automatically filters queries (e.g., `WHERE company_id = companyId`).
* **Graceful Sandbox Fallback**: If both Netlify and the local PHP proxy are offline, the frontend `DB_ENGINE` falls back to **Local Sandbox Mode** using browser `localStorage` for offline presentations.

---

## 🛠️ Technology Stack
* **Frontend**: Native HTML5, Vanilla CSS3 (Custom Glassmorphism, animations, dark theme), FontAwesome.
* **Visual Libraries**: Chart.js (Interactive analytics), Leaflet.js (Interactive GPS maps).
* **Cloud Backend**: Netlify Serverless Functions (Node.js API).
* **Local Backend**: PHP Proxy (XAMPP compatible).
* **Database**: Supabase PostgreSQL Cloud.

---

## 🚀 Setup & Deployment

### 1. Database Schema & Migration (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open your project's **SQL Editor** tab.
3. If setting up tables for the first time, execute the SQL script below. If you already have existing tables, execute the [migration.sql](file:///d:/xampp/htdocs/HR%20App/migration.sql) script to upgrade your schema.

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

### 2. Local Setup (XAMPP Apache + PHP)
1. Move the `HR App` project folder to your `xampp/htdocs/` directory.
2. In the project root, create a file named `.env` and fill it with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-access-key
   ```
3. Open the XAMPP Control Panel and start **Apache**.
4. Open your browser and navigate to:
   ```
   http://localhost/HR App/
   ```
   The application will connect to Supabase through the local PHP proxy API, indicated by **"Live SaaS Cloud DB Active"** in the header.

---

### 3. Production Deployment (Netlify)
1. Push your local Git repository to GitHub.
2. Log in to [Netlify](https://app.netlify.com/) and create a new site linked to your GitHub repository.
3. In your Netlify Site dashboard, go to **Site Settings > Environment Variables** (or **Site configuration > Environment variables**) and add:
   * **`SUPABASE_URL`**: Your Supabase API URL.
   * **`SUPABASE_SERVICE_KEY`**: Your Supabase private access key (or `service_role` key).
4. Netlify will build and deploy the application. Your live site is now securely connected to the cloud backend database!
