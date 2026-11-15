import http from 'http';
import { startServer } from './index.js';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
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

async function runTestSuite() {
  const TEST_PORT = 5055;
  const server = await startServer(TEST_PORT);

  console.log('🧪 ========================================================');
  console.log('🧪 ARH PHASE 1 — AUTOMATED BACKEND AUTHENTICATION TEST SUITE');
  console.log('🧪 ========================================================\n');

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

  const baseOptions = {
    hostname: '127.0.0.1',
    port: TEST_PORT,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    // 1. Health check
    console.log('🔹 Test 1: Backend Health Check');
    const healthRes = await makeRequest({ ...baseOptions, path: '/api/health', method: 'GET' });
    assert(healthRes.status === 200 && healthRes.data.status === 'healthy', 'Health check returns 200 OK and healthy status');

    // 2. Student Registration
    console.log('\n🔹 Test 2: Student Registration (Valid Payload)');
    const testStudentEmail = `jordan.miller.${Date.now()}@university.edu`;
    const regPayload = {
      fullName: 'Jordan Miller',
      email: testStudentEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      department: 'Electrical Engineering',
      academicYear: 'Sophomore (2nd Year)',
      semester: 'Semester 3'
    };
    const regRes = await makeRequest({ ...baseOptions, path: '/api/auth/student/register', method: 'POST' }, regPayload);
    assert(regRes.status === 201 && regRes.data.success === true, 'Student registration returns 201 Created');
    assert(regRes.data.user.role === 'student', 'Registered user role is verified as student');
    assert(!!regRes.data.token, 'JWT token returned on registration');
    const registeredStudentToken = regRes.data.token;

    // 3. Duplicate Registration Prevention
    console.log('\n🔹 Test 3: Duplicate Registration Prevention');
    const dupRes = await makeRequest({ ...baseOptions, path: '/api/auth/student/register', method: 'POST' }, regPayload);
    assert(dupRes.status === 409 && dupRes.data.success === false, 'Duplicate email registration correctly rejected with 409 Conflict');

    // 4. Student Registration Validation (Password Mismatch)
    console.log('\n🔹 Test 4: Password Mismatch Validation');
    const mismatchRes = await makeRequest({ ...baseOptions, path: '/api/auth/student/register', method: 'POST' }, {
      ...regPayload,
      email: `mismatch.${Date.now()}@university.edu`,
      confirmPassword: 'DifferentPassword456!'
    });
    assert(mismatchRes.status === 400 && mismatchRes.data.success === false, 'Mismatched passwords rejected with 400 Bad Request');

    // 5. Student Login with Valid Credentials
    console.log('\n🔹 Test 5: Student Login (Valid Credentials)');
    const loginRes = await makeRequest({ ...baseOptions, path: '/api/auth/student/login', method: 'POST' }, {
      email: testStudentEmail,
      password: 'SecurePassword123!'
    });
    assert(loginRes.status === 200 && loginRes.data.success === true, 'Student login returns 200 OK');
    assert(loginRes.data.user.email === testStudentEmail, 'Authenticated user details match');
    assert(loginRes.data.user.password_hash === undefined, 'Password hash is strictly excluded from response');

    // 6. Student Login with Invalid Password
    console.log('\n🔹 Test 6: Student Login (Invalid Password)');
    const invalidPassRes = await makeRequest({ ...baseOptions, path: '/api/auth/student/login', method: 'POST' }, {
      email: testStudentEmail,
      password: 'WrongPassword999'
    });
    assert(invalidPassRes.status === 401 && invalidPassRes.data.success === false, 'Invalid credentials rejected with 401 Unauthorized');

    // 7. Faculty Login with Provisioned Institutional Credentials
    console.log('\n🔹 Test 7: Faculty Login (Provisioned Account)');
    const facLoginRes = await makeRequest({ ...baseOptions, path: '/api/auth/faculty/login', method: 'POST' }, {
      email: 'dr.morales@university.edu',
      password: 'Faculty@1234'
    });
    assert(facLoginRes.status === 200 && facLoginRes.data.success === true, 'Faculty login returns 200 OK');
    assert(facLoginRes.data.user.role === 'faculty', 'Faculty account role is strictly verified as faculty');
    const facultyToken = facLoginRes.data.token;

    // 8. Cross-Portal Role Protection (Student attempting Faculty login)
    console.log('\n🔹 Test 8: Cross-Portal Role Protection (Student accessing Faculty login)');
    const crossLoginRes = await makeRequest({ ...baseOptions, path: '/api/auth/faculty/login', method: 'POST' }, {
      email: testStudentEmail,
      password: 'SecurePassword123!'
    });
    assert(crossLoginRes.status === 403 && crossLoginRes.data.success === false, 'Student prevented from logging into Faculty portal (403 Forbidden)');

    // 9. Public Faculty Registration Block
    console.log('\n🔹 Test 9: Public Faculty Registration Prevention');
    const blockFacRes = await makeRequest({ ...baseOptions, path: '/api/auth/faculty/register', method: 'POST' }, {
      email: 'newfaculty@university.edu',
      password: 'Password123!'
    });
    assert(blockFacRes.status === 403 && blockFacRes.data.success === false, 'Public faculty registration strictly blocked (403 Forbidden)');

    // 10. Session Verification (/api/auth/me)
    console.log('\n🔹 Test 10: Session Verification via JWT (/api/auth/me)');
    const meRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        ...baseOptions.headers,
        'Authorization': `Bearer ${registeredStudentToken}`
      }
    });
    assert(meRes.status === 200 && meRes.data.user.email === testStudentEmail, 'Current session verified and returns fresh user object');

    // 11. Role-Based Route Protection (RBAC)
    console.log('\n🔹 Test 11: RBAC Middleware Enforcement');
    const studentAccessRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/student-only-data',
      method: 'GET',
      headers: { ...baseOptions.headers, 'Authorization': `Bearer ${registeredStudentToken}` }
    });
    assert(studentAccessRes.status === 200, 'Student token allows access to student-only endpoint');

    const facultyAccessBlockedRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/faculty-only-data',
      method: 'GET',
      headers: { ...baseOptions.headers, 'Authorization': `Bearer ${registeredStudentToken}` }
    });
    assert(facultyAccessBlockedRes.status === 403, 'Student token strictly rejected from faculty-only endpoint (403 Forbidden)');

    const facultyAccessAllowedRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/faculty-only-data',
      method: 'GET',
      headers: { ...baseOptions.headers, 'Authorization': `Bearer ${facultyToken}` }
    });
    assert(facultyAccessAllowedRes.status === 200, 'Faculty token successfully accesses faculty-only endpoint');

    // 12. Password Reset Request
    console.log('\n🔹 Test 12: Forgot Password Request');
    const forgotRes = await makeRequest({ ...baseOptions, path: '/api/auth/forgot-password', method: 'POST' }, {
      email: testStudentEmail
    });
    assert(forgotRes.status === 200 && forgotRes.data.success === true, 'Forgot password returns 200 OK and neutral security confirmation');

    // 13. Logout Handling
    console.log('\n🔹 Test 13: Logout Endpoint');
    const logoutRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { ...baseOptions.headers, 'Authorization': `Bearer ${registeredStudentToken}` }
    });
    assert(logoutRes.status === 200 && logoutRes.data.success === true, 'Logout endpoint returns 200 OK');

    console.log('\n========================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');
  } finally {
    server.close();
  }

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
