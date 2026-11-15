import http from 'http';
import { startServer } from './index.js';

function makeRequest(options, postData = null, isFormData = false) {
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
      if (typeof postData === 'string') {
        req.write(postData);
      } else {
        req.write(JSON.stringify(postData));
      }
    }
    req.end();
  });
}

async function runStudentTestSuite() {
  const TEST_PORT = 5056;
  const server = await startServer(TEST_PORT);

  console.log('🧪 ========================================================');
  console.log('🧪 ARH PHASE 2 — AUTOMATED STUDENT PORTAL TEST SUITE');
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
    // Step 1: Health & Meta APIs
    console.log('🔹 Test 1: Academic Meta Endpoints');
    const deptsRes = await makeRequest({ ...baseOptions, path: '/api/meta/departments', method: 'GET' });
    assert(deptsRes.status === 200 && deptsRes.data.departments.length >= 6, 'Departments API returns registered academic faculties');

    const subjsRes = await makeRequest({ ...baseOptions, path: '/api/meta/subjects?department=dept-cs', method: 'GET' });
    assert(subjsRes.status === 200 && subjsRes.data.subjects.length > 0, 'Subjects API returns department course listings');

    const typesRes = await makeRequest({ ...baseOptions, path: '/api/meta/resource-types', method: 'GET' });
    assert(typesRes.status === 200 && typesRes.data.resourceTypes.length >= 5, 'Resource types API returns academic formats');

    // Step 2: Student Login
    console.log('\n🔹 Test 2: Student Authentication & Session Provisioning');
    const loginRes = await makeRequest({ ...baseOptions, path: '/api/auth/student/login', method: 'POST' }, {
      email: 'alex.chen@student.university.edu',
      password: 'Student@1234'
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Student successfully authenticated');
    const studentToken = loginRes.data.token;
    const studentUser = loginRes.data.user;

    const studentHeaders = {
      ...baseOptions.headers,
      'Authorization': `Bearer ${studentToken}`
    };

    // Step 3: Module 1 — Student Dashboard Statistics
    console.log('\n🔹 Test 3: Module 1 — Student Dashboard Statistics');
    const statsRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/dashboard-stats',
      method: 'GET',
      headers: studentHeaders
    });
    assert(statsRes.status === 200 && statsRes.data.success, 'Dashboard stats API returns 200 OK');
    assert(typeof statsRes.data.stats.totalAvailable === 'number', 'Available resources metric exists and is numeric');
    assert(typeof statsRes.data.stats.totalBookmarks === 'number', 'Total bookmarks metric calculated from DB');
    assert(typeof statsRes.data.stats.totalDownloads === 'number', 'Total downloads metric calculated from DB');
    assert(statsRes.data.stats.recentlyPublished.length > 0, 'Recently published materials list populated');

    // Step 4: Module 2 & 3 — Resource Library Search, Filter & Pagination
    console.log('\n🔹 Test 4: Modules 2 & 3 — Resource Library Query Engine');
    const libraryRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/resources?page=1&limit=5',
      method: 'GET',
      headers: studentHeaders
    });
    assert(libraryRes.status === 200 && Array.isArray(libraryRes.data.data), 'General resource library returned');
    assert(libraryRes.data.pagination.total > 0, 'Pagination metadata returned with total count');
    // Verify only PUBLISHED
    const allPublished = libraryRes.data.data.every(r => r.status === 'PUBLISHED');
    assert(allPublished, 'SECURITY: Only PUBLISHED status resources are visible in general catalog');

    // Filter by department and keyword
    const filteredRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/resources?department=dept-cs&q=recursion',
      method: 'GET',
      headers: studentHeaders
    });
    assert(filteredRes.status === 200, 'Combined filter query executed successfully');
    assert(filteredRes.data.data.length >= 1, 'Search query matched keyword "recursion" in CS department');

    // Step 5: Module 4 — Resource Details & Download
    console.log('\n🔹 Test 5: Module 4 — Resource Details & Verified Download');
    const targetResource = libraryRes.data.data[0];
    const detailsRes = await makeRequest({
      ...baseOptions,
      path: `/api/student/resources/${targetResource.id}`,
      method: 'GET',
      headers: studentHeaders
    });
    assert(detailsRes.status === 200 && detailsRes.data.resource.id === targetResource.id, 'Resource details endpoint returns complete metadata');
    assert(detailsRes.data.resource.subject_name !== undefined, 'Subject details joined in response');
    assert(typeof detailsRes.data.resource.is_bookmarked === 'boolean', 'User bookmark status dynamically resolved');

    // Download action
    const initialDownloads = detailsRes.data.resource.download_count || 0;
    const downloadRes = await makeRequest({
      ...baseOptions,
      path: `/api/student/resources/${targetResource.id}/download`,
      method: 'POST',
      headers: studentHeaders
    });
    assert(downloadRes.status === 200, 'Download endpoint returns document stream (200 OK)');
    assert(downloadRes.headers['content-disposition'].includes('attachment'), 'Content-Disposition attachment header set');

    // Verify counter increment
    const verifyDetailsRes = await makeRequest({
      ...baseOptions,
      path: `/api/student/resources/${targetResource.id}`,
      method: 'GET',
      headers: studentHeaders
    });
    assert(verifyDetailsRes.data.resource.download_count >= initialDownloads + 1, 'Download counter incremented in database');

    // Step 6: Module 5 — Bookmarks Management
    console.log('\n🔹 Test 6: Module 5 — Persistent Bookmarks');
    const bookmarkRes = await makeRequest({
      ...baseOptions,
      path: `/api/student/bookmarks/${targetResource.id}`,
      method: 'POST',
      headers: studentHeaders
    });
    assert(bookmarkRes.status === 200 || bookmarkRes.status === 201, 'Bookmark saved successfully');

    const dupBookmarkRes = await makeRequest({
      ...baseOptions,
      path: `/api/student/bookmarks/${targetResource.id}`,
      method: 'POST',
      headers: studentHeaders
    });
    assert(dupBookmarkRes.data.message.includes('already bookmarked'), 'Duplicate bookmark correctly handled without error');

    const bookmarksListRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/bookmarks',
      method: 'GET',
      headers: studentHeaders
    });
    assert(bookmarksListRes.status === 200 && bookmarksListRes.data.bookmarks.some(b => b.id === targetResource.id), 'Saved resource visible in student bookmarks list');

    const removeBookmarkRes = await makeRequest({
      ...baseOptions,
      path: `/api/student/bookmarks/${targetResource.id}`,
      method: 'DELETE',
      headers: studentHeaders
    });
    assert(removeBookmarkRes.status === 200, 'Bookmark successfully deleted');

    // Step 7: Module 6 — Upload Resource Contribution
    console.log('\n🔹 Test 7: Module 6 — Student Resource Submission (PENDING status enforcement)');
    const uploadPayload = {
      title: 'CS301 Distributed Locks and Two-Phase Commit Study Guide',
      description: 'Detailed analysis of 2PC, 3PC, and Paxos consensus with latency tradeoffs.',
      department_id: 'dept-cs',
      subject_id: 'subj-cs301',
      resource_type_id: 'type-notes',
      academic_year: '2024-2025',
      year: 3,
      semester: 'Semester 5',
      file_url: '/uploads/simulated_2pc_guide.pdf',
      file_name: 'CS301_Distributed_Locks_Guide.pdf',
      file_size: '3.4 MB',
      file_mime: 'application/pdf'
    };
    const uploadRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/upload',
      method: 'POST',
      headers: studentHeaders
    }, uploadPayload);
    assert(uploadRes.status === 201 && uploadRes.data.success, 'Student upload returns 201 Created');
    assert(uploadRes.data.resource.status === 'PENDING', 'CRITICAL SECURITY: Student contribution strictly enters PENDING status');
    const newContribId = uploadRes.data.resource.id;

    // Step 8: Module 7 — My Contributions
    console.log('\n🔹 Test 8: Module 7 — My Contributions Tracking');
    const contribsRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/contributions',
      method: 'GET',
      headers: studentHeaders
    });
    assert(contribsRes.status === 200 && contribsRes.data.contributions.length > 0, 'My contributions returns student uploads');
    const uploadedItem = contribsRes.data.contributions.find(c => c.id === newContribId);
    assert(!!uploadedItem && uploadedItem.status === 'PENDING', 'New submission visible in student contribution tracker with PENDING state');

    // Step 9: Module 8 — Resource Requests
    console.log('\n🔹 Test 9: Module 8 — Resource Requests Creation and Tracking');
    const requestPayload = {
      department_id: 'dept-cs',
      subject_id: 'subj-cs302',
      title: 'Need 2024 Database Query Tuning Exam Solutions',
      description: 'Looking for verified solutions and step-by-step query execution plan walkthroughs.'
    };
    const createReqRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/requests',
      method: 'POST',
      headers: studentHeaders
    }, requestPayload);
    assert(createReqRes.status === 201 && createReqRes.data.request.status === 'PENDING', 'Resource request created with PENDING status');

    const getReqsRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/requests',
      method: 'GET',
      headers: studentHeaders
    });
    assert(getReqsRes.status === 200 && getReqsRes.data.requests.length >= 1, 'Student submitted requests returned with tracking metadata');

    // Step 10: Module 9 — Student Profile & Editing
    console.log('\n🔹 Test 10: Module 9 — Student Profile Management & Restricted Fields');
    const profileRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/profile',
      method: 'GET',
      headers: studentHeaders
    });
    assert(profileRes.status === 200 && profileRes.data.profile.email === studentUser.email, 'Student profile fetched successfully');
    assert(profileRes.data.profile.stats !== undefined, 'Profile includes contribution and bookmark stats');

    // Update permitted fields
    const updateProfileRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/profile',
      method: 'PUT',
      headers: studentHeaders
    }, {
      full_name: 'Alex Chen (Honors)',
      semester: 'Semester 8',
      role: 'admin' // Attempt to elevate role (should be ignored)
    });
    assert(updateProfileRes.status === 200 && updateProfileRes.data.user.full_name === 'Alex Chen (Honors)', 'Permitted fields updated');
    assert(updateProfileRes.data.user.role === 'student', 'SECURITY: Student role is immutable and elevation is rejected');

    // Step 11: Security — Role Restrictions
    console.log('\n🔹 Test 11: Security & Cross-Role Enforcement');
    // Student trying to access faculty route
    const facultyAccessRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/faculty-only-data',
      method: 'GET',
      headers: studentHeaders
    });
    assert(facultyAccessRes.status === 403, 'Student access to faculty resources rejected with 403 Forbidden');

    // Unauthenticated request
    const unauthRes = await makeRequest({
      ...baseOptions,
      path: '/api/student/dashboard-stats',
      method: 'GET'
    });
    assert(unauthRes.status === 401, 'Unauthenticated request rejected with 401 Unauthorized');

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  } finally {
    server.close();
    console.log('\n========================================================');
    console.log(`📊 PHASE 2 STUDENT PORTAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================');
    if (failed > 0) process.exit(1);
    else process.exit(0);
  }
}

runStudentTestSuite();
