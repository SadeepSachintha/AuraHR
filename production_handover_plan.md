# AuraHR - Production Handover Plan

This document outlines the final production handover plan, including repository structures, deployment procedures, database schemas, and verification guides for the AuraHR suite.

---

## 🏗️ System Components Overview

The system consists of three main modules and a shared Supabase cloud backend:

1. **Standalone Production Portal (`/production-portal`):** Vite + React + TS single-page admin application for desktops, secured by Supabase Auth and integrated with Leaflet geofencing maps.
2. **Demo Portal (`/`):** React dashboard integrated with an interactive visual mobile simulator context, ideal for sandboxed pitches and QA runs.
3. **Flutter Mobile App (`/mobile`):** Native Android/iOS employee client utilizing geofenced GPS check-ins, local storage secure queueing, and PDF slip exports.
4. **PHP API Proxy (`/api`):** Secure server backend directing query headers and database tokens between clients and the cloud.

---

## 🛡️ Enterprise Compliance Modules (Production-Ready)

The production web portal has been enhanced with enterprise-grade features to satisfy security and audit requirements:

### 1. Role-Based Access Control (RBAC) Console
* **Super Admin:** Complete access to all database configurations, sync tools, and the RBAC Operator Invite screen.
* **Department Manager (Engineering):** Scopes attendance logs, maps, and tasks strictly to the Engineering team. Financial details (salaries/allowances) are automatically masked.
* **HR Specialist:** Accesses payroll structures, but system administration tools (like Database Reseed/Reset) are disabled.

### 2. Audit Trail & Compliance Log (SOC 2 Compliant)
* A dedicated tab in the sidebar (restricted to Super Admins).
* Captures events like logins, employee profile edits, leave approvals/rejections, task assignments, and database resets.
* Logs timestamps, operator email, action type, description details, and simulated gateway IP address.

### 3. Compliance Export Center
* A dedicated tab in the sidebar (accessible to Super Admins and HR Specialists).
* Generates and downloads:
  * **Attendance Payroll Feeds** (CSV/Excel format with date range filters).
  * **Employee Register Directories** (CSV/Excel or Printable PDF format).
  * **Leave History Logs** (CSV/Excel or Printable PDF format).

### 4. Corporate Shift Planner & Roster Scheduler
* Maps shifts to employees and calculates check-in compliance stats (Punctual, Late, Absent, Pending).
* Displays team compliance rates, total late warnings, and total absentees today.

### 5. Dynamic Org Chart Visualizer
* Generates an interactive multi-level organizational hierarchy tree diagram.
* Includes expand/collapse toggles and a node details sidebar panel drawer.

---

## 🛠️ Database Schema & Keys

Configure your Supabase PostgreSQL instance with the following tables (refer to [migration.sql](file:///d:/xampp/htdocs/HR%20App/migration.sql) for incremental upgrades):
- `public.employees`
- `public.attendance`
- `public.leaves`
- `public.claims`
- `public.payslips`
- `public.kpis`
- `public.audit_logs` (New)
- `public.rosters` (New)

Ensure index keys are set up for performance-efficient lookup searching:
```sql
CREATE INDEX IF NOT EXISTS idx_emp_company ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_att_company ON public.attendance(company_id);
CREATE INDEX IF NOT EXISTS idx_leaves_company ON public.leaves(company_id);
CREATE INDEX IF NOT EXISTS idx_claims_company ON public.claims(company_id);
CREATE INDEX IF NOT EXISTS idx_payslips_company ON public.payslips(company_id);
CREATE INDEX IF NOT EXISTS idx_kpis_company ON public.kpis(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_company ON public.audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rosters_company ON public.rosters(company_id);
CREATE INDEX IF NOT EXISTS idx_rosters_date ON public.rosters(date);
```

---

## ⚙️ Environment Config Setup

### Web Portals
The production admin console uses the following keys configured on **Netlify** or locally inside [production-portal/.env](file:///d:/xampp/htdocs/HR%20App/production-portal/.env):
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-private-service-key-token...
```
*Note: Vite config is customized with `envPrefix: ['VITE_', 'SUPABASE_']` so Netlify's standard variables are resolved natively.*

### PHP API Server
Place these keys in your server's root `.env` file to grant `/api/index.php` database query authorization.

---

## 🚀 Web Admin Hosting & Netlify Deployment

To host the standalone portal on Netlify via continuous deployment:

1. Discard/cancel any manual overrides in Netlify's Web UI.
2. Push your changes to GitHub.
3. The root [netlify.toml](file:///d:/xampp/htdocs/HR%20App/netlify.toml) contains the base override pipeline:
   ```toml
   [build]
     base = "production-portal"
     command = "npm run build"
     publish = "dist"
   ```
4. If your PHP backend is hosted on a public domain (e.g. `https://api.aurahr.io`), configure proxy redirects by creating a `_redirects` file in [production-portal/public](file:///d:/xampp/htdocs/HR%20App/production-portal/public):
   ```text
   /api/*  https://api.aurahr.io/api/:splat  200
   ```

---

## 📱 Flutter Mobile Deployment

To prepare the native app for release:

1. Validate dependencies and code syntax:
   ```bash
   cd mobile
   flutter analyze
   ```
2. Verify API host in [lib/config.dart](file:///d:/xampp/htdocs/HR%20App/mobile/lib/config.dart):
   ```dart
   static const String apiUrl = 'https://api.aurahr.io/api';
   ```
3. Compile the production Google Play release bundle:
   ```bash
   flutter build aab --release
   ```

---

## 🧪 Testing & Sandbox Credentials

Use these credentials to manually test components:
- **Admin Dashboard login (Supabase fallback):**
  * Email: `admin@aurahr.io`
  * Password: `admin123`
- **Employee Mock Geofence Coordinates:**
  * Latitude: `6.9271` (Colombo HQ)
  * Longitude: `79.8612`
