const { createClient } = require('@supabase/supabase-js');

// Helper for HTTP Response headers (CORS & JSON type)
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Company-ID',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.handler = async (event, context) => {
  // 1. Handle CORS Preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // 2. Validate Supabase environment credentials
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Supabase environment keys are missing on the Netlify console." })
    };
  }

  // Initialize Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 3. Extract Tenant ID (Company Isolation)
  const companyId = event.headers['x-company-id'] || 'company_aura';

  // 4. Parse dynamic route
  const path = event.path;
  let route = "";
  if (path.includes('/api/')) {
    route = path.substring(path.indexOf('/api/') + 5);
  } else if (path.includes('/functions/api/')) {
    route = path.substring(path.indexOf('/functions/api/') + 15);
  } else {
    route = path.split('/').pop();
  }
  route = route.split('/')[0]; // Get core resource name

  const method = event.httpMethod;

  try {
    // 5. Route Handling Logic
    switch (route) {
      case 'employees':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('company_id', companyId)
            .order('id', { ascending: true });
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } else if (method === 'POST') {
          const bodyData = JSON.parse(event.body);
          bodyData.company_id = companyId; // enforce tenant isolation
          
          const { data, error } = await supabase
            .from('employees')
            .upsert(bodyData);
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        break;

      case 'attendance':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('company_id', companyId)
            .order('id', { ascending: true });
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } else if (method === 'POST') {
          const bodyData = JSON.parse(event.body);
          bodyData.company_id = companyId;
          
          // Geofencing verification for mobile clock-in requests
          const isClockIn = bodyData.clock_in && !bodyData.clock_out;
          if (isClockIn) {
            let lat = bodyData.latitude;
            let lng = bodyData.longitude;
            
            // Attempt to parse coordinates from the location string if not explicitly passed
            if ((!lat || !lng) && bodyData.location) {
              const match = bodyData.location.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
              if (match) {
                lat = parseFloat(match[1]);
                lng = parseFloat(match[2]);
              }
            }
            
            if (lat && lng) {
              const { data: employee, error: empErr } = await supabase
                .from('employees')
                .select('home_office_lat, home_office_lng, geofence_radius_meters')
                .eq('id', bodyData.emp_id)
                .single();
                
              if (!empErr && employee && employee.home_office_lat && employee.home_office_lng) {
                const distance = calculateDistance(
                  parseFloat(lat),
                  parseFloat(lng),
                  parseFloat(employee.home_office_lat),
                  parseFloat(employee.home_office_lng)
                );
                const allowedRadius = employee.geofence_radius_meters || 200;
                
                if (distance > allowedRadius) {
                  return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                      success: false,
                      error: `Geofence violation: You are ${Math.round(distance)}m away from the office. Required within ${allowedRadius}m.`
                    })
                  };
                }
              }
            }
          }
          
          let error;
          if (bodyData.id) {
            const { error: err } = await supabase
              .from('attendance')
              .update(bodyData)
              .eq('id', bodyData.id);
            error = err;
          } else {
            const { error: err } = await supabase
              .from('attendance')
              .insert([bodyData]);
            error = err;
          }
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        break;

      case 'devices':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('mobile_devices')
            .select('*')
            .order('id', { ascending: true });
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } else if (method === 'POST') {
          const bodyData = JSON.parse(event.body);
          const { data, error } = await supabase
            .from('mobile_devices')
            .upsert(bodyData, { onConflict: 'device_token' });
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        break;

      case 'leaves':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('leaves')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: true });
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } else if (method === 'POST') {
          const bodyData = JSON.parse(event.body);
          bodyData.company_id = companyId;
          
          const { data, error } = await supabase
            .from('leaves')
            .upsert(bodyData);
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        break;

      case 'claims':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('claims')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: true });
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } else if (method === 'POST') {
          const bodyData = JSON.parse(event.body);
          bodyData.company_id = companyId;
          
          const { data, error } = await supabase
            .from('claims')
            .upsert(bodyData);
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        break;

      case 'payslips':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('payslips')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: true });
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } else if (method === 'POST') {
          const bodyData = JSON.parse(event.body);
          bodyData.company_id = companyId;
          
          // Truncate existing payslips for employee in same month to avoid duplicates
          await supabase
            .from('payslips')
            .delete()
            .eq('company_id', companyId)
            .eq('emp_id', bodyData.emp_id)
            .eq('month', bodyData.month);
            
          const { data, error } = await supabase
            .from('payslips')
            .insert([bodyData]);
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        break;

      case 'projects':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('company_id', companyId)
            .order('id', { ascending: true });
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } else if (method === 'POST') {
          const bodyData = JSON.parse(event.body);
          bodyData.company_id = companyId;
          const { data, error } = await supabase
            .from('projects')
            .upsert(bodyData);
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        break;

      case 'tasks':
        if (method === 'GET') {
          // Parse query filters
          const queryParams = event.queryStringParameters || {};
          let empFilter = queryParams.emp_id || '';
          if (empFilter.startsWith('eq.')) {
            empFilter = empFilter.substring(3);
          }
          
          let query = supabase
            .from('tasks')
            .select('*')
            .eq('company_id', companyId);
            
          if (empFilter) {
            query = query.eq('emp_id', empFilter);
          }
          
          const { data, error } = await query.order('id', { ascending: true });
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } else if (method === 'POST') {
          const bodyData = JSON.parse(event.body);
          bodyData.company_id = companyId;
          const { data, error } = await supabase
            .from('tasks')
            .upsert(bodyData);
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        break;

      case 'kpis':
        if (method === 'GET') {
          const { data, error } = await supabase
            .from('kpis')
            .select('*')
            .eq('company_id', companyId);
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } else if (method === 'POST') {
          const bodyData = JSON.parse(event.body);
          bodyData.company_id = companyId;
          
          const { data, error } = await supabase
            .from('kpis')
            .upsert(bodyData);
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        break;

      case 'reset':
        if (method === 'POST') {
          // 1. Wipe only this company's tables
          await supabase.from('tasks').delete().eq('company_id', companyId);
          await supabase.from('projects').delete().eq('company_id', companyId);
          await supabase.from('kpis').delete().eq('company_id', companyId);
          await supabase.from('payslips').delete().eq('company_id', companyId);
          await supabase.from('claims').delete().eq('company_id', companyId);
          await supabase.from('leaves').delete().eq('company_id', companyId);
          await supabase.from('attendance').delete().eq('company_id', companyId);
          await supabase.from('employees').delete().eq('company_id', companyId);

          // Default Employees definition
          const defaultEmployees = [
            { id: "EMP001", name: "Kasun Silva", email: "kasun.s@aurahr.io", role: "Senior Software Engineer", dept: "Engineering", salary: 135000, allowance: 25000, phone: "+94 77 123 4567", epf_no: "EPF/2349/E01", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100", status: "online", company_id: companyId },
            { id: "EMP002", name: "Dilini Fernando", email: "dilini.f@aurahr.io", role: "Lead UI/UX Designer", dept: "Product", salary: 120000, allowance: 15000, phone: "+94 77 987 6543", epf_no: "EPF/2349/E02", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100", status: "online", company_id: companyId },
            { id: "EMP003", name: "Fathima Rizna", email: "rizna.f@aurahr.io", role: "HR Operations Manager", dept: "Human Resources", salary: 110000, allowance: 10000, phone: "+94 71 555 4321", epf_no: "EPF/2349/HR01", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=100&h=100", status: "offline", company_id: companyId },
            { id: "EMP004", name: "Roshan Perera", email: "roshan.p@aurahr.io", role: "Marketing Specialist", dept: "Marketing", salary: 85000, allowance: 8000, phone: "+94 72 333 4444", epf_no: "EPF/2349/M04", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100", status: "offline", company_id: companyId },
            { id: "EMP005", name: "Sajith de Silva", email: "sajith.d@aurahr.io", role: "Senior Accountant", dept: "Finance", salary: 105000, allowance: 12000, phone: "+94 77 444 8888", epf_no: "EPF/2349/F05", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100", status: "online", company_id: companyId }
          ];
          await supabase.from('employees').insert(defaultEmployees);

          // Default Projects
          const defaultProjects = [
            { id: "P-1", name: "Aura Web Portal v2.0", status: "Active", deadline: "2026-08-15", progress: 68, company_id: companyId },
            { id: "P-2", name: "Mobile Biometric Engine", status: "Active", deadline: "2026-07-20", progress: 45, company_id: companyId },
            { id: "P-3", name: "Compliance & Payroll Audit", status: "Completed", deadline: "2026-06-30", progress: 100, company_id: companyId }
          ];
          await supabase.from('projects').insert(defaultProjects);

          // Default Tasks
          const defaultTasks = [
            { id: "T-1", project_id: "P-1", emp_id: "EMP001", title: "Migrate Portal to React & Tailwind CSS", status: "in-progress", due_date: "2026-07-05", company_id: companyId },
            { id: "T-2", project_id: "P-1", emp_id: "EMP002", title: "Implement Glassmorphism Dark Mode Styling", status: "completed", due_date: "2026-06-28", company_id: companyId },
            { id: "T-3", project_id: "P-3", emp_id: "EMP005", title: "Verify Sri Lankan EPF/ETF compliance math", status: "todo", due_date: "2026-07-10", company_id: companyId },
            { id: "T-4", project_id: "P-2", emp_id: "EMP001", title: "Resolve GPS accuracy & geofence validation lag", status: "in-progress", due_date: "2026-06-25", company_id: companyId }
          ];
          await supabase.from('tasks').insert(defaultTasks);

          // Default KPI definition
          const defaultKpis = [
            { emp_id: "EMP001", title: "Complete Core HR Web modules", completion: 85, score: 4.5, feedback: "Excellent progress in mobile interface integrations.", company_id: companyId },
            { emp_id: "EMP002", title: "Redesign employee self service views", completion: 100, score: 4.8, feedback: "Stunning layout revisions; users love the glassmorphism approach.", company_id: companyId },
            { emp_id: "EMP003", title: "Update legal policy manuals", completion: 60, score: 3.9, feedback: "Good drafts, requires finishing compliance chapters.", company_id: companyId },
            { emp_id: "EMP004", title: "Launch marketing campaign", completion: 40, score: 3.5, feedback: "Need higher engagement on social channels.", company_id: companyId },
            { emp_id: "EMP005", title: "Complete auditing sheets", completion: 90, score: 4.2, feedback: "Very meticulous financial calculation logs.", company_id: companyId }
          ];
          await supabase.from('kpis').insert(defaultKpis);

          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }
        break;

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: `API route '${route}' not found.` })
        };
    }
  } catch (err) {
    console.error("API Error: ", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
