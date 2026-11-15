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
      if (typeof postData === 'string') {
        req.write(postData);
      } else {
        req.write(JSON.stringify(postData));
      }
    }
    req.end();
  });
}

async function runFacultyTestSuite() {
  const TEST_PORT = 5057;
  const server = await startServer(TEST_PORT);

  console.log('🧪 ========================================================');
  console.log('🧪 ARH PHASE 3 PART A — AUTOMATED FACULTY PORTAL TEST SUITE');
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
    // Step 1: Faculty Authentication & Session Provisioning
    console.log('🔹 Test 1: Faculty Authentication & Session Provisioning');
    const facLoginRes = await makeRequest({ ...baseOptions, path: '/api/auth/faculty/login', method: 'POST' }, {
      email: 'dr.morales@university.edu',
      password: 'Faculty@1234'
    });
    assert(facLoginRes.status === 200 && facLoginRes.data.token, 'Faculty authenticated with verified institutional credentials');
    assert(facLoginRes.data.user.role === 'faculty', 'Authenticated user role is verified as faculty');
    const facultyToken = facLoginRes.data.token;
    const facultyUser = facLoginRes.data.user;

    const facultyHeaders = {
      ...baseOptions.headers,
      'Authorization': `Bearer ${facultyToken}`
    };

    // Step 2: Role-Based Authorization & Anti-Spoofing Checks
    console.log('\n🔹 Test 2: RBAC Protection & Cross-Role Enforcement');
    // Student token
    const stuLoginRes = await makeRequest({ ...baseOptions, path: '/api/auth/student/login', method: 'POST' }, {
      email: 'alex.chen@student.university.edu',
      password: 'Student@1234'
    });
    const studentToken = stuLoginRes.data.token;
    const studentHeaders = {
      ...baseOptions.headers,
      'Authorization': `Bearer ${studentToken}`
    };

    // Attempt student access to faculty endpoints
    const stuDeniedRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/dashboard-stats',
      method: 'GET',
      headers: studentHeaders
    });
    assert(stuDeniedRes.status === 403, 'SECURITY: Student token strictly blocked from faculty dashboard (403 Forbidden)');

    const stuDeniedUpload = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/resources',
      method: 'POST',
      headers: studentHeaders
    }, { title: 'Unauthorized' });
    assert(stuDeniedUpload.status === 403, 'SECURITY: Student token strictly blocked from faculty resource management');

    // Unauthenticated request
    const unauthRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/dashboard-stats',
      method: 'GET'
    });
    assert(unauthRes.status === 401, 'SECURITY: Unauthenticated request rejected (401 Unauthorized)');

    // Step 3: Module 1 — Faculty Dashboard Database Statistics
    console.log('\n🔹 Test 3: Module 1 — Faculty Dashboard Real Database Statistics');
    const statsRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/dashboard-stats',
      method: 'GET',
      headers: facultyHeaders
    });
    assert(statsRes.status === 200 && statsRes.data.success, 'Faculty dashboard stats endpoint returns 200 OK');
    assert(typeof statsRes.data.stats.totalResources === 'number', 'Total resources metric is returned from DB');
    assert(typeof statsRes.data.stats.publishedResources === 'number', 'Published resources metric is returned');
    assert(typeof statsRes.data.stats.pendingSubmissions === 'number', 'Pending submissions metric is returned');
    assert(typeof statsRes.data.stats.underReviewSubmissions === 'number', 'Under review metric is returned');
    assert(typeof statsRes.data.stats.totalDownloads === 'number', 'Total downloads metric is returned');
    assert(typeof statsRes.data.stats.activeStudentRequests === 'number', 'Active student requests metric is returned');
    assert(Array.isArray(statsRes.data.stats.recentlyUploaded), 'Recently uploaded resources array populated');
    assert(Array.isArray(statsRes.data.stats.recentActivities), 'Recent institutional activities array populated');

    // Step 4: Module 4 — Department Management
    console.log('\n🔹 Test 4: Module 4 — Department Management (CRUD & Integrity)');
    const deptsRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/departments',
      method: 'GET',
      headers: facultyHeaders
    });
    assert(deptsRes.status === 200 && deptsRes.data.departments.length >= 6, 'Faculty departments list returned with metadata');
    assert(deptsRes.data.departments[0].subjects_count !== undefined, 'Department subjects count dynamically calculated');
    assert(deptsRes.data.departments[0].resources_count !== undefined, 'Department resources count dynamically calculated');

    // Add department
    const newDeptRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/departments',
      method: 'POST',
      headers: facultyHeaders
    }, {
      code: 'AI',
      name: 'Artificial Intelligence & Robotics',
      description: 'Department of Autonomous Intelligence and Robotics Engineering',
      icon: 'Cpu'
    });
    assert(newDeptRes.status === 201 && newDeptRes.data.department.code === 'AI', 'New department created successfully');
    const createdDeptId = newDeptRes.data.department.id;

    // Edit department
    const editDeptRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/departments/${createdDeptId}`,
      method: 'PUT',
      headers: facultyHeaders
    }, {
      name: 'Department of AI & Robotics',
      description: 'Updated description for Autonomous Intelligence'
    });
    assert(editDeptRes.status === 200 && editDeptRes.data.department.name === 'Department of AI & Robotics', 'Department metadata edited successfully');

    // Duplicate code prevention
    const dupDeptRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/departments',
      method: 'POST',
      headers: facultyHeaders
    }, {
      code: 'AI',
      name: 'Duplicate AI'
    });
    assert(dupDeptRes.status === 400, 'Duplicate department code rejected with 400 Bad Request');

    // Step 5: Module 5 — Subject Management
    console.log('\n🔹 Test 5: Module 5 — Subject Management (CRUD & Department Link)');
    const subjectsRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/subjects',
      method: 'GET',
      headers: facultyHeaders
    });
    assert(subjectsRes.status === 200 && subjectsRes.data.subjects.length >= 6, 'Subjects list fetched successfully');

    // Add subject associated with newly created department
    const newSubjRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/subjects',
      method: 'POST',
      headers: facultyHeaders
    }, {
      department_id: createdDeptId,
      code: 'AI401',
      name: 'Deep Neural Architectures & Transformers',
      year: 4,
      semester: 'Semester 7',
      description: 'Foundations of Attention mechanisms, LLMs, and multi-modal transformers.'
    });
    assert(newSubjRes.status === 201 && newSubjRes.data.subject.code === 'AI401', 'Subject created and linked to department');
    const createdSubjId = newSubjRes.data.subject.id;

    // Edit subject
    const editSubjRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/subjects/${createdSubjId}`,
      method: 'PUT',
      headers: facultyHeaders
    }, {
      name: 'Advanced Deep Learning & Transformers',
      semester: 'Semester 8'
    });
    assert(editSubjRes.status === 200 && editSubjRes.data.subject.name === 'Advanced Deep Learning & Transformers', 'Subject metadata updated');

    // Verify department deletion blocked because it has associated subjects
    const blockedDeptDel = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/departments/${createdDeptId}`,
      method: 'DELETE',
      headers: facultyHeaders
    });
    assert(blockedDeptDel.status === 400, 'RELATIONSHIP INTEGRITY: Cannot delete department with active subjects');

    // Step 6: Module 6 — Resource Type Management
    console.log('\n🔹 Test 6: Module 6 — Resource Type Management');
    const typesRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/resource-types',
      method: 'GET',
      headers: facultyHeaders
    });
    assert(typesRes.status === 200 && typesRes.data.resourceTypes.length >= 6, 'Resource types list fetched');

    // Add resource type
    const newTypeRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/resource-types',
      method: 'POST',
      headers: facultyHeaders
    }, {
      code: 'case_study',
      name: 'Industry Case Studies',
      description: 'Real-world enterprise case studies and architectural retrospectives',
      icon: 'Briefcase'
    });
    assert(newTypeRes.status === 201 && newTypeRes.data.resourceType.code === 'case_study', 'New resource type created');
    const createdTypeId = newTypeRes.data.resourceType.id;

    // Edit resource type
    const editTypeRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/resource-types/${createdTypeId}`,
      method: 'PUT',
      headers: facultyHeaders
    }, {
      name: 'Enterprise Case Studies & Blueprints'
    });
    assert(editTypeRes.status === 200 && editTypeRes.data.resourceType.name.includes('Blueprints'), 'Resource type updated');

    // Step 7: Module 7 — Academic Year Management
    console.log('\n🔹 Test 7: Module 7 — Academic Year Management & Active Year State');
    const yearsRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/academic-years',
      method: 'GET',
      headers: facultyHeaders
    });
    assert(yearsRes.status === 200 && yearsRes.data.academicYears.length >= 2, 'Academic years list returned');
    const activeYear = yearsRes.data.academicYears.find(y => y.is_active === 1 || y.is_active === true);
    assert(activeYear && activeYear.name === '2024-2025', 'Active academic year is designated');

    // Add new academic year
    const newYearRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/academic-years',
      method: 'POST',
      headers: facultyHeaders
    }, {
      name: '2026-2027',
      start_date: '2026-08-01',
      end_date: '2027-05-31',
      is_active: false
    });
    assert(newYearRes.status === 201 && newYearRes.data.academicYear.name === '2026-2027', 'New academic year created');
    const createdYearId = newYearRes.data.academicYear.id;

    // Set active academic year
    const setActiveRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/academic-years/${createdYearId}/set-active`,
      method: 'PATCH',
      headers: facultyHeaders
    });
    assert(setActiveRes.status === 200 && setActiveRes.data.academicYear.is_active === 1, 'Academic year activated successfully');

    // Prevent deletion of active academic year
    const delActiveRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/academic-years/${createdYearId}`,
      method: 'DELETE',
      headers: facultyHeaders
    });
    assert(delActiveRes.status === 400, 'SECURITY: Deletion of currently active academic year is blocked (400 Bad Request)');

    // Reset active year back to 2024-2025
    await makeRequest({
      ...baseOptions,
      path: `/api/faculty/academic-years/${activeYear.id}/set-active`,
      method: 'PATCH',
      headers: facultyHeaders
    });

    // Step 8: Module 3 — Faculty Resource Upload (Auto-Publishing Rule)
    console.log('\n🔹 Test 8: Module 3 — Faculty Resource Upload & Institutional Auto-Publishing');
    const facultyUploadPayload = {
      title: 'AI401: Transformers Attention Mechanism Comprehensive Lecture Slides',
      description: 'Detailed analysis of self-attention, multi-head attention, rotary positional embeddings (RoPE), and KV-caching optimizations.',
      department_id: createdDeptId,
      subject_id: createdSubjId,
      resource_type_id: createdTypeId,
      academic_year: '2024-2025',
      year: 4,
      semester: 'Semester 8',
      file_url: '/uploads/ai401_transformers_slides.pdf',
      file_name: 'AI401_Transformers_Lecture_Notes.pdf',
      file_size: '5.2 MB',
      file_mime: 'application/pdf',
      staff_remarks: 'Official institutional lecture slides endorsed by Dr. Morales.'
    };

    const uploadRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/resources',
      method: 'POST',
      headers: facultyHeaders
    }, facultyUploadPayload);
    assert(uploadRes.status === 201 && uploadRes.data.success, 'Faculty resource upload succeeds (201 Created)');
    assert(uploadRes.data.resource.status === 'PUBLISHED', 'INSTITUTIONAL RULE: Faculty upload is automatically PUBLISHED');
    assert(uploadRes.data.resource.verified_by !== null, 'Faculty member recorded as verifier');
    const uploadedResId = uploadRes.data.resource.id;

    // Step 9: Module 2 — Manage Resources (Querying, Filtering, Editing, Archiving & Deleting)
    console.log('\n🔹 Test 9: Module 2 — Resource Management Operations');
    // Query all resources (faculty sees ALL statuses, not just PUBLISHED)
    const allRes = await makeRequest({
      ...baseOptions,
      path: '/api/faculty/resources?page=1&limit=20',
      method: 'GET',
      headers: facultyHeaders
    });
    assert(allRes.status === 200 && allRes.data.data.length >= 6, 'Faculty can view complete resource repository');
    const hasPendingVisible = allRes.data.data.some(r => r.status === 'PENDING');
    assert(hasPendingVisible, 'Faculty resource list includes student PENDING items for moderation');

    // Filter by department
    const deptFiltered = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/resources?department=${createdDeptId}`,
      method: 'GET',
      headers: facultyHeaders
    });
    assert(deptFiltered.status === 200 && deptFiltered.data.data.some(r => r.id === uploadedResId), 'Filtered resources by department matches created resource');

    // Edit Resource Metadata
    const editRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/resources/${uploadedResId}`,
      method: 'PUT',
      headers: facultyHeaders
    }, {
      title: 'AI401: Transformers Attention Mechanism (Updated 2nd Edition)',
      staff_remarks: 'Updated with FlashAttention-2 benchmarks.'
    });
    assert(editRes.status === 200 && editRes.data.resource.title.includes('2nd Edition'), 'Resource metadata edited successfully');

    // Archive Resource
    const archiveRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/resources/${uploadedResId}/archive`,
      method: 'PATCH',
      headers: facultyHeaders
    });
    assert(archiveRes.status === 200 && archiveRes.data.resource.status === 'ARCHIVED', 'Resource status transitioned to ARCHIVED');

    // Remove / Delete Resource
    const deleteRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/resources/${uploadedResId}`,
      method: 'DELETE',
      headers: facultyHeaders
    });
    assert(deleteRes.status === 200, 'Resource successfully deleted from database');

    // Clean up created subject & department now that resource is removed
    const delSubjRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/subjects/${createdSubjId}`,
      method: 'DELETE',
      headers: facultyHeaders
    });
    assert(delSubjRes.status === 200, 'Subject successfully deleted once resources are unlinked');

    const delDeptRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/departments/${createdDeptId}`,
      method: 'DELETE',
      headers: facultyHeaders
    });
    assert(delDeptRes.status === 200, 'Department successfully deleted once subjects are unlinked');

    const delTypeRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/resource-types/${createdTypeId}`,
      method: 'DELETE',
      headers: facultyHeaders
    });
    assert(delTypeRes.status === 200, 'Resource type deleted successfully');

    const delYearRes = await makeRequest({
      ...baseOptions,
      path: `/api/faculty/academic-years/${createdYearId}`,
      method: 'DELETE',
      headers: facultyHeaders
    });
    assert(delYearRes.status === 200, 'Inactive academic year deleted successfully');

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  } finally {
    server.close();
    console.log('\n========================================================');
    console.log(`📊 PHASE 3 PART A FACULTY PORTAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================');
    if (failed > 0) process.exit(1);
    else process.exit(0);
  }
}

runFacultyTestSuite();
