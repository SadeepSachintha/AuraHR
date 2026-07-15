# AuraHR - Standalone Production Web Admin Dashboard

This subdirectory houses the standalone production admin dashboard, optimized for full-screen desktop viewing, decoupled from mobile simulators, and secured by Supabase Authentication.

---

## ⚡ Key Technical Features

1. **Supabase Authentication Gateway:**
   - Real-time login via `LoginPage.tsx` using your production Supabase project.
   - Developer/Sandbox fallback credentials: `admin@aurahr.io` / `admin123`.
   
2. **Interactive Live Map:**
   - Leaflet.js dark-themed map plotting present employees' geolocations.
   - Distinct green (geofenced office area) and red (remote site check-in) markers.

3. **Multi-Tenant Support:**
   - Send requests tagged with dynamic company-scoped headers (`X-Company-ID`).

---

## 🚀 Setup & Build Pipelines

### 1. Configure Environment Keys
Create a `.env` file or define Netlify environment variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-anon-key
```

### 2. Local Run
```bash
npm install
npm run dev
```

### 3. Compile Production Bundle
```bash
npm run build
```
Static assets will compile into the `dist/` directory.

### 4. Setup Routing Proxy Redirects
If deployed on Netlify, create a file named `_redirects` inside the `public/` directory to safely route API logs:
```text
/api/*  https://your-production-php-backend.com/api/:splat  200
```
