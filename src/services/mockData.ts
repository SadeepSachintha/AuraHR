import { Employee, Attendance, Leave, Claim, KPI, Project, Task } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP001",
    name: "Kasun Silva",
    email: "kasun.s@aurahr.io",
    role: "Senior Software Engineer",
    dept: "Engineering",
    salary: 135000,
    allowance: 25000,
    phone: "+94 77 123 4567",
    epf_no: "EPF/2349/E01",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
    status: "online",
    leave_balances: { Annual: 12, Casual: 7, Medical: 10 }
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
    epf_no: "EPF/2349/E02",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
    status: "online",
    leave_balances: { Annual: 14, Casual: 6, Medical: 10 }
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
    epf_no: "EPF/2349/HR01",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=100&h=100",
    status: "offline",
    leave_balances: { Annual: 15, Casual: 8, Medical: 10 }
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
    epf_no: "EPF/2349/M04",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100",
    status: "offline",
    leave_balances: { Annual: 10, Casual: 5, Medical: 8 }
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
    epf_no: "EPF/2349/F05",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
    status: "online",
    leave_balances: { Annual: 14, Casual: 7, Medical: 10 }
  }
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  { id: 1, emp_id: "EMP001", date: "2026-06-15", clock_in: "08:52 AM", clock_out: "05:05 PM", hours: 8.2, location: "Colombo Office HQ", device: "Mobile App" },
  { id: 2, emp_id: "EMP002", date: "2026-06-15", clock_in: "08:58 AM", clock_out: "05:15 PM", hours: 8.3, location: "Colombo Office HQ", device: "Mobile App" },
  { id: 3, emp_id: "EMP005", date: "2026-06-15", clock_in: "09:02 AM", clock_out: "05:00 PM", hours: 7.9, location: "Office Biometrics", device: "Card Reader" }
];

export const INITIAL_LEAVES: Leave[] = [
  { id: "L001", emp_id: "EMP001", type: "Casual", start: "2026-06-10", end: "2026-06-11", reason: "Family event in Kandy", status: "Approved", applied_on: "2026-06-08", decider: "Samantha Perera" },
  { id: "L002", emp_id: "EMP002", type: "Medical", start: "2026-06-14", end: "2026-06-14", reason: "Dental treatment", status: "Approved", applied_on: "2026-06-13", decider: "Samantha Perera" },
  { id: "L003", emp_id: "EMP004", type: "Annual", start: "2026-07-05", end: "2026-07-08", reason: "Trip to Nuwara Eliya", status: "Pending", applied_on: "2026-07-01", decider: "" }
];

export const INITIAL_CLAIMS: Claim[] = [
  { id: "C001", emp_id: "EMP001", category: "Travel / Mileage", amount: 4800, description: "Client visit to Galle site", receipt: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=250&h=350", status: "Pending" },
  { id: "C002", emp_id: "EMP002", category: "Internet / Broadband", amount: 3500, description: "Broadband allowance", receipt: "https://images.unsplash.com/photo-1534972195531-d756b9bda9f2?auto=format&fit=crop&q=80&w=250&h=350", status: "Approved", decider: "Samantha Perera" }
];

export const INITIAL_KPIS: KPI[] = [
  { emp_id: "EMP001", title: "Complete Core HR Web modules", completion: 85, score: 4.5, feedback: "Excellent progress in mobile interface integrations." },
  { emp_id: "EMP002", title: "Redesign employee self service views", completion: 100, score: 4.8, feedback: "Stunning layout revisions; users love the glassmorphism approach." },
  { emp_id: "EMP003", title: "Update legal policy manuals", completion: 60, score: 3.9, feedback: "Good drafts, requires finishing compliance chapters." },
  { emp_id: "EMP004", title: "Launch marketing campaign", completion: 40, score: 3.5, feedback: "Need higher engagement on social channels." },
  { emp_id: "EMP005", title: "Complete auditing sheets", completion: 90, score: 4.2, feedback: "Very meticulous financial calculation logs." }
];

export const INITIAL_PROJECTS: Project[] = [
  { id: "P-1", name: "Aura Web Portal v2.0", status: "Active", deadline: "2026-08-15", progress: 68 },
  { id: "P-2", name: "Mobile Biometric Engine", status: "Active", deadline: "2026-07-20", progress: 45 },
  { id: "P-3", name: "Compliance & Payroll Audit", status: "Completed", deadline: "2026-06-30", progress: 100 }
];

export const INITIAL_TASKS: Task[] = [
  { id: "T-1", project_id: "P-1", emp_id: "EMP001", title: "Migrate Portal to React & Tailwind CSS", status: "in-progress", due_date: "2026-07-05" },
  { id: "T-2", project_id: "P-1", emp_id: "EMP002", title: "Implement Glassmorphism Dark Mode Styling", status: "completed", due_date: "2026-06-28" },
  { id: "T-3", project_id: "P-3", emp_id: "EMP005", title: "Verify Sri Lankan EPF/ETF compliance math", status: "todo", due_date: "2026-07-10" },
  { id: "T-4", project_id: "P-2", emp_id: "EMP001", title: "Resolve GPS accuracy & geofence validation lag", status: "in-progress", due_date: "2026-06-25" }, // Overdue!
  { id: "T-5", project_id: "P-1", emp_id: "EMP003", title: "Write documentation on database multi-tenant isolation", status: "todo", due_date: "2026-07-18" }
];
