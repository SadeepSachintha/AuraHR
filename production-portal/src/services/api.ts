import type { Employee, Attendance, Leave, Claim, KPI, Project, Task } from '../types';
import * as mock from './mockData';

// Storage key for localStorage fallback
const LOCAL_STORAGE_KEY = 'aura_hr_prod_db';

interface DatabaseSchema {
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  claims: Claim[];
  kpis: KPI[];
  projects: Project[];
  tasks: Task[];
}

// Initialize Local DB if empty
const initLocalStorageDB = (): DatabaseSchema => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        employees: parsed.employees || mock.INITIAL_EMPLOYEES,
        attendance: parsed.attendance || mock.INITIAL_ATTENDANCE,
        leaves: parsed.leaves || mock.INITIAL_LEAVES,
        claims: parsed.claims || mock.INITIAL_CLAIMS,
        kpis: parsed.kpis || mock.INITIAL_KPIS,
        projects: parsed.projects || mock.INITIAL_PROJECTS,
        tasks: parsed.tasks || mock.INITIAL_TASKS,
      };
    } catch (e) {
      console.error("Local storage corrupt. Resetting.", e);
    }
  }
  
  const initial: DatabaseSchema = {
    employees: mock.INITIAL_EMPLOYEES,
    attendance: mock.INITIAL_ATTENDANCE,
    leaves: mock.INITIAL_LEAVES,
    claims: mock.INITIAL_CLAIMS,
    kpis: mock.INITIAL_KPIS,
    projects: mock.INITIAL_PROJECTS,
    tasks: mock.INITIAL_TASKS,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

let localDb = initLocalStorageDB();

const saveLocalDb = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localDb));
};

function mapEmployeeFromPg(pg: any): Employee {
  return {
    id: pg.id,
    name: pg.name,
    email: pg.email,
    role: pg.role,
    dept: pg.dept,
    salary: parseFloat(pg.salary),
    allowance: parseFloat(pg.allowance),
    phone: pg.phone,
    epf_no: pg.epf_no,
    avatar: pg.avatar,
    status: pg.status,
    leave_balances: typeof pg.leave_balances === 'string' ? JSON.parse(pg.leave_balances) : pg.leave_balances
  };
}

function mapEmployeeToPg(emp: Employee) {
  return {
    id: emp.id,
    name: emp.name,
    email: emp.email,
    role: emp.role,
    dept: emp.dept,
    salary: emp.salary,
    allowance: emp.allowance,
    phone: emp.phone,
    epf_no: emp.epf_no,
    avatar: emp.avatar,
    status: emp.status,
    leave_balances: emp.leave_balances
  };
}

function mapAttendanceFromPg(pg: any): Attendance {
  return {
    id: pg.id,
    emp_id: pg.emp_id,
    date: pg.date,
    clock_in: pg.clock_in,
    clock_out: pg.clock_out,
    hours: parseFloat(pg.hours),
    location: pg.location,
    device: pg.device
  };
}

function mapAttendanceToPg(att: Attendance) {
  const mapped: any = {
    emp_id: att.emp_id,
    date: att.date,
    clock_in: att.clock_in,
    clock_out: att.clock_out,
    hours: att.hours,
    location: att.location,
    device: att.device
  };
  if (att.id) mapped.id = att.id;
  return mapped;
}

function getApiUrl(endpoint: string): string {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocalhost) {
    return `/api/${endpoint}`;
  }
  const path = window.location.pathname;
  if (path.includes('/api/')) {
    return path.substring(0, path.indexOf('/api/')) + '/api/' + endpoint;
  }
  return `/api/${endpoint}`;
}

export const API_SERVICE = {
  isSaaSActive: false,

  init: async function (companyId: string): Promise<boolean> {
    try {
      const res = await fetch(getApiUrl('employees'), {
        headers: { 'X-Company-ID': companyId }
      });
      if (res.ok) {
        this.isSaaSActive = true;
      } else {
        this.isSaaSActive = false;
      }
    } catch (err) {
      console.warn("Backend API not reachable. Using local sandbox fallback.");
      this.isSaaSActive = false;
    }
    return this.isSaaSActive;
  },

  getEmployees: async function (companyId: string): Promise<Employee[]> {
    if (this.isSaaSActive) {
      try {
        const res = await fetch(getApiUrl('employees'), {
          headers: { 'X-Company-ID': companyId }
        });
        if (res.ok) {
          const data = await res.json();
          return data.map(mapEmployeeFromPg);
        }
      } catch (e) {
        console.error("Error fetching employees", e);
      }
    }
    return localDb.employees;
  },

  saveEmployee: async function (emp: Employee, companyId: string): Promise<void> {
    if (this.isSaaSActive) {
      try {
        await fetch(getApiUrl('employees'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Company-ID': companyId
          },
          body: JSON.stringify(mapEmployeeToPg(emp))
        });
        return;
      } catch (e) {
        console.error("Error saving employee to API", e);
      }
    }
    const idx = localDb.employees.findIndex(e => e.id === emp.id);
    if (idx !== -1) {
      localDb.employees[idx] = emp;
    } else {
      localDb.employees.push(emp);
    }
    saveLocalDb();
  },

  getAttendance: async function (companyId: string): Promise<Attendance[]> {
    if (this.isSaaSActive) {
      try {
        const res = await fetch(getApiUrl('attendance'), {
          headers: { 'X-Company-ID': companyId }
        });
        if (res.ok) {
          const data = await res.json();
          return data.map(mapAttendanceFromPg);
        }
      } catch (e) {
        console.error("Error fetching attendance", e);
      }
    }
    return localDb.attendance;
  },

  saveAttendance: async function (att: Attendance, companyId: string): Promise<{ success: boolean; error?: string }> {
    if (this.isSaaSActive) {
      try {
        const res = await fetch(getApiUrl('attendance'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Company-ID': companyId
          },
          body: JSON.stringify(mapAttendanceToPg(att))
        });
        const result = await res.json();
        if (res.ok) {
          return { success: true };
        } else {
          return { success: false, error: result.error || 'Server error saving attendance.' };
        }
      } catch (e: any) {
        console.error("Error saving attendance to API", e);
        return { success: false, error: 'Network failure: ' + e.message };
      }
    }
    
    if (att.id) {
      const idx = localDb.attendance.findIndex(a => a.id === att.id);
      if (idx !== -1) localDb.attendance[idx] = att;
    } else {
      const idx = localDb.attendance.findIndex(a => a.emp_id === att.emp_id && a.date === att.date);
      if (idx !== -1) {
        att.id = localDb.attendance[idx].id;
        localDb.attendance[idx] = att;
      } else {
        att.id = Date.now();
        localDb.attendance.push(att);
      }
    }
    saveLocalDb();
    return { success: true };
  },

  getLeaves: async function (companyId: string): Promise<Leave[]> {
    if (this.isSaaSActive) {
      try {
        const res = await fetch(getApiUrl('leaves'), {
          headers: { 'X-Company-ID': companyId }
        });
        if (res.ok) {
          const data = await res.json();
          return data.map((pg: any) => ({
            id: pg.id,
            emp_id: pg.emp_id,
            type: pg.type,
            start: pg.start,
            end: pg.end,
            reason: pg.reason,
            status: pg.status,
            applied_on: pg.applied_on,
            decider: pg.decider
          }));
        }
      } catch (e) {
        console.error("Error fetching leaves", e);
      }
    }
    return localDb.leaves;
  },

  saveLeave: async function (l: Leave, companyId: string): Promise<void> {
    if (this.isSaaSActive) {
      try {
        const mapped = {
          id: l.id,
          emp_id: l.emp_id,
          type: l.type,
          start: l.start,
          end: l.end,
          reason: l.reason,
          status: l.status,
          applied_on: l.applied_on,
          decider: l.decider
        };
        await fetch(getApiUrl('leaves'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Company-ID': companyId
          },
          body: JSON.stringify(mapped)
        });
        return;
      } catch (e) {
        console.error("Error saving leave to API", e);
      }
    }
    const idx = localDb.leaves.findIndex(x => x.id === l.id);
    if (idx !== -1) {
      localDb.leaves[idx] = l;
    } else {
      localDb.leaves.push(l);
    }
    saveLocalDb();
  },

  getClaims: async function (companyId: string): Promise<Claim[]> {
    if (this.isSaaSActive) {
      try {
        const res = await fetch(getApiUrl('claims'), {
          headers: { 'X-Company-ID': companyId }
        });
        if (res.ok) {
          const data = await res.json();
          return data.map((pg: any) => ({
            id: pg.id,
            emp_id: pg.emp_id,
            category: pg.category,
            amount: parseFloat(pg.amount),
            description: pg.description,
            receipt: pg.receipt,
            status: pg.status,
            decider: pg.decider
          }));
        }
      } catch (e) {
        console.error("Error fetching claims", e);
      }
    }
    return localDb.claims;
  },

  saveClaim: async function (c: Claim, companyId: string): Promise<void> {
    if (this.isSaaSActive) {
      try {
        const mapped = {
          id: c.id,
          emp_id: c.emp_id,
          category: c.category,
          amount: c.amount,
          description: c.description,
          receipt: c.receipt,
          status: c.status,
          decider: c.decider
        };
        await fetch(getApiUrl('claims'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Company-ID': companyId
          },
          body: JSON.stringify(mapped)
        });
        return;
      } catch (e) {
        console.error("Error saving claim to API", e);
      }
    }
    const idx = localDb.claims.findIndex(x => x.id === c.id);
    if (idx !== -1) {
      localDb.claims[idx] = c;
    } else {
      localDb.claims.push(c);
    }
    saveLocalDb();
  },

  getKPIs: async function (companyId: string): Promise<KPI[]> {
    if (this.isSaaSActive) {
      try {
        const res = await fetch(getApiUrl('kpis'), {
          headers: { 'X-Company-ID': companyId }
        });
        if (res.ok) {
          const data = await res.json();
          return data.map((pg: any) => ({
            emp_id: pg.emp_id,
            title: pg.title,
            completion: parseInt(pg.completion),
            score: parseFloat(pg.score),
            feedback: pg.feedback
          }));
        }
      } catch (e) {
        console.error("Error fetching KPIs", e);
      }
    }
    return localDb.kpis;
  },

  saveKPI: async function (k: KPI, companyId: string): Promise<void> {
    if (this.isSaaSActive) {
      try {
        const mapped = {
          emp_id: k.emp_id,
          title: k.title,
          completion: k.completion,
          score: k.score,
          feedback: k.feedback
        };
        await fetch(getApiUrl('kpis'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Company-ID': companyId
          },
          body: JSON.stringify(mapped)
        });
        return;
      } catch (e) {
        console.error("Error saving KPI to API", e);
      }
    }
    const idx = localDb.kpis.findIndex(x => x.emp_id === k.emp_id);
    if (idx !== -1) {
      localDb.kpis[idx] = k;
    } else {
      localDb.kpis.push(k);
    }
    saveLocalDb();
  },

  getProjects: async function (companyId: string): Promise<Project[]> {
    if (this.isSaaSActive) {
      try {
        const res = await fetch(getApiUrl('projects'), {
          headers: { 'X-Company-ID': companyId }
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.error("Error fetching projects", e);
      }
    }
    return localDb.projects;
  },

  saveProject: async function (proj: Project, companyId: string): Promise<void> {
    if (this.isSaaSActive) {
      try {
        await fetch(getApiUrl('projects'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Company-ID': companyId
          },
          body: JSON.stringify(proj)
        });
        return;
      } catch (e) {
        console.error("Error saving project to API", e);
      }
    }
    const idx = localDb.projects.findIndex(p => p.id === proj.id);
    if (idx !== -1) {
      localDb.projects[idx] = proj;
    } else {
      localDb.projects.push(proj);
    }
    saveLocalDb();
  },

  getTasks: async function (companyId: string): Promise<Task[]> {
    if (this.isSaaSActive) {
      try {
        const res = await fetch(getApiUrl('tasks'), {
          headers: { 'X-Company-ID': companyId }
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.error("Error fetching tasks", e);
      }
    }
    return localDb.tasks;
  },

  saveTask: async function (t: Task, companyId: string): Promise<void> {
    if (this.isSaaSActive) {
      try {
        await fetch(getApiUrl('tasks'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Company-ID': companyId
          },
          body: JSON.stringify(t)
        });
        return;
      } catch (e) {
        console.error("Error saving task to API", e);
      }
    }
    const idx = localDb.tasks.findIndex(x => x.id === t.id);
    if (idx !== -1) {
      localDb.tasks[idx] = t;
    } else {
      localDb.tasks.push(t);
    }
    saveLocalDb();
  },

  resetData: async function (companyId: string): Promise<void> {
    if (this.isSaaSActive) {
      try {
        await fetch(getApiUrl('reset'), {
          method: 'POST',
          headers: { 'X-Company-ID': companyId }
        });
      } catch (e) {
        console.error("Error resetting Cloud DB", e);
      }
    }
    localDb = {
      employees: mock.INITIAL_EMPLOYEES,
      attendance: mock.INITIAL_ATTENDANCE,
      leaves: mock.INITIAL_LEAVES,
      claims: mock.INITIAL_CLAIMS,
      kpis: mock.INITIAL_KPIS,
      projects: mock.INITIAL_PROJECTS,
      tasks: mock.INITIAL_TASKS,
    };
    saveLocalDb();
  }
};
