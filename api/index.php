<?php
/**
 * AuraHR SaaS Backend Proxy for local XAMPP / Apache environments.
 * Delegates request processing securely to the cloud Supabase instance.
 */

// 1. CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, X-Company-ID");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PATCH, DELETE");
header("Content-Type: application/json");

// Handle CORS OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 2. Load Local Environment Configuration
$env = [];
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $env[trim($parts[0])] = trim($parts[1]);
        }
    }
}

$supabaseUrl = isset($env['SUPABASE_URL']) ? $env['SUPABASE_URL'] : getenv('SUPABASE_URL');
$supabaseKey = isset($env['SUPABASE_SERVICE_KEY']) ? $env['SUPABASE_SERVICE_KEY'] : getenv('SUPABASE_SERVICE_KEY');

if (!$supabaseUrl || !$supabaseKey) {
    http_response_code(500);
    echo json_encode(["error" => "Supabase environment keys are missing in local .env file."]);
    exit;
}

// 3. Resolve Request Details
$companyId = 'company_aura';
$headers = [];
if (function_exists('getallheaders')) {
    $headers = getallheaders();
} else {
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
        }
    }
}

foreach ($headers as $key => $val) {
    if (strtolower($key) === 'x-company-id') {
        $companyId = $val;
        break;
    }
}

// Parse route from query parameter (set by .htaccess rewrite)
$route = isset($_GET['route']) ? trim($_GET['route']) : '';
$route = explode('/', $route)[0]; // get base entity route (e.g. employees)

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$bodyData = json_decode($rawInput, true);

// Helper function to calculate distance using Haversine formula
function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371000; // in meters
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon / 2) * sin($dLon / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return $earthRadius * $c;
}

// 4. Helper Function to call Supabase REST API
function supabaseRequest($url, $method, $key, $body = null, $extraHeaders = []) {
    $ch = curl_init($url);
    $headers = [
        "apikey: $key",
        "Authorization: Bearer $key",
        "Content-Type: application/json",
        "Prefer: return=representation"
    ];
    foreach ($extraHeaders as $h) {
        $headers[] = $h;
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For localhost development ease

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        "status" => $httpCode,
        "data" => json_decode($response, true)
    ];
}

try {
    switch ($route) {
        case 'employees':
            if ($method === 'GET') {
                $url = "$supabaseUrl/rest/v1/employees?company_id=eq." . urlencode($companyId) . "&order=id.asc";
                $res = supabaseRequest($url, 'GET', $supabaseKey);
                http_response_code($res['status']);
                echo json_encode($res['data']);
            } elseif ($method === 'POST') {
                $bodyData['company_id'] = $companyId;
                $url = "$supabaseUrl/rest/v1/employees";
                // Postgres upsert using merge-duplicates
                $res = supabaseRequest($url, 'POST', $supabaseKey, $bodyData, ["Prefer: resolution=merge-duplicates"]);
                http_response_code($res['status']);
                echo json_encode(["success" => $res['status'] < 300]);
            }
            break;

        case 'attendance':
            if ($method === 'GET') {
                $url = "$supabaseUrl/rest/v1/attendance?company_id=eq." . urlencode($companyId) . "&order=id.asc";
                $res = supabaseRequest($url, 'GET', $supabaseKey);
                http_response_code($res['status']);
                echo json_encode($res['data']);
            } elseif ($method === 'POST') {
                $bodyData['company_id'] = $companyId;
                
                // Geofencing verification for mobile clock-in requests
                $isClockIn = isset($bodyData['clock_in']) && !empty($bodyData['clock_in']) && (!isset($bodyData['clock_out']) || empty($bodyData['clock_out']));
                if ($isClockIn) {
                    $lat = isset($bodyData['latitude']) ? floatval($bodyData['latitude']) : null;
                    $lng = isset($bodyData['longitude']) ? floatval($bodyData['longitude']) : null;
                    
                    // Attempt to parse coordinates from simulated location string if not explicitly passed
                    if (($lat === null || $lng === null) && isset($bodyData['location'])) {
                        if (preg_match('/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/', $bodyData['location'], $matches)) {
                            $lat = floatval($matches[1]);
                            $lng = floatval($matches[2]);
                        }
                    }
                    
                    if ($lat !== null && $lng !== null) {
                        // Fetch employee's geofencing details from Supabase
                        $empUrl = "$supabaseUrl/rest/v1/employees?id=eq." . urlencode($bodyData['emp_id']) . "&select=home_office_lat,home_office_lng,geofence_radius_meters";
                        $empRes = supabaseRequest($empUrl, 'GET', $supabaseKey);
                        if ($empRes['status'] === 200 && !empty($empRes['data'])) {
                            $employee = $empRes['data'][0];
                            if (isset($employee['home_office_lat']) && isset($employee['home_office_lng'])) {
                                $distance = calculateDistance(
                                    $lat,
                                    $lng,
                                    floatval($employee['home_office_lat']),
                                    floatval($employee['home_office_lng'])
                                );
                                $allowedRadius = isset($employee['geofence_radius_meters']) ? intval($employee['geofence_radius_meters']) : 200;
                                if ($distance > $allowedRadius) {
                                    http_response_code(400);
                                    echo json_encode([
                                        "success" => false,
                                        "error" => "Geofence violation: You are " . round($distance) . "m away from the office. Required within " . $allowedRadius . "m."
                                    ]);
                                    exit;
                                }
                            }
                        }
                    }
                }
                
                if (isset($bodyData['id'])) {
                    // Update existing attendance
                    $url = "$supabaseUrl/rest/v1/attendance?id=eq." . urlencode($bodyData['id']);
                    $res = supabaseRequest($url, 'PATCH', $supabaseKey, $bodyData);
                } else {
                    // Insert new attendance record
                    $url = "$supabaseUrl/rest/v1/attendance";
                    $res = supabaseRequest($url, 'POST', $supabaseKey, $bodyData);
                }
                http_response_code($res['status']);
                echo json_encode(["success" => $res['status'] < 300]);
            }
            break;

        case 'devices':
            if ($method === 'GET') {
                $url = "$supabaseUrl/rest/v1/mobile_devices?order=id.asc";
                $res = supabaseRequest($url, 'GET', $supabaseKey);
                http_response_code($res['status']);
                echo json_encode($res['data']);
            } elseif ($method === 'POST') {
                $url = "$supabaseUrl/rest/v1/mobile_devices";
                $res = supabaseRequest($url, 'POST', $supabaseKey, $bodyData, ["Prefer: resolution=merge-duplicates"]);
                http_response_code($res['status']);
                echo json_encode(["success" => $res['status'] < 300]);
            }
            break;

        case 'leaves':
            if ($method === 'GET') {
                $url = "$supabaseUrl/rest/v1/leaves?company_id=eq." . urlencode($companyId) . "&order=created_at.asc";
                $res = supabaseRequest($url, 'GET', $supabaseKey);
                http_response_code($res['status']);
                echo json_encode($res['data']);
            } elseif ($method === 'POST') {
                $bodyData['company_id'] = $companyId;
                $url = "$supabaseUrl/rest/v1/leaves";
                $res = supabaseRequest($url, 'POST', $supabaseKey, $bodyData, ["Prefer: resolution=merge-duplicates"]);
                http_response_code($res['status']);
                echo json_encode(["success" => $res['status'] < 300]);
            }
            break;

        case 'claims':
            if ($method === 'GET') {
                $url = "$supabaseUrl/rest/v1/claims?company_id=eq." . urlencode($companyId) . "&order=created_at.asc";
                $res = supabaseRequest($url, 'GET', $supabaseKey);
                http_response_code($res['status']);
                echo json_encode($res['data']);
            } elseif ($method === 'POST') {
                $bodyData['company_id'] = $companyId;
                $url = "$supabaseUrl/rest/v1/claims";
                $res = supabaseRequest($url, 'POST', $supabaseKey, $bodyData, ["Prefer: resolution=merge-duplicates"]);
                http_response_code($res['status']);
                echo json_encode(["success" => $res['status'] < 300]);
            }
            break;

        case 'payslips':
            if ($method === 'GET') {
                $url = "$supabaseUrl/rest/v1/payslips?company_id=eq." . urlencode($companyId) . "&order=created_at.asc";
                $res = supabaseRequest($url, 'GET', $supabaseKey);
                http_response_code($res['status']);
                echo json_encode($res['data']);
            } elseif ($method === 'POST') {
                $bodyData['company_id'] = $companyId;
                // Delete previous duplicate payslips in the same month
                $delUrl = "$supabaseUrl/rest/v1/payslips?company_id=eq." . urlencode($companyId) . "&emp_id=eq." . urlencode($bodyData['emp_id']) . "&month=eq." . urlencode($bodyData['month']);
                supabaseRequest($delUrl, 'DELETE', $supabaseKey);

                // Insert new payslip
                $url = "$supabaseUrl/rest/v1/payslips";
                $res = supabaseRequest($url, 'POST', $supabaseKey, $bodyData);
                http_response_code($res['status']);
                echo json_encode(["success" => $res['status'] < 300]);
            }
            break;

        case 'kpis':
            if ($method === 'GET') {
                $url = "$supabaseUrl/rest/v1/kpis?company_id=eq." . urlencode($companyId);
                $res = supabaseRequest($url, 'GET', $supabaseKey);
                http_response_code($res['status']);
                echo json_encode($res['data']);
            } elseif ($method === 'POST') {
                $bodyData['company_id'] = $companyId;
                $url = "$supabaseUrl/rest/v1/kpis";
                $res = supabaseRequest($url, 'POST', $supabaseKey, $bodyData, ["Prefer: resolution=merge-duplicates"]);
                http_response_code($res['status']);
                echo json_encode(["success" => $res['status'] < 300]);
            }
            break;

        case 'reset':
            if ($method === 'POST') {
                // Delete current tenant's data sequentially
                $entities = ['kpis', 'payslips', 'claims', 'leaves', 'attendance', 'employees'];
                foreach ($entities as $entity) {
                    $delUrl = "$supabaseUrl/rest/v1/$entity?company_id=eq." . urlencode($companyId);
                    supabaseRequest($delUrl, 'DELETE', $supabaseKey);
                }

                // Default Employees definition
                $defaultEmployees = [
                    [ "id" => "EMP001", "name" => "Kasun Silva", "email" => "kasun.s@aurahr.io", "role" => "Senior Software Engineer", "dept" => "Engineering", "salary" => 135000, "allowance" => 25000, "phone" => "+94 77 123 4567", "epf_no" => "EPF/2349/E01", "avatar" => "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100", "status" => "online", "company_id" => $companyId ],
                    [ "id" => "EMP002", "name" => "Dilini Fernando", "email" => "dilini.f@aurahr.io", "role" => "Lead UI/UX Designer", "dept" => "Product", "salary" => 120000, "allowance" => 15000, "phone" => "+94 77 987 6543", "epf_no" => "EPF/2349/E02", "avatar" => "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100", "status" => "online", "company_id" => $companyId ],
                    [ "id" => "EMP003", "name" => "Fathima Rizna", "email" => "rizna.f@aurahr.io", "role" => "HR Operations Manager", "dept" => "Human Resources", "salary" => 110000, "allowance" => 10000, "phone" => "+94 71 555 4321", "epf_no" => "EPF/2349/HR01", "avatar" => "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=100&h=100", "status" => "offline", "company_id" => $companyId ],
                    [ "id" => "EMP004", "name" => "Roshan Perera", "email" => "roshan.p@aurahr.io", "role" => "Marketing Specialist", "dept" => "Marketing", "salary" => 85000, "allowance" => 8000, "phone" => "+94 72 333 4444", "epf_no" => "EPF/2349/M04", "avatar" => "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100", "status" => "offline", "company_id" => $companyId ],
                    [ "id" => "EMP005", "name" => "Sajith de Silva", "email" => "sajith.d@aurahr.io", "role" => "Senior Accountant", "dept" => "Finance", "salary" => 105000, "allowance" => 12000, "phone" => "+94 77 444 8888", "epf_no" => "EPF/2349/F05", "avatar" => "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100", "status" => "online", "company_id" => $companyId ]
                ];
                supabaseRequest("$supabaseUrl/rest/v1/employees", 'POST', $supabaseKey, $defaultEmployees);

                // Default KPIs definition
                $defaultKpis = [
                    [ "emp_id" => "EMP001", "title" => "Complete Core HR Web modules", "completion" => 85, "score" => 4.5, "feedback" => "Excellent progress in mobile interface integrations.", "company_id" => $companyId ],
                    [ "emp_id" => "EMP002", "title" => "Redesign employee self service views", "completion" => 100, "score" => 4.8, "feedback" => "Stunning layout revisions; users love the glassmorphism approach.", "company_id" => $companyId ],
                    [ "emp_id" => "EMP003", "title" => "Update legal policy manuals", "completion" => 60, "score" => 3.9, "feedback" => "Good drafts, requires finishing compliance chapters.", "company_id" => $companyId ],
                    [ "emp_id" => "EMP004", "title" => "Launch marketing campaign", "completion" => 40, "score" => 3.5, "feedback" => "Need higher engagement on social channels.", "company_id" => $companyId ],
                    [ "emp_id" => "EMP005", "title" => "Complete auditing sheets", "completion" => 90, "score" => 4.2, "feedback" => "Very meticulous financial calculation logs.", "company_id" => $companyId ]
                ];
                $res = supabaseRequest("$supabaseUrl/rest/v1/kpis", 'POST', $supabaseKey, $defaultKpis);

                http_response_code($res['status']);
                echo json_encode(["success" => $res['status'] < 300]);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(["error" => "API route '$route' not found."]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
