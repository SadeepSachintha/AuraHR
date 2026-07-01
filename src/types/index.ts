export interface LeaveBalances {
  Annual: number;
  Casual: number;
  Medical: number;
  [key: string]: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  dept: string;
  salary: number;
  allowance: number;
  phone: string;
  epf_no: string;
  avatar: string;
  status: 'online' | 'offline';
  leave_balances: LeaveBalances;
  company_id?: string;
  created_at?: string;
}

export interface Attendance {
  id?: number;
  emp_id: string;
  date: string;
  clock_in: string;
  clock_out: string;
  hours: number;
  location: string;
  device: string;
  company_id?: string;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'On Hold';
  deadline: string;
  progress: number; // 0 to 100
}

export interface Task {
  id: string;
  project_id: string;
  emp_id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  due_date: string;
}

export interface Leave {
  id: string;
  emp_id: string;
  type: 'Casual' | 'Annual' | 'Medical';
  start: string;
  end: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  applied_on: string;
  decider?: string;
  company_id?: string;
  created_at?: string;
}

export interface Claim {
  id: string;
  emp_id: string;
  category: string;
  amount: number;
  description: string;
  receipt?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  decider?: string;
  company_id?: string;
  created_at?: string;
}

export interface KPI {
  emp_id: string;
  title: string;
  completion: number;
  score: number;
  feedback: string;
  company_id?: string;
  created_at?: string;
}
