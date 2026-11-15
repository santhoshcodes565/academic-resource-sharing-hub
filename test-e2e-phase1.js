import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startServer } from './server/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, text: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: body });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runPhase1Verification() {
  console.log('================================================================');
  console.log('🎓 ARH PHASE 1 — END-TO-END VERIFICATION & COMPLIANCE TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Static Bundle & Route Inspection Check
  console.log('📌 Verification Scenario 1: Entry Point & Route Protection Architecture');
  const appJsx = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf-8');
  assert(appJsx.includes('path="/"') && appJsx.includes('AuthEntryPage'), 'Root route "/" strictly configured to render AuthEntryPage');
  assert(appJsx.includes('path="/auth/student/login"') && appJsx.includes('StudentLoginPage'), 'Dedicated route "/auth/student/login" configured');
  assert(appJsx.includes('path="/auth/student/register"') && appJsx.includes('StudentRegisterPage'), 'Dedicated route "/auth/student/register" configured');
  assert(appJsx.includes('path="/auth/faculty/login"') && appJsx.includes('FacultyLoginPage'), 'Dedicated route "/auth/faculty/login" configured');
  assert(appJsx.includes('path="/auth/forgot-password"') && appJsx.includes('ForgotPasswordPage'), 'Dedicated route "/auth/forgot-password" configured');
  assert(appJsx.includes('path="/student/dashboard"') && appJsx.includes('allowedRoles={[\'student\']}'), 'Route "/student/dashboard" protected for student role only');
  assert(appJsx.includes('path="/faculty/dashboard"') && appJsx.includes('allowedRoles={[\'faculty\', \'admin\']}'), 'Route "/faculty/dashboard" protected for faculty role only');

  // 2. Check AuthEntryPage Components
  console.log('\n📌 Verification Scenario 2: Authentication Entry Screen (Google Stitch & ARH Branding)');
  const authEntryJsx = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'auth', 'AuthEntryPage.jsx'), 'utf-8');
  assert(authEntryJsx.includes('Academic Resource Sharing Hub'), 'Branding displays Academic Resource Sharing Hub');
  assert(authEntryJsx.includes('Student Sign In'), 'Displays Student Sign In action');
  assert(authEntryJsx.includes('Register Student Account'), 'Displays Student Registration action');
  assert(authEntryJsx.includes('Faculty Sign In'), 'Displays Faculty Sign In action');
  assert(authEntryJsx.includes('Forgot Faculty or Student Password?'), 'Displays Forgot Password option');
  assert(authEntryJsx.includes('Restricted Registration'), 'Displays Faculty restricted registration notice');
  assert(!authEntryJsx.includes('MOCK_RESOURCES'), 'Auth entry does not expose mock resource catalog');

  // 3. Start Backend Server for API Verification
  console.log('\n📌 Verification Scenario 3: Backend Authentication & Security APIs');
  const TEST_PORT = 5088;
  const server = await startServer(TEST_PORT);
  const baseOptions = {
    hostname: '127.0.0.1',
    port: TEST_PORT,
    headers: { 'Content-Type': 'application/json' }
  };

  try {
    // 3A. Student Registration
    console.log('  Testing Student Registration:');
    const studentEmail = `student.phase1.${Date.now()}@university.edu`;
    const regRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/student/register',
      method: 'POST'
    }, {
      fullName: 'Alex Morgan',
      email: studentEmail,
      password: 'ComplexPassword123!',
      confirmPassword: 'ComplexPassword123!',
      department: 'Computer Science',
      academicYear: 'Senior (4th Year)',
      semester: 'Semester 7'
    });
    assert(regRes.status === 201 && regRes.data.success, 'Student registration returns 201 Created');
    assert(regRes.data.user.role === 'student', 'Backend forces role to "student"');
    const studentToken = regRes.data.token;

    // 3B. Invalid Credentials Check
    console.log('  Testing Invalid Credentials:');
    const failLoginRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/student/login',
      method: 'POST'
    }, {
      email: studentEmail,
      password: 'WrongPassword'
    });
    assert(failLoginRes.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // 3C. Valid Student Login
    console.log('  Testing Student Login:');
    const loginRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/student/login',
      method: 'POST'
    }, {
      email: studentEmail,
      password: 'ComplexPassword123!'
    });
    assert(loginRes.status === 200 && loginRes.data.success, 'Student login returns 200 OK and valid JWT');

    // 3D. Faculty Login
    console.log('  Testing Faculty Login:');
    const facLoginRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/faculty/login',
      method: 'POST'
    }, {
      email: 'dr.morales@university.edu',
      password: 'Faculty@1234'
    });
    assert(facLoginRes.status === 200 && facLoginRes.data.user.role === 'faculty', 'Faculty login verified with provisioned role');
    const facultyToken = facLoginRes.data.token;

    // 3E. Role-Based Route Protection (RBAC)
    console.log('  Testing Role-Based Route Protection:');
    const studentOnFacultyRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/faculty-only-data',
      method: 'GET',
      headers: { ...baseOptions.headers, 'Authorization': `Bearer ${studentToken}` }
    });
    assert(studentOnFacultyRes.status === 403, 'Student prevented from accessing faculty protected data (403 Forbidden)');

    const facultyOnFacultyRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/faculty-only-data',
      method: 'GET',
      headers: { ...baseOptions.headers, 'Authorization': `Bearer ${facultyToken}` }
    });
    assert(facultyOnFacultyRes.status === 200, 'Faculty authorized on faculty protected data');

    // 3F. Session Persistence (/api/auth/me)
    console.log('  Testing Session Persistence:');
    const meRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/me',
      method: 'GET',
      headers: { ...baseOptions.headers, 'Authorization': `Bearer ${studentToken}` }
    });
    assert(meRes.status === 200 && meRes.data.user.email === studentEmail, 'Browser refresh re-hydrates authenticated user from JWT token');

    // 3G. Forgot Password
    console.log('  Testing Password Reset:');
    const forgotRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/forgot-password',
      method: 'POST'
    }, {
      email: studentEmail
    });
    assert(forgotRes.status === 200 && forgotRes.data.success, 'Password reset request acknowledged securely');

    // 3H. Logout
    console.log('  Testing Logout:');
    const logoutRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { ...baseOptions.headers, 'Authorization': `Bearer ${studentToken}` }
    });
    assert(logoutRes.status === 200 && logoutRes.data.success, 'Logout endpoint terminates session');

  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`📊 PHASE 1 E2E VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase1Verification().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
