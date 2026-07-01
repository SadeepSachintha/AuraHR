# AuraHR - Premium SaaS HR Portal & Mobile Simulator (Serverless & PHP Proxy Edition)
A Product of [SS Labz](https://ss-labz.pages.dev/)

AuraHR is a high-fidelity, interactive, multi-tenant SaaS HR management dashboard and simulated mobile self-service app built side-by-side. It features a secure dual-mode backend (Netlify Serverless Functions for production, and local PHP Proxy for XAMPP environments) connected to a Supabase Cloud PostgreSQL database.

The suite also includes **Progressive Web App (PWA)** capabilities for offline capability and installation, as well as a companion **Flutter Mobile Simulator** designed for employees to manage attendance (with geolocated GPS validation), leaves, claims, and payslips on the go.

---

## ⚡ Architecture & Security Features

* **Dual-Mode Backend Routing**: 
  * **Production (Netlify)**: Routes `/api/*` requests to serverless Node.js handlers (`netlify/functions/api.js`).
  * **Local Development (XAMPP)**: Automatically routes requests to a local PHP proxy (`api/index.php`) via `.htaccess` URL rewrites, eliminating the need to install Node.js/npm or Netlify CLI locally.
* **100% Secret Database Keys**: Supabase URL and keys are stored securely in a local `.env` file (ignored by Git) or within Netlify Site environment variables. They are never exposed to the client browser.
* **Multi-Tenant Isolation**: Multiple companies share the same database. By changing the **Tenant Selector** in the header, the frontend includes a custom `X-Company-ID` request header, and the backend automatically filters queries (e.g., `WHERE company_id = companyId`).
* **Graceful Sandbox Fallback**: If both Netlify and the local PHP proxy are offline, the frontend `DB_ENGINE` falls back to **Local Sandbox Mode** using browser `localStorage` for offline presentations.
* **Progressive Web App (PWA)**:
  * Includes a [Web App Manifest](file:///d:/xampp/htdocs/HR%20App/manifest.json) supporting standard and maskable icons (`192x192` and `512x512` pixels), standalone viewport, and dark themes.
  * Uses a dedicated [Service Worker](file:///d:/xampp/htdocs/HR%20App/sw.js) implements an **Offline Cache-First Strategy** for static assets (HTML, CSS, JS, manifest, and icons), while bypassing API routes to ensure live server communication takes precedence.
* **Mobile Simulator Integration**:
  * Connected via HTTP REST APIs to the PHP proxy or Netlify endpoint.
  * Implements automatic platform-based routing (`10.0.2.2` for Android Emulator loopbacks and localhost/127.0.0.1 for Web and physical devices).

---

## 🛠️ Technology Stack

* **Web Portal (Frontend)**: React 18 (TypeScript), Vite, Tailwind CSS (Premium Dark Glassmorphism theme, dynamic hover states), and Lucide React icons.
* **Service Worker / PWA**: Web App Manifest (`manifest.json`) and native JavaScript caching APIs (`sw.js`).
* **Mobile Simulator**: Flutter (Dart) utilizing Material 3 design and custom typography.
* **Visual & Geolocation Libraries**: Responsive interactive SVG dashboard charts, Leaflet.js (Web GPS map tracker), Geolocator (Flutter native GPS locator), static mapping APIs.
* **Cloud Backend**: Netlify Serverless Functions (Node.js API).
* **Local Backend**: PHP Proxy (XAMPP compatible).
* **Database**: Supabase PostgreSQL Cloud.

---

## 📱 Mobile App Screens & Features

Located in the [/mobile](file:///d:/xampp/htdocs/HR%20App/mobile) subdirectory, the Flutter mobile simulator contains the following features:

1. **Biometric Bypass Splash Screen**: Simulated fingerprint biometric gateway to unlock employee workspace instantly without manual login friction.
2. **Interactive Employee Dashboard**: Displays active shift status (clocked in/out), recent activities, and quick actions to access services.
3. **GPS Geofenced Clock-in/out Screen**:
   - Acquires lock on native GPS coordinates using the `geolocator` plugin.
   - Automatically handles mock location simulation for environments where hardware GPS is unavailable (e.g., Windows builds).
   - Dynamically renders location markers on an interactive static map using GPS latitude/longitude.
4. **Self-Service Modules**:
   - **Leave Portal**: Real-time indicators of Annual, Casual, and Medical leave balances. Includes forms to select leave dates and submit application requests to the cloud DB.
   - **Expense Claims**: Multi-category claim submissions (Travel, Meals, Internet, Medical). Simulates uploading image receipts via Unsplash presets.
   - **Payslips**: Comprehensive overview of earnings (basic + allowance), deductions (taxes, EPF, ETF), and employer contributions, with detailed calculations.

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
3. Open the XAMPP Control Panel and start **Apache** (serving local API endpoints at `/api/index.php`).
4. Install packages and run the React frontend in dev mode:
   ```bash
   npm install
   npm run dev
   ```
   Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```
   Vite's dev proxy automatically redirects `/api/*` requests to your local Apache proxy server.
5. To test the production-ready build locally:
   ```bash
   npm run build
   ```
   Open your browser and navigate to `http://localhost/HR App/dist/`.

---

### 3. Production Deployment (Netlify)
1. Push your local Git repository to GitHub.
2. Log in to [Netlify](https://app.netlify.com/) and create a new site linked to your GitHub repository.
3. In your Netlify Site dashboard, go to **Site Settings > Environment Variables** (or **Site configuration > Environment variables**) and add:
   * **`SUPABASE_URL`**: Your Supabase API URL.
   * **`SUPABASE_SERVICE_KEY`**: Your Supabase private access key (or `service_role` key).
4. Netlify will automatically build the application using the configuration in [netlify.toml](file:///d:/xampp/htdocs/HR%20App/netlify.toml):
   * Build command: `npm run build`
   * Publish directory: `dist`

---

### 4. Running the Mobile Simulator (Flutter)
1. Ensure the Flutter SDK is installed and configured on your machine.
2. Open a terminal and navigate to the mobile folder:
   ```bash
   cd mobile
   ```
3. Fetch dependencies:
   ```bash
   flutter pub get
   ```
4. Configure target API IP in [lib/config.dart](file:///d:/xampp/htdocs/HR%20App/mobile/lib/config.dart) if custom proxy addresses are used.
5. Launch your target device (Android Emulator, iOS Simulator, or Chrome) and run:
   ```bash
   flutter run
   ```
   *Note: For Android Emulators, the config automatically routes requests to the local machine using the loopback IP `10.0.2.2` to communicate with the XAMPP server.*
6. To compile a production-ready `.aab` file for Google Play upload, run:
   ```bash
   flutter build appbundle --release
   ```
   For details on setting up keystore signing and resolving cross-drive Windows path errors during release compilation, check the [mobile README](file:///d:/xampp/htdocs/HR%20App/mobile/README.md).
