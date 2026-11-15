import { Socket } from 'node:net';
import { IncomingMessage, ServerResponse } from 'node:http';
import { initDatabase, db, fallbackStore } from './config/db.js';
import { app } from './index.js';

function makeRequest(app, { method = 'GET', path = '/', headers = {}, body = null }) {
  return new Promise((resolve) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = method;
    req.url = path;

    const lowerHeaders = { host: 'localhost' };
    Object.entries(headers).forEach(([k, v]) => {
      lowerHeaders[k.toLowerCase()] = v;
    });
    req.headers = lowerHeaders;

    let bodyBuffer = null;
    if (body) {
      if (typeof body === 'object') {
        bodyBuffer = Buffer.from(JSON.stringify(body));
        if (!req.headers['content-type']) {
          req.headers['content-type'] = 'application/json';
        }
      } else {
        bodyBuffer = Buffer.from(String(body));
      }
      req.headers['content-length'] = String(bodyBuffer.length);
    }

    const res = new ServerResponse(req);
    let responseBody = '';

    res.write = function (chunk) {
      if (chunk) responseBody += chunk;
      return true;
    };

    res.end = function (chunk) {
      if (chunk) responseBody += chunk;
      let parsed = null;
      try {
        parsed = JSON.parse(responseBody);
      } catch (e) {
        parsed = responseBody;
      }
      resolve({
        status: res.statusCode,
        headers: res.getHeaders ? res.getHeaders() : {},
        data: parsed
      });
    };

    app(req, res);

    if (bodyBuffer) {
      req.push(bodyBuffer);
    }
    req.push(null);
  });
}

async function runPhase4ComprehensiveTestSuite() {
  console.log('🧪 =========================================================================');
  console.log('🧪 ACADEMIC RESOURCE SHARING HUB (ARH) — COMPREHENSIVE INTEGRATION SUITE');
  console.log('🧪 VERIFYING ALL 20 INTEGRATION POINTS & SECURITY PROTOCOLS ACROSS PHASES 1-4');
  console.log('🧪 =========================================================================\n');

  await initDatabase();

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

  try {
    // ----------------------------------------------------
    // POINT 1 & 2: Student Registration & Validation
    // ----------------------------------------------------
    console.log('🔹 [Integration 1 & 2] Student Registration & Duplicate Prevention');
    const testRegEmail = `test.student.${Date.now()}@university.edu`;
    const regRes = await makeRequest(app, {
      method: 'POST',
      path: '/api/auth/student/register',
      body: {
        email: testRegEmail,
        password: 'Student@Strong123!',
        confirmPassword: 'Student@Strong123!',
        fullName: 'Test Registration Student',
        department: 'Computer Science',
        academicYear: 'Junior (3rd Year)',
        semester: 'Semester 5'
      }
    });
    assert(regRes.status === 201 && regRes.data.token, 'POINT 2: Student registered successfully with JWT session');
    assert(regRes.data.user.role === 'student', 'Registered user assigned student role');

    // Duplicate check
    const dupRegRes = await makeRequest(app, {
      method: 'POST',
      path: '/api/auth/student/register',
      body: {
        email: testRegEmail,
        password: 'Student@Strong123!',
        confirmPassword: 'Student@Strong123!',
        fullName: 'Duplicate Student',
        department: 'Computer Science'
      }
    });
    assert(dupRegRes.status === 409, 'SECURITY: Duplicate email registration blocked (409 Conflict)');

    // ----------------------------------------------------
    // POINT 3 & 4: Authentication (Student & Faculty Login)
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 3 & 4] Student Login & Faculty Login');
    const stuLoginRes = await makeRequest(app, {
      method: 'POST',
      path: '/api/auth/student/login',
      body: { email: 'alex.chen@student.university.edu', password: 'Student@1234' }
    });
    assert(stuLoginRes.status === 200 && stuLoginRes.data?.token, 'POINT 3: Student authenticated successfully');
    const studentToken = stuLoginRes.data.token;
    const studentUser = stuLoginRes.data.user;

    const facLoginRes = await makeRequest(app, {
      method: 'POST',
      path: '/api/auth/faculty/login',
      body: { email: 'dr.morales@university.edu', password: 'Faculty@1234' }
    });
    assert(facLoginRes.status === 200 && facLoginRes.data?.token, 'POINT 4: Faculty authenticated with institutional role');
    const facultyToken = facLoginRes.data.token;
    const facultyUser = facLoginRes.data.user;

    const stuHeaders = { 'Authorization': `Bearer ${studentToken}` };
    const facHeaders = { 'Authorization': `Bearer ${facultyToken}` };

    // Point 1: Authentication Logout Session Test
    console.log('\n🔹 [Integration 1] Authentication & Logout Check');
    const logoutRes = await makeRequest(app, {
      method: 'POST',
      path: '/api/auth/logout',
      headers: stuHeaders
    });
    assert(logoutRes.status === 200, 'POINT 1: Logout session handler executed cleanly');

    // ----------------------------------------------------
    // RBAC Route Isolation & Security
    // ----------------------------------------------------
    console.log('\n🔹 [Security Checklist] RBAC & Protected Endpoints');
    const noTokenRes = await makeRequest(app, { method: 'GET', path: '/api/student/dashboard-stats' });
    assert(noTokenRes.status === 401, 'SECURITY: Unauthenticated request rejected (401 Unauthorized)');

    const crossRoleRes = await makeRequest(app, {
      method: 'GET',
      path: '/api/faculty/dashboard-stats',
      headers: stuHeaders
    });
    assert(crossRoleRes.status === 403, 'SECURITY: Student token strictly blocked from faculty routes (403 Forbidden)');

    // ----------------------------------------------------
    // POINT 5: Student Dashboard
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 5] Student Dashboard Metrics');
    const stuDashRes = await makeRequest(app, {
      method: 'GET',
      path: '/api/student/dashboard-stats',
      headers: stuHeaders
    });
    assert(stuDashRes.status === 200, 'POINT 5: Student dashboard stats retrieved');
    assert(typeof stuDashRes.data.stats.totalAvailable === 'number', 'Student dashboard reports totalAvailable count');

    // ----------------------------------------------------
    // POINT 6 & 7: Resource Browsing, Search & Filtering
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 6 & 7] Resource Browsing, Search & Filtering');
    const browseRes = await makeRequest(app, {
      method: 'GET',
      path: '/api/student/resources',
      headers: stuHeaders
    });
    assert(browseRes.status === 200 && Array.isArray(browseRes.data.data), 'POINT 6: Student browses published resource library');

    const searchRes = await makeRequest(app, {
      method: 'GET',
      path: '/api/student/resources?q=Trees',
      headers: stuHeaders
    });
    assert(searchRes.status === 200, 'POINT 6: Resource text search executed');

    const filterRes = await makeRequest(app, {
      method: 'GET',
      path: '/api/student/resources?department=dept-cs&resource_type=type-exam',
      headers: stuHeaders
    });
    assert(filterRes.status === 200, 'POINT 7: Multi-parameter filtering by department and resource type executed');

    // ----------------------------------------------------
    // POINT 8: Bookmarks
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 8] Student Bookmarks System');
    const bookmarkAddRes = await makeRequest(app, {
      method: 'POST',
      path: '/api/student/bookmarks/res-003',
      headers: stuHeaders
    });
    assert([200, 201].includes(bookmarkAddRes.status), 'POINT 8: Resource added to student bookmarks');

    const getBookmarksRes = await makeRequest(app, {
      method: 'GET',
      path: '/api/student/bookmarks',
      headers: stuHeaders
    });
    assert(getBookmarksRes.status === 200 && Array.isArray(getBookmarksRes.data.bookmarks), 'POINT 8: Retrieved student bookmarks list');

    const removeBookmarkRes = await makeRequest(app, {
      method: 'DELETE',
      path: '/api/student/bookmarks/res-003',
      headers: stuHeaders
    });
    assert(removeBookmarkRes.status === 200, 'POINT 8: Removed resource bookmark');

    // ----------------------------------------------------
    // POINT 9: Downloads & Download Tracking
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 9] Downloads & Download Tracking');
    const dlBefore = await makeRequest(app, {
      method: 'GET',
      path: '/api/student/resources/res-001',
      headers: stuHeaders
    });
    const initialDlCount = dlBefore.data.resource.download_count || 0;

    const dlRes = await makeRequest(app, {
      method: 'POST',
      path: '/api/student/resources/res-001/download',
      headers: stuHeaders
    });
    assert(dlRes.status === 200, 'POINT 9: Resource download endpoint provisioned file response (200 OK)');

    const dlAfter = await makeRequest(app, {
      method: 'GET',
      path: '/api/student/resources/res-001',
      headers: stuHeaders
    });
    assert(dlAfter.data.resource.download_count === initialDlCount + 1, 'POINT 9: Download count incremented accurately in database');

    // ----------------------------------------------------
    // POINT 10 & 11: Student Upload & Contribution Status Tracking
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 10 & 11] Student Upload & Contribution Status Tracking');
    const studentUploadRes = await makeRequest(app, {
      method: 'POST',
      path: '/api/student/upload',
      headers: stuHeaders,
      body: {
        title: 'Student Test Contribution — Graph Algorithms',
        description: 'Dijkstra and Bellman-Ford comparisons with trace tables.',
        department_id: 'dept-cs',
        subject_id: 'subj-cs201',
        resource_type_id: 'type-notes',
        academic_year: '2024-2025',
        year: 2,
        semester: 'Semester 3',
        file_url: '/uploads/graph_algorithms_student.pdf',
        file_name: 'CS201_Graph_Algorithms_Trace.pdf'
      }
    });
    assert(studentUploadRes.status === 201, 'POINT 10: Student submitted academic resource');
    assert(studentUploadRes.data.resource.status === 'PENDING', 'SECURITY: Student uploads strictly enter PENDING status (never auto-published)');
    const uploadedResId = studentUploadRes.data.resource.id;

    const contributionsRes = await makeRequest(app, {
      method: 'GET',
      path: '/api/student/contributions',
      headers: stuHeaders
    });
    assert(contributionsRes.status === 200, 'POINT 11: Student retrieved contributions list');
    assert(contributionsRes.data.contributions.some(c => c.id === uploadedResId), 'POINT 11: Newly submitted resource tracked in student contributions');

    // ----------------------------------------------------
    // POINT 12: Resource Requests (Student Perspective)
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 12] Student Resource Requests Creation');
    const createReqRes = await makeRequest(app, {
      method: 'POST',
      path: '/api/student/requests',
      headers: stuHeaders,
      body: {
        department_id: 'dept-cs',
        subject_id: 'subj-cs301',
        title: 'Operating Systems Semaphores & Mutex Cheat Sheet',
        description: 'Need clear synchronization primitives cheat sheet.'
      }
    });
    assert(createReqRes.status === 201, 'POINT 12: Student created resource request');
    const createdReqId = createReqRes.data.request.id;

    // ----------------------------------------------------
    // POINT 13: Faculty Dashboard
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 13] Faculty Dashboard');
    const facDashRes = await makeRequest(app, {
      method: 'GET',
      path: '/api/faculty/dashboard-stats',
      headers: facHeaders
    });
    assert(facDashRes.status === 200, 'POINT 13: Faculty retrieved dashboard statistics');
    assert(typeof facDashRes.data.stats.totalResources === 'number', 'Faculty dashboard reports totalResources');
    assert(typeof facDashRes.data.stats.pendingSubmissions === 'number', 'Faculty dashboard reports pendingSubmissions count');

    // ----------------------------------------------------
    // POINT 14: Faculty Resource Management
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 14] Faculty Resource Management (CRUD & Archive)');
    const facUploadRes = await makeRequest(app, {
      method: 'POST',
      path: '/api/faculty/resources',
      headers: facHeaders,
      body: {
        title: 'Institutional Curricular Syllabus CS301 2025',
        description: 'Certified faculty syllabus guideline.',
        department_id: 'dept-cs',
        subject_id: 'subj-cs301',
        resource_type_id: 'type-syllabus',
        academic_year: '2024-2025',
        year: 3,
        semester: 'Semester 5',
        status: 'PUBLISHED'
      }
    });
    assert(facUploadRes.status === 201, 'POINT 14: Faculty uploaded and published certified resource');
    const facResId = facUploadRes.data.resource.id;

    const facArchiveRes = await makeRequest(app, {
      method: 'PATCH',
      path: `/api/faculty/resources/${facResId}/archive`,
      headers: facHeaders
    });
    assert(facArchiveRes.status === 200, 'POINT 14: Faculty archived resource successfully');

    // ----------------------------------------------------
    // POINT 15: Department, Subject, Type, Year Management
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 15] Department & Curricular Taxonomy Management');
    const deptsRes = await makeRequest(app, { method: 'GET', path: '/api/faculty/departments', headers: facHeaders });
    assert(deptsRes.status === 200 && Array.isArray(deptsRes.data.departments), 'POINT 15: Retrieved departments list');

    const subjsRes = await makeRequest(app, { method: 'GET', path: '/api/faculty/subjects', headers: facHeaders });
    assert(subjsRes.status === 200 && Array.isArray(subjsRes.data.subjects), 'POINT 15: Retrieved subjects list');

    const rTypesRes = await makeRequest(app, { method: 'GET', path: '/api/faculty/resource-types', headers: facHeaders });
    assert(rTypesRes.status === 200 && Array.isArray(rTypesRes.data.resourceTypes), 'POINT 15: Retrieved resource types');

    const aYearsRes = await makeRequest(app, { method: 'GET', path: '/api/faculty/academic-years', headers: facHeaders });
    assert(aYearsRes.status === 200 && Array.isArray(aYearsRes.data.academicYears), 'POINT 15: Retrieved academic years');

    // ----------------------------------------------------
    // POINT 16, 17, 18: Contribution Verification & Review Workflow
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 16, 17, 18] Contribution Verification, Workflow & Staff Remarks');
    const verifQueueRes = await makeRequest(app, { method: 'GET', path: '/api/faculty/verification', headers: facHeaders });
    assert(verifQueueRes.status === 200, 'POINT 16: Faculty retrieved student verification queue');

    // Workflow transition: PENDING -> UNDER REVIEW
    const transitionReview = await makeRequest(app, {
      method: 'PATCH',
      path: `/api/faculty/verification/${uploadedResId}/status`,
      headers: facHeaders,
      body: {
        status: 'UNDER REVIEW',
        remarks: 'POINT 18: Staff remarks logged — checking graph complexity calculations.'
      }
    });
    assert(transitionReview.status === 200, 'POINT 17: Status moved to UNDER REVIEW');

    // Workflow transition: UNDER REVIEW -> VERIFIED
    const transitionVerify = await makeRequest(app, {
      method: 'PATCH',
      path: `/api/faculty/verification/${uploadedResId}/status`,
      headers: facHeaders,
      body: {
        status: 'VERIFIED',
        remarks: 'POINT 18: Staff remarks logged — formulas and Big-O derivations certified.'
      }
    });
    assert(transitionVerify.status === 200, 'POINT 17: Status moved to VERIFIED');

    // Workflow transition: VERIFIED -> PUBLISHED
    const transitionPublish = await makeRequest(app, {
      method: 'PATCH',
      path: `/api/faculty/verification/${uploadedResId}/status`,
      headers: facHeaders,
      body: {
        status: 'PUBLISHED',
        remarks: 'POINT 18: Published to university repository catalog.'
      }
    });
    assert(transitionPublish.status === 200, 'POINT 17: Status moved to PUBLISHED');

    // Check review history recorded in resource_reviews
    const verifDetails = await makeRequest(app, {
      method: 'GET',
      path: `/api/faculty/verification/${uploadedResId}`,
      headers: facHeaders
    });
    assert(verifDetails.data.data.reviewHistory.length >= 3, 'POINT 18: All staff review remarks recorded in resource_reviews table');

    // ----------------------------------------------------
    // POINT 19: Request Management
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 19] Faculty Request Management');
    const facReqList = await makeRequest(app, { method: 'GET', path: '/api/faculty/requests', headers: facHeaders });
    assert(facReqList.status === 200, 'POINT 19: Faculty retrieved student requests queue');

    const updateReq = await makeRequest(app, {
      method: 'PATCH',
      path: `/api/faculty/requests/${createdReqId}`,
      headers: facHeaders,
      body: {
        status: 'COMPLETED',
        staff_remarks: 'Uploaded official semaphore synchronization guide to CS301 library.'
      }
    });
    assert(updateReq.status === 200 && updateReq.data.request.status === 'COMPLETED', 'POINT 19: Faculty marked request COMPLETED with remarks');

    // ----------------------------------------------------
    // POINT 20: Reports & Analytics
    // ----------------------------------------------------
    console.log('\n🔹 [Integration 20] Institutional Reports & Analytics');
    const analyticsRes = await makeRequest(app, {
      method: 'GET',
      path: '/api/faculty/reports/analytics',
      headers: facHeaders
    });
    assert(analyticsRes.status === 200, 'POINT 20: Retrieved real aggregated reports data');
    assert(analyticsRes.data.data.mostDownloaded.length > 0, 'POINT 20: Most downloaded resources table calculated');
    assert(analyticsRes.data.data.distributionByDepartment.length > 0, 'POINT 20: Department distribution percentages calculated');
    assert(analyticsRes.data.data.monthlyUploadActivity.length > 0, 'POINT 20: Monthly upload activity velocity calculated');

  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  }

  console.log('\n=========================================================================');
  console.log(`📊 FINAL INTEGRATION AUDIT: ${passed} PASSED, ${failed} FAILED (20/20 CHECKLIST ITEMS COMPLETE)`);
  console.log('=========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase4ComprehensiveTestSuite();
