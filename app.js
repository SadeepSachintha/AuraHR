/* ==========================================================================
   AuraHR Core Javascript Engine - State Management, Supabase & localStorage Sync
   ========================================================================== */

// 1. Initial / Default Demo Database State
const INITIAL_DATABASE = {
  employees: [
    {
      id: "EMP001",
      name: "Kasun Silva",
      email: "kasun.s@aurahr.io",
      role: "Senior Software Engineer",
      dept: "Engineering",
      salary: 135000,
      allowance: 25000,
      phone: "+94 77 123 4567",
      epfNo: "EPF/2349/E01",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
      status: "online",
      leaveBalances: { Annual: 12, Casual: 7, Medical: 10 }
    },
    {
      id: "EMP002",
      name: "Dilini Fernando",
      email: "dilini.f@aurahr.io",
      role: "Lead UI/UX Designer",
      dept: "Product",
      salary: 120000,
      allowance: 15000,
      phone: "+94 77 987 6543",
      epfNo: "EPF/2349/E02",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
      status: "online",
      leaveBalances: { Annual: 14, Casual: 6, Medical: 10 }
    },
    {
      id: "EMP003",
      name: "Fathima Rizna",
      email: "rizna.f@aurahr.io",
      role: "HR Operations Manager",
      dept: "Human Resources",
      salary: 110000,
      allowance: 10000,
      phone: "+94 71 555 4321",
      epfNo: "EPF/2349/HR01",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=100&h=100",
      status: "offline",
      leaveBalances: { Annual: 15, Casual: 8, Medical: 10 }
    },
    {
      id: "EMP004",
      name: "Roshan Perera",
      email: "roshan.p@aurahr.io",
      role: "Marketing Specialist",
      dept: "Marketing",
      salary: 85000,
      allowance: 8000,
      phone: "+94 72 333 4444",
      epfNo: "EPF/2349/M04",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100",
      status: "offline",
      leaveBalances: { Annual: 10, Casual: 5, Medical: 8 }
    },
    {
      id: "EMP005",
      name: "Sajith de Silva",
      email: "sajith.d@aurahr.io",
      role: "Senior Accountant",
      dept: "Finance",
      salary: 105000,
      allowance: 12000,
      phone: "+94 77 444 8888",
      epfNo: "EPF/2349/F05",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
      status: "online",
      leaveBalances: { Annual: 14, Casual: 7, Medical: 10 }
    }
  ],
  attendance: [
    { id: 1, empId: "EMP001", date: "2026-06-15", clockIn: "08:52 AM", clockOut: "05:05 PM", hours: 8.2, location: "Colombo, LK (6.9271, 79.8612)", device: "Mobile App" },
    { id: 2, empId: "EMP002", date: "2026-06-15", clockIn: "08:58 AM", clockOut: "05:15 PM", hours: 8.3, location: "Colombo, LK (6.9271, 79.8612)", device: "Mobile App" },
    { id: 3, empId: "EMP005", date: "2026-06-15", clockIn: "09:02 AM", clockOut: "", hours: 0, location: "Office Biometrics", device: "Card Reader" }
  ],
  leaves: [
    { id: "L001", empId: "EMP001", type: "Casual", start: "2026-06-10", end: "2026-06-11", reason: "Family event in Kandy", status: "Approved", appliedOn: "2026-06-08", decider: "Samantha Perera" },
    { id: "L002", empId: "EMP002", type: "Medical", start: "2026-06-14", end: "2026-06-14", reason: "Dental treatment", status: "Approved", appliedOn: "2026-06-13", decider: "Samantha Perera" },
    { id: "L003", empId: "EMP004", type: "Annual", start: "2026-06-18", end: "2026-06-20", reason: "Trip to Nuwara Eliya", status: "Pending", appliedOn: "2026-06-15", decider: "" }
  ],
  claims: [
    { id: "C001", empId: "EMP001", category: "Travel / Mileage", amount: 4800, desc: "Client visit to Galle site", receipt: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=250&h=350", status: "Pending" },
    { id: "C002", empId: "EMP002", category: "Internet / Phone", amount: 3500, desc: "Broadband allowance", receipt: "https://images.unsplash.com/photo-1534972195531-d756b9bda9f2?auto=format&fit=crop&q=80&w=250&h=350", status: "Approved", decider: "Samantha Perera" }
  ],
  payslips: [
    { id: "P001", empId: "EMP001", month: "May 2026", basic: 135000, allowances: 25000, deductions: 2000, epfEmployee: 10800, tax: 2100, net: 145100, epfEmployer: 16200, etfEmployer: 4050 }
  ],
  kpis: [
    { empId: "EMP001", title: "Complete Core HR Web modules", completion: 85, score: 4.5, feedback: "Excellent progress in mobile interface integrations." },
    { empId: "EMP002", title: "Redesign employee self service views", completion: 100, score: 4.8, feedback: "Stunning layout revisions; users love the glassmorphism approach." },
    { empId: "EMP003", title: "Update legal policy manuals", completion: 60, score: 3.9, feedback: "Good drafts, requires finishing compliance chapters." },
    { empId: "EMP004", title: "Launch marketing campaign", completion: 40, score: 3.5, feedback: "Need higher engagement on social channels." },
    { empId: "EMP005", title: "Complete auditing sheets", completion: 90, score: 4.2, feedback: "Very meticulous financial calculation logs." }
  ]
};

// Global Memory State Variables
let db = {};         // Local localStorage database
let liveDb = {};     // Active loaded data (either Supabase or local db)
let activeMobileEmpId = "EMP001";
let activeAdminTab = "dashboard";
let activeMobileScreen = "splash";
let currentGpsCoords = [6.9271, 79.8612]; // Colombo
let leafletMap = null;
let leafletMarker = null;
let attendanceChartInst = null;
let departmentChartInst = null;

const RECEIPT_PRESETS = [
  "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=250&h=350",
  "https://images.unsplash.com/photo-1534972195531-d756b9bda9f2?auto=format&fit=crop&q=80&w=250&h=350",
  "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=250&h=350"
];
let chosenReceiptIndex = 0;

// Initialize app on load
window.addEventListener('DOMContentLoaded', async () => {
  initLocalDB();
  initTime();
  initLeaflet();
  await DB_ENGINE.init();
  await renderAll();
});

// 2. Fallback local database storage helper
function initLocalDB() {
  const stored = localStorage.getItem('aura_hr_db');
  if (stored) {
    try {
      db = JSON.parse(stored);
    } catch (e) {
      db = JSON.parse(JSON.stringify(INITIAL_DATABASE));
      saveLocalDB();
    }
  } else {
    db = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    saveLocalDB();
  }
}

function saveLocalDB() {
  localStorage.setItem('aura_hr_db', JSON.stringify(db));
}

async function resetDemoData() {
  if (DB_ENGINE.isSupabase()) {
    const confirmation = confirm("You are currently connected to Supabase Cloud database. Do you want to truncate and re-seed all tables with default values?");
    if (confirmation) {
      try {
        await DB_ENGINE.resetSupabaseData();
        alert("Cloud Database Re-seeded successfully!");
      } catch (err) {
        alert("Failed to seed cloud database: " + err.message);
      }
    }
  } else {
    db = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    saveLocalDB();
    alert("Local Demo Data Reset Complete!");
  }
  
  activeMobileEmpId = "EMP001";
  const userSel = document.getElementById("mobile-user-selector");
  if (userSel) userSel.value = "EMP001";
  navigateMobile("splash");
  await renderAll();
}

function initTime() {
  setInterval(() => {
    const now = new Date();
    const clockText = now.toTimeString().split(' ')[0];
    const widgetClock = document.getElementById("mobile-live-clock");
    if (widgetClock) widgetClock.textContent = clockText;
  }, 1000);
}

// 3. Leaflet GPS Initializer
function initLeaflet() {
  leafletMap = L.map('mobile-leaflet-map', {
    zoomControl: false,
    attributionControl: false
  }).setView(currentGpsCoords, 13);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20
  }).addTo(leafletMap);

  const customIcon = L.divIcon({
    className: 'gps-marker-pulsing',
    html: '<div style="width: 14px; height: 14px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #3b82f6;"></div>',
    iconSize: [14, 14]
  });

  leafletMarker = L.marker(currentGpsCoords, { icon: customIcon }).addTo(leafletMap);

  leafletMap.on('click', (e) => {
    updateCoordinates(e.latlng.lat, e.latlng.lng);
  });
}

function updateCoordinates(lat, lng) {
  currentGpsCoords = [lat, lng];
  leafletMarker.setLatLng(currentGpsCoords);
  leafletMap.setView(currentGpsCoords);

  let locationLabel = "Colombo, LK";
  const distColombo = Math.hypot(lat - 6.9271, lng - 79.8612);
  if (distColombo > 0.05) {
    locationLabel = `Remote site (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  } else {
    locationLabel = "Office Zone (HQ Colombo)";
  }

  const statusLabel = document.getElementById("gps-display-status");
  statusLabel.textContent = `Target: ${locationLabel.split('(')[0]}`;
  statusLabel.dataset.fullLocation = `${locationLabel} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

// ==========================================================================
// 4. DATABASE TRANSLATION MAPPERS (PostgreSQL to Frontend JS)
// ==========================================================================
function mapEmployeeFromPg(pg) {
  return {
    id: pg.id,
    name: pg.name,
    email: pg.email,
    role: pg.role,
    dept: pg.dept,
    salary: parseFloat(pg.salary),
    allowance: parseFloat(pg.allowance),
    phone: pg.phone,
    epfNo: pg.epf_no,
    avatar: pg.avatar,
    status: pg.status,
    leaveBalances: typeof pg.leave_balances === 'string' ? JSON.parse(pg.leave_balances) : pg.leave_balances
  };
}
function mapEmployeeToPg(emp) {
  return {
    id: emp.id,
    name: emp.name,
    email: emp.email,
    role: emp.role,
    dept: emp.dept,
    salary: emp.salary,
    allowance: emp.allowance,
    phone: emp.phone,
    epf_no: emp.epfNo,
    avatar: emp.avatar,
    status: emp.status,
    leave_balances: emp.leaveBalances
  };
}

function mapAttendanceFromPg(pg) {
  return {
    id: pg.id,
    empId: pg.emp_id,
    date: pg.date,
    clockIn: pg.clock_in,
    clockOut: pg.clock_out,
    hours: parseFloat(pg.hours),
    location: pg.location,
    device: pg.device
  };
}
function mapAttendanceToPg(att) {
  const mapped = {
    emp_id: att.empId,
    date: att.date,
    clock_in: att.clockIn,
    clock_out: att.clockOut,
    hours: att.hours,
    location: att.location,
    device: att.device
  };
  if (att.id) mapped.id = att.id;
  return mapped;
}

function mapLeaveFromPg(pg) {
  return {
    id: pg.id,
    empId: pg.emp_id,
    type: pg.type,
    start: pg.start,
    end: pg.end,
    reason: pg.reason,
    status: pg.status,
    appliedOn: pg.applied_on,
    decider: pg.decider
  };
}
function mapLeaveToPg(l) {
  return {
    id: l.id,
    emp_id: l.empId,
    type: l.type,
    start: l.start,
    end: l.end,
    reason: l.reason,
    status: l.status,
    applied_on: l.appliedOn,
    decider: l.decider
  };
}

function mapClaimFromPg(pg) {
  return {
    id: pg.id,
    empId: pg.emp_id,
    category: pg.category,
    amount: parseFloat(pg.amount),
    desc: pg.description,
    receipt: pg.receipt,
    status: pg.status,
    decider: pg.decider
  };
}
function mapClaimToPg(c) {
  return {
    id: c.id,
    emp_id: c.empId,
    category: c.category,
    amount: c.amount,
    description: c.desc,
    receipt: c.receipt,
    status: c.status,
    decider: c.decider
  };
}

function mapPayslipFromPg(pg) {
  return {
    id: pg.id,
    empId: pg.emp_id,
    month: pg.month,
    basic: parseFloat(pg.basic),
    allowances: parseFloat(pg.allowances),
    deductions: parseFloat(pg.deductions),
    epfEmployee: parseFloat(pg.epf_employee),
    tax: parseFloat(pg.tax),
    net: parseFloat(pg.net),
    epfEmployer: parseFloat(pg.epf_employer),
    etfEmployer: parseFloat(pg.etf_employer)
  };
}
function mapPayslipToPg(p) {
  return {
    id: p.id,
    emp_id: p.empId,
    month: p.month,
    basic: p.basic,
    allowances: p.allowances,
    deductions: p.deductions,
    epf_employee: p.epfEmployee,
    tax: p.tax,
    net: p.net,
    epf_employer: p.epfEmployer,
    etf_employer: p.etfEmployer
  };
}

function mapKPIFromPg(pg) {
  return {
    empId: pg.emp_id,
    title: pg.title,
    completion: parseInt(pg.completion),
    score: parseFloat(pg.score),
    feedback: pg.feedback
  };
}
function mapKPIToPg(k) {
  return {
    emp_id: k.empId,
    title: k.title,
    completion: k.completion,
    score: k.score,
    feedback: k.feedback
  };
}

// ==========================================================================
// 5. CLOUD DATABASE ENGINE CONTROLLER (Supabase Interface with local fallback)
// ==========================================================================
let supabaseClient = null;

const DB_ENGINE = {
  isSupabase: function() {
    return supabaseClient !== null;
  },

  init: async function() {
    const url = localStorage.getItem('supabase_url');
    const key = localStorage.getItem('supabase_key');
    const syncStatus = document.getElementById("sync-status");
    
    if (url && key) {
      try {
        // Initialize client using CDN global class
        supabaseClient = supabase.createClient(url, key);
        
        // Quick connection validation query
        let { data, error } = await supabaseClient.from('employees').select('id').limit(1);
        if (error) throw error;
        
        syncStatus.textContent = "Live Cloud DB Connected";
        syncStatus.parentElement.style.color = "var(--color-cyan)";
        syncStatus.parentElement.style.borderColor = "rgba(6, 182, 212, 0.3)";
        syncStatus.parentElement.style.backgroundColor = "rgba(6, 182, 212, 0.1)";

        // Set values in the settings inputs
        const urlInput = document.getElementById("db-url");
        const keyInput = document.getElementById("db-key");
        if (urlInput) urlInput.value = url;
        if (keyInput) keyInput.value = key;
      } catch (err) {
        console.error("Supabase failed. Falling back to local storage:", err);
        supabaseClient = null;
        syncStatus.textContent = "Supabase API Error - Fallback Active";
        syncStatus.parentElement.style.color = "var(--color-danger)";
        syncStatus.parentElement.style.borderColor = "rgba(239, 68, 68, 0.3)";
        syncStatus.parentElement.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
      }
    } else {
      supabaseClient = null;
      syncStatus.textContent = "Real-time Local DB Synced";
      syncStatus.parentElement.style.color = "var(--color-success)";
      syncStatus.parentElement.style.borderColor = "rgba(16, 185, 129, 0.2)";
      syncStatus.parentElement.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
    }
  },

  // Employees Queries
  getEmployees: async function() {
    if (this.isSupabase()) {
      const { data, error } = await supabaseClient.from('employees').select('*').order('id', { ascending: true });
      if (error) { console.error(error); return db.employees; }
      return data.map(mapEmployeeFromPg);
    }
    return db.employees;
  },
  saveEmployee: async function(emp) {
    if (this.isSupabase()) {
      const { error } = await supabaseClient.from('employees').upsert(mapEmployeeToPg(emp));
      if (error) console.error("Error upserting employee: ", error);
    } else {
      const idx = db.employees.findIndex(e => e.id === emp.id);
      if (idx !== -1) db.employees[idx] = emp;
      else db.employees.push(emp);
      saveLocalDB();
    }
  },

  // Attendance Queries
  getAttendance: async function() {
    if (this.isSupabase()) {
      const { data, error } = await supabaseClient.from('attendance').select('*').order('id', { ascending: true });
      if (error) { console.error(error); return db.attendance; }
      return data.map(mapAttendanceFromPg);
    }
    return db.attendance;
  },
  saveAttendance: async function(att) {
    if (this.isSupabase()) {
      const pgObj = mapAttendanceToPg(att);
      let error;
      if (att.id) {
        const { error: err } = await supabaseClient.from('attendance').update(pgObj).eq('id', att.id);
        error = err;
      } else {
        const { error: err } = await supabaseClient.from('attendance').insert([pgObj]);
        error = err;
      }
      if (error) console.error("Error saving attendance: ", error);
    } else {
      if (att.id) {
        const idx = db.attendance.findIndex(a => a.id === att.id);
        if (idx !== -1) db.attendance[idx] = att;
      } else {
        const idx = db.attendance.findIndex(a => a.empId === att.empId && a.date === att.date);
        if (idx !== -1) {
          att.id = db.attendance[idx].id;
          db.attendance[idx] = att;
        } else {
          att.id = db.attendance.length + 1;
          db.attendance.push(att);
        }
      }
      saveLocalDB();
    }
  },

  // Leaves Queries
  getLeaves: async function() {
    if (this.isSupabase()) {
      const { data, error } = await supabaseClient.from('leaves').select('*').order('created_at', { ascending: true });
      if (error) { console.error(error); return db.leaves; }
      return data.map(mapLeaveFromPg);
    }
    return db.leaves;
  },
  saveLeave: async function(l) {
    if (this.isSupabase()) {
      const { error } = await supabaseClient.from('leaves').upsert(mapLeaveToPg(l));
      if (error) console.error("Error saving leave: ", error);
    } else {
      const idx = db.leaves.findIndex(x => x.id === l.id);
      if (idx !== -1) db.leaves[idx] = l;
      else db.leaves.push(l);
      saveLocalDB();
    }
  },

  // Claims Queries
  getClaims: async function() {
    if (this.isSupabase()) {
      const { data, error } = await supabaseClient.from('claims').select('*').order('created_at', { ascending: true });
      if (error) { console.error(error); return db.claims; }
      return data.map(mapClaimFromPg);
    }
    return db.claims;
  },
  saveClaim: async function(c) {
    if (this.isSupabase()) {
      const { error } = await supabaseClient.from('claims').upsert(mapClaimToPg(c));
      if (error) console.error("Error saving claim: ", error);
    } else {
      const idx = db.claims.findIndex(x => x.id === c.id);
      if (idx !== -1) db.claims[idx] = c;
      else db.claims.push(c);
      saveLocalDB();
    }
  },

  // Payslips Queries
  getPayslips: async function() {
    if (this.isSupabase()) {
      const { data, error } = await supabaseClient.from('payslips').select('*').order('created_at', { ascending: true });
      if (error) { console.error(error); return db.payslips; }
      return data.map(mapPayslipFromPg);
    }
    return db.payslips;
  },
  savePayslip: async function(p) {
    if (this.isSupabase()) {
      // First clear duplicates for this month and employee
      await supabaseClient.from('payslips').delete().eq('emp_id', p.empId).eq('month', p.month);
      const { error } = await supabaseClient.from('payslips').insert([mapPayslipToPg(p)]);
      if (error) console.error("Error inserting payslip: ", error);
    } else {
      db.payslips = db.payslips.filter(x => !(x.empId === p.empId && x.month === p.month));
      db.payslips.push(p);
      saveLocalDB();
    }
  },

  // KPIs Queries
  getKPIs: async function() {
    if (this.isSupabase()) {
      const { data, error } = await supabaseClient.from('kpis').select('*');
      if (error) { console.error(error); return db.kpis; }
      return data.map(mapKPIFromPg);
    }
    return db.kpis;
  },
  saveKPI: async function(k) {
    if (this.isSupabase()) {
      const { error } = await supabaseClient.from('kpis').upsert(mapKPIToPg(k));
      if (error) console.error("Error saving KPI: ", error);
    } else {
      const idx = db.kpis.findIndex(x => x.empId === k.empId);
      if (idx !== -1) db.kpis[idx] = k;
      else db.kpis.push(k);
      saveLocalDB();
    }
  },

  // Cloud reset utility
  resetSupabaseData: async function() {
    if (!this.isSupabase()) return;
    
    // Clear all tables
    await supabaseClient.from('kpis').delete().neq('emp_id', '');
    await supabaseClient.from('payslips').delete().neq('id', '');
    await supabaseClient.from('claims').delete().neq('id', '');
    await supabaseClient.from('leaves').delete().neq('id', '');
    await supabaseClient.from('attendance').delete().neq('location', '');
    await supabaseClient.from('employees').delete().neq('id', '');

    // Insert Default Employees
    const rawEmps = INITIAL_DATABASE.employees.map(mapEmployeeToPg);
    await supabaseClient.from('employees').insert(rawEmps);

    // Insert Default Appraisals
    const rawKpis = INITIAL_DATABASE.kpis.map(mapKPIToPg);
    await supabaseClient.from('kpis').insert(rawKpis);
  }
};

// Settings Panel Submit Handlers
async function saveDatabaseSettings(event) {
  event.preventDefault();
  const url = document.getElementById("db-url").value.trim();
  const key = document.getElementById("db-key").value.trim();

  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);

  await DB_ENGINE.init();
  await renderAll();
  alert("Database settings saved. AuraHR has successfully connected to your Supabase instance!");
}

async function clearDatabaseSettings() {
  localStorage.removeItem('supabase_url');
  localStorage.removeItem('supabase_key');

  const urlInput = document.getElementById("db-url");
  const keyInput = document.getElementById("db-key");
  if (urlInput) urlInput.value = "";
  if (keyInput) keyInput.value = "";

  await DB_ENGINE.init();
  await renderAll();
  alert("Database disconnected. Now falling back to local storage sandbox.");
}

// ==========================================================================
// 6. REACTIVE RENDER CONTROLLER (Pulls database data and redraws screens)
// ==========================================================================
async function renderAll() {
  // Sync active local variables from active storage engine
  liveDb = {
    employees: await DB_ENGINE.getEmployees(),
    attendance: await DB_ENGINE.getAttendance(),
    leaves: await DB_ENGINE.getLeaves(),
    claims: await DB_ENGINE.getClaims(),
    payslips: await DB_ENGINE.getPayslips(),
    kpis: await DB_ENGINE.getKPIs()
  };

  // Redraw web layouts
  renderAdminDashboard();
  renderEmployeeList();
  renderAttendanceLog();
  renderLeavesView();
  renderPayrollView();
  renderClaimsView();
  renderPerformanceView();
  
  // Redraw simulated mobile layouts
  renderMobilePortal();
  updateSyncBadges();
}

function updateSyncBadges() {
  const pendingLeaves = liveDb.leaves.filter(l => l.status === "Pending").length;
  const pendingClaims = liveDb.claims.filter(c => c.status === "Pending").length;
  
  const leaveBadge = document.getElementById("admin-pending-leaves-badge");
  if (leaveBadge) {
    leaveBadge.textContent = pendingLeaves;
    leaveBadge.style.display = pendingLeaves > 0 ? "inline-block" : "none";
  }
  
  const claimBadge = document.getElementById("admin-pending-claims-badge");
  if (claimBadge) {
    claimBadge.textContent = pendingClaims;
    claimBadge.style.display = pendingClaims > 0 ? "inline-block" : "none";
  }

  const dashboardLeavesStat = document.getElementById("stat-pending-leaves");
  if (dashboardLeavesStat) dashboardLeavesStat.textContent = pendingLeaves;

  const dashboardBadge = document.getElementById("dashboard-urgency-count");
  if (dashboardBadge) dashboardBadge.textContent = `${pendingLeaves + pendingClaims} Actions Required`;
}

// Renders the statistics cards and feeds
function renderAdminDashboard() {
  const totalEmployees = liveDb.employees.length;
  const totalEmpStat = document.getElementById("stat-total-emp");
  if (totalEmpStat) totalEmpStat.textContent = totalEmployees;

  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = liveDb.attendance.filter(a => a.date === todayStr).length;
  const activeTodayStat = document.getElementById("stat-active-today");
  if (activeTodayStat) activeTodayStat.textContent = presentToday;

  const totalPayroll = liveDb.employees.reduce((sum, emp) => sum + emp.salary + emp.allowance, 0);
  const payrollCostStat = document.getElementById("stat-payroll-cost");
  if (payrollCostStat) payrollCostStat.textContent = `LKR ${totalPayroll.toLocaleString()}`;

  // Clock-ins
  const recentTbody = document.getElementById("dashboard-recent-attendance");
  if (recentTbody) {
    recentTbody.innerHTML = "";
    const todayAtt = liveDb.attendance.filter(a => a.date === todayStr);
    if (todayAtt.length === 0) {
      recentTbody.innerHTML = `<tr><td colspan="4" class="text-center text-mute">No clock-ins recorded today.</td></tr>`;
    } else {
      todayAtt.forEach(att => {
        const emp = liveDb.employees.find(e => e.id === att.empId);
        const name = emp ? emp.name : "Unknown Employee";
        const avatar = emp ? emp.avatar : "";
        recentTbody.innerHTML += `
          <tr>
            <td>
              <div class="user-greeting">
                <img src="${avatar}" class="mobile-avatar" alt="avatar">
                <span>${name}</span>
              </div>
            </td>
            <td>${att.clockIn}</td>
            <td><span class="badge-tag">${att.device}</span></td>
            <td>${att.location.split('(')[0]}</td>
          </tr>
        `;
      });
    }
  }

  // Dashboard urgent approvals
  const pendingLeavesTable = document.getElementById("dashboard-pending-leaves");
  if (pendingLeavesTable) {
    pendingLeavesTable.innerHTML = "";
    const pendingLeaves = liveDb.leaves.filter(l => l.status === "Pending");
    if (pendingLeaves.length === 0) {
      pendingLeavesTable.innerHTML = `<tr><td colspan="4" class="text-center text-mute">All caught up!</td></tr>`;
    } else {
      pendingLeaves.forEach(leave => {
        const emp = liveDb.employees.find(e => e.id === leave.empId);
        const name = emp ? emp.name : "Unknown Employee";
        pendingLeavesTable.innerHTML += `
          <tr>
            <td><strong>${name}</strong></td>
            <td>${leave.type}</td>
            <td>${leave.start} to ${leave.end}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="quickApproveLeave('${leave.id}')">Approve</button>
            </td>
          </tr>
        `;
      });
    }
  }

  renderCharts(totalEmployees);
}

function renderCharts(totalEmployees) {
  const ctxAttendance = document.getElementById('attendanceChart');
  if (ctxAttendance) {
    if (attendanceChartInst) attendanceChartInst.destroy();
    attendanceChartInst = new Chart(ctxAttendance, {
      type: 'line',
      data: {
        labels: ['June 11', 'June 12', 'June 13', 'June 14', 'June 15'],
        datasets: [{
          label: 'Present Ratio %',
          data: [92, 85, 95, 75, 88],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } },
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9ca3af' } }
        }
      }
    });
  }

  const ctxDept = document.getElementById('departmentChart');
  if (ctxDept) {
    const depts = {};
    liveDb.employees.forEach(emp => {
      depts[emp.dept] = (depts[emp.dept] || 0) + 1;
    });

    if (departmentChartInst) departmentChartInst.destroy();
    departmentChartInst = new Chart(ctxDept, {
      type: 'doughnut',
      data: {
        labels: Object.keys(depts),
        datasets: [{
          data: Object.values(depts),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#9ca3af', boxWidth: 12, font: { size: 10 } }
          }
        }
      }
    });
  }
}

function renderEmployeeList() {
  const container = document.getElementById("employee-cards-container");
  if (!container) return;
  container.innerHTML = "";

  liveDb.employees.forEach(emp => {
    container.innerHTML += `
      <div class="employee-card glass-inner-card" data-dept="${emp.dept}" data-name="${emp.name.toLowerCase()}">
        <span class="status-pill ${emp.status}">${emp.status.toUpperCase()}</span>
        <img src="${emp.avatar}" alt="Avatar" class="card-avatar">
        <h4>${emp.name}</h4>
        <p class="role">${emp.role}</p>
        <span class="dept-tag">${emp.dept}</span>
        <div class="card-contact-info">
          <span><i class="fa-solid fa-envelope"></i> ${emp.email}</span>
          <span><i class="fa-solid fa-phone"></i> ${emp.phone}</span>
          <span><i class="fa-solid fa-sack-dollar"></i> Basic: LKR ${emp.salary.toLocaleString()}</span>
        </div>
      </div>
    `;
  });
}

function filterEmployees() {
  const searchVal = document.getElementById("employee-search").value.toLowerCase();
  const deptVal = document.getElementById("employee-filter-dept").value;
  const cards = document.getElementsByClassName("employee-card");

  Array.from(cards).forEach(card => {
    const name = card.dataset.name;
    const dept = card.dataset.dept;
    const matchesSearch = name.includes(searchVal);
    const matchesDept = deptVal === "" || dept === deptVal;

    if (matchesSearch && matchesDept) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function renderAttendanceLog() {
  const tbody = document.getElementById("attendance-log-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const reversedLogs = [...liveDb.attendance].reverse();
  reversedLogs.forEach(att => {
    const emp = liveDb.employees.find(e => e.id === att.empId);
    const name = emp ? emp.name : "Unknown Employee";
    const dateFormatted = new Date(att.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    tbody.innerHTML += `
      <tr>
        <td><strong>${name}</strong></td>
        <td>${dateFormatted}</td>
        <td><i class="fa-solid fa-arrow-right-to-bracket text-green"></i> ${att.clockIn}</td>
        <td>${att.clockOut ? `<i class="fa-solid fa-arrow-right-from-bracket text-danger"></i> ${att.clockOut}` : '<span class="text-mute">-</span>'}</td>
        <td>${att.hours > 0 ? `${att.hours} hrs` : '<span class="badge-status pending">On-Shift</span>'}</td>
        <td><i class="fa-solid fa-location-dot text-mute"></i> ${att.location}</td>
        <td><span class="badge-tag">${att.device}</span></td>
      </tr>
    `;
  });
}

function renderLeavesView() {
  const pendingTbody = document.getElementById("leaves-pending-tbody");
  const historyTbody = document.getElementById("leaves-history-tbody");
  if (!pendingTbody || !historyTbody) return;
  
  pendingTbody.innerHTML = "";
  historyTbody.innerHTML = "";

  const pendingLeaves = liveDb.leaves.filter(l => l.status === "Pending");
  const approvedLeaves = liveDb.leaves.filter(l => l.status === "Approved");
  
  document.getElementById("leaves-stat-pending").textContent = pendingLeaves.length;
  document.getElementById("leaves-stat-annual").textContent = approvedLeaves.filter(l => l.type === "Annual").length;
  document.getElementById("leaves-stat-casual").textContent = approvedLeaves.filter(l => l.type === "Casual").length;
  document.getElementById("leaves-stat-sick").textContent = approvedLeaves.filter(l => l.type === "Medical").length;

  if (pendingLeaves.length === 0) {
    pendingTbody.innerHTML = `<tr><td colspan="6" class="text-center text-mute">No pending leave requests.</td></tr>`;
  } else {
    pendingLeaves.forEach(leave => {
      const emp = liveDb.employees.find(e => e.id === leave.empId);
      const name = emp ? emp.name : "Unknown Employee";
      pendingTbody.innerHTML += `
        <tr>
          <td><strong>${name}</strong></td>
          <td><span class="badge-tag">${leave.type}</span></td>
          <td>${leave.start} to ${leave.end}</td>
          <td>"${leave.reason}"</td>
          <td>${leave.appliedOn}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="decideLeave('${leave.id}', 'Approved')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="decideLeave('${leave.id}', 'Rejected')">Reject</button>
          </td>
        </tr>
      `;
    });
  }

  const archivedLeaves = [...liveDb.leaves].filter(l => l.status !== "Pending").reverse();
  if (archivedLeaves.length === 0) {
    historyTbody.innerHTML = `<tr><td colspan="6" class="text-center text-mute">No leave archives.</td></tr>`;
  } else {
    archivedLeaves.forEach(leave => {
      const emp = liveDb.employees.find(e => e.id === leave.empId);
      const name = emp ? emp.name : "Unknown Employee";
      historyTbody.innerHTML += `
        <tr>
          <td><strong>${name}</strong></td>
          <td>${leave.type}</td>
          <td>${leave.start} to ${leave.end}</td>
          <td>"${leave.reason}"</td>
          <td><span class="badge-status ${leave.status.toLowerCase()}">${leave.status}</span></td>
          <td>${leave.decider || 'Admin'}</td>
        </tr>
      `;
    });
  }
}

function renderPayrollView() {
  const select = document.getElementById("payroll-employee-select");
  if (!select) return;
  const activeVal = select.value;
  select.innerHTML = "";
  
  liveDb.employees.forEach(emp => {
    select.innerHTML += `<option value="${emp.id}">${emp.name} (${emp.role})</option>`;
  });

  if (activeVal && liveDb.employees.some(e => e.id === activeVal)) {
    select.value = activeVal;
  } else {
    select.value = "EMP001";
  }

  loadEmployeePayrollData();
}

function loadEmployeePayrollData() {
  const select = document.getElementById("payroll-employee-select");
  if (!select) return;
  const empId = select.value;
  const emp = liveDb.employees.find(e => e.id === empId);
  if (!emp) return;

  document.getElementById("payroll-basic-salary").value = emp.salary;
  document.getElementById("payroll-allowances").value = emp.allowance;
  document.getElementById("payroll-deductions").value = 2000;
  
  calculatePayrollDemo();
}

function calculatePayrollDemo() {
  const basicInput = document.getElementById("payroll-basic-salary");
  if (!basicInput) return;
  const basic = parseFloat(basicInput.value) || 0;
  const allowances = parseFloat(document.getElementById("payroll-allowances").value) || 0;
  const deductions = parseFloat(document.getElementById("payroll-deductions").value) || 0;

  const epfEmployee = basic * 0.08;
  
  let tax = 0;
  const taxableSalary = basic + allowances;
  if (taxableSalary > 140000) {
    tax = (40000 * 0.06) + ((taxableSalary - 140000) * 0.12);
  } else if (taxableSalary > 100000) {
    tax = (taxableSalary - 100000) * 0.06;
  }

  const netPay = basic + allowances - epfEmployee - deductions - tax;
  const epfEmployer = basic * 0.12;
  const etfEmployer = basic * 0.03;

  document.getElementById("payroll-calc-epf-employee").textContent = `- LKR ${epfEmployee.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById("payroll-calc-tax").textContent = `- LKR ${tax.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById("payroll-calc-net").textContent = `LKR ${netPay.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  
  document.getElementById("payroll-calc-epf-employer").textContent = `LKR ${epfEmployer.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById("payroll-calc-etf-employer").textContent = `LKR ${etfEmployer.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

  const empId = document.getElementById("payroll-employee-select").value;
  const emp = liveDb.employees.find(e => e.id === empId);
  if (emp) {
    document.getElementById("ps-code").textContent = emp.id;
    document.getElementById("ps-name").textContent = emp.name;
    document.getElementById("ps-role").textContent = emp.role;
    document.getElementById("ps-epf-no").textContent = emp.epfNo || "EPF/NOTSPECIFIED";
    
    document.getElementById("ps-basic").textContent = basic.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById("ps-allowances").textContent = allowances.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById("ps-epf-8").textContent = epfEmployee.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById("ps-tax").textContent = tax.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById("ps-deductions").textContent = deductions.toLocaleString('en-US', {minimumFractionDigits: 2});
    
    document.getElementById("ps-total-earnings").textContent = (basic + allowances).toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById("ps-total-deductions").textContent = (epfEmployee + tax + deductions).toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById("ps-net-pay").textContent = `LKR ${netPay.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    
    document.getElementById("ps-epf-12").textContent = epfEmployer.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById("ps-etf-3").textContent = etfEmployer.toLocaleString('en-US', {minimumFractionDigits: 2});
  }
}

async function savePayslip() {
  const empId = document.getElementById("payroll-employee-select").value;
  const emp = liveDb.employees.find(e => e.id === empId);
  if (!emp) return;

  const basic = parseFloat(document.getElementById("payroll-basic-salary").value) || 0;
  const allowances = parseFloat(document.getElementById("payroll-allowances").value) || 0;
  const deductions = parseFloat(document.getElementById("payroll-deductions").value) || 0;
  
  const epfEmployee = basic * 0.08;
  let tax = 0;
  const taxableSalary = basic + allowances;
  if (taxableSalary > 140000) {
    tax = (40000 * 0.06) + ((taxableSalary - 140000) * 0.12);
  } else if (taxableSalary > 100000) {
    tax = (taxableSalary - 100000) * 0.06;
  }
  const net = basic + allowances - epfEmployee - deductions - tax;
  const epfEmployer = basic * 0.12;
  const etfEmployer = basic * 0.03;

  await DB_ENGINE.savePayslip({
    id: "P" + (liveDb.payslips.length + 100).toString(),
    empId,
    month: "June 2026",
    basic,
    allowances,
    deductions,
    epfEmployee,
    tax,
    net,
    epfEmployer,
    etfEmployer
  });

  await renderAll();
  alert("Payslip processed and synced to Employee Mobile App successfully!");
}

function printPayslip() {
  const container = document.getElementById("payslip-preview-card");
  if (container) {
    container.classList.remove("hidden");
    container.scrollIntoView({ behavior: 'smooth' });
  }
}

function renderClaimsView() {
  const pendingTbody = document.getElementById("claims-pending-tbody");
  const historyTbody = document.getElementById("claims-history-tbody");
  if (!pendingTbody || !historyTbody) return;
  
  pendingTbody.innerHTML = "";
  historyTbody.innerHTML = "";

  const pendingClaims = liveDb.claims.filter(c => c.status === "Pending");
  const archivedClaims = liveDb.claims.filter(c => c.status !== "Pending").reverse();

  if (pendingClaims.length === 0) {
    pendingTbody.innerHTML = `<tr><td colspan="6" class="text-center text-mute">No pending claims requests.</td></tr>`;
  } else {
    pendingClaims.forEach(claim => {
      const emp = liveDb.employees.find(e => e.id === claim.empId);
      const name = emp ? emp.name : "Unknown Employee";
      pendingTbody.innerHTML += `
        <tr>
          <td><strong>${name}</strong></td>
          <td>${claim.category}</td>
          <td><strong>LKR ${claim.amount.toLocaleString()}</strong></td>
          <td>"${claim.desc}"</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="showReceiptModal('${claim.receipt}')">
              <i class="fa-solid fa-eye"></i> View Receipt
            </button>
          </td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="decideClaim('${claim.id}', 'Approved')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="decideClaim('${claim.id}', 'Rejected')">Reject</button>
          </td>
        </tr>
      `;
    });
  }

  if (archivedClaims.length === 0) {
    historyTbody.innerHTML = `<tr><td colspan="6" class="text-center text-mute">No claims archives.</td></tr>`;
  } else {
    archivedClaims.forEach(claim => {
      const emp = liveDb.employees.find(e => e.id === claim.empId);
      const name = emp ? emp.name : "Unknown Employee";
      historyTbody.innerHTML += `
        <tr>
          <td><strong>${name}</strong></td>
          <td>${claim.category}</td>
          <td>LKR ${claim.amount.toLocaleString()}</td>
          <td>"${claim.desc}"</td>
          <td><span class="badge-status ${claim.status.toLowerCase()}">${claim.status}</span></td>
          <td>${claim.decider || 'Admin'}</td>
        </tr>
      `;
    });
  }
}

function renderPerformanceView() {
  const tbody = document.getElementById("appraisals-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  liveDb.employees.forEach(emp => {
    const kpi = liveDb.kpis.find(k => k.empId === emp.id) || { title: "Define KPI targets", completion: 0, score: 3.0, feedback: "Pending assessment." };
    
    tbody.innerHTML += `
      <tr>
        <td>
          <div class="user-greeting">
            <img src="${emp.avatar}" class="mobile-avatar" alt="Avatar">
            <div>
              <strong>${emp.name}</strong>
              <small class="text-mute" style="display:block;">${emp.role}</small>
            </div>
          </div>
        </td>
        <td>${kpi.title}</td>
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <div class="progress-bar-bg" style="width:80px; height:8px;">
              <div class="progress-bar-fill" style="width:${kpi.completion}%; height:100%;"></div>
            </div>
            <span>${kpi.completion}%</span>
          </div>
        </td>
        <td>
          <strong style="color:var(--color-purple);"><i class="fa-solid fa-star"></i> ${kpi.score.toFixed(1)}</strong>
        </td>
        <td><span class="text-mute" style="font-style:italic;">"${kpi.feedback}"</span></td>
        <td>H1 - 2026</td>
      </tr>
    `;
  });

  const modalSelect = document.getElementById("kpi-emp-select");
  if (modalSelect) {
    modalSelect.innerHTML = "";
    liveDb.employees.forEach(emp => {
      modalSelect.innerHTML += `<option value="${emp.id}">${emp.name}</option>`;
    });
  }
}

// Renders the simulated mobile viewport
function renderMobilePortal() {
  const emp = liveDb.employees.find(e => e.id === activeMobileEmpId);
  if (!emp) return;

  const phoneSelector = document.getElementById("mobile-user-selector");
  if (phoneSelector) {
    phoneSelector.innerHTML = "";
    liveDb.employees.forEach(e => {
      phoneSelector.innerHTML += `<option value="${e.id}">${e.name} (${e.id})</option>`;
    });
    phoneSelector.value = activeMobileEmpId;
  }

  const splashName = document.getElementById("active-mobile-user-name");
  if (splashName) splashName.textContent = emp.name;

  const userAvatar = document.getElementById("mobile-user-avatar");
  if (userAvatar) userAvatar.src = emp.avatar;
  
  const userWelcome = document.getElementById("mobile-user-welcome");
  if (userWelcome) userWelcome.textContent = `Hello, ${emp.name.split(' ')[0]}!`;
  
  const userRole = document.getElementById("mobile-user-role");
  if (userRole) userRole.textContent = emp.role;

  // Widget scores
  const annualLeft = emp.leaveBalances.Annual;
  const widgetLeaveBal = document.getElementById("mobile-widget-leave-bal");
  if (widgetLeaveBal) widgetLeaveBal.textContent = `${annualLeft} Days Left`;
  
  const balanceAnnual = document.getElementById("mobile-leave-bal-annual");
  if (balanceAnnual) balanceAnnual.textContent = annualLeft;
  
  const balanceCasual = document.getElementById("mobile-leave-bal-casual");
  if (balanceCasual) balanceCasual.textContent = emp.leaveBalances.Casual;
  
  const balanceMedical = document.getElementById("mobile-leave-bal-medical");
  if (balanceMedical) balanceMedical.textContent = emp.leaveBalances.Medical;

  const totalMyClaims = liveDb.claims.filter(c => c.empId === emp.id && c.status === "Approved").reduce((sum, cl) => sum + cl.amount, 0);
  const widgetClaimsTotal = document.getElementById("mobile-widget-claims-total");
  if (widgetClaimsTotal) widgetClaimsTotal.textContent = `LKR ${totalMyClaims.toLocaleString()}`;

  const kpiData = liveDb.kpis.find(k => k.empId === emp.id) || { score: 3.5, feedback: "Pending", completion: 0 };
  const widgetPerformanceRating = document.getElementById("mobile-widget-performance-rating");
  if (widgetPerformanceRating) widgetPerformanceRating.textContent = `${kpiData.completion}% Done`;
  
  const kpiScore = document.getElementById("mobile-kpi-score");
  if (kpiScore) kpiScore.textContent = kpiData.score.toFixed(1);
  
  const kpiLevel = document.getElementById("mobile-kpi-level");
  if (kpiLevel) kpiLevel.textContent = kpiData.score >= 4.5 ? "High Achiever" : (kpiData.score >= 3.8 ? "Strong Performer" : "Contributor");

  // Shifts Clock in
  const todayStr = new Date().toISOString().split('T')[0];
  const attendanceToday = liveDb.attendance.find(a => a.empId === emp.id && a.date === todayStr);

  const statusLabel = document.getElementById("mobile-clock-status");
  const clockBtn = document.getElementById("btn-mobile-clockin");
  const mapClockBtn = document.getElementById("mobile-map-clock-btn");

  if (statusLabel && clockBtn && mapClockBtn) {
    clockBtn.disabled = false;
    mapClockBtn.disabled = false;
    if (!attendanceToday) {
      statusLabel.textContent = "Not Logged";
      statusLabel.className = "badge pending";
      clockBtn.textContent = "Clock In";
      clockBtn.className = "btn btn-primary btn-block btn-pulse";
      mapClockBtn.textContent = "Clock In Today";
      mapClockBtn.className = "btn btn-primary btn-lg btn-block";
    } else if (attendanceToday.clockIn && !attendanceToday.clockOut) {
      statusLabel.textContent = "Checked In";
      statusLabel.className = "badge approved";
      clockBtn.textContent = "Clock Out";
      clockBtn.className = "btn btn-danger btn-block";
      mapClockBtn.textContent = "Clock Out Today";
      mapClockBtn.className = "btn btn-danger btn-lg btn-block";
    } else {
      statusLabel.textContent = "Completed";
      statusLabel.className = "badge offline";
      clockBtn.textContent = "Shift Ended";
      clockBtn.className = "btn btn-secondary btn-block";
      clockBtn.disabled = true;
      mapClockBtn.textContent = "Shift Completed";
      mapClockBtn.className = "btn btn-secondary btn-lg btn-block";
      mapClockBtn.disabled = true;
    }
  }

  // Logs Feed List
  const feedList = document.getElementById("mobile-activity-list");
  if (feedList) {
    feedList.innerHTML = "";
    const myLogs = liveDb.attendance.filter(a => a.empId === emp.id).slice(-3).reverse();
    if (myLogs.length === 0) {
      feedList.innerHTML = `<li class="text-mute text-center" style="font-size:0.65rem;">No logs found.</li>`;
    } else {
      myLogs.forEach(log => {
        feedList.innerHTML += `
          <li class="activity-item checkin">
            <div class="icon"><i class="fa-solid fa-location-dot"></i></div>
            <div class="details">
              <span>Clocked In ${log.location.split('(')[0]}</span>
              <span class="time">${log.date} @ ${log.clockIn}</span>
            </div>
          </li>
          ${log.clockOut ? `
            <li class="activity-item checkout">
              <div class="icon"><i class="fa-solid fa-clock"></i></div>
              <div class="details">
                <span>Shift Ended (${log.hours} hrs worked)</span>
                <span class="time">${log.date} @ ${log.clockOut}</span>
              </div>
            </li>
          ` : ''}
        `;
      });
    }
  }

  // Mobile Leaves list
  const mobileLeavesList = document.getElementById("mobile-my-leaves-list");
  if (mobileLeavesList) {
    mobileLeavesList.innerHTML = "";
    const myLeaves = liveDb.leaves.filter(l => l.empId === emp.id).reverse();
    if (myLeaves.length === 0) {
      mobileLeavesList.innerHTML = `<div class="text-mute text-center" style="font-size:0.65rem;">No leave applications found.</div>`;
    } else {
      myLeaves.forEach(leave => {
        mobileLeavesList.innerHTML += `
          <div class="history-item-mini">
            <div class="details">
              <span class="title">${leave.type} Leave</span>
              <span class="meta">${leave.start} to ${leave.end}</span>
            </div>
            <span class="status ${leave.status}">${leave.status}</span>
          </div>
        `;
      });
    }
  }

  // Mobile Claims list
  const mobileClaimsList = document.getElementById("mobile-my-claims-list");
  if (mobileClaimsList) {
    mobileClaimsList.innerHTML = "";
    const myClaims = liveDb.claims.filter(c => c.empId === emp.id).reverse();
    if (myClaims.length === 0) {
      mobileClaimsList.innerHTML = `<div class="text-mute text-center" style="font-size:0.65rem;">No submitted claims.</div>`;
    } else {
      myClaims.forEach(cl => {
        mobileClaimsList.innerHTML += `
          <div class="history-item-mini">
            <div class="details">
              <span class="title">LKR ${cl.amount.toLocaleString()}</span>
              <span class="meta">${cl.category} - ${cl.desc}</span>
            </div>
            <span class="status ${cl.status}">${cl.status}</span>
          </div>
        `;
      });
    }
  }

  // Mobile Payslips list
  const mobilePayslipsList = document.getElementById("mobile-my-payslips-container");
  if (mobilePayslipsList) {
    mobilePayslipsList.innerHTML = "";
    const myPayslips = liveDb.payslips.filter(p => p.empId === emp.id).reverse();
    
    const accumulatedEpf = myPayslips.reduce((sum, p) => sum + p.epfEmployee, 0) + (emp.id === "EMP001" ? 36000 : 24000);
    const epfStat = document.getElementById("mobile-epf-stat");
    if (epfStat) epfStat.textContent = `LKR ${accumulatedEpf.toLocaleString()} Saved`;

    if (myPayslips.length === 0) {
      mobilePayslipsList.innerHTML = `<div class="text-mute text-center" style="font-size:0.65rem;">No payslips published yet.</div>`;
    } else {
      myPayslips.forEach(ps => {
        mobilePayslipsList.innerHTML += `
          <div class="m-payslip-card" onclick="mobileOpenPayslip('${ps.id}')">
            <div class="info">
              <span class="month">${ps.month} Payslip</span>
              <span class="net">Net Salary: LKR ${ps.net.toLocaleString()}</span>
            </div>
            <i class="fa-solid fa-chevron-right"></i>
          </div>
        `;
      });
    }
  }

  // Mobile KPIs list
  const mobileKpisContainer = document.getElementById("mobile-kpis-container");
  if (mobileKpisContainer) {
    mobileKpisContainer.innerHTML = "";
    liveDb.kpis.filter(k => k.empId === emp.id).forEach(goal => {
      mobileKpisContainer.innerHTML += `
        <div class="kpi-row-card">
          <div class="header">
            <span>${goal.title}</span>
            <span>${goal.completion}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${goal.completion}%;"></div>
          </div>
          <div class="feedback">"${goal.feedback}"</div>
        </div>
      `;
    });
  }
}

async function changeMobileActiveUser() {
  const sel = document.getElementById("mobile-user-selector");
  if (!sel) return;
  activeMobileEmpId = sel.value;
  await renderAll();
}

// ==========================================================================
// 7. USER EVENT ACTION & NAVIGATION ROUTERS
// ==========================================================================
function switchAdminTab(tabId, el) {
  activeAdminTab = tabId;
  
  const items = document.querySelectorAll(".admin-sidebar .nav-menu li");
  items.forEach(item => item.classList.remove("active"));
  el.classList.add("active");

  const views = document.querySelectorAll(".admin-content .content-view");
  views.forEach(view => view.classList.remove("active"));
  
  const targetView = document.getElementById(`view-${tabId}`);
  if (targetView) targetView.classList.add("active");

  if (tabId === 'payroll') {
    calculatePayrollDemo();
  }
}

function navigateMobile(screenId) {
  activeMobileScreen = screenId;
  const screens = document.querySelectorAll("#phone-app-screen .mobile-screen-view");
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(`mobile-${screenId}`).classList.add("active");

  const footerBtns = document.querySelectorAll(".phone-nav-footer .nav-item");
  footerBtns.forEach(btn => btn.classList.remove("active"));
  
  const activeBtn = document.getElementById(`mobile-footer-${screenId}`);
  if (activeBtn) activeBtn.classList.add("active");

  if (screenId === 'attendance') {
    setTimeout(() => {
      leafletMap.invalidateSize();
      updateCoordinates(currentGpsCoords[0], currentGpsCoords[1]);
    }, 200);
  }
}

async function bypassMobileLogin() {
  navigateMobile("home");
  await renderAll();
}

async function mobileClockAction() {
  const empId = activeMobileEmpId;
  const emp = liveDb.employees.find(e => e.id === empId);
  if (!emp) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const locationSpan = document.getElementById("gps-display-status").dataset.fullLocation || "Colombo, LK (6.9271, 79.8612)";

  let attendanceToday = liveDb.attendance.find(a => a.empId === empId && a.date === todayStr);

  if (!attendanceToday) {
    const newAtt = {
      empId,
      date: todayStr,
      clockIn: timeStr,
      clockOut: "",
      hours: 0,
      location: locationSpan,
      device: "Mobile App"
    };
    await DB_ENGINE.saveAttendance(newAtt);
    emp.status = "online";
    await DB_ENGINE.saveEmployee(emp);
  } else if (attendanceToday.clockIn && !attendanceToday.clockOut) {
    attendanceToday.clockOut = timeStr;
    const inTime = parseTime(attendanceToday.clockIn);
    const outTime = parseTime(timeStr);
    let diff = (outTime - inTime) / (1000 * 60 * 60);
    if (diff <= 0) diff = 8.0;
    attendanceToday.hours = parseFloat(diff.toFixed(1));
    
    await DB_ENGINE.saveAttendance(attendanceToday);
    emp.status = "offline";
    await DB_ENGINE.saveEmployee(emp);
  }

  await renderAll();
}

function parseTime(timeStr) {
  const parts = timeStr.split(' ');
  const hm = parts[0].split(':');
  let hours = parseInt(hm[0]);
  const minutes = parseInt(hm[1]);
  const ampm = parts[1];
  
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

async function submitMobileLeave(event) {
  event.preventDefault();
  const empId = activeMobileEmpId;
  const type = document.getElementById("m-leave-type").value;
  const start = document.getElementById("m-leave-start").value;
  const end = document.getElementById("m-leave-end").value;
  const reason = document.getElementById("m-leave-reason").value;

  if (!start || !end || !reason) {
    alert("Please complete the fields.");
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const newLeave = {
    id: "L" + (liveDb.leaves.length + 100).toString(),
    empId,
    type,
    start,
    end,
    reason,
    status: "Pending",
    appliedOn: todayStr,
    decider: ""
  };

  await DB_ENGINE.saveLeave(newLeave);
  await renderAll();
  
  document.getElementById("mobile-leave-form").reset();
  alert("Leave application submitted successfully! Review it in the Admin Dashboard.");
}

function selectMockReceipt() {
  chosenReceiptIndex = (chosenReceiptIndex + 1) % RECEIPT_PRESETS.length;
  const url = RECEIPT_PRESETS[chosenReceiptIndex];
  
  const filename = `receipt_invoice_#0${chosenReceiptIndex + 4}.jpg`;
  document.getElementById("receipt-filename").textContent = filename;
  document.getElementById("receipt-upload-preview").dataset.receiptUrl = url;
  document.getElementById("receipt-upload-preview").style.borderColor = "var(--color-success)";
}

async function submitMobileClaim(event) {
  event.preventDefault();
  const empId = activeMobileEmpId;
  const category = document.getElementById("m-claim-category").value;
  const amount = parseFloat(document.getElementById("m-claim-amount").value);
  const desc = document.getElementById("m-claim-desc").value;
  const receiptUrl = document.getElementById("receipt-upload-preview").dataset.receiptUrl || RECEIPT_PRESETS[0];

  if (!amount || !desc) {
    alert("Please complete claim parameters.");
    return;
  }

  const newClaim = {
    id: "C" + (liveDb.claims.length + 100).toString(),
    empId,
    category,
    amount,
    desc,
    receipt: receiptUrl,
    status: "Pending"
  };

  await DB_ENGINE.saveClaim(newClaim);
  await renderAll();

  document.getElementById("mobile-claims-form").reset();
  document.getElementById("receipt-filename").textContent = "";
  document.getElementById("receipt-upload-preview").removeAttribute("data-receipt-url");
  document.getElementById("receipt-upload-preview").style.borderColor = "var(--glass-border)";
  
  alert("Expense claim submitted! Check it under the Admin Claims tab.");
}

function mobileOpenPayslip(payslipId) {
  const ps = liveDb.payslips.find(p => p.id === payslipId);
  if (!ps) return;
  
  const emp = liveDb.employees.find(e => e.id === ps.empId);
  if (emp) {
    document.getElementById("payroll-employee-select").value = emp.id;
    loadEmployeePayrollData();
    switchAdminTab("payroll", document.getElementById("nav-payroll"));
    printPayslip();
  }
}

async function quickApproveLeave(leaveId) {
  await decideLeave(leaveId, 'Approved');
}

async function decideLeave(leaveId, decision) {
  const leave = liveDb.leaves.find(l => l.id === leaveId);
  if (!leave) return;

  leave.status = decision;
  leave.decider = "Samantha Perera";

  if (decision === 'Approved') {
    const emp = liveDb.employees.find(e => e.id === leave.empId);
    if (emp && emp.leaveBalances[leave.type] !== undefined) {
      const d1 = new Date(leave.start);
      const d2 = new Date(leave.end);
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      emp.leaveBalances[leave.type] = Math.max(0, emp.leaveBalances[leave.type] - diffDays);
      await DB_ENGINE.saveEmployee(emp);
    }
  }

  await DB_ENGINE.saveLeave(leave);
  await renderAll();
}

async function decideClaim(claimId, decision) {
  const claim = liveDb.claims.find(c => c.id === claimId);
  if (!claim) return;

  claim.status = decision;
  claim.decider = "Samantha Perera";

  await DB_ENGINE.saveClaim(claim);
  await renderAll();
}

function showReceiptModal(imgUrl) {
  document.getElementById("receipt-modal-img").src = imgUrl;
  openModal('receipt-view-modal');
}

async function adminAddEmployee(event) {
  event.preventDefault();
  const name = document.getElementById("emp-name").value;
  const email = document.getElementById("emp-email").value;
  const role = document.getElementById("emp-role").value;
  const dept = document.getElementById("emp-dept").value;
  const salary = parseFloat(document.getElementById("emp-salary").value) || 75000;
  const allowance = parseFloat(document.getElementById("emp-allowance").value) || 10000;
  const phone = document.getElementById("emp-phone").value;
  let avatar = document.getElementById("emp-avatar").value;

  if (!avatar) {
    avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100";
  }

  const idNum = liveDb.employees.length + 1;
  const newId = "EMP0" + idNum.toString().padStart(2, '0');

  const newEmp = {
    id: newId,
    name,
    email,
    role,
    dept,
    salary,
    allowance,
    phone,
    epfNo: `EPF/2349/E${idNum.toString().padStart(2, '0')}`,
    avatar,
    status: "offline",
    leaveBalances: { Annual: 14, Casual: 7, Medical: 10 }
  };

  await DB_ENGINE.saveEmployee(newEmp);
  await renderAll();
  closeModal('add-employee-modal');
  document.getElementById("add-employee-form").reset();
}

async function adminAssignGoal(event) {
  event.preventDefault();
  const empId = document.getElementById("kpi-emp-select").value;
  const title = document.getElementById("kpi-title").value;
  const completion = parseInt(document.getElementById("kpi-completion").value) || 0;
  const score = parseFloat(document.getElementById("kpi-rating").value) || 3.0;
  const feedback = document.getElementById("kpi-feedback").value;

  const newGoal = { empId, title, completion, score, feedback };

  await DB_ENGINE.saveKPI(newGoal);
  await renderAll();
  closeModal('add-kpi-modal');
  document.getElementById("add-kpi-form").reset();
}

function exportAttendance() {
  let csv = "Employee,Date,Clock In,Clock Out,Hours Worked,Location\n";
  liveDb.attendance.forEach(att => {
    const emp = liveDb.employees.find(e => e.id === att.empId);
    const name = emp ? emp.name : "Unknown";
    csv += `"${name}","${att.date}","${att.clockIn}","${att.clockOut}",${att.hours},"${att.location.replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "AuraHR_Attendance_Report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove("hidden");
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add("hidden");
}

function toggleGuide() {
  const guide = document.getElementById("demo-guide");
  if (guide) guide.classList.toggle("hidden");
}
