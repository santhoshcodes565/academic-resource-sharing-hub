import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

dotenv.config();

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'arh_db'
} = process.env;

let pool = null;
let useFallback = false;

// Robust fallback in-memory store if MySQL daemon is not active
export const fallbackStore = {
  users: [],
  password_resets: [],
  audit_logs: [],
  departments: [],
  subjects: [],
  resource_types: [],
  resources: [],
  bookmarks: [],
  resource_downloads: [],
  resource_requests: [],
  resource_reviews: [],
  academic_years: [],
  authorized_faculty_emails: [],
  faculty_verifications: [],
  notifications: []
};

// Initial Seed Fixtures
const SEED_ACADEMIC_YEARS = [
  { id: 'ay-2024-2025', name: '2024-2025', start_date: '2024-08-01', end_date: '2025-05-31', is_active: 1, created_at: new Date('2024-07-01T00:00:00Z').toISOString() },
  { id: 'ay-2023-2024', name: '2023-2024', start_date: '2023-08-01', end_date: '2024-05-31', is_active: 0, created_at: new Date('2023-07-01T00:00:00Z').toISOString() },
  { id: 'ay-2025-2026', name: '2025-2026', start_date: '2025-08-01', end_date: '2026-05-31', is_active: 0, created_at: new Date('2025-01-01T00:00:00Z').toISOString() }
];

const SEED_DEPARTMENTS = [
  { id: 'dept-cs', code: 'CS', name: 'Computer Science', description: 'Department of Computer Science & Engineering', icon: 'Code' },
  { id: 'dept-ee', code: 'EE', name: 'Electrical Engineering', description: 'Department of Electrical & Electronics Engineering', icon: 'Cpu' },
  { id: 'dept-me', code: 'ME', name: 'Mechanical Engineering', description: 'Department of Mechanical Engineering', icon: 'Settings' },
  { id: 'dept-ce', code: 'CE', name: 'Civil Engineering', description: 'Department of Civil & Infrastructure Engineering', icon: 'Building' },
  { id: 'dept-math', code: 'MATH', name: 'Mathematics', description: 'Department of Applied & Pure Mathematics', icon: 'Sigma' },
  { id: 'dept-phys', code: 'PHYS', name: 'Physics', description: 'Department of Physics & Quantum Mechanics', icon: 'Atom' }
];

const SEED_RESOURCE_TYPES = [
  { id: 'type-notes', code: 'notes', name: 'Lecture Notes', description: 'Comprehensive professor & student lecture summaries', icon: 'BookOpen' },
  { id: 'type-exam', code: 'exam', name: 'Past Exams & Midterms', description: 'Previous examination papers and verified answer keys', icon: 'FileText' },
  { id: 'type-cheatsheet', code: 'cheatsheet', name: 'Cheatsheets & Formulas', description: 'Dense high-yield quick reference guides and cheat sheets', icon: 'Zap' },
  { id: 'type-lab', code: 'lab_manual', name: 'Lab Manuals & Reports', description: 'Laboratory experiment protocols, starter code and templates', icon: 'Terminal' },
  { id: 'type-assignment', code: 'assignment', name: 'Problem Sets & Solutions', description: 'Homework problem sets and step-by-step solutions', icon: 'CheckSquare' },
  { id: 'type-syllabus', code: 'syllabus', name: 'Curriculum & Syllabus', description: 'Course objectives, outlines, and grading rubrics', icon: 'Bookmark' }
];

const SEED_SUBJECTS = [
  { id: 'subj-cs101', department_id: 'dept-cs', code: 'CS101', name: 'Introduction to Programming (C++/Python)', year: 1, semester: 'Semester 1' },
  { id: 'subj-cs201', department_id: 'dept-cs', code: 'CS201', name: 'Data Structures & Algorithms', year: 2, semester: 'Semester 3' },
  { id: 'subj-cs301', department_id: 'dept-cs', code: 'CS301', name: 'Operating Systems & Concurrency', year: 3, semester: 'Semester 5' },
  { id: 'subj-cs302', department_id: 'dept-cs', code: 'CS302', name: 'Database Management Systems & SQL', year: 3, semester: 'Semester 5' },
  { id: 'subj-cs401', department_id: 'dept-cs', code: 'CS401', name: 'Distributed Systems & Cloud Computing', year: 4, semester: 'Semester 7' },
  { id: 'subj-ee201', department_id: 'dept-ee', code: 'EE201', name: 'Electric Circuit Analysis', year: 2, semester: 'Semester 3' },
  { id: 'subj-ee301', department_id: 'dept-ee', code: 'EE301', name: 'Digital Signal Processing', year: 3, semester: 'Semester 5' },
  { id: 'subj-math101', department_id: 'dept-math', code: 'MATH101', name: 'Single Variable Calculus', year: 1, semester: 'Semester 1' },
  { id: 'subj-math215', department_id: 'dept-math', code: 'MATH215', name: 'Multivariable Calculus & Differential Eq', year: 2, semester: 'Semester 3' },
  { id: 'subj-math250', department_id: 'dept-math', code: 'MATH250', name: 'Linear Algebra & Matrix Computation', year: 2, semester: 'Semester 4' },
  { id: 'subj-phys101', department_id: 'dept-phys', code: 'PHYS101', name: 'Classical Mechanics & Waves', year: 1, semester: 'Semester 1' }
];

async function seedDefaultFallbackData() {
  // 1. Users
  const facultyPasswordHash = await bcrypt.hash('Faculty@1234', 10);
  const studentPasswordHash = await bcrypt.hash('Student@1234', 10);

  fallbackStore.users = [
    {
      id: 'fac-001',
      email: 'dr.morales@university.edu',
      password_hash: facultyPasswordHash,
      full_name: 'Dr. Evelyn Morales',
      role: 'faculty',
      department: 'Computer Science',
      academic_year: 'Tenured Faculty',
      semester: 'N/A',
      is_active: 1,
      is_verified: 1,
      created_at: new Date('2025-01-10T09:00:00Z').toISOString(),
      updated_at: new Date('2025-01-10T09:00:00Z').toISOString()
    },
    {
      id: 'stu-001',
      email: 'alex.chen@student.university.edu',
      password_hash: studentPasswordHash,
      full_name: 'Alex Chen',
      role: 'student',
      department: 'Computer Science',
      academic_year: 'Senior (4th Year)',
      semester: 'Semester 7',
      is_active: 1,
      is_verified: 1,
      created_at: new Date('2025-01-15T10:00:00Z').toISOString(),
      updated_at: new Date('2025-01-15T10:00:00Z').toISOString()
    },
    {
      id: 'stu-002',
      email: 'maya.lin@student.university.edu',
      password_hash: studentPasswordHash,
      full_name: 'Maya Lin',
      role: 'student',
      department: 'Mathematics',
      academic_year: 'Junior (3rd Year)',
      semester: 'Semester 5',
      is_active: 1,
      is_verified: 1,
      created_at: new Date('2025-01-20T11:00:00Z').toISOString(),
      updated_at: new Date('2025-01-20T11:00:00Z').toISOString()
    }
  ];

  fallbackStore.departments = [...SEED_DEPARTMENTS];
  fallbackStore.resource_types = [...SEED_RESOURCE_TYPES];
  fallbackStore.subjects = [...SEED_SUBJECTS];
  fallbackStore.academic_years = [...SEED_ACADEMIC_YEARS];

  // Seed Published Resources
  fallbackStore.resources = [
    {
      id: 'res-001',
      title: 'CS201: Comprehensive Trees, Graphs & Backtracking Midterm Prep',
      description: 'Complete synthesis of recursion backtracking, custom ADTs, Graph traversals (BFS/DFS), and dynamic memory management. Verified solutions from 2023-2024 exams.',
      department_id: 'dept-cs',
      subject_id: 'subj-cs201',
      resource_type_id: 'type-exam',
      academic_year: '2024-2025',
      year: 2,
      semester: 'Semester 3',
      file_url: '/uploads/cs201_midterm_prep.pdf',
      file_name: 'CS201_Midterm_Preparation_Pack.pdf',
      file_size: '4.8 MB',
      file_mime: 'application/pdf',
      uploader_id: 'fac-001',
      status: 'PUBLISHED',
      staff_remarks: 'Approved by Dr. Morales for academic curriculum alignment.',
      verified_by: 'fac-001',
      verified_at: new Date('2025-02-01T12:00:00Z').toISOString(),
      download_count: 142,
      created_at: new Date('2025-02-01T11:00:00Z').toISOString(),
      updated_at: new Date('2025-02-01T12:00:00Z').toISOString()
    },
    {
      id: 'res-002',
      title: 'MATH215: Multivariable Calculus Full Formula Cheat Sheet',
      description: 'Green theorem, Stokes theorem, divergence theorem, Lagrange multipliers, Jacobian transformations, and surface integrals compact 4-page reference.',
      department_id: 'dept-math',
      subject_id: 'subj-math215',
      resource_type_id: 'type-cheatsheet',
      academic_year: '2024-2025',
      year: 2,
      semester: 'Semester 3',
      file_url: '/uploads/math215_formula_sheet.pdf',
      file_name: 'MATH215_Formula_Cheat_Sheet.pdf',
      file_size: '2.1 MB',
      file_mime: 'application/pdf',
      uploader_id: 'fac-001',
      status: 'PUBLISHED',
      staff_remarks: 'Verified complete and mathematically rigorous.',
      verified_by: 'fac-001',
      verified_at: new Date('2025-02-05T14:00:00Z').toISOString(),
      download_count: 210,
      created_at: new Date('2025-02-05T13:30:00Z').toISOString(),
      updated_at: new Date('2025-02-05T14:00:00Z').toISOString()
    },
    {
      id: 'res-003',
      title: 'CS302: Relational Algebra & SQL Query Optimization Lecture Notes',
      description: 'In-depth notes on B+ Trees, query cost evaluation, indexing strategies, normalization forms (1NF through BCNF), and ACID transaction concurrency.',
      department_id: 'dept-cs',
      subject_id: 'subj-cs302',
      resource_type_id: 'type-notes',
      academic_year: '2024-2025',
      year: 3,
      semester: 'Semester 5',
      file_url: '/uploads/cs302_dbms_lecture_notes.pdf',
      file_name: 'CS302_DBMS_Relational_Optimization.pdf',
      file_size: '5.4 MB',
      file_mime: 'application/pdf',
      uploader_id: 'fac-001',
      status: 'PUBLISHED',
      staff_remarks: 'Official course slides and supplementary derivation notes.',
      verified_by: 'fac-001',
      verified_at: new Date('2025-02-10T09:15:00Z').toISOString(),
      download_count: 98,
      created_at: new Date('2025-02-10T08:45:00Z').toISOString(),
      updated_at: new Date('2025-02-10T09:15:00Z').toISOString()
    },
    {
      id: 'res-004',
      title: 'EE201: Thevenin, Norton & RLC Transient Response Lab Protocol',
      description: 'Hands-on lab experiment steps, oscilloscope calibration, breadboard wiring schematics, and LTspice simulation verification code.',
      department_id: 'dept-ee',
      subject_id: 'subj-ee201',
      resource_type_id: 'type-lab',
      academic_year: '2023-2024',
      year: 2,
      semester: 'Semester 3',
      file_url: '/uploads/ee201_lab_protocol.pdf',
      file_name: 'EE201_Circuit_Lab_Protocol.pdf',
      file_size: '3.6 MB',
      file_mime: 'application/pdf',
      uploader_id: 'fac-001',
      status: 'PUBLISHED',
      staff_remarks: 'Standard department lab manual for Spring semester.',
      verified_by: 'fac-001',
      verified_at: new Date('2025-01-20T10:00:00Z').toISOString(),
      download_count: 76,
      created_at: new Date('2025-01-20T09:00:00Z').toISOString(),
      updated_at: new Date('2025-01-20T10:00:00Z').toISOString()
    },
    {
      id: 'res-005',
      title: 'CS301: Virtual Memory, Page Replacement & Semaphore Problems',
      description: 'Solved problem set focusing on Dining Philosophers, Readers-Writers synchronization lock patterns, and LRU/Clock page fault calculations.',
      department_id: 'dept-cs',
      subject_id: 'subj-cs301',
      resource_type_id: 'type-assignment',
      academic_year: '2024-2025',
      year: 3,
      semester: 'Semester 5',
      file_url: '/uploads/cs301_concurrency_psets.pdf',
      file_name: 'CS301_Concurrency_Psets.pdf',
      file_size: '3.1 MB',
      file_mime: 'application/pdf',
      uploader_id: 'fac-001',
      status: 'PUBLISHED',
      staff_remarks: 'Reviewed and certified.',
      verified_by: 'fac-001',
      verified_at: new Date('2025-02-12T16:00:00Z').toISOString(),
      download_count: 115,
      created_at: new Date('2025-02-12T15:00:00Z').toISOString(),
      updated_at: new Date('2025-02-12T16:00:00Z').toISOString()
    },
    // Student Pending Contribution (demonstrating student contribution tracking)
    {
      id: 'res-006',
      title: 'CS401: Raft Consensus Algorithm Step-by-Step Visualization Notes',
      description: 'Student-created visual diagrams and state transition traces for Raft leader election and log replication under network partition scenarios.',
      department_id: 'dept-cs',
      subject_id: 'subj-cs401',
      resource_type_id: 'type-notes',
      academic_year: '2024-2025',
      year: 4,
      semester: 'Semester 7',
      file_url: '/uploads/cs401_raft_visualization.pdf',
      file_name: 'CS401_Raft_Visualization.pdf',
      file_size: '2.9 MB',
      file_mime: 'application/pdf',
      uploader_id: 'stu-001',
      status: 'PENDING',
      staff_remarks: 'Pending faculty peer review.',
      verified_by: null,
      verified_at: null,
      download_count: 0,
      created_at: new Date('2025-02-14T11:20:00Z').toISOString(),
      updated_at: new Date('2025-02-14T11:20:00Z').toISOString()
    },
    {
      id: 'res-007',
      title: 'EE201: Electric Circuit Analysis Comprehensive Solved Problem Sets',
      description: 'Thevenin and Norton equivalents, nodal voltage equations, and AC impedance derivations with step-by-step verified calculations.',
      department_id: 'dept-ee',
      subject_id: 'subj-ee201',
      resource_type_id: 'type-assignment',
      academic_year: '2024-2025',
      year: 2,
      semester: 'Semester 3',
      file_url: '/uploads/ee201_circuits_psets.pdf',
      file_name: 'EE201_Circuits_ProblemSets.pdf',
      file_size: '3.4 MB',
      file_mime: 'application/pdf',
      uploader_id: 'stu-001',
      status: 'UNDER REVIEW',
      staff_remarks: 'Under technical review for formula correctness.',
      verified_by: 'fac-001',
      verified_at: new Date('2025-02-13T10:00:00Z').toISOString(),
      download_count: 0,
      created_at: new Date('2025-02-12T09:15:00Z').toISOString(),
      updated_at: new Date('2025-02-13T10:00:00Z').toISOString()
    },
    {
      id: 'res-008',
      title: 'MATH250: Linear Algebra Eigenvalues & Diagonalization Study Guide',
      description: 'Comprehensive review guide covering eigenspaces, characteristic polynomials, algebraic vs geometric multiplicity, and matrix diagonalization.',
      department_id: 'dept-math',
      subject_id: 'subj-math250',
      resource_type_id: 'type-cheatsheet',
      academic_year: '2024-2025',
      year: 2,
      semester: 'Semester 4',
      file_url: '/uploads/math250_eigenvalues_guide.pdf',
      file_name: 'MATH250_Eigenvalues_Study_Guide.pdf',
      file_size: '1.9 MB',
      file_mime: 'application/pdf',
      uploader_id: 'stu-001',
      status: 'VERIFIED',
      staff_remarks: 'Verified by Dr. Morales. Ready for final semester publication.',
      verified_by: 'fac-001',
      verified_at: new Date('2025-02-13T14:00:00Z').toISOString(),
      download_count: 0,
      created_at: new Date('2025-02-11T16:30:00Z').toISOString(),
      updated_at: new Date('2025-02-13T14:00:00Z').toISOString()
    },
    {
      id: 'res-009',
      title: 'CS101: Intro Programming Homework Solution Dump',
      description: 'Rough scans of weekly lab exercises without explanation headers or documentation.',
      department_id: 'dept-cs',
      subject_id: 'subj-cs101',
      resource_type_id: 'type-lab',
      academic_year: '2024-2025',
      year: 1,
      semester: 'Semester 1',
      file_url: '/uploads/cs101_rough_solutions.pdf',
      file_name: 'CS101_Rough_Lab_Notes.pdf',
      file_size: '5.2 MB',
      file_mime: 'application/pdf',
      uploader_id: 'stu-001',
      status: 'REJECTED',
      staff_remarks: 'Rejected: Incomplete citations and low resolution scans of handwritten sheets. Please re-scan in high resolution with course code headers.',
      verified_by: 'fac-001',
      verified_at: new Date('2025-02-14T09:30:00Z').toISOString(),
      download_count: 0,
      created_at: new Date('2025-02-10T11:00:00Z').toISOString(),
      updated_at: new Date('2025-02-14T09:30:00Z').toISOString()
    },
    {
      id: 'res-010',
      title: 'MATH101: Single Variable Calculus Integration by Parts Master Sheet',
      description: 'High-yield tabular integration by parts, trigonometric substitutions, and reduction formulas with detailed exemplar steps.',
      department_id: 'dept-math',
      subject_id: 'subj-math101',
      resource_type_id: 'type-notes',
      academic_year: '2024-2025',
      year: 1,
      semester: 'Semester 1',
      file_url: '/uploads/math101_integration_master.pdf',
      file_name: 'MATH101_Integration_By_Parts.pdf',
      file_size: '2.4 MB',
      file_mime: 'application/pdf',
      uploader_id: 'stu-002',
      status: 'PUBLISHED',
      staff_remarks: 'Peer-reviewed and published for institutional student curriculum access.',
      verified_by: 'fac-001',
      verified_at: new Date('2025-02-10T11:00:00Z').toISOString(),
      download_count: 88,
      created_at: new Date('2025-02-09T08:00:00Z').toISOString(),
      updated_at: new Date('2025-02-10T11:00:00Z').toISOString()
    }
  ];

  // Seed default bookmarks for stu-001
  fallbackStore.bookmarks = [
    {
      id: 'bm-001',
      user_id: 'stu-001',
      resource_id: 'res-001',
      created_at: new Date('2025-02-02T10:00:00Z').toISOString()
    },
    {
      id: 'bm-002',
      user_id: 'stu-001',
      resource_id: 'res-002',
      created_at: new Date('2025-02-06T11:00:00Z').toISOString()
    }
  ];

  // Seed default downloads for stu-001
  fallbackStore.resource_downloads = [
    {
      id: 'dl-001',
      user_id: 'stu-001',
      resource_id: 'res-001',
      downloaded_at: new Date('2025-02-02T10:05:00Z').toISOString()
    },
    {
      id: 'dl-002',
      user_id: 'stu-001',
      resource_id: 'res-003',
      downloaded_at: new Date('2025-02-11T09:20:00Z').toISOString()
    }
  ];

  // Seed default resource requests for stu-001
  fallbackStore.resource_requests = [
    {
      id: 'req-001',
      user_id: 'stu-001',
      department_id: 'dept-cs',
      subject_id: 'subj-cs401',
      title: 'Distributed Systems 2024 End-Semester Solved Question Paper',
      description: 'Looking for verified solutions to questions on Byzantine Fault Tolerance and Paxos algorithm comparison.',
      status: 'IN PROGRESS',
      staff_remarks: 'Dr. Morales has assigned TA to compile the solution rubric.',
      resolved_by: 'fac-001',
      created_at: new Date('2025-02-08T14:30:00Z').toISOString(),
      updated_at: new Date('2025-02-10T16:00:00Z').toISOString()
    },
    {
      id: 'req-002',
      user_id: 'stu-001',
      department_id: 'dept-math',
      subject_id: 'subj-math250',
      title: 'Linear Algebra SVD & Principal Component Analysis Lab Notes',
      description: 'Need detailed derivations and code snippets for Singular Value Decomposition in Python NumPy.',
      status: 'PENDING',
      staff_remarks: null,
      resolved_by: null,
      created_at: new Date('2025-02-13T10:15:00Z').toISOString(),
      updated_at: new Date('2025-02-13T10:15:00Z').toISOString()
    },
    {
      id: 'req-003',
      user_id: 'stu-001',
      department_id: 'dept-cs',
      subject_id: 'subj-cs201',
      title: 'CS201 Binary Search Tree & Red-Black Tree Implementation Guide',
      description: 'Requesting self-balancing tree rotation diagrams and C++ pointer-to-pointer node manipulation examples.',
      status: 'COMPLETED',
      staff_remarks: 'Uploaded official faculty supplementary guide to CS201 archive.',
      resolved_by: 'fac-001',
      created_at: new Date('2025-02-05T12:00:00Z').toISOString(),
      updated_at: new Date('2025-02-07T15:20:00Z').toISOString()
    },
    {
      id: 'req-004',
      user_id: 'stu-002',
      department_id: 'dept-phys',
      subject_id: 'subj-phys101',
      title: 'PHYS101 Classical Mechanics 2022 Midterm Solutions',
      description: 'Need answer key for simple harmonic motion pendulum problem 4.',
      status: 'CLOSED',
      staff_remarks: 'Duplicate request. Verified solutions are already live in the catalog under Exam Packs.',
      resolved_by: 'fac-001',
      created_at: new Date('2025-02-04T09:00:00Z').toISOString(),
      updated_at: new Date('2025-02-05T11:00:00Z').toISOString()
    }
  ];

  // Seed default resource reviews
  fallbackStore.resource_reviews = [
    {
      id: 'rev-001',
      resource_id: 'res-001',
      user_id: 'stu-001',
      staff_id: null,
      review_status: 'PUBLISHED',
      remarks: null,
      rating: 5,
      review_text: 'Outstanding exam pack! The recursion tree examples were identical to question 3 on the actual exam.',
      created_at: new Date('2025-02-03T15:00:00Z').toISOString(),
      updated_at: new Date('2025-02-03T15:00:00Z').toISOString()
    },
    {
      id: 'rev-002',
      resource_id: 'res-002',
      user_id: 'stu-001',
      staff_id: null,
      review_status: 'PUBLISHED',
      remarks: null,
      rating: 5,
      review_text: 'Compact and concise. Saved me hours of formula lookup before the midterm.',
      created_at: new Date('2025-02-07T12:00:00Z').toISOString(),
      updated_at: new Date('2025-02-07T12:00:00Z').toISOString()
    },
    {
      id: 'rev-003',
      resource_id: 'res-007',
      user_id: 'fac-001',
      staff_id: 'fac-001',
      review_status: 'UNDER REVIEW',
      remarks: 'Commenced technical evaluation of formula derivations and circuit schematics.',
      rating: null,
      review_text: null,
      created_at: new Date('2025-02-13T10:00:00Z').toISOString(),
      updated_at: new Date('2025-02-13T10:00:00Z').toISOString()
    },
    {
      id: 'rev-004',
      resource_id: 'res-008',
      user_id: 'fac-001',
      staff_id: 'fac-001',
      review_status: 'UNDER REVIEW',
      remarks: 'Checking against standard Department syllabus and matrix textbook theorems.',
      rating: null,
      review_text: null,
      created_at: new Date('2025-02-12T11:00:00Z').toISOString(),
      updated_at: new Date('2025-02-12T11:00:00Z').toISOString()
    },
    {
      id: 'rev-005',
      resource_id: 'res-008',
      user_id: 'fac-001',
      staff_id: 'fac-001',
      review_status: 'VERIFIED',
      remarks: 'All eigenvalues, eigenvectors, and diagonalization theorems verified accurate. Verified and approved.',
      rating: null,
      review_text: null,
      created_at: new Date('2025-02-13T14:00:00Z').toISOString(),
      updated_at: new Date('2025-02-13T14:00:00Z').toISOString()
    },
    {
      id: 'rev-006',
      resource_id: 'res-009',
      user_id: 'fac-001',
      staff_id: 'fac-001',
      review_status: 'REJECTED',
      remarks: 'Incomplete citations and low resolution handwritten scans. Please resubmit clean digital notes with clear course headers.',
      rating: null,
      review_text: null,
      created_at: new Date('2025-02-14T09:30:00Z').toISOString(),
      updated_at: new Date('2025-02-14T09:30:00Z').toISOString()
    },
    {
      id: 'rev-007',
      resource_id: 'res-010',
      user_id: 'fac-001',
      staff_id: 'fac-001',
      review_status: 'VERIFIED',
      remarks: 'Integration by parts tables and reduction formulas approved.',
      rating: null,
      review_text: null,
      created_at: new Date('2025-02-10T10:00:00Z').toISOString(),
      updated_at: new Date('2025-02-10T10:00:00Z').toISOString()
    },
    {
      id: 'rev-008',
      resource_id: 'res-010',
      user_id: 'fac-001',
      staff_id: 'fac-001',
      review_status: 'PUBLISHED',
      action: 'PUBLISHED',
      previous_status: 'VERIFIED',
      new_status: 'PUBLISHED',
      remarks: 'Published to general institutional student catalog.',
      rating: null,
      review_text: null,
      created_at: new Date('2025-02-10T11:00:00Z').toISOString(),
      updated_at: new Date('2025-02-10T11:00:00Z').toISOString()
    }
  ];

  // 2. Pre-authorized Faculty Email Allowlist Fixtures
  fallbackStore.authorized_faculty_emails = [
    { id: 'afe-001', email: 'dr.morales@university.edu', department: 'Computer Science', designation: 'Associate Professor', is_registered: 1, created_at: new Date('2025-01-01T00:00:00Z').toISOString() },
    { id: 'afe-002', email: 'prof.patel@university.edu', department: 'Electrical Engineering', designation: 'Professor & Chair', is_registered: 0, created_at: new Date('2025-01-01T00:00:00Z').toISOString() },
    { id: 'afe-003', email: 'dr.connor@university.edu', department: 'Mechanical Engineering', designation: 'Assistant Professor', is_registered: 0, created_at: new Date('2025-01-01T00:00:00Z').toISOString() },
    { id: 'afe-004', email: 'prof.turing@university.edu', department: 'Computer Science', designation: 'Distinguished Professor', is_registered: 0, created_at: new Date('2025-01-01T00:00:00Z').toISOString() },
    { id: 'afe-005', email: 'dr.hopper@university.edu', department: 'Computer Science', designation: 'Professor', is_registered: 0, created_at: new Date('2025-01-01T00:00:00Z').toISOString() },
    { id: 'afe-006', email: 'dr.feynman@university.edu', department: 'Physics', designation: 'Professor', is_registered: 0, created_at: new Date('2025-01-01T00:00:00Z').toISOString() },
    { id: 'afe-007', email: 'prof.gauss@university.edu', department: 'Mathematics', designation: 'Professor & Chair', is_registered: 0, created_at: new Date('2025-01-01T00:00:00Z').toISOString() }
  ];

  fallbackStore.faculty_verifications = [];

  // 3. Initial Seed Notifications
  fallbackStore.notifications = [
    {
      id: 'notif-001',
      user_id: 'stu-001',
      title: 'Resource Contribution Verified',
      message: 'Your submission "MATH250: Linear Algebra Eigenvalues & Diagonalization Study Guide" has been verified by Dr. Evelyn Morales.',
      type: 'STATUS_CHANGE',
      link: '/student/contributions',
      is_read: 0,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'notif-002',
      user_id: 'stu-001',
      title: 'Resource Request Update',
      message: 'Your resource request for "Distributed Systems 2024 End-Semester Solved Question Paper" is now IN PROGRESS.',
      type: 'REQUEST',
      link: '/student/requests',
      is_read: 1,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'notif-003',
      user_id: 'fac-001',
      title: 'New Student Submission for Review',
      message: 'Alex Chen submitted "CS401: Raft Consensus Algorithm Step-by-Step Visualization Notes" for verification.',
      type: 'SUBMISSION',
      link: '/faculty/verification',
      is_read: 0,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ];
}

// Initialize database connection and schemas
export async function initDatabase() {
  try {
    const tempConn = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD
    });

    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConn.end();

    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Run table creations in order of foreign key dependencies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        role ENUM('student', 'faculty', 'admin') NOT NULL DEFAULT 'student',
        department VARCHAR(100) NOT NULL,
        academic_year VARCHAR(50) DEFAULT NULL,
        semester VARCHAR(20) DEFAULT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_resets_token (token_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NULL,
        action VARCHAR(100) NOT NULL,
        status ENUM('SUCCESS', 'FAILURE') NOT NULL,
        ip_address VARCHAR(50) NULL,
        details TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS academic_years (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        start_date DATE NULL,
        end_date DATE NULL,
        is_active BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_academic_years_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        description TEXT NULL,
        icon VARCHAR(50) DEFAULT 'BookOpen',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(36) PRIMARY KEY,
        department_id VARCHAR(36) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        year INT NOT NULL DEFAULT 1,
        semester VARCHAR(20) NOT NULL DEFAULT 'Semester 1',
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        INDEX idx_subjects_dept (department_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS resource_types (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        icon VARCHAR(50) DEFAULT 'FileText'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        department_id VARCHAR(36) NOT NULL,
        subject_id VARCHAR(36) NOT NULL,
        resource_type_id VARCHAR(36) NOT NULL,
        academic_year VARCHAR(50) NOT NULL,
        year INT NOT NULL DEFAULT 1,
        semester VARCHAR(20) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size VARCHAR(50) NOT NULL,
        file_mime VARCHAR(100) DEFAULT 'application/pdf',
        uploader_id VARCHAR(36) NOT NULL,
        status ENUM('PENDING', 'UNDER REVIEW', 'VERIFIED', 'REJECTED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PENDING',
        staff_remarks TEXT NULL,
        verified_by VARCHAR(36) NULL,
        verified_at TIMESTAMP NULL,
        download_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
        FOREIGN KEY (resource_type_id) REFERENCES resource_types(id) ON DELETE RESTRICT,
        FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_resources_status (status),
        INDEX idx_resources_dept (department_id),
        INDEX idx_resources_subj (subject_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        resource_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
        UNIQUE KEY idx_user_resource_bookmark (user_id, resource_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS resource_downloads (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        resource_id VARCHAR(36) NOT NULL,
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
        INDEX idx_downloads_user (user_id),
        INDEX idx_downloads_res (resource_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS resource_requests (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        department_id VARCHAR(36) NOT NULL,
        subject_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('PENDING', 'IN PROGRESS', 'COMPLETED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
        staff_remarks TEXT NULL,
        resolved_by VARCHAR(36) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
        INDEX idx_requests_user (user_id),
        INDEX idx_requests_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS resource_reviews (
        id VARCHAR(36) PRIMARY KEY,
        resource_id VARCHAR(36) NOT NULL,
        staff_id VARCHAR(36) NULL,
        user_id VARCHAR(36) NOT NULL,
        review_status VARCHAR(50) DEFAULT 'UNDER REVIEW',
        remarks TEXT NULL,
        rating INT NULL,
        review_text TEXT NULL,
        action VARCHAR(50) NULL DEFAULT 'REVIEW',
        previous_status VARCHAR(50) NULL DEFAULT NULL,
        new_status VARCHAR(50) NULL DEFAULT 'UNDER REVIEW',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_reviews_resource (resource_id),
        INDEX idx_reviews_staff (staff_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist if table was already created
    try {
      await pool.query(`ALTER TABLE resource_reviews ADD COLUMN action VARCHAR(50) NULL DEFAULT 'REVIEW'`);
    } catch (e) {}
    try {
      await pool.query(`ALTER TABLE resource_reviews ADD COLUMN previous_status VARCHAR(50) NULL DEFAULT NULL`);
    } catch (e) {}
    try {
      await pool.query(`ALTER TABLE resource_reviews ADD COLUMN new_status VARCHAR(50) NULL DEFAULT 'UNDER REVIEW'`);
    } catch (e) {}

    // 12. Authorized Faculty Emails Allowlist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS authorized_faculty_emails (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        department VARCHAR(100) NOT NULL,
        designation VARCHAR(100) DEFAULT 'Faculty Member',
        is_registered BOOLEAN NOT NULL DEFAULT FALSE,
        added_by VARCHAR(36) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_auth_faculty_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 13. Faculty Verification Tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faculty_verifications (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_faculty_verif_token (token_hash),
        INDEX idx_faculty_verif_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 14. Notifications Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'INFO',
        link VARCHAR(255) NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_notifications_user_read (user_id, is_read),
        INDEX idx_notifications_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed authorized faculty emails if empty
    const [authFacultyRows] = await pool.query('SELECT COUNT(*) as count FROM authorized_faculty_emails');
    if (authFacultyRows[0].count === 0) {
      const SEED_FACULTY_EMAILS = [
        ['afe-001', 'dr.morales@university.edu', 'Computer Science', 'Associate Professor', 1],
        ['afe-002', 'prof.patel@university.edu', 'Electrical Engineering', 'Professor & Chair', 0],
        ['afe-003', 'dr.connor@university.edu', 'Mechanical Engineering', 'Assistant Professor', 0],
        ['afe-004', 'prof.turing@university.edu', 'Computer Science', 'Distinguished Professor', 0],
        ['afe-005', 'dr.hopper@university.edu', 'Computer Science', 'Professor', 0],
        ['afe-006', 'dr.feynman@university.edu', 'Physics', 'Professor', 0],
        ['afe-007', 'prof.gauss@university.edu', 'Mathematics', 'Professor & Chair', 0]
      ];
      for (const f of SEED_FACULTY_EMAILS) {
        await pool.query('INSERT IGNORE INTO authorized_faculty_emails (id, email, department, designation, is_registered) VALUES (?, ?, ?, ?, ?)', f);
      }
    }

    // Seed departments if empty
    const [deptRows] = await pool.query('SELECT COUNT(*) as count FROM departments');
    if (deptRows[0].count === 0) {
      for (const d of SEED_DEPARTMENTS) {
        await pool.query('INSERT INTO departments (id, code, name, description, icon) VALUES (?, ?, ?, ?, ?)', [d.id, d.code, d.name, d.description, d.icon]);
      }
      for (const t of SEED_RESOURCE_TYPES) {
        await pool.query('INSERT INTO resource_types (id, code, name, description, icon) VALUES (?, ?, ?, ?, ?)', [t.id, t.code, t.name, t.description, t.icon]);
      }
      for (const s of SEED_SUBJECTS) {
        await pool.query('INSERT INTO subjects (id, department_id, code, name, year, semester) VALUES (?, ?, ?, ?, ?, ?)', [s.id, s.department_id, s.code, s.name, s.year, s.semester]);
      }
      for (const ay of SEED_ACADEMIC_YEARS) {
        await pool.query('INSERT INTO academic_years (id, name, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)', [ay.id, ay.name, ay.start_date, ay.end_date, ay.is_active]);
      }
      console.log('✅ [Database] Seeded departments, resource types, subjects, and academic years into MySQL.');
    }

    useFallback = false;
    console.log(`✅ [Database] Successfully connected to MySQL at ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  } catch (error) {
    useFallback = true;
    console.warn(`⚠️  [Database] MySQL connection failed (${error.message}). Activating dual-mode resilient store fallback.`);
    await seedDefaultFallbackData();
  }
}

// Database Operations Layer
export const db = {
  isUsingFallback: () => useFallback,

  // ==================== AUTH & USER METHODS ====================
  async findUserByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [cleanEmail]);
      return rows[0] || null;
    } else {
      const user = fallbackStore.users.find(u => u.email.toLowerCase() === cleanEmail);
      return user ? { ...user } : null;
    }
  },

  async findUserById(id) {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT id, email, full_name, role, department, academic_year, semester, is_active, is_verified, created_at FROM users WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    } else {
      const user = fallbackStore.users.find(u => u.id === id);
      if (!user) return null;
      const { password_hash, ...rest } = user;
      return rest;
    }
  },

  async createUser({ email, password_hash, full_name, role, department, academic_year, semester }) {
    const id = crypto.randomUUID();
    const cleanEmail = email.trim().toLowerCase();

    if (!useFallback && pool) {
      await pool.query(`
        INSERT INTO users (id, email, password_hash, full_name, role, department, academic_year, semester, is_active, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `, [id, cleanEmail, password_hash, full_name, role, department, academic_year, semester, role === 'student' ? 1 : 0]);

      return this.findUserById(id);
    } else {
      const newUser = {
        id,
        email: cleanEmail,
        password_hash,
        full_name,
        role,
        department,
        academic_year,
        semester,
        is_active: 1,
        is_verified: role === 'student' ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      fallbackStore.users.push(newUser);
      const { password_hash: _, ...rest } = newUser;
      return rest;
    }
  },

  async updateUserProfile(userId, { full_name, department, academic_year, semester }) {
    if (!useFallback && pool) {
      await pool.query(`
        UPDATE users 
        SET full_name = COALESCE(?, full_name),
            department = COALESCE(?, department),
            academic_year = COALESCE(?, academic_year),
            semester = COALESCE(?, semester),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [full_name, department, academic_year, semester, userId]);

      return this.findUserById(userId);
    } else {
      const index = fallbackStore.users.findIndex(u => u.id === userId);
      if (index === -1) return null;
      if (full_name !== undefined) fallbackStore.users[index].full_name = full_name;
      if (department !== undefined) fallbackStore.users[index].department = department;
      if (academic_year !== undefined) fallbackStore.users[index].academic_year = academic_year;
      if (semester !== undefined) fallbackStore.users[index].semester = semester;
      fallbackStore.users[index].updated_at = new Date().toISOString();
      const { password_hash: _, ...rest } = fallbackStore.users[index];
      return rest;
    }
  },

  async updateUserPassword(userId, password_hash) {
    if (!useFallback && pool) {
      await pool.query('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [password_hash, userId]);
      return true;
    } else {
      const user = fallbackStore.users.find(u => u.id === userId);
      if (user) {
        user.password_hash = password_hash;
        user.updated_at = new Date().toISOString();
        return true;
      }
      return false;
    }
  },

  async createPasswordReset(userId, tokenHash, expiresAt) {
    const id = crypto.randomUUID();
    if (!useFallback && pool) {
      await pool.query(`
        INSERT INTO password_resets (id, user_id, token_hash, expires_at, used)
        VALUES (?, ?, ?, ?, 0)
      `, [id, userId, tokenHash, expiresAt]);
    } else {
      fallbackStore.password_resets.push({
        id,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used: 0,
        created_at: new Date().toISOString()
      });
    }
    return id;
  },

  async logAudit({ userId = null, action, status, ipAddress = null, details = null }) {
    const id = crypto.randomUUID();
    if (!useFallback && pool) {
      await pool.query(`
        INSERT INTO audit_logs (id, user_id, action, status, ip_address, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, userId, action, status, ipAddress, details]);
    } else {
      fallbackStore.audit_logs.push({
        id,
        user_id: userId,
        action,
        status,
        ip_address: ipAddress,
        details,
        created_at: new Date().toISOString()
      });
    }
  },

  // ==================== METADATA METHODS ====================
  async getDepartments() {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM departments ORDER BY name ASC');
      return rows;
    }
    return [...fallbackStore.departments];
  },

  async getSubjects(departmentId = null) {
    if (!useFallback && pool) {
      let query = 'SELECT s.*, d.name as department_name, d.code as department_code FROM subjects s JOIN departments d ON s.department_id = d.id';
      const params = [];
      if (departmentId && departmentId !== 'all') {
        query += ' WHERE s.department_id = ? OR d.code = ?';
        params.push(departmentId, departmentId);
      }
      query += ' ORDER BY s.code ASC';
      const [rows] = await pool.query(query, params);
      return rows;
    }

    let result = fallbackStore.subjects.map(s => {
      const dept = fallbackStore.departments.find(d => d.id === s.department_id);
      return {
        ...s,
        department_name: dept ? dept.name : 'Unknown Department',
        department_code: dept ? dept.code : 'GEN'
      };
    });

    if (departmentId && departmentId !== 'all') {
      result = result.filter(s => s.department_id === departmentId || s.department_code.toLowerCase() === departmentId.toLowerCase());
    }
    return result;
  },

  async getResourceTypes() {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM resource_types ORDER BY name ASC');
      return rows;
    }
    return [...fallbackStore.resource_types];
  },

  async getAcademicYears() {
    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM academic_years ORDER BY name DESC');
      return rows;
    }
    return [...fallbackStore.academic_years].sort((a, b) => b.name.localeCompare(a.name));
  },

  // ==================== RESOURCE METHODS ====================
  // Library repository search & filtering - only returns PUBLISHED resources
  async getResources({
    q = '',
    department = '',
    academicYear = '',
    year = '',
    semester = '',
    subject = '',
    resourceType = '',
    sort = 'newest',
    page = 1,
    limit = 12
  }) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12));
    const offset = (pageNum - 1) * limitNum;

    if (!useFallback && pool) {
      let baseSql = `
        FROM resources r
        JOIN departments d ON r.department_id = d.id
        JOIN subjects s ON r.subject_id = s.id
        JOIN resource_types rt ON r.resource_type_id = rt.id
        JOIN users u ON r.uploader_id = u.id
        WHERE r.status = 'PUBLISHED'
      `;
      const params = [];

      if (q && q.trim()) {
        const keyword = `%${q.trim()}%`;
        baseSql += ` AND (r.title LIKE ? OR r.description LIKE ? OR s.name LIKE ? OR s.code LIKE ?)`;
        params.push(keyword, keyword, keyword, keyword);
      }

      if (department && department !== 'all') {
        baseSql += ` AND (r.department_id = ? OR d.code = ?)`;
        params.push(department, department);
      }

      if (academicYear && academicYear !== 'all') {
        baseSql += ` AND r.academic_year = ?`;
        params.push(academicYear);
      }

      if (year && year !== 'all') {
        baseSql += ` AND r.year = ?`;
        params.push(parseInt(year));
      }

      if (semester && semester !== 'all') {
        baseSql += ` AND r.semester = ?`;
        params.push(semester);
      }

      if (subject && subject !== 'all') {
        baseSql += ` AND (r.subject_id = ? OR s.code = ?)`;
        params.push(subject, subject);
      }

      if (resourceType && resourceType !== 'all') {
        baseSql += ` AND (r.resource_type_id = ? OR rt.code = ?)`;
        params.push(resourceType, resourceType);
      }

      // Count total matching
      const [countRows] = await pool.query(`SELECT COUNT(*) as total ${baseSql}`, params);
      const total = countRows[0].total;

      // Sorting
      let orderBy = 'ORDER BY r.created_at DESC';
      if (sort === 'downloads') orderBy = 'ORDER BY r.download_count DESC, r.created_at DESC';
      else if (sort === 'title') orderBy = 'ORDER BY r.title ASC';
      else if (sort === 'oldest') orderBy = 'ORDER BY r.created_at ASC';

      const selectSql = `
        SELECT 
          r.id, r.title, r.description, r.academic_year, r.year, r.semester,
          r.file_url, r.file_name, r.file_size, r.file_mime, r.status,
          r.download_count, r.created_at, r.updated_at,
          d.id as department_id, d.name as department_name, d.code as department_code,
          s.id as subject_id, s.name as subject_name, s.code as subject_code,
          rt.id as resource_type_id, rt.name as resource_type_name, rt.code as resource_type_code, rt.icon as resource_type_icon,
          u.id as uploader_id, u.full_name as uploader_name, u.role as uploader_role
        ${baseSql}
        ${orderBy}
        LIMIT ? OFFSET ?
      `;

      const [items] = await pool.query(selectSql, [...params, limitNum, offset]);

      return {
        items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      };
    } else {
      // Resilient Fallback Store Implementation
      let items = fallbackStore.resources.filter(r => r.status === 'PUBLISHED');

      if (q && q.trim()) {
        const query = q.trim().toLowerCase();
        items = items.filter(r => {
          const subj = fallbackStore.subjects.find(s => s.id === r.subject_id);
          return r.title.toLowerCase().includes(query) ||
            (r.description && r.description.toLowerCase().includes(query)) ||
            (subj && (subj.name.toLowerCase().includes(query) || subj.code.toLowerCase().includes(query)));
        });
      }

      if (department && department !== 'all') {
        items = items.filter(r => {
          const dept = fallbackStore.departments.find(d => d.id === r.department_id);
          return r.department_id === department || (dept && dept.code.toLowerCase() === department.toLowerCase());
        });
      }

      if (academicYear && academicYear !== 'all') {
        items = items.filter(r => r.academic_year === academicYear);
      }

      if (year && year !== 'all') {
        items = items.filter(r => r.year === parseInt(year));
      }

      if (semester && semester !== 'all') {
        items = items.filter(r => r.semester.toLowerCase() === semester.toLowerCase());
      }

      if (subject && subject !== 'all') {
        items = items.filter(r => {
          const subj = fallbackStore.subjects.find(s => s.id === r.subject_id);
          return r.subject_id === subject || (subj && subj.code.toLowerCase() === subject.toLowerCase());
        });
      }

      if (resourceType && resourceType !== 'all') {
        items = items.filter(r => {
          const rt = fallbackStore.resource_types.find(t => t.id === r.resource_type_id);
          return r.resource_type_id === resourceType || (rt && rt.code.toLowerCase() === resourceType.toLowerCase());
        });
      }

      // Sorting
      if (sort === 'downloads') {
        items.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
      } else if (sort === 'title') {
        items.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'oldest') {
        items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } else {
        items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      const total = items.length;
      const paginatedItems = items.slice(offset, offset + limitNum).map(r => {
        const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
        const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};
        const rt = fallbackStore.resource_types.find(t => t.id === r.resource_type_id) || {};
        const uploader = fallbackStore.users.find(u => u.id === r.uploader_id) || {};

        return {
          ...r,
          department_name: dept.name || 'Computer Science',
          department_code: dept.code || 'CS',
          subject_name: subj.name || 'Data Structures',
          subject_code: subj.code || 'CS201',
          resource_type_name: rt.name || 'Lecture Notes',
          resource_type_code: rt.code || 'notes',
          resource_type_icon: rt.icon || 'BookOpen',
          uploader_name: uploader.full_name || 'Faculty Member',
          uploader_role: uploader.role || 'faculty'
        };
      });

      return {
        items: paginatedItems,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      };
    }
  },

  async getResourceById(id, currentUserId = null) {
    if (!useFallback && pool) {
      const [rows] = await pool.query(`
        SELECT 
          r.*,
          d.name as department_name, d.code as department_code,
          s.name as subject_name, s.code as subject_code,
          rt.name as resource_type_name, rt.code as resource_type_code, rt.icon as resource_type_icon,
          u.full_name as uploader_name, u.role as uploader_role, u.department as uploader_department
        FROM resources r
        JOIN departments d ON r.department_id = d.id
        JOIN subjects s ON r.subject_id = s.id
        JOIN resource_types rt ON r.resource_type_id = rt.id
        JOIN users u ON r.uploader_id = u.id
        WHERE r.id = ?
        LIMIT 1
      `, [id]);

      if (rows.length === 0) return null;
      const resource = rows[0];

      // Fetch reviews
      const [reviews] = await pool.query(`
        SELECT rv.*, u.full_name as user_name, u.role as user_role
        FROM resource_reviews rv
        JOIN users u ON rv.user_id = u.id
        WHERE rv.resource_id = ?
        ORDER BY rv.created_at DESC
      `, [id]);

      // Check if current user has bookmarked this
      let isBookmarked = false;
      if (currentUserId) {
        const [bmRows] = await pool.query('SELECT id FROM bookmarks WHERE user_id = ? AND resource_id = ? LIMIT 1', [currentUserId, id]);
        isBookmarked = bmRows.length > 0;
      }

      return {
        ...resource,
        is_bookmarked: isBookmarked,
        reviews
      };
    } else {
      const resource = fallbackStore.resources.find(r => r.id === id);
      if (!resource) return null;

      const dept = fallbackStore.departments.find(d => d.id === resource.department_id) || {};
      const subj = fallbackStore.subjects.find(s => s.id === resource.subject_id) || {};
      const rt = fallbackStore.resource_types.find(t => t.id === resource.resource_type_id) || {};
      const uploader = fallbackStore.users.find(u => u.id === resource.uploader_id) || {};

      const reviews = fallbackStore.resource_reviews
        .filter(rv => rv.resource_id === id)
        .map(rv => {
          const user = fallbackStore.users.find(u => u.id === rv.user_id) || {};
          return {
            ...rv,
            user_name: user.full_name || 'Student Reviewer',
            user_role: user.role || 'student'
          };
        });

      const isBookmarked = currentUserId 
        ? fallbackStore.bookmarks.some(bm => bm.user_id === currentUserId && bm.resource_id === id)
        : false;

      return {
        ...resource,
        department_name: dept.name || 'Computer Science',
        department_code: dept.code || 'CS',
        subject_name: subj.name || 'Subject',
        subject_code: subj.code || 'SUBJ',
        resource_type_name: rt.name || 'Resource Type',
        resource_type_code: rt.code || 'notes',
        resource_type_icon: rt.icon || 'BookOpen',
        uploader_name: uploader.full_name || 'User',
        uploader_role: uploader.role || 'student',
        uploader_department: uploader.department || dept.name,
        is_bookmarked: isBookmarked,
        reviews
      };
    }
  },

  async createResource({
    title,
    description,
    department_id,
    subject_id,
    resource_type_id,
    academic_year,
    year,
    semester,
    file_url,
    file_name,
    file_size,
    file_mime,
    uploader_id,
    status = 'PENDING' // Students always enter PENDING
  }) {
    const id = crypto.randomUUID();
    const initialRemarks = 'Initial contribution submitted for academic verification.';

    if (!useFallback && pool) {
      await pool.query(`
        INSERT INTO resources (
          id, title, description, department_id, subject_id, resource_type_id,
          academic_year, year, semester, file_url, file_name, file_size, file_mime,
          uploader_id, status, download_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `, [
        id, title, description, department_id, subject_id, resource_type_id,
        academic_year, parseInt(year) || 1, semester, file_url, file_name, file_size, file_mime,
        uploader_id, status
      ]);

      // Record initial verification history entry (Append-only)
      const reviewId = `rev-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      await pool.query(`
        INSERT INTO resource_reviews (id, resource_id, staff_id, user_id, review_status, action, previous_status, new_status, remarks, created_at)
        VALUES (?, ?, NULL, ?, 'PENDING', 'SUBMITTED', NULL, 'PENDING', ?, CURRENT_TIMESTAMP)
      `, [reviewId, id, uploader_id, initialRemarks]);

      // Emit student notification
      await this.createNotification({
        user_id: uploader_id,
        title: 'Resource Contribution Submitted',
        message: `Your resource contribution "${title}" was successfully submitted and is PENDING faculty review.`,
        type: 'SUBMISSION',
        link: '/student/contributions'
      });

      // Emit faculty group notification
      await this.notifyFacultyGroup({
        title: 'New Student Contribution Pending Review',
        message: `A new student resource "${title}" has been submitted for verification.`,
        type: 'SUBMISSION',
        link: '/faculty/verification'
      });

      return this.getResourceById(id, uploader_id);
    } else {
      const newResource = {
        id,
        title,
        description,
        department_id,
        subject_id,
        resource_type_id,
        academic_year,
        year: parseInt(year) || 1,
        semester,
        file_url,
        file_name,
        file_size,
        file_mime,
        uploader_id,
        status,
        staff_remarks: null,
        verified_by: null,
        verified_at: null,
        download_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      fallbackStore.resources.unshift(newResource);

      // Record initial verification history entry (Append-only)
      const reviewId = `rev-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      fallbackStore.resource_reviews.unshift({
        id: reviewId,
        resource_id: id,
        staff_id: null,
        user_id: uploader_id,
        review_status: 'PENDING',
        action: 'SUBMITTED',
        previous_status: null,
        new_status: 'PENDING',
        remarks: initialRemarks,
        rating: null,
        review_text: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Emit student notification
      await this.createNotification({
        user_id: uploader_id,
        title: 'Resource Contribution Submitted',
        message: `Your resource contribution "${title}" was successfully submitted and is PENDING faculty review.`,
        type: 'SUBMISSION',
        link: '/student/contributions'
      });

      // Emit faculty group notification
      await this.notifyFacultyGroup({
        title: 'New Student Contribution Pending Review',
        message: `A new student resource "${title}" has been submitted for verification.`,
        type: 'SUBMISSION',
        link: '/faculty/verification'
      });

      return this.getResourceById(id, uploader_id);
    }
  },

  async incrementResourceDownloads(resourceId, userId) {
    const downloadId = crypto.randomUUID();
    if (!useFallback && pool) {
      await pool.query('INSERT INTO resource_downloads (id, user_id, resource_id) VALUES (?, ?, ?)', [downloadId, userId, resourceId]);
      await pool.query('UPDATE resources SET download_count = download_count + 1 WHERE id = ?', [resourceId]);
    } else {
      fallbackStore.resource_downloads.push({
        id: downloadId,
        user_id: userId,
        resource_id: resourceId,
        downloaded_at: new Date().toISOString()
      });
      const res = fallbackStore.resources.find(r => r.id === resourceId);
      if (res) {
        res.download_count = (res.download_count || 0) + 1;
      }
    }
  },

  // ==================== BOOKMARK METHODS ====================
  async getBookmarks(userId) {
    if (!useFallback && pool) {
      const [rows] = await pool.query(`
        SELECT 
          b.id as bookmark_id, b.created_at as bookmarked_at,
          r.id, r.title, r.description, r.academic_year, r.year, r.semester,
          r.file_url, r.file_name, r.file_size, r.file_mime, r.status,
          r.download_count, r.created_at,
          d.name as department_name, d.code as department_code,
          s.name as subject_name, s.code as subject_code,
          rt.name as resource_type_name, rt.code as resource_type_code, rt.icon as resource_type_icon,
          u.full_name as uploader_name
        FROM bookmarks b
        JOIN resources r ON b.resource_id = r.id
        JOIN departments d ON r.department_id = d.id
        JOIN subjects s ON r.subject_id = s.id
        JOIN resource_types rt ON r.resource_type_id = rt.id
        JOIN users u ON r.uploader_id = u.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `, [userId]);
      return rows;
    } else {
      const userBookmarks = fallbackStore.bookmarks
        .filter(bm => bm.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return userBookmarks.map(bm => {
        const r = fallbackStore.resources.find(res => res.id === bm.resource_id) || {};
        const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
        const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};
        const rt = fallbackStore.resource_types.find(t => t.id === r.resource_type_id) || {};
        const uploader = fallbackStore.users.find(u => u.id === r.uploader_id) || {};

        return {
          bookmark_id: bm.id,
          bookmarked_at: bm.created_at,
          ...r,
          department_name: dept.name || 'Computer Science',
          department_code: dept.code || 'CS',
          subject_name: subj.name || 'Subject',
          subject_code: subj.code || 'SUBJ',
          resource_type_name: rt.name || 'Notes',
          resource_type_code: rt.code || 'notes',
          resource_type_icon: rt.icon || 'BookOpen',
          uploader_name: uploader.full_name || 'Faculty'
        };
      });
    }
  },

  async addBookmark(userId, resourceId) {
    const id = crypto.randomUUID();
    if (!useFallback && pool) {
      // Check existing
      const [existing] = await pool.query('SELECT id FROM bookmarks WHERE user_id = ? AND resource_id = ? LIMIT 1', [userId, resourceId]);
      if (existing.length > 0) return { alreadyExists: true, id: existing[0].id };

      await pool.query('INSERT INTO bookmarks (id, user_id, resource_id) VALUES (?, ?, ?)', [id, userId, resourceId]);
      return { alreadyExists: false, id };
    } else {
      const existing = fallbackStore.bookmarks.find(bm => bm.user_id === userId && bm.resource_id === resourceId);
      if (existing) return { alreadyExists: true, id: existing.id };

      fallbackStore.bookmarks.push({
        id,
        user_id: userId,
        resource_id: resourceId,
        created_at: new Date().toISOString()
      });
      return { alreadyExists: false, id };
    }
  },

  async removeBookmark(userId, resourceId) {
    if (!useFallback && pool) {
      const [result] = await pool.query('DELETE FROM bookmarks WHERE user_id = ? AND resource_id = ?', [userId, resourceId]);
      return result.affectedRows > 0;
    } else {
      const initialLength = fallbackStore.bookmarks.length;
      fallbackStore.bookmarks = fallbackStore.bookmarks.filter(
        bm => !(bm.user_id === userId && bm.resource_id === resourceId)
      );
      return fallbackStore.bookmarks.length < initialLength;
    }
  },

  // ==================== CONTRIBUTIONS METHODS ====================
  async getStudentContributions(userId) {
    if (!useFallback && pool) {
      const [rows] = await pool.query(`
        SELECT 
          r.id, r.title, r.description, r.academic_year, r.year, r.semester,
          r.file_url, r.file_name, r.file_size, r.file_mime, r.status,
          r.staff_remarks, r.verified_at, r.download_count, r.created_at, r.updated_at,
          d.name as department_name, d.code as department_code,
          s.name as subject_name, s.code as subject_code,
          rt.name as resource_type_name, rt.code as resource_type_code, rt.icon as resource_type_icon,
          v.full_name as verified_by_name
        FROM resources r
        JOIN departments d ON r.department_id = d.id
        JOIN subjects s ON r.subject_id = s.id
        JOIN resource_types rt ON r.resource_type_id = rt.id
        LEFT JOIN users v ON r.verified_by = v.id
        WHERE r.uploader_id = ?
        ORDER BY r.created_at DESC
      `, [userId]);
      return rows;
    } else {
      const contributions = fallbackStore.resources
        .filter(r => r.uploader_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return contributions.map(r => {
        const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
        const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};
        const rt = fallbackStore.resource_types.find(t => t.id === r.resource_type_id) || {};
        const verifier = r.verified_by ? fallbackStore.users.find(u => u.id === r.verified_by) : null;

        return {
          ...r,
          department_name: dept.name || 'Computer Science',
          department_code: dept.code || 'CS',
          subject_name: subj.name || 'Subject',
          subject_code: subj.code || 'SUBJ',
          resource_type_name: rt.name || 'Notes',
          resource_type_code: rt.code || 'notes',
          resource_type_icon: rt.icon || 'BookOpen',
          verified_by_name: verifier ? verifier.full_name : null
        };
      });
    }
  },

  // ==================== REQUEST METHODS ====================
  async getStudentRequests(userId) {
    if (!useFallback && pool) {
      const [rows] = await pool.query(`
        SELECT 
          rq.id, rq.title, rq.description, rq.status, rq.staff_remarks,
          rq.created_at, rq.updated_at,
          d.id as department_id, d.name as department_name, d.code as department_code,
          s.id as subject_id, s.name as subject_name, s.code as subject_code,
          u.full_name as resolved_by_name
        FROM resource_requests rq
        JOIN departments d ON rq.department_id = d.id
        JOIN subjects s ON rq.subject_id = s.id
        LEFT JOIN users u ON rq.resolved_by = u.id
        WHERE rq.user_id = ?
        ORDER BY rq.created_at DESC
      `, [userId]);
      return rows;
    } else {
      const requests = fallbackStore.resource_requests
        .filter(req => req.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return requests.map(rq => {
        const dept = fallbackStore.departments.find(d => d.id === rq.department_id) || {};
        const subj = fallbackStore.subjects.find(s => s.id === rq.subject_id) || {};
        const resolver = rq.resolved_by ? fallbackStore.users.find(u => u.id === rq.resolved_by) : null;

        return {
          ...rq,
          department_name: dept.name || 'Computer Science',
          department_code: dept.code || 'CS',
          subject_name: subj.name || 'Subject',
          subject_code: subj.code || 'SUBJ',
          resolved_by_name: resolver ? resolver.full_name : null
        };
      });
    }
  },

  async createStudentRequest({ user_id, department_id, subject_id, title, description }) {
    const id = crypto.randomUUID();
    if (!useFallback && pool) {
      await pool.query(`
        INSERT INTO resource_requests (id, user_id, department_id, subject_id, title, description, status)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
      `, [id, user_id, department_id, subject_id, title, description]);

      await this.notifyFacultyGroup({
        title: 'New Student Resource Request',
        message: `A new resource request "${title}" has been submitted for faculty and peer fulfillment.`,
        type: 'REQUEST',
        link: '/faculty/requests'
      });

      const [rows] = await pool.query(`
        SELECT rq.*, d.name as department_name, s.name as subject_name, s.code as subject_code
        FROM resource_requests rq
        JOIN departments d ON rq.department_id = d.id
        JOIN subjects s ON rq.subject_id = s.id
        WHERE rq.id = ?
      `, [id]);
      return rows[0];
    } else {
      const dept = fallbackStore.departments.find(d => d.id === department_id) || {};
      const subj = fallbackStore.subjects.find(s => s.id === subject_id) || {};

      const newReq = {
        id,
        user_id,
        department_id,
        subject_id,
        title,
        description,
        status: 'PENDING',
        staff_remarks: null,
        resolved_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        department_name: dept.name || 'Computer Science',
        department_code: dept.code || 'CS',
        subject_name: subj.name || 'Subject',
        subject_code: subj.code || 'SUBJ'
      };
      fallbackStore.resource_requests.unshift(newReq);

      await this.notifyFacultyGroup({
        title: 'New Student Resource Request',
        message: `A new resource request "${title}" has been submitted for faculty and peer fulfillment.`,
        type: 'REQUEST',
        link: '/faculty/requests'
      });

      return newReq;
    }
  },

  // ==================== DASHBOARD STATS ====================
  async getStudentDashboardStats(userId) {
    if (!useFallback && pool) {
      // 1. Total available resources (published)
      const [resCount] = await pool.query("SELECT COUNT(*) as count FROM resources WHERE status = 'PUBLISHED'");
      const totalAvailable = resCount[0].count;

      // 2. Total bookmarks of this student
      const [bmCount] = await pool.query("SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?", [userId]);
      const totalBookmarks = bmCount[0].count;

      // 3. Total downloads by this student
      const [dlCount] = await pool.query("SELECT COUNT(*) as count FROM resource_downloads WHERE user_id = ?", [userId]);
      const totalDownloads = dlCount[0].count;

      // 4. Active requests by this student (PENDING or IN PROGRESS)
      const [reqCount] = await pool.query("SELECT COUNT(*) as count FROM resource_requests WHERE user_id = ? AND status IN ('PENDING', 'IN PROGRESS')", [userId]);
      const activeRequests = reqCount[0].count;

      // 5. Student's contributions count
      const [contribCount] = await pool.query("SELECT COUNT(*) as count FROM resources WHERE uploader_id = ?", [userId]);
      const totalContributions = contribCount[0].count;

      const [contribPending] = await pool.query("SELECT COUNT(*) as count FROM resources WHERE uploader_id = ? AND status = 'PENDING'", [userId]);
      const [contribPublished] = await pool.query("SELECT COUNT(*) as count FROM resources WHERE uploader_id = ? AND status = 'PUBLISHED'", [userId]);

      // 6. Recently published resources (top 4)
      const [recentPublished] = await pool.query(`
        SELECT 
          r.id, r.title, r.description, r.academic_year, r.semester, r.file_size, r.download_count, r.created_at,
          d.name as department_name, d.code as department_code,
          s.name as subject_name, s.code as subject_code,
          rt.name as resource_type_name, rt.code as resource_type_code, rt.icon as resource_type_icon
        FROM resources r
        JOIN departments d ON r.department_id = d.id
        JOIN subjects s ON r.subject_id = s.id
        JOIN resource_types rt ON r.resource_type_id = rt.id
        WHERE r.status = 'PUBLISHED'
        ORDER BY r.created_at DESC
        LIMIT 4
      `);

      // 7. Recent activity (mix of recent downloads, bookmarks, uploads, and request status changes)
      const recentActivity = [];

      const [recentDls] = await pool.query(`
        SELECT rd.downloaded_at as activity_time, r.title, r.id as resource_id, 'download' as type
        FROM resource_downloads rd
        JOIN resources r ON rd.resource_id = r.id
        WHERE rd.user_id = ?
        ORDER BY rd.downloaded_at DESC
        LIMIT 3
      `, [userId]);
      recentDls.forEach(d => recentActivity.push({
        id: `act-dl-${d.activity_time}`,
        type: 'DOWNLOAD',
        title: `Downloaded "${d.title}"`,
        targetId: d.resource_id,
        timestamp: d.activity_time
      }));

      const [recentBms] = await pool.query(`
        SELECT bm.created_at as activity_time, r.title, r.id as resource_id, 'bookmark' as type
        FROM bookmarks bm
        JOIN resources r ON bm.resource_id = r.id
        WHERE bm.user_id = ?
        ORDER BY bm.created_at DESC
        LIMIT 3
      `, [userId]);
      recentBms.forEach(b => recentActivity.push({
        id: `act-bm-${b.activity_time}`,
        type: 'BOOKMARK',
        title: `Saved "${b.title}" to Bookmarks`,
        targetId: b.resource_id,
        timestamp: b.activity_time
      }));

      recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return {
        totalAvailable,
        totalBookmarks,
        totalDownloads,
        activeRequests,
        myContributions: {
          total: totalContributions,
          pending: contribPending[0].count,
          published: contribPublished[0].count
        },
        recentlyPublished: recentPublished,
        recentActivity: recentActivity.slice(0, 5)
      };
    } else {
      const totalAvailable = fallbackStore.resources.filter(r => r.status === 'PUBLISHED').length;
      const totalBookmarks = fallbackStore.bookmarks.filter(bm => bm.user_id === userId).length;
      const totalDownloads = fallbackStore.resource_downloads.filter(dl => dl.user_id === userId).length;
      const activeRequests = fallbackStore.resource_requests.filter(rq => rq.user_id === userId && (rq.status === 'PENDING' || rq.status === 'IN PROGRESS')).length;
      
      const userContribs = fallbackStore.resources.filter(r => r.uploader_id === userId);
      const totalContributions = userContribs.length;
      const contribPending = userContribs.filter(r => r.status === 'PENDING').length;
      const contribPublished = userContribs.filter(r => r.status === 'PUBLISHED').length;

      const recentlyPublished = fallbackStore.resources
        .filter(r => r.status === 'PUBLISHED')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4)
        .map(r => {
          const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
          const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};
          const rt = fallbackStore.resource_types.find(t => t.id === r.resource_type_id) || {};
          return {
            ...r,
            department_name: dept.name || 'Computer Science',
            department_code: dept.code || 'CS',
            subject_name: subj.name || 'Subject',
            subject_code: subj.code || 'SUBJ',
            resource_type_name: rt.name || 'Notes',
            resource_type_code: rt.code || 'notes',
            resource_type_icon: rt.icon || 'BookOpen'
          };
        });

      const recentActivity = [];

      fallbackStore.resource_downloads
        .filter(dl => dl.user_id === userId)
        .forEach(dl => {
          const r = fallbackStore.resources.find(res => res.id === dl.resource_id);
          recentActivity.push({
            id: `act-dl-${dl.id}`,
            type: 'DOWNLOAD',
            title: `Downloaded "${r ? r.title : 'Academic Resource'}"`,
            targetId: dl.resource_id,
            timestamp: dl.downloaded_at
          });
        });

      fallbackStore.bookmarks
        .filter(bm => bm.user_id === userId)
        .forEach(bm => {
          const r = fallbackStore.resources.find(res => res.id === bm.resource_id);
          recentActivity.push({
            id: `act-bm-${bm.id}`,
            type: 'BOOKMARK',
            title: `Saved "${r ? r.title : 'Academic Resource'}" to Bookmarks`,
            targetId: bm.resource_id,
            timestamp: bm.created_at
          });
        });

      fallbackStore.resources
        .filter(r => r.uploader_id === userId)
        .forEach(r => {
          recentActivity.push({
            id: `act-up-${r.id}`,
            type: 'UPLOAD',
            title: `Submitted "${r.title}" (${r.status})`,
            targetId: r.id,
            timestamp: r.created_at
          });
        });

      fallbackStore.resource_requests
        .filter(rq => rq.user_id === userId)
        .forEach(rq => {
          recentActivity.push({
            id: `act-rq-${rq.id}`,
            type: 'REQUEST',
            title: `Requested "${rq.title}" (${rq.status})`,
            targetId: rq.id,
            timestamp: rq.created_at
          });
        });

      recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return {
        totalAvailable,
        totalBookmarks,
        totalDownloads,
        activeRequests,
        myContributions: {
          total: totalContributions,
          pending: contribPending,
          published: contribPublished
        },
        recentlyPublished,
        recentActivity: recentActivity.slice(0, 5)
      };
    }
  },

  // ==================== FACULTY MODULES ====================

  // MODULE 1: Faculty Dashboard Statistics
  async getFacultyDashboardStats() {
    if (!useFallback && pool) {
      const [totalRes] = await pool.query('SELECT COUNT(*) as count FROM resources');
      const [pubRes] = await pool.query("SELECT COUNT(*) as count FROM resources WHERE status = 'PUBLISHED'");
      const [pendRes] = await pool.query("SELECT COUNT(*) as count FROM resources WHERE status = 'PENDING'");
      const [revRes] = await pool.query("SELECT COUNT(*) as count FROM resources WHERE status = 'UNDER REVIEW'");
      const [dlRes] = await pool.query('SELECT COALESCE(SUM(download_count), 0) as total FROM resources');
      const [reqRes] = await pool.query("SELECT COUNT(*) as count FROM resource_requests WHERE status IN ('PENDING', 'IN PROGRESS')");

      // Recently uploaded resources (all statuses, latest 5)
      const [recentlyUploaded] = await pool.query(`
        SELECT 
          r.id, r.title, r.description, r.academic_year, r.semester, r.year,
          r.file_url, r.file_name, r.file_size, r.status, r.download_count, r.created_at,
          d.name as department_name, d.code as department_code,
          s.name as subject_name, s.code as subject_code,
          rt.name as resource_type_name, rt.code as resource_type_code, rt.icon as resource_type_icon,
          u.full_name as uploader_name, u.role as uploader_role
        FROM resources r
        JOIN departments d ON r.department_id = d.id
        JOIN subjects s ON r.subject_id = s.id
        JOIN resource_types rt ON r.resource_type_id = rt.id
        JOIN users u ON r.uploader_id = u.id
        ORDER BY r.created_at DESC
        LIMIT 5
      `);

      // Recent activities from audit logs & recent uploads/requests
      const [auditLogs] = await pool.query(`
        SELECT al.id, al.action, al.details, al.created_at as timestamp, u.full_name as user_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 6
      `);

      return {
        totalResources: totalRes[0].count,
        publishedResources: pubRes[0].count,
        pendingSubmissions: pendRes[0].count,
        underReviewSubmissions: revRes[0].count,
        totalDownloads: parseInt(dlRes[0].total) || 0,
        activeStudentRequests: reqRes[0].count,
        recentlyUploaded,
        recentActivities: auditLogs.map(l => ({
          id: l.id,
          action: l.action,
          details: l.details || `Performed ${l.action}`,
          userName: l.user_name || 'System',
          timestamp: l.timestamp
        }))
      };
    } else {
      const totalResources = fallbackStore.resources.length;
      const publishedResources = fallbackStore.resources.filter(r => r.status === 'PUBLISHED').length;
      const pendingSubmissions = fallbackStore.resources.filter(r => r.status === 'PENDING').length;
      const underReviewSubmissions = fallbackStore.resources.filter(r => r.status === 'UNDER REVIEW').length;
      const totalDownloads = fallbackStore.resources.reduce((sum, r) => sum + (r.download_count || 0), 0);
      const activeStudentRequests = fallbackStore.resource_requests.filter(rq => rq.status === 'PENDING' || rq.status === 'IN PROGRESS').length;

      const recentlyUploaded = fallbackStore.resources
        .slice(0, 5)
        .map(r => {
          const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
          const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};
          const rt = fallbackStore.resource_types.find(t => t.id === r.resource_type_id) || {};
          const uploader = fallbackStore.users.find(u => u.id === r.uploader_id) || {};
          return {
            ...r,
            department_name: dept.name || 'Computer Science',
            department_code: dept.code || 'CS',
            subject_name: subj.name || 'Subject',
            subject_code: subj.code || 'SUBJ',
            resource_type_name: rt.name || 'Lecture Notes',
            resource_type_code: rt.code || 'notes',
            resource_type_icon: rt.icon || 'BookOpen',
            uploader_name: uploader.full_name || 'Faculty Member',
            uploader_role: uploader.role || 'faculty'
          };
        });

      const recentActivities = [];
      fallbackStore.resources.slice(0, 4).forEach(r => {
        const uploader = fallbackStore.users.find(u => u.id === r.uploader_id);
        recentActivities.push({
          id: `act-res-${r.id}`,
          action: 'RESOURCE_UPLOAD',
          details: `Resource "${r.title}" uploaded with status ${r.status}`,
          userName: uploader ? uploader.full_name : 'Faculty Staff',
          timestamp: r.created_at
        });
      });

      fallbackStore.resource_requests.slice(0, 2).forEach(rq => {
        const user = fallbackStore.users.find(u => u.id === rq.user_id);
        recentActivities.push({
          id: `act-req-${rq.id}`,
          action: 'RESOURCE_REQUEST',
          details: `Student request submitted: "${rq.title}"`,
          userName: user ? user.full_name : 'Student',
          timestamp: rq.created_at
        });
      });

      recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return {
        totalResources,
        publishedResources,
        pendingSubmissions,
        underReviewSubmissions,
        totalDownloads,
        activeStudentRequests,
        recentlyUploaded,
        recentActivities: recentActivities.slice(0, 6)
      };
    }
  },

  // MODULE 2: Manage Resources (All statuses, comprehensive filtering)
  async getFacultyResources({
    q = '',
    department = '',
    subject = '',
    resourceType = '',
    academicYear = '',
    status = '',
    sort = 'newest',
    page = 1,
    limit = 10
  }) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    if (!useFallback && pool) {
      let baseSql = `
        FROM resources r
        JOIN departments d ON r.department_id = d.id
        JOIN subjects s ON r.subject_id = s.id
        JOIN resource_types rt ON r.resource_type_id = rt.id
        JOIN users u ON r.uploader_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (q && q.trim()) {
        const kw = `%${q.trim()}%`;
        baseSql += ` AND (r.title LIKE ? OR r.description LIKE ? OR s.name LIKE ? OR s.code LIKE ?)`;
        params.push(kw, kw, kw, kw);
      }

      if (department && department !== 'all') {
        baseSql += ` AND (r.department_id = ? OR d.code = ?)`;
        params.push(department, department);
      }

      if (subject && subject !== 'all') {
        baseSql += ` AND (r.subject_id = ? OR s.code = ?)`;
        params.push(subject, subject);
      }

      if (resourceType && resourceType !== 'all') {
        baseSql += ` AND (r.resource_type_id = ? OR rt.code = ?)`;
        params.push(resourceType, resourceType);
      }

      if (academicYear && academicYear !== 'all') {
        baseSql += ` AND r.academic_year = ?`;
        params.push(academicYear);
      }

      if (status && status !== 'all' && status !== 'ALL') {
        baseSql += ` AND r.status = ?`;
        params.push(status);
      }

      const [countRows] = await pool.query(`SELECT COUNT(*) as total ${baseSql}`, params);
      const total = countRows[0].total;

      let orderBy = 'ORDER BY r.created_at DESC';
      if (sort === 'downloads') orderBy = 'ORDER BY r.download_count DESC, r.created_at DESC';
      else if (sort === 'title') orderBy = 'ORDER BY r.title ASC';
      else if (sort === 'oldest') orderBy = 'ORDER BY r.created_at ASC';

      const selectSql = `
        SELECT 
          r.id, r.title, r.description, r.academic_year, r.year, r.semester,
          r.file_url, r.file_name, r.file_size, r.file_mime, r.status,
          r.staff_remarks, r.verified_by, r.verified_at, r.download_count,
          r.created_at, r.updated_at,
          d.id as department_id, d.name as department_name, d.code as department_code,
          s.id as subject_id, s.name as subject_name, s.code as subject_code,
          rt.id as resource_type_id, rt.name as resource_type_name, rt.code as resource_type_code, rt.icon as resource_type_icon,
          u.id as uploader_id, u.full_name as uploader_name, u.role as uploader_role, u.email as uploader_email
        ${baseSql}
        ${orderBy}
        LIMIT ? OFFSET ?
      `;

      const [items] = await pool.query(selectSql, [...params, limitNum, offset]);

      return {
        items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      };
    } else {
      let items = [...fallbackStore.resources];

      if (q && q.trim()) {
        const kw = q.trim().toLowerCase();
        items = items.filter(r => {
          const subj = fallbackStore.subjects.find(s => s.id === r.subject_id);
          return r.title.toLowerCase().includes(kw) ||
            (r.description && r.description.toLowerCase().includes(kw)) ||
            (subj && (subj.name.toLowerCase().includes(kw) || subj.code.toLowerCase().includes(kw)));
        });
      }

      if (department && department !== 'all') {
        items = items.filter(r => {
          const dept = fallbackStore.departments.find(d => d.id === r.department_id);
          return r.department_id === department || (dept && dept.code.toLowerCase() === department.toLowerCase());
        });
      }

      if (subject && subject !== 'all') {
        items = items.filter(r => {
          const subj = fallbackStore.subjects.find(s => s.id === r.subject_id);
          return r.subject_id === subject || (subj && subj.code.toLowerCase() === subject.toLowerCase());
        });
      }

      if (resourceType && resourceType !== 'all') {
        items = items.filter(r => {
          const rt = fallbackStore.resource_types.find(t => t.id === r.resource_type_id);
          return r.resource_type_id === resourceType || (rt && rt.code.toLowerCase() === resourceType.toLowerCase());
        });
      }

      if (academicYear && academicYear !== 'all') {
        items = items.filter(r => r.academic_year === academicYear);
      }

      if (status && status !== 'all' && status !== 'ALL') {
        items = items.filter(r => r.status.toLowerCase() === status.toLowerCase());
      }

      if (sort === 'downloads') {
        items.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
      } else if (sort === 'title') {
        items.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'oldest') {
        items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } else {
        items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      const total = items.length;
      const paginatedItems = items.slice(offset, offset + limitNum).map(r => {
        const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
        const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};
        const rt = fallbackStore.resource_types.find(t => t.id === r.resource_type_id) || {};
        const uploader = fallbackStore.users.find(u => u.id === r.uploader_id) || {};

        return {
          ...r,
          department_name: dept.name || 'Computer Science',
          department_code: dept.code || 'CS',
          subject_name: subj.name || 'Subject',
          subject_code: subj.code || 'SUBJ',
          resource_type_name: rt.name || 'Notes',
          resource_type_code: rt.code || 'notes',
          resource_type_icon: rt.icon || 'BookOpen',
          uploader_name: uploader.full_name || 'Faculty Member',
          uploader_role: uploader.role || 'faculty',
          uploader_email: uploader.email || 'faculty@university.edu'
        };
      });

      return {
        items: paginatedItems,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      };
    }
  },

  // MODULE 3: Faculty Resource Upload (Auto-authorized as PUBLISHED)
  async createFacultyResource({
    title,
    description,
    department_id,
    subject_id,
    resource_type_id,
    academic_year,
    year,
    semester,
    file_url,
    file_name,
    file_size,
    file_mime,
    uploader_id,
    status = 'PUBLISHED',
    staff_remarks = 'Curricularly approved & published by faculty'
  }) {
    const id = crypto.randomUUID();
    const verifiedAt = status === 'PUBLISHED' ? new Date().toISOString() : null;
    const verifiedBy = status === 'PUBLISHED' ? uploader_id : null;

    if (!useFallback && pool) {
      await pool.query(`
        INSERT INTO resources (
          id, title, description, department_id, subject_id, resource_type_id,
          academic_year, year, semester, file_url, file_name, file_size, file_mime,
          uploader_id, status, staff_remarks, verified_by, verified_at, download_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `, [
        id, title, description, department_id, subject_id, resource_type_id,
        academic_year, parseInt(year) || 1, semester, file_url, file_name, file_size, file_mime,
        uploader_id, status, staff_remarks, verifiedBy, verifiedAt ? new Date() : null
      ]);

      return this.getResourceById(id);
    } else {
      const newResource = {
        id,
        title,
        description,
        department_id,
        subject_id,
        resource_type_id,
        academic_year,
        year: parseInt(year) || 1,
        semester,
        file_url,
        file_name,
        file_size,
        file_mime,
        uploader_id,
        status,
        staff_remarks,
        verified_by: verifiedBy,
        verified_at: verifiedAt,
        download_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      fallbackStore.resources.unshift(newResource);
      return this.getResourceById(id);
    }
  },

  // Update Resource Metadata
  async updateFacultyResource(id, fields) {
    if (!useFallback && pool) {
      const updates = [];
      const values = [];

      const allowedFields = [
        'title', 'description', 'department_id', 'subject_id', 'resource_type_id',
        'academic_year', 'year', 'semester', 'status', 'staff_remarks'
      ];

      for (const field of allowedFields) {
        if (fields[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(field === 'year' ? parseInt(fields[field]) || 1 : fields[field]);
        }
      }

      if (fields.status === 'PUBLISHED' || fields.status === 'VERIFIED') {
        updates.push('verified_at = CURRENT_TIMESTAMP');
        if (fields.verified_by) {
          updates.push('verified_by = ?');
          values.push(fields.verified_by);
        }
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);
        await pool.query(`UPDATE resources SET ${updates.join(', ')} WHERE id = ?`, values);
      }

      return this.getResourceById(id);
    } else {
      const index = fallbackStore.resources.findIndex(r => r.id === id);
      if (index === -1) return null;

      const current = fallbackStore.resources[index];
      Object.keys(fields).forEach(key => {
        if (fields[key] !== undefined) {
          current[key] = key === 'year' ? (parseInt(fields[key]) || 1) : fields[key];
        }
      });
      current.updated_at = new Date().toISOString();
      if (fields.status === 'PUBLISHED' || fields.status === 'VERIFIED') {
        current.verified_at = new Date().toISOString();
        if (fields.verified_by) current.verified_by = fields.verified_by;
      }
      return this.getResourceById(id);
    }
  },

  // Archive Resource
  async archiveFacultyResource(id) {
    return this.updateFacultyResource(id, { status: 'ARCHIVED' });
  },

  // Delete Resource
  async deleteFacultyResource(id) {
    if (!useFallback && pool) {
      await pool.query('DELETE FROM bookmarks WHERE resource_id = ?', [id]);
      await pool.query('DELETE FROM resource_downloads WHERE resource_id = ?', [id]);
      await pool.query('DELETE FROM resource_reviews WHERE resource_id = ?', [id]);
      const [res] = await pool.query('DELETE FROM resources WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } else {
      const initial = fallbackStore.resources.length;
      fallbackStore.resources = fallbackStore.resources.filter(r => r.id !== id);
      fallbackStore.bookmarks = fallbackStore.bookmarks.filter(bm => bm.resource_id !== id);
      fallbackStore.resource_downloads = fallbackStore.resource_downloads.filter(dl => dl.resource_id !== id);
      fallbackStore.resource_reviews = fallbackStore.resource_reviews.filter(rv => rv.resource_id !== id);
      return fallbackStore.resources.length < initial;
    }
  },

  // MODULE 4: Department Management
  async getDepartmentsDetailed() {
    if (!useFallback && pool) {
      const [rows] = await pool.query(`
        SELECT 
          d.*,
          (SELECT COUNT(*) FROM subjects s WHERE s.department_id = d.id) as subjects_count,
          (SELECT COUNT(*) FROM resources r WHERE r.department_id = d.id) as resources_count
        FROM departments d
        ORDER BY d.name ASC
      `);
      return rows;
    } else {
      return fallbackStore.departments.map(d => ({
        ...d,
        subjects_count: fallbackStore.subjects.filter(s => s.department_id === d.id).length,
        resources_count: fallbackStore.resources.filter(r => r.department_id === d.id).length
      }));
    }
  },

  async createDepartment({ code, name, description, icon = 'BookOpen' }) {
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!useFallback && pool) {
      const [existing] = await pool.query('SELECT id FROM departments WHERE UPPER(code) = ? LIMIT 1', [cleanCode]);
      if (existing.length > 0) {
        throw new Error(`Department with code '${cleanCode}' already exists.`);
      }

      const id = crypto.randomUUID();
      await pool.query(
        'INSERT INTO departments (id, code, name, description, icon) VALUES (?, ?, ?, ?, ?)',
        [id, cleanCode, cleanName, description || null, icon || 'BookOpen']
      );

      const [created] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
      return created[0];
    } else {
      const exists = fallbackStore.departments.some(d => d.code.toUpperCase() === cleanCode);
      if (exists) {
        throw new Error(`Department with code '${cleanCode}' already exists.`);
      }

      const newDept = {
        id: crypto.randomUUID(),
        code: cleanCode,
        name: cleanName,
        description: description || null,
        icon: icon || 'BookOpen',
        created_at: new Date().toISOString()
      };
      fallbackStore.departments.push(newDept);
      return newDept;
    }
  },

  async updateDepartment(id, { code, name, description, icon }) {
    if (!useFallback && pool) {
      const updates = [];
      const values = [];

      if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (icon !== undefined) { updates.push('icon = ?'); values.push(icon); }
      if (code !== undefined) { updates.push('code = ?'); values.push(code.trim().toUpperCase()); }

      if (updates.length > 0) {
        values.push(id);
        await pool.query(`UPDATE departments SET ${updates.join(', ')} WHERE id = ?`, values);
      }

      const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
      return updated[0] || null;
    } else {
      const dept = fallbackStore.departments.find(d => d.id === id);
      if (!dept) return null;

      if (name !== undefined) dept.name = name.trim();
      if (description !== undefined) dept.description = description;
      if (icon !== undefined) dept.icon = icon;
      if (code !== undefined) dept.code = code.trim().toUpperCase();

      return { ...dept };
    }
  },

  async deleteDepartment(id) {
    if (!useFallback && pool) {
      const [subjCount] = await pool.query('SELECT COUNT(*) as count FROM subjects WHERE department_id = ?', [id]);
      const [resCount] = await pool.query('SELECT COUNT(*) as count FROM resources WHERE department_id = ?', [id]);

      if (subjCount[0].count > 0 || resCount[0].count > 0) {
        throw new Error(`Cannot delete department. There are ${subjCount[0].count} subjects and ${resCount[0].count} resources currently associated.`);
      }

      const [res] = await pool.query('DELETE FROM departments WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } else {
      const hasSubjects = fallbackStore.subjects.some(s => s.department_id === id);
      const hasResources = fallbackStore.resources.some(r => r.department_id === id);

      if (hasSubjects || hasResources) {
        throw new Error('Cannot delete department. Associated subjects or resources exist.');
      }

      const init = fallbackStore.departments.length;
      fallbackStore.departments = fallbackStore.departments.filter(d => d.id !== id);
      return fallbackStore.departments.length < init;
    }
  },

  // MODULE 5: Subject Management
  async getSubjectsDetailed(departmentId = null) {
    if (!useFallback && pool) {
      let query = `
        SELECT 
          s.*,
          d.name as department_name, d.code as department_code,
          (SELECT COUNT(*) FROM resources r WHERE r.subject_id = s.id) as resources_count
        FROM subjects s
        JOIN departments d ON s.department_id = d.id
      `;
      const params = [];
      if (departmentId && departmentId !== 'all') {
        query += ' WHERE s.department_id = ? OR d.code = ?';
        params.push(departmentId, departmentId);
      }
      query += ' ORDER BY s.code ASC';

      const [rows] = await pool.query(query, params);
      return rows;
    } else {
      let list = fallbackStore.subjects.map(s => {
        const dept = fallbackStore.departments.find(d => d.id === s.department_id) || {};
        return {
          ...s,
          department_name: dept.name || 'Unknown Department',
          department_code: dept.code || 'GEN',
          resources_count: fallbackStore.resources.filter(r => r.subject_id === s.id).length
        };
      });

      if (departmentId && departmentId !== 'all') {
        list = list.filter(s => s.department_id === departmentId || s.department_code.toLowerCase() === departmentId.toLowerCase());
      }
      return list;
    }
  },

  async createSubject({ department_id, code, name, year = 1, semester = 'Semester 1', description = '' }) {
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!useFallback && pool) {
      const [existing] = await pool.query('SELECT id FROM subjects WHERE UPPER(code) = ? LIMIT 1', [cleanCode]);
      if (existing.length > 0) {
        throw new Error(`Subject with code '${cleanCode}' already exists.`);
      }

      const id = crypto.randomUUID();
      await pool.query(
        'INSERT INTO subjects (id, department_id, code, name, year, semester, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, department_id, cleanCode, cleanName, parseInt(year) || 1, semester, description || null]
      );

      const [created] = await pool.query(`
        SELECT s.*, d.name as department_name, d.code as department_code
        FROM subjects s JOIN departments d ON s.department_id = d.id
        WHERE s.id = ?
      `, [id]);
      return created[0];
    } else {
      const exists = fallbackStore.subjects.some(s => s.code.toUpperCase() === cleanCode);
      if (exists) {
        throw new Error(`Subject with code '${cleanCode}' already exists.`);
      }

      const id = crypto.randomUUID();
      const newSubj = {
        id,
        department_id,
        code: cleanCode,
        name: cleanName,
        year: parseInt(year) || 1,
        semester,
        description: description || null,
        created_at: new Date().toISOString()
      };
      fallbackStore.subjects.push(newSubj);

      const dept = fallbackStore.departments.find(d => d.id === department_id) || {};
      return {
        ...newSubj,
        department_name: dept.name || 'Department',
        department_code: dept.code || 'GEN',
        resources_count: 0
      };
    }
  },

  async updateSubject(id, { department_id, code, name, year, semester, description }) {
    if (!useFallback && pool) {
      const updates = [];
      const values = [];

      if (department_id !== undefined) { updates.push('department_id = ?'); values.push(department_id); }
      if (code !== undefined) { updates.push('code = ?'); values.push(code.trim().toUpperCase()); }
      if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()); }
      if (year !== undefined) { updates.push('year = ?'); values.push(parseInt(year) || 1); }
      if (semester !== undefined) { updates.push('semester = ?'); values.push(semester); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }

      if (updates.length > 0) {
        values.push(id);
        await pool.query(`UPDATE subjects SET ${updates.join(', ')} WHERE id = ?`, values);
      }

      const [updated] = await pool.query(`
        SELECT s.*, d.name as department_name, d.code as department_code
        FROM subjects s JOIN departments d ON s.department_id = d.id
        WHERE s.id = ?
      `, [id]);
      return updated[0] || null;
    } else {
      const subj = fallbackStore.subjects.find(s => s.id === id);
      if (!subj) return null;

      if (department_id !== undefined) subj.department_id = department_id;
      if (code !== undefined) subj.code = code.trim().toUpperCase();
      if (name !== undefined) subj.name = name.trim();
      if (year !== undefined) subj.year = parseInt(year) || 1;
      if (semester !== undefined) subj.semester = semester;
      if (description !== undefined) subj.description = description;

      const dept = fallbackStore.departments.find(d => d.id === subj.department_id) || {};
      return {
        ...subj,
        department_name: dept.name || 'Department',
        department_code: dept.code || 'GEN',
        resources_count: fallbackStore.resources.filter(r => r.subject_id === id).length
      };
    }
  },

  async deleteSubject(id) {
    if (!useFallback && pool) {
      const [resCount] = await pool.query('SELECT COUNT(*) as count FROM resources WHERE subject_id = ?', [id]);
      if (resCount[0].count > 0) {
        throw new Error(`Cannot delete subject. There are ${resCount[0].count} academic resources associated with this subject.`);
      }

      const [res] = await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } else {
      const hasResources = fallbackStore.resources.some(r => r.subject_id === id);
      if (hasResources) {
        throw new Error('Cannot delete subject. Associated resources exist.');
      }

      const init = fallbackStore.subjects.length;
      fallbackStore.subjects = fallbackStore.subjects.filter(s => s.id !== id);
      return fallbackStore.subjects.length < init;
    }
  },

  // MODULE 6: Resource Type Management
  async getResourceTypesDetailed() {
    if (!useFallback && pool) {
      const [rows] = await pool.query(`
        SELECT 
          rt.*,
          (SELECT COUNT(*) FROM resources r WHERE r.resource_type_id = rt.id) as resources_count
        FROM resource_types rt
        ORDER BY rt.name ASC
      `);
      return rows;
    } else {
      return fallbackStore.resource_types.map(rt => ({
        ...rt,
        resources_count: fallbackStore.resources.filter(r => r.resource_type_id === rt.id).length
      }));
    }
  },

  async createResourceType({ code, name, description = '', icon = 'FileText' }) {
    const cleanCode = code.trim().toLowerCase();
    const cleanName = name.trim();

    if (!useFallback && pool) {
      const [existing] = await pool.query('SELECT id FROM resource_types WHERE LOWER(code) = ? LIMIT 1', [cleanCode]);
      if (existing.length > 0) {
        throw new Error(`Resource type with code '${cleanCode}' already exists.`);
      }

      const id = crypto.randomUUID();
      await pool.query(
        'INSERT INTO resource_types (id, code, name, description, icon) VALUES (?, ?, ?, ?, ?)',
        [id, cleanCode, cleanName, description || null, icon || 'FileText']
      );

      const [created] = await pool.query('SELECT * FROM resource_types WHERE id = ?', [id]);
      return created[0];
    } else {
      const exists = fallbackStore.resource_types.some(t => t.code.toLowerCase() === cleanCode);
      if (exists) {
        throw new Error(`Resource type with code '${cleanCode}' already exists.`);
      }

      const newType = {
        id: crypto.randomUUID(),
        code: cleanCode,
        name: cleanName,
        description: description || null,
        icon: icon || 'FileText'
      };
      fallbackStore.resource_types.push(newType);
      return { ...newType, resources_count: 0 };
    }
  },

  async updateResourceType(id, { code, name, description, icon }) {
    if (!useFallback && pool) {
      const updates = [];
      const values = [];

      if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()); }
      if (code !== undefined) { updates.push('code = ?'); values.push(code.trim().toLowerCase()); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (icon !== undefined) { updates.push('icon = ?'); values.push(icon); }

      if (updates.length > 0) {
        values.push(id);
        await pool.query(`UPDATE resource_types SET ${updates.join(', ')} WHERE id = ?`, values);
      }

      const [updated] = await pool.query('SELECT * FROM resource_types WHERE id = ?', [id]);
      return updated[0] || null;
    } else {
      const item = fallbackStore.resource_types.find(t => t.id === id);
      if (!item) return null;

      if (name !== undefined) item.name = name.trim();
      if (code !== undefined) item.code = code.trim().toLowerCase();
      if (description !== undefined) item.description = description;
      if (icon !== undefined) item.icon = icon;

      return {
        ...item,
        resources_count: fallbackStore.resources.filter(r => r.resource_type_id === id).length
      };
    }
  },

  async deleteResourceType(id) {
    if (!useFallback && pool) {
      const [resCount] = await pool.query('SELECT COUNT(*) as count FROM resources WHERE resource_type_id = ?', [id]);
      if (resCount[0].count > 0) {
        throw new Error(`Cannot delete resource type. There are ${resCount[0].count} academic resources associated with this type.`);
      }

      const [res] = await pool.query('DELETE FROM resource_types WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } else {
      const hasResources = fallbackStore.resources.some(r => r.resource_type_id === id);
      if (hasResources) {
        throw new Error('Cannot delete resource type. Associated resources exist.');
      }

      const init = fallbackStore.resource_types.length;
      fallbackStore.resource_types = fallbackStore.resource_types.filter(t => t.id !== id);
      return fallbackStore.resource_types.length < init;
    }
  },

  // MODULE 7: Academic Year Management
  async createAcademicYear({ name, start_date = null, end_date = null, is_active = false }) {
    const cleanName = name.trim();
    const isActiveVal = is_active ? 1 : 0;

    if (!useFallback && pool) {
      const [existing] = await pool.query('SELECT id FROM academic_years WHERE name = ? LIMIT 1', [cleanName]);
      if (existing.length > 0) {
        throw new Error(`Academic year '${cleanName}' already exists.`);
      }

      // If active, unset other active years
      if (isActiveVal === 1) {
        await pool.query('UPDATE academic_years SET is_active = 0');
      }

      const id = crypto.randomUUID();
      await pool.query(
        'INSERT INTO academic_years (id, name, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)',
        [id, cleanName, start_date || null, end_date || null, isActiveVal]
      );

      const [created] = await pool.query('SELECT * FROM academic_years WHERE id = ?', [id]);
      return created[0];
    } else {
      const exists = fallbackStore.academic_years.some(y => y.name === cleanName);
      if (exists) {
        throw new Error(`Academic year '${cleanName}' already exists.`);
      }

      if (isActiveVal === 1) {
        fallbackStore.academic_years.forEach(y => { y.is_active = 0; });
      }

      const newYear = {
        id: crypto.randomUUID(),
        name: cleanName,
        start_date: start_date || null,
        end_date: end_date || null,
        is_active: isActiveVal,
        created_at: new Date().toISOString()
      };
      fallbackStore.academic_years.push(newYear);
      return newYear;
    }
  },

  async updateAcademicYear(id, { name, start_date, end_date, is_active }) {
    if (!useFallback && pool) {
      if (is_active) {
        await pool.query('UPDATE academic_years SET is_active = 0 WHERE id != ?', [id]);
      }

      const updates = [];
      const values = [];

      if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()); }
      if (start_date !== undefined) { updates.push('start_date = ?'); values.push(start_date || null); }
      if (end_date !== undefined) { updates.push('end_date = ?'); values.push(end_date || null); }
      if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }

      if (updates.length > 0) {
        values.push(id);
        await pool.query(`UPDATE academic_years SET ${updates.join(', ')} WHERE id = ?`, values);
      }

      const [updated] = await pool.query('SELECT * FROM academic_years WHERE id = ?', [id]);
      return updated[0] || null;
    } else {
      const year = fallbackStore.academic_years.find(y => y.id === id);
      if (!year) return null;

      if (is_active) {
        fallbackStore.academic_years.forEach(y => {
          if (y.id !== id) y.is_active = 0;
        });
      }

      if (name !== undefined) year.name = name.trim();
      if (start_date !== undefined) year.start_date = start_date || null;
      if (end_date !== undefined) year.end_date = end_date || null;
      if (is_active !== undefined) year.is_active = is_active ? 1 : 0;

      return { ...year };
    }
  },

  async setActiveAcademicYear(id) {
    if (!useFallback && pool) {
      await pool.query('UPDATE academic_years SET is_active = 0');
      await pool.query('UPDATE academic_years SET is_active = 1 WHERE id = ?', [id]);
      const [updated] = await pool.query('SELECT * FROM academic_years WHERE id = ?', [id]);
      return updated[0] || null;
    } else {
      const target = fallbackStore.academic_years.find(y => y.id === id);
      if (!target) return null;

      fallbackStore.academic_years.forEach(y => {
        y.is_active = y.id === id ? 1 : 0;
      });
      return { ...target, is_active: 1 };
    }
  },

  async deleteAcademicYear(id) {
    if (!useFallback && pool) {
      const [row] = await pool.query('SELECT * FROM academic_years WHERE id = ? LIMIT 1', [id]);
      if (row.length === 0) return false;

      if (row[0].is_active) {
        throw new Error('Cannot delete the currently active academic year.');
      }

      // Check if resources reference this year
      const [resCount] = await pool.query('SELECT COUNT(*) as count FROM resources WHERE academic_year = ?', [row[0].name]);
      if (resCount[0].count > 0) {
        throw new Error(`Cannot delete academic year '${row[0].name}'. There are ${resCount[0].count} resources associated with it.`);
      }

      const [res] = await pool.query('DELETE FROM academic_years WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } else {
      const item = fallbackStore.academic_years.find(y => y.id === id);
      if (!item) return false;

      if (item.is_active) {
        throw new Error('Cannot delete the currently active academic year.');
      }

      const hasResources = fallbackStore.resources.some(r => r.academic_year === item.name);
      if (hasResources) {
        throw new Error(`Cannot delete academic year '${item.name}'. Associated resources exist.`);
      }

      const init = fallbackStore.academic_years.length;
      fallbackStore.academic_years = fallbackStore.academic_years.filter(y => y.id !== id);
      return fallbackStore.academic_years.length < init;
    }
  },

  // ==================== PHASE 4: FACULTY PORTAL PART B ====================

  // MODULE 1 & 2: Verification Management & Student Contributions
  async getStudentContributionsForFaculty({
    status = 'ALL',
    department = 'all',
    search = '',
    sort = 'newest',
    page = 1,
    limit = 10
  } = {}) {
    if (!useFallback && pool) {
      // 1. Fetch aggregate status counts for student contributions
      const [countRows] = await pool.query(`
        SELECT 
          COUNT(*) as total_all,
          SUM(CASE WHEN r.status = 'PENDING' THEN 1 ELSE 0 END) as total_pending,
          SUM(CASE WHEN r.status = 'UNDER REVIEW' THEN 1 ELSE 0 END) as total_under_review,
          SUM(CASE WHEN r.status = 'VERIFIED' THEN 1 ELSE 0 END) as total_verified,
          SUM(CASE WHEN r.status = 'REJECTED' THEN 1 ELSE 0 END) as total_rejected,
          SUM(CASE WHEN r.status = 'PUBLISHED' THEN 1 ELSE 0 END) as total_published,
          SUM(CASE WHEN r.status = 'ARCHIVED' THEN 1 ELSE 0 END) as total_archived
        FROM resources r
        JOIN users u ON r.uploader_id = u.id
        WHERE u.role = 'student'
      `);

      const counts = {
        all: Number(countRows[0]?.total_all || 0),
        pending: Number(countRows[0]?.total_pending || 0),
        underReview: Number(countRows[0]?.total_under_review || 0),
        verified: Number(countRows[0]?.total_verified || 0),
        rejected: Number(countRows[0]?.total_rejected || 0),
        published: Number(countRows[0]?.total_published || 0),
        archived: Number(countRows[0]?.total_archived || 0)
      };

      // 2. Build filtered query
      const conditions = ["u.role = 'student'"];
      const params = [];

      const normalizedStatus = (status || '').toUpperCase().trim();
      if (normalizedStatus && normalizedStatus !== 'ALL') {
        if (normalizedStatus === 'UNDER_REVIEW' || normalizedStatus === 'UNDER REVIEW') {
          conditions.push("r.status = 'UNDER REVIEW'");
        } else {
          conditions.push('r.status = ?');
          params.push(normalizedStatus);
        }
      }

      if (department && department !== 'all') {
        conditions.push('(d.id = ? OR d.code = ? OR d.name = ?)');
        params.push(department, department, department);
      }

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        conditions.push('(r.title LIKE ? OR r.description LIKE ? OR u.full_name LIKE ? OR s.code LIKE ? OR s.name LIKE ?)');
        params.push(term, term, term, term, term);
      }

      const whereClause = conditions.join(' AND ');

      // Total count matching filter
      const [filteredCountRow] = await pool.query(
        `SELECT COUNT(*) as count 
         FROM resources r 
         JOIN users u ON r.uploader_id = u.id 
         JOIN departments d ON r.department_id = d.id 
         JOIN subjects s ON r.subject_id = s.id 
         WHERE ${whereClause}`,
        params
      );
      const total = filteredCountRow[0]?.count || 0;

      // Sorting
      let orderBy = 'r.created_at DESC';
      if (sort === 'oldest') orderBy = 'r.created_at ASC';
      else if (sort === 'title') orderBy = 'r.title ASC';
      else if (sort === 'student') orderBy = 'u.full_name ASC';

      // Pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const offset = (pageNum - 1) * limitNum;

      const [items] = await pool.query(`
        SELECT 
          r.id, r.title, r.description, r.academic_year, r.year, r.semester,
          r.file_url, r.file_name, r.file_size, r.file_mime,
          r.status, r.staff_remarks, r.verified_by, r.verified_at, r.download_count,
          r.created_at, r.updated_at,
          d.id as department_id, d.name as department_name, d.code as department_code,
          s.id as subject_id, s.name as subject_name, s.code as subject_code,
          rt.id as resource_type_id, rt.name as resource_type_name, rt.code as resource_type_code, rt.icon as resource_type_icon,
          u.id as student_id, u.full_name as student_name, u.email as student_email,
          u.department as student_department, u.academic_year as student_academic_year, u.semester as student_semester,
          v.full_name as verifier_name
        FROM resources r
        JOIN users u ON r.uploader_id = u.id
        JOIN departments d ON r.department_id = d.id
        JOIN subjects s ON r.subject_id = s.id
        JOIN resource_types rt ON r.resource_type_id = rt.id
        LEFT JOIN users v ON r.verified_by = v.id
        WHERE ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `, [...params, limitNum, offset]);

      return {
        items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        },
        counts
      };
    } else {
      // Fallback Store implementation
      const studentResources = fallbackStore.resources.filter(r => {
        const uploader = fallbackStore.users.find(u => u.id === r.uploader_id);
        return uploader && uploader.role === 'student';
      });

      const counts = {
        all: studentResources.length,
        pending: studentResources.filter(r => r.status === 'PENDING').length,
        underReview: studentResources.filter(r => r.status === 'UNDER REVIEW').length,
        verified: studentResources.filter(r => r.status === 'VERIFIED').length,
        rejected: studentResources.filter(r => r.status === 'REJECTED').length,
        published: studentResources.filter(r => r.status === 'PUBLISHED').length,
        archived: studentResources.filter(r => r.status === 'ARCHIVED').length
      };

      let filtered = studentResources.filter(r => {
        const uploader = fallbackStore.users.find(u => u.id === r.uploader_id) || {};
        const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
        const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};

        // Status filter
        const normStatus = (status || '').toUpperCase().trim();
        if (normStatus && normStatus !== 'ALL') {
          if (normStatus === 'UNDER_REVIEW' || normStatus === 'UNDER REVIEW') {
            if (r.status !== 'UNDER REVIEW') return false;
          } else if (r.status !== normStatus) {
            return false;
          }
        }

        // Department filter
        if (department && department !== 'all') {
          if (dept.id !== department && dept.code !== department && dept.name !== department) {
            return false;
          }
        }

        // Search query
        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          const matchTitle = (r.title || '').toLowerCase().includes(q);
          const matchDesc = (r.description || '').toLowerCase().includes(q);
          const matchStudent = (uploader.full_name || '').toLowerCase().includes(q);
          const matchSubj = (subj.name || '').toLowerCase().includes(q) || (subj.code || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchStudent && !matchSubj) return false;
        }

        return true;
      });

      // Sorting
      if (sort === 'oldest') {
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } else if (sort === 'title') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'student') {
        filtered.sort((a, b) => {
          const uA = fallbackStore.users.find(u => u.id === a.uploader_id)?.full_name || '';
          const uB = fallbackStore.users.find(u => u.id === b.uploader_id)?.full_name || '';
          return uA.localeCompare(uB);
        });
      } else {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      const total = filtered.length;
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const offset = (pageNum - 1) * limitNum;
      const sliced = filtered.slice(offset, offset + limitNum);

      const items = sliced.map(r => {
        const uploader = fallbackStore.users.find(u => u.id === r.uploader_id) || {};
        const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
        const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};
        const rType = fallbackStore.resource_types.find(rt => rt.id === r.resource_type_id) || {};
        const verifier = r.verified_by ? fallbackStore.users.find(u => u.id === r.verified_by) : null;

        return {
          id: r.id,
          title: r.title,
          description: r.description,
          academic_year: r.academic_year,
          year: r.year,
          semester: r.semester,
          file_url: r.file_url,
          file_name: r.file_name,
          file_size: r.file_size,
          file_mime: r.file_mime,
          status: r.status,
          staff_remarks: r.staff_remarks,
          verified_by: r.verified_by,
          verified_at: r.verified_at,
          download_count: r.download_count || 0,
          created_at: r.created_at,
          updated_at: r.updated_at,
          department_id: dept.id || r.department_id,
          department_name: dept.name || 'Department',
          department_code: dept.code || 'DEPT',
          subject_id: subj.id || r.subject_id,
          subject_name: subj.name || 'Subject',
          subject_code: subj.code || 'SUBJ',
          resource_type_id: rType.id || r.resource_type_id,
          resource_type_name: rType.name || 'Document',
          resource_type_code: rType.code || 'doc',
          resource_type_icon: rType.icon || 'FileText',
          student_id: uploader.id || r.uploader_id,
          student_name: uploader.full_name || 'Student Contributor',
          student_email: uploader.email || '',
          student_department: uploader.department || dept.name,
          student_academic_year: uploader.academic_year || 'Senior',
          student_semester: uploader.semester || 'Semester 1',
          verifier_name: verifier?.full_name || null
        };
      });

      return {
        items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        },
        counts
      };
    }
  },

  // MODULE 2: Submission Details & Review History
  async getVerificationDetails(resourceId) {
    if (!useFallback && pool) {
      const [resRows] = await pool.query(`
        SELECT 
          r.id, r.title, r.description, r.academic_year, r.year, r.semester,
          r.file_url, r.file_name, r.file_size, r.file_mime,
          r.status, r.staff_remarks, r.verified_by, r.verified_at, r.download_count,
          r.created_at, r.updated_at,
          d.id as department_id, d.name as department_name, d.code as department_code,
          s.id as subject_id, s.name as subject_name, s.code as subject_code, s.description as subject_description,
          rt.id as resource_type_id, rt.name as resource_type_name, rt.code as resource_type_code, rt.icon as resource_type_icon,
          u.id as student_id, u.full_name as student_name, u.email as student_email,
          u.department as student_department, u.academic_year as student_academic_year, u.semester as student_semester,
          v.full_name as verifier_name
        FROM resources r
        JOIN users u ON r.uploader_id = u.id
        JOIN departments d ON r.department_id = d.id
        JOIN subjects s ON r.subject_id = s.id
        JOIN resource_types rt ON r.resource_type_id = rt.id
        LEFT JOIN users v ON r.verified_by = v.id
        WHERE r.id = ?
        LIMIT 1
      `, [resourceId]);

      if (resRows.length === 0) return null;
      const resource = resRows[0];

      // Fetch review history
      const [reviewRows] = await pool.query(`
        SELECT 
          rv.id, rv.resource_id, rv.review_status, rv.remarks, rv.created_at,
          u.id as staff_id, u.full_name as staff_name, u.email as staff_email, u.role as staff_role
        FROM resource_reviews rv
        JOIN users u ON (rv.staff_id = u.id OR rv.user_id = u.id)
        WHERE rv.resource_id = ?
        ORDER BY rv.created_at DESC
      `, [resourceId]);

      return {
        resource,
        reviewHistory: reviewRows
      };
    } else {
      const r = fallbackStore.resources.find(res => res.id === resourceId);
      if (!r) return null;

      const uploader = fallbackStore.users.find(u => u.id === r.uploader_id) || {};
      const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
      const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};
      const rType = fallbackStore.resource_types.find(rt => rt.id === r.resource_type_id) || {};
      const verifier = r.verified_by ? fallbackStore.users.find(u => u.id === r.verified_by) : null;

      const resource = {
        id: r.id,
        title: r.title,
        description: r.description,
        academic_year: r.academic_year,
        year: r.year,
        semester: r.semester,
        file_url: r.file_url,
        file_name: r.file_name,
        file_size: r.file_size,
        file_mime: r.file_mime,
        status: r.status,
        staff_remarks: r.staff_remarks,
        verified_by: r.verified_by,
        verified_at: r.verified_at,
        download_count: r.download_count || 0,
        created_at: r.created_at,
        updated_at: r.updated_at,
        department_id: dept.id || r.department_id,
        department_name: dept.name || 'Department',
        department_code: dept.code || 'DEPT',
        subject_id: subj.id || r.subject_id,
        subject_name: subj.name || 'Subject',
        subject_code: subj.code || 'SUBJ',
        subject_description: subj.description || '',
        resource_type_id: rType.id || r.resource_type_id,
        resource_type_name: rType.name || 'Document',
        resource_type_code: rType.code || 'doc',
        resource_type_icon: rType.icon || 'FileText',
        student_id: uploader.id || r.uploader_id,
        student_name: uploader.full_name || 'Student Contributor',
        student_email: uploader.email || '',
        student_department: uploader.department || dept.name,
        student_academic_year: uploader.academic_year || 'Senior',
        student_semester: uploader.semester || 'Semester 1',
        verifier_name: verifier?.full_name || null
      };

      const reviews = fallbackStore.resource_reviews
        .filter(rv => rv.resource_id === resourceId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(rv => {
          const reviewer = fallbackStore.users.find(u => u.id === (rv.staff_id || rv.user_id)) || {};
          return {
            id: rv.id,
            resource_id: rv.resource_id,
            review_status: rv.review_status,
            remarks: rv.remarks || rv.review_text,
            created_at: rv.created_at,
            staff_id: reviewer.id || rv.staff_id,
            staff_name: reviewer.full_name || 'Institutional Faculty',
            staff_email: reviewer.email || '',
            staff_role: reviewer.role || 'faculty'
          };
        });

      return {
        resource,
        reviewHistory: reviews
      };
    }
  },

  // MODULE 2: Update Verification Status & Record Review
  async updateVerificationStatus(resourceId, staffId, { status, remarks }) {
    const validStatuses = ['PENDING', 'UNDER REVIEW', 'VERIFIED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'];
    const normStatus = (status || '').toUpperCase().trim();

    if (!validStatuses.includes(normStatus)) {
      throw new Error(`Invalid review status: "${status}". Must be one of ${validStatuses.join(', ')}`);
    }

    if (normStatus === 'REJECTED' && (!remarks || !remarks.trim())) {
      throw new Error('Institutional review remarks are mandatory when rejecting a student contribution.');
    }

    const now = new Date().toISOString();
    const cleanRemarks = (remarks || '').trim();

    if (!useFallback && pool) {
      // 1. Check existing resource
      const [resCheck] = await pool.query('SELECT * FROM resources WHERE id = ? LIMIT 1', [resourceId]);
      if (resCheck.length === 0) {
        throw new Error('Resource not found.');
      }
      const existing = resCheck[0];

      // 2. Determine verification timestamp and verifier
      const isDecision = ['VERIFIED', 'REJECTED', 'PUBLISHED'].includes(normStatus);
      const verifiedBy = isDecision ? staffId : existing.verified_by;
      const verifiedAt = isDecision ? new Date() : existing.verified_at;

      // 3. Update resources table
      await pool.query(`
        UPDATE resources 
        SET status = ?, staff_remarks = ?, verified_by = ?, verified_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [normStatus, cleanRemarks || existing.staff_remarks, verifiedBy, verifiedAt, resourceId]);

      // 4. Record entry in resource_reviews (Append-only review history)
      const reviewId = `rev-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      await pool.query(`
        INSERT INTO resource_reviews (id, resource_id, staff_id, user_id, review_status, action, previous_status, new_status, remarks, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [reviewId, resourceId, staffId, staffId, normStatus, normStatus, existing.status, normStatus, cleanRemarks || `Status marked as ${normStatus}`]);

      // 5. Audit log
      await pool.query(`
        INSERT INTO audit_logs (id, user_id, action, status, details, created_at)
        VALUES (?, ?, 'FACULTY_VERIFY_RESOURCE', 'SUCCESS', ?, CURRENT_TIMESTAMP)
      `, [`aud-${Date.now()}`, staffId, `Updated resource ${resourceId} status to ${normStatus}. Remarks: ${cleanRemarks}`]);

      // 6. Emit real-time notification to student contributor
      const notifType = normStatus === 'REJECTED' ? 'REJECTION' : (normStatus === 'PUBLISHED' ? 'PUBLICATION' : 'STATUS_CHANGE');
      await this.createNotification({
        user_id: existing.uploader_id,
        title: `Resource Review: ${normStatus}`,
        message: `Your contribution "${existing.title}" has been updated to "${normStatus}".${cleanRemarks ? ` Faculty Remarks: "${cleanRemarks}"` : ''}`,
        type: notifType,
        link: '/student/contributions'
      });

      return await this.getVerificationDetails(resourceId);
    } else {
      const resource = fallbackStore.resources.find(r => r.id === resourceId);
      if (!resource) {
        throw new Error('Resource not found.');
      }

      const previousStatus = resource.status;
      const isDecision = ['VERIFIED', 'REJECTED', 'PUBLISHED'].includes(normStatus);
      resource.status = normStatus;
      if (cleanRemarks) resource.staff_remarks = cleanRemarks;
      if (isDecision) {
        resource.verified_by = staffId;
        resource.verified_at = now;
      }
      resource.updated_at = now;

      // Insert review history (Append-only)
      const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      fallbackStore.resource_reviews.unshift({
        id: reviewId,
        resource_id: resourceId,
        staff_id: staffId,
        user_id: staffId,
        review_status: normStatus,
        action: normStatus,
        previous_status: previousStatus,
        new_status: normStatus,
        remarks: cleanRemarks || `Status updated to ${normStatus}`,
        rating: null,
        review_text: null,
        created_at: now,
        updated_at: now
      });

      // Audit log
      fallbackStore.audit_logs.unshift({
        id: `aud-${Date.now()}`,
        user_id: staffId,
        action: 'FACULTY_VERIFY_RESOURCE',
        status: 'SUCCESS',
        ip_address: '127.0.0.1',
        details: `Updated resource "${resource.title}" (${resourceId}) status to ${normStatus}. Remarks: ${cleanRemarks}`,
        created_at: now
      });

      // Emit real-time notification to student contributor
      const notifType = normStatus === 'REJECTED' ? 'REJECTION' : (normStatus === 'PUBLISHED' ? 'PUBLICATION' : 'STATUS_CHANGE');
      await this.createNotification({
        user_id: resource.uploader_id,
        title: `Resource Review: ${normStatus}`,
        message: `Your contribution "${resource.title}" has been updated to "${normStatus}".${cleanRemarks ? ` Faculty Remarks: "${cleanRemarks}"` : ''}`,
        type: notifType,
        link: '/student/contributions'
      });

      return await this.getVerificationDetails(resourceId);
    }
  },

  // MODULE 3: Resource Request Management
  async getFacultyRequests({
    status = 'ALL',
    department = 'all',
    search = '',
    sort = 'newest',
    page = 1,
    limit = 10
  } = {}) {
    if (!useFallback && pool) {
      // 1. Status counts
      const [countRows] = await pool.query(`
        SELECT 
          COUNT(*) as total_all,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as total_pending,
          SUM(CASE WHEN status = 'IN PROGRESS' THEN 1 ELSE 0 END) as total_in_progress,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as total_completed,
          SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as total_closed
        FROM resource_requests
      `);

      const counts = {
        all: Number(countRows[0]?.total_all || 0),
        pending: Number(countRows[0]?.total_pending || 0),
        inProgress: Number(countRows[0]?.total_in_progress || 0),
        completed: Number(countRows[0]?.total_completed || 0),
        closed: Number(countRows[0]?.total_closed || 0)
      };

      // 2. Build filtered conditions
      const conditions = [];
      const params = [];

      const normStatus = (status || '').toUpperCase().trim();
      if (normStatus && normStatus !== 'ALL') {
        if (normStatus === 'IN_PROGRESS' || normStatus === 'IN PROGRESS') {
          conditions.push("req.status = 'IN PROGRESS'");
        } else {
          conditions.push('req.status = ?');
          params.push(normStatus);
        }
      }

      if (department && department !== 'all') {
        conditions.push('(d.id = ? OR d.code = ? OR d.name = ?)');
        params.push(department, department, department);
      }

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        conditions.push('(req.title LIKE ? OR req.description LIKE ? OR u.full_name LIKE ? OR s.name LIKE ? OR s.code LIKE ?)');
        params.push(term, term, term, term, term);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Total count
      const [countFiltered] = await pool.query(`
        SELECT COUNT(*) as count
        FROM resource_requests req
        JOIN users u ON req.user_id = u.id
        JOIN departments d ON req.department_id = d.id
        JOIN subjects s ON req.subject_id = s.id
        ${whereClause}
      `, params);
      const total = countFiltered[0]?.count || 0;

      // Sorting
      let orderBy = 'req.created_at DESC';
      if (sort === 'oldest') orderBy = 'req.created_at ASC';
      else if (sort === 'title') orderBy = 'req.title ASC';

      // Pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const offset = (pageNum - 1) * limitNum;

      const [items] = await pool.query(`
        SELECT 
          req.id, req.title, req.description, req.status, req.staff_remarks,
          req.created_at, req.updated_at,
          d.id as department_id, d.name as department_name, d.code as department_code,
          s.id as subject_id, s.name as subject_name, s.code as subject_code,
          u.id as student_id, u.full_name as student_name, u.email as student_email,
          u.department as student_department, u.academic_year as student_academic_year, u.semester as student_semester,
          res_u.full_name as resolver_name
        FROM resource_requests req
        JOIN users u ON req.user_id = u.id
        JOIN departments d ON req.department_id = d.id
        JOIN subjects s ON req.subject_id = s.id
        LEFT JOIN users res_u ON req.resolved_by = res_u.id
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `, [...params, limitNum, offset]);

      return {
        items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        },
        counts
      };
    } else {
      const allRequests = fallbackStore.resource_requests;
      const counts = {
        all: allRequests.length,
        pending: allRequests.filter(r => r.status === 'PENDING').length,
        inProgress: allRequests.filter(r => r.status === 'IN PROGRESS').length,
        completed: allRequests.filter(r => r.status === 'COMPLETED').length,
        closed: allRequests.filter(r => r.status === 'CLOSED').length
      };

      let filtered = allRequests.filter(r => {
        const student = fallbackStore.users.find(u => u.id === r.user_id) || {};
        const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
        const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};

        const normStatus = (status || '').toUpperCase().trim();
        if (normStatus && normStatus !== 'ALL') {
          if (normStatus === 'IN_PROGRESS' || normStatus === 'IN PROGRESS') {
            if (r.status !== 'IN PROGRESS') return false;
          } else if (r.status !== normStatus) {
            return false;
          }
        }

        if (department && department !== 'all') {
          if (dept.id !== department && dept.code !== department && dept.name !== department) {
            return false;
          }
        }

        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          const mTitle = (r.title || '').toLowerCase().includes(q);
          const mDesc = (r.description || '').toLowerCase().includes(q);
          const mStudent = (student.full_name || '').toLowerCase().includes(q);
          const mSubj = (subj.name || '').toLowerCase().includes(q) || (subj.code || '').toLowerCase().includes(q);
          if (!mTitle && !mDesc && !mStudent && !mSubj) return false;
        }

        return true;
      });

      if (sort === 'oldest') {
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      } else if (sort === 'title') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      const total = filtered.length;
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
      const offset = (pageNum - 1) * limitNum;
      const sliced = filtered.slice(offset, offset + limitNum);

      const items = sliced.map(r => {
        const student = fallbackStore.users.find(u => u.id === r.user_id) || {};
        const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
        const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};
        const resolver = r.resolved_by ? fallbackStore.users.find(u => u.id === r.resolved_by) : null;

        return {
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status,
          staff_remarks: r.staff_remarks,
          created_at: r.created_at,
          updated_at: r.updated_at,
          department_id: dept.id || r.department_id,
          department_name: dept.name || 'Department',
          department_code: dept.code || 'DEPT',
          subject_id: subj.id || r.subject_id,
          subject_name: subj.name || 'Subject',
          subject_code: subj.code || 'SUBJ',
          student_id: student.id || r.user_id,
          student_name: student.full_name || 'Student',
          student_email: student.email || '',
          student_department: student.department || dept.name,
          student_academic_year: student.academic_year || 'Senior',
          student_semester: student.semester || 'Semester 1',
          resolver_name: resolver?.full_name || null
        };
      });

      return {
        items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        },
        counts
      };
    }
  },

  async getFacultyRequestById(requestId) {
    if (!useFallback && pool) {
      const [rows] = await pool.query(`
        SELECT 
          req.id, req.title, req.description, req.status, req.staff_remarks,
          req.created_at, req.updated_at,
          d.id as department_id, d.name as department_name, d.code as department_code,
          s.id as subject_id, s.name as subject_name, s.code as subject_code,
          u.id as student_id, u.full_name as student_name, u.email as student_email,
          u.department as student_department, u.academic_year as student_academic_year, u.semester as student_semester,
          res_u.full_name as resolver_name
        FROM resource_requests req
        JOIN users u ON req.user_id = u.id
        JOIN departments d ON req.department_id = d.id
        JOIN subjects s ON req.subject_id = s.id
        LEFT JOIN users res_u ON req.resolved_by = res_u.id
        WHERE req.id = ?
        LIMIT 1
      `, [requestId]);

      return rows[0] || null;
    } else {
      const req = fallbackStore.resource_requests.find(r => r.id === requestId);
      if (!req) return null;

      const student = fallbackStore.users.find(u => u.id === req.user_id) || {};
      const dept = fallbackStore.departments.find(d => d.id === req.department_id) || {};
      const subj = fallbackStore.subjects.find(s => s.id === req.subject_id) || {};
      const resolver = req.resolved_by ? fallbackStore.users.find(u => u.id === req.resolved_by) : null;

      return {
        id: req.id,
        title: req.title,
        description: req.description,
        status: req.status,
        staff_remarks: req.staff_remarks,
        created_at: req.created_at,
        updated_at: req.updated_at,
        department_id: dept.id || req.department_id,
        department_name: dept.name || 'Department',
        department_code: dept.code || 'DEPT',
        subject_id: subj.id || req.subject_id,
        subject_name: subj.name || 'Subject',
        subject_code: subj.code || 'SUBJ',
        student_id: student.id || req.user_id,
        student_name: student.full_name || 'Student',
        student_email: student.email || '',
        student_department: student.department || dept.name,
        student_academic_year: student.academic_year || 'Senior',
        student_semester: student.semester || 'Semester 1',
        resolver_name: resolver?.full_name || null
      };
    }
  },

  async updateFacultyRequest(requestId, staffId, { status, staff_remarks }) {
    const validStatuses = ['PENDING', 'IN PROGRESS', 'COMPLETED', 'CLOSED'];
    const normStatus = (status || '').toUpperCase().trim();

    if (!validStatuses.includes(normStatus)) {
      throw new Error(`Invalid request status: "${status}". Must be one of ${validStatuses.join(', ')}`);
    }

    const cleanRemarks = (staff_remarks || '').trim();
    const now = new Date().toISOString();

    if (!useFallback && pool) {
      const [reqCheck] = await pool.query('SELECT * FROM resource_requests WHERE id = ? LIMIT 1', [requestId]);
      if (reqCheck.length === 0) {
        throw new Error('Resource request not found.');
      }
      const existing = reqCheck[0];

      await pool.query(`
        UPDATE resource_requests
        SET status = ?, staff_remarks = ?, resolved_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [normStatus, cleanRemarks || existing.staff_remarks, staffId, requestId]);

      // Audit log
      await pool.query(`
        INSERT INTO audit_logs (id, user_id, action, status, details, created_at)
        VALUES (?, ?, 'FACULTY_UPDATE_REQUEST', 'SUCCESS', ?, CURRENT_TIMESTAMP)
      `, [`aud-${Date.now()}`, staffId, `Updated request ${requestId} status to ${normStatus}`]);

      // Notify the student requester
      await this.createNotification({
        user_id: existing.user_id,
        title: `Resource Request Status: ${normStatus}`,
        message: `Your request "${existing.title}" is now "${normStatus}".${cleanRemarks ? ` Faculty Note: "${cleanRemarks}"` : ''}`,
        type: 'REQUEST',
        link: '/student/requests'
      });

      return await this.getFacultyRequestById(requestId);
    } else {
      const req = fallbackStore.resource_requests.find(r => r.id === requestId);
      if (!req) {
        throw new Error('Resource request not found.');
      }

      req.status = normStatus;
      if (cleanRemarks) req.staff_remarks = cleanRemarks;
      req.resolved_by = staffId;
      req.updated_at = now;

      fallbackStore.audit_logs.unshift({
        id: `aud-${Date.now()}`,
        user_id: staffId,
        action: 'FACULTY_UPDATE_REQUEST',
        status: 'SUCCESS',
        ip_address: '127.0.0.1',
        details: `Updated request "${req.title}" (${requestId}) status to ${normStatus}`,
        created_at: now
      });

      // Notify the student requester
      await this.createNotification({
        user_id: req.user_id,
        title: `Resource Request Status: ${normStatus}`,
        message: `Your request "${req.title}" is now "${normStatus}".${cleanRemarks ? ` Faculty Note: "${cleanRemarks}"` : ''}`,
        type: 'REQUEST',
        link: '/student/requests'
      });

      return await this.getFacultyRequestById(requestId);
    }
  },

  // MODULE 4: Reports & Analytics (Real MySQL aggregated metrics)
  async getFacultyReportsAnalytics() {
    if (!useFallback && pool) {
      // 1. Overall resource counts & downloads
      const [metricsRow] = await pool.query(`
        SELECT 
          COUNT(*) as total_resources,
          SUM(CASE WHEN r.status = 'PUBLISHED' THEN 1 ELSE 0 END) as published_resources,
          SUM(CASE WHEN r.status = 'PENDING' THEN 1 ELSE 0 END) as pending_submissions,
          SUM(CASE WHEN r.status = 'UNDER REVIEW' THEN 1 ELSE 0 END) as under_review_submissions,
          SUM(CASE WHEN r.status = 'VERIFIED' THEN 1 ELSE 0 END) as verified_submissions,
          SUM(CASE WHEN r.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_submissions,
          SUM(CASE WHEN r.status = 'ARCHIVED' THEN 1 ELSE 0 END) as archived_resources,
          COALESCE(SUM(r.download_count), 0) as total_downloads,
          SUM(CASE WHEN u.role = 'student' THEN 1 ELSE 0 END) as student_contributions_total,
          SUM(CASE WHEN u.role IN ('faculty', 'admin') THEN 1 ELSE 0 END) as faculty_uploads_total
        FROM resources r
        JOIN users u ON r.uploader_id = u.id
      `);

      // 2. Request statistics
      const [reqStats] = await pool.query(`
        SELECT 
          COUNT(*) as total_requests,
          SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_requests,
          SUM(CASE WHEN status = 'IN PROGRESS' THEN 1 ELSE 0 END) as in_progress_requests,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_requests,
          SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as closed_requests
        FROM resource_requests
      `);

      // 3. Most downloaded resources (Top 10)
      const [mostDownloaded] = await pool.query(`
        SELECT 
          r.id, r.title, r.download_count, r.status, r.file_size, r.created_at,
          d.name as department_name, d.code as department_code,
          s.name as subject_name, s.code as subject_code,
          rt.name as resource_type_name, rt.icon as resource_type_icon,
          u.full_name as uploader_name, u.role as uploader_role
        FROM resources r
        JOIN departments d ON r.department_id = d.id
        JOIN subjects s ON r.subject_id = s.id
        JOIN resource_types rt ON r.resource_type_id = rt.id
        JOIN users u ON r.uploader_id = u.id
        ORDER BY r.download_count DESC, r.created_at DESC
        LIMIT 10
      `);

      // 4. Distribution by Department
      const [deptDistribution] = await pool.query(`
        SELECT 
          d.id, d.name, d.code, d.icon,
          COUNT(r.id) as resource_count,
          COALESCE(SUM(r.download_count), 0) as download_count
        FROM departments d
        LEFT JOIN resources r ON d.id = r.department_id
        GROUP BY d.id, d.name, d.code, d.icon
        ORDER BY resource_count DESC, d.name ASC
      `);

      // 5. Distribution by Resource Type
      const [typeDistribution] = await pool.query(`
        SELECT 
          rt.id, rt.name, rt.code, rt.icon,
          COUNT(r.id) as resource_count
        FROM resource_types rt
        LEFT JOIN resources r ON rt.id = r.resource_type_id
        GROUP BY rt.id, rt.name, rt.code, rt.icon
        ORDER BY resource_count DESC
      `);

      // 6. Monthly Upload Activity (Last 6-12 months)
      const [monthlyActivity] = await pool.query(`
        SELECT 
          DATE_FORMAT(r.created_at, '%Y-%m') as month,
          COUNT(*) as total_uploads,
          SUM(CASE WHEN u.role = 'student' THEN 1 ELSE 0 END) as student_uploads,
          SUM(CASE WHEN u.role IN ('faculty', 'admin') THEN 1 ELSE 0 END) as faculty_uploads
        FROM resources r
        JOIN users u ON r.uploader_id = u.id
        GROUP BY DATE_FORMAT(r.created_at, '%Y-%m')
        ORDER BY month ASC
        LIMIT 12
      `);

      const totalRes = Number(metricsRow[0]?.total_resources || 0);

      const deptDistWithPercent = deptDistribution.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        icon: d.icon,
        resource_count: Number(d.resource_count || 0),
        download_count: Number(d.download_count || 0),
        percentage: totalRes > 0 ? Math.round((Number(d.resource_count || 0) / totalRes) * 100) : 0
      }));

      const typeDistWithPercent = typeDistribution.map(t => ({
        id: t.id,
        name: t.name,
        code: t.code,
        icon: t.icon,
        count: Number(t.resource_count || 0),
        percentage: totalRes > 0 ? Math.round((Number(t.resource_count || 0) / totalRes) * 100) : 0
      }));

      return {
        summary: {
          totalResources: totalRes,
          publishedResources: Number(metricsRow[0]?.published_resources || 0),
          pendingSubmissions: Number(metricsRow[0]?.pending_submissions || 0),
          underReviewSubmissions: Number(metricsRow[0]?.under_review_submissions || 0),
          verifiedSubmissions: Number(metricsRow[0]?.verified_submissions || 0),
          rejectedSubmissions: Number(metricsRow[0]?.rejected_submissions || 0),
          archivedResources: Number(metricsRow[0]?.archived_resources || 0),
          totalDownloads: Number(metricsRow[0]?.total_downloads || 0),
          studentContributionsTotal: Number(metricsRow[0]?.student_contributions_total || 0),
          facultyUploadsTotal: Number(metricsRow[0]?.faculty_uploads_total || 0),
          totalRequests: Number(reqStats[0]?.total_requests || 0),
          pendingRequests: Number(reqStats[0]?.pending_requests || 0),
          inProgressRequests: Number(reqStats[0]?.in_progress_requests || 0),
          completedRequests: Number(reqStats[0]?.completed_requests || 0),
          closedRequests: Number(reqStats[0]?.closed_requests || 0)
        },
        mostDownloaded,
        distributionByDepartment: deptDistWithPercent,
        distributionByType: typeDistWithPercent,
        monthlyUploadActivity: monthlyActivity.map(m => {
          const [yr, mo] = (m.month || '2025-01').split('-');
          const date = new Date(parseInt(yr), parseInt(mo) - 1, 1);
          const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          return {
            month: m.month,
            label,
            total: Number(m.total_uploads || 0),
            student: Number(m.student_uploads || 0),
            faculty: Number(m.faculty_uploads || 0)
          };
        })
      };
    } else {
      // Fallback Store calculations
      const resources = fallbackStore.resources;
      const totalRes = resources.length;
      const published = resources.filter(r => r.status === 'PUBLISHED').length;
      const pending = resources.filter(r => r.status === 'PENDING').length;
      const underReview = resources.filter(r => r.status === 'UNDER REVIEW').length;
      const verified = resources.filter(r => r.status === 'VERIFIED').length;
      const rejected = resources.filter(r => r.status === 'REJECTED').length;
      const archived = resources.filter(r => r.status === 'ARCHIVED').length;
      const totalDownloads = resources.reduce((acc, r) => acc + (r.download_count || 0), 0);

      const studentContribs = resources.filter(r => {
        const u = fallbackStore.users.find(usr => usr.id === r.uploader_id);
        return u && u.role === 'student';
      }).length;

      const facultyUploads = resources.filter(r => {
        const u = fallbackStore.users.find(usr => usr.id === r.uploader_id);
        return u && (u.role === 'faculty' || u.role === 'admin');
      }).length;

      const requests = fallbackStore.resource_requests;
      const reqSummary = {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'PENDING').length,
        inProgressRequests: requests.filter(r => r.status === 'IN PROGRESS').length,
        completedRequests: requests.filter(r => r.status === 'COMPLETED').length,
        closedRequests: requests.filter(r => r.status === 'CLOSED').length
      };

      // Most downloaded
      const mostDownloaded = [...resources]
        .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
        .slice(0, 10)
        .map(r => {
          const dept = fallbackStore.departments.find(d => d.id === r.department_id) || {};
          const subj = fallbackStore.subjects.find(s => s.id === r.subject_id) || {};
          const rType = fallbackStore.resource_types.find(rt => rt.id === r.resource_type_id) || {};
          const uploader = fallbackStore.users.find(u => u.id === r.uploader_id) || {};

          return {
            id: r.id,
            title: r.title,
            download_count: r.download_count || 0,
            status: r.status,
            file_size: r.file_size,
            created_at: r.created_at,
            department_name: dept.name || 'Department',
            department_code: dept.code || 'DEPT',
            subject_name: subj.name || 'Subject',
            subject_code: subj.code || 'SUBJ',
            resource_type_name: rType.name || 'Document',
            resource_type_icon: rType.icon || 'FileText',
            uploader_name: uploader.full_name || 'Contributor',
            uploader_role: uploader.role || 'faculty'
          };
        });

      // Distribution by Department
      const distributionByDepartment = fallbackStore.departments.map(d => {
        const matching = resources.filter(r => r.department_id === d.id);
        const count = matching.length;
        const dl = matching.reduce((acc, r) => acc + (r.download_count || 0), 0);
        return {
          id: d.id,
          name: d.name,
          code: d.code,
          icon: d.icon,
          resource_count: count,
          download_count: dl,
          percentage: totalRes > 0 ? Math.round((count / totalRes) * 100) : 0
        };
      }).sort((a, b) => b.resource_count - a.resource_count);

      // Distribution by Type
      const distributionByType = fallbackStore.resource_types.map(t => {
        const count = resources.filter(r => r.resource_type_id === t.id).length;
        return {
          id: t.id,
          name: t.name,
          code: t.code,
          icon: t.icon,
          count,
          percentage: totalRes > 0 ? Math.round((count / totalRes) * 100) : 0
        };
      }).sort((a, b) => b.count - a.count);

      // Monthly activity grouping
      const monthMap = {};
      resources.forEach(r => {
        const d = new Date(r.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[key]) {
          const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
          monthMap[key] = { month: key, label, total: 0, student: 0, faculty: 0 };
        }
        monthMap[key].total++;
        const u = fallbackStore.users.find(usr => usr.id === r.uploader_id);
        if (u && u.role === 'student') monthMap[key].student++;
        else monthMap[key].faculty++;
      });

      const monthlyUploadActivity = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

      return {
        summary: {
          totalResources: totalRes,
          publishedResources: published,
          pendingSubmissions: pending,
          underReviewSubmissions: underReview,
          verifiedSubmissions: verified,
          rejectedSubmissions: rejected,
          archivedResources: archived,
          totalDownloads,
          studentContributionsTotal: studentContribs,
          facultyUploadsTotal: facultyUploads,
          ...reqSummary
        },
        mostDownloaded,
        distributionByDepartment,
        distributionByType,
        monthlyUploadActivity
      };
    }
  },

  // MODULE 5: Faculty Profile
  async getFacultyProfile(facultyId) {
    if (!useFallback && pool) {
      const [userRows] = await pool.query(`
        SELECT id, email, full_name, role, department, academic_year, semester, is_active, is_verified, created_at, updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `, [facultyId]);

      if (userRows.length === 0) return null;
      const user = userRows[0];

      // Activity metrics
      const [uploadRow] = await pool.query('SELECT COUNT(*) as count FROM resources WHERE uploader_id = ?', [facultyId]);
      const [verifyRow] = await pool.query('SELECT COUNT(*) as count FROM resources WHERE verified_by = ?', [facultyId]);
      const [reqRow] = await pool.query('SELECT COUNT(*) as count FROM resource_requests WHERE resolved_by = ?', [facultyId]);

      return {
        user,
        stats: {
          totalUploads: Number(uploadRow[0]?.count || 0),
          totalVerifications: Number(verifyRow[0]?.count || 0),
          totalResolvedRequests: Number(reqRow[0]?.count || 0)
        }
      };
    } else {
      const user = fallbackStore.users.find(u => u.id === facultyId);
      if (!user) return null;

      const { password_hash, ...safeUser } = user;
      const totalUploads = fallbackStore.resources.filter(r => r.uploader_id === facultyId).length;
      const totalVerifications = fallbackStore.resources.filter(r => r.verified_by === facultyId).length;
      const totalResolvedRequests = fallbackStore.resource_requests.filter(r => r.resolved_by === facultyId).length;

      return {
        user: safeUser,
        stats: {
          totalUploads,
          totalVerifications,
          totalResolvedRequests
        }
      };
    }
  },

  async updateFacultyProfile(facultyId, { full_name, department }) {
    if (!full_name || !full_name.trim()) {
      throw new Error('Faculty full name is required.');
    }

    const cleanName = full_name.trim();
    const cleanDept = (department || '').trim();

    if (!useFallback && pool) {
      await pool.query(`
        UPDATE users
        SET full_name = ?, department = COALESCE(NULLIF(?, ''), department), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [cleanName, cleanDept, facultyId]);

      await pool.query(`
        INSERT INTO audit_logs (id, user_id, action, status, details, created_at)
        VALUES (?, ?, 'FACULTY_UPDATE_PROFILE', 'SUCCESS', ?, CURRENT_TIMESTAMP)
      `, [`aud-${Date.now()}`, facultyId, `Faculty updated profile name to "${cleanName}"`]);

      const [updated] = await pool.query(`
        SELECT id, email, full_name, role, department, academic_year, semester, is_active, is_verified, created_at, updated_at
        FROM users WHERE id = ?
      `, [facultyId]);

      return updated[0] || null;
    } else {
      const user = fallbackStore.users.find(u => u.id === facultyId);
      if (!user) throw new Error('User not found.');

      user.full_name = cleanName;
      if (cleanDept) user.department = cleanDept;
      user.updated_at = new Date().toISOString();

      fallbackStore.audit_logs.unshift({
        id: `aud-${Date.now()}`,
        user_id: facultyId,
        action: 'FACULTY_UPDATE_PROFILE',
        status: 'SUCCESS',
        ip_address: '127.0.0.1',
        details: `Faculty updated profile name to "${cleanName}"`,
        created_at: new Date().toISOString()
      });

      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
  },

  async updateFacultyPassword(facultyId, { current_password, new_password }) {
    if (!current_password) {
      throw new Error('Current password is required.');
    }
    if (!new_password) {
      throw new Error('New password is required.');
    }

    // Password validation: min 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(new_password)) {
      throw new Error('New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).');
    }

    if (!useFallback && pool) {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [facultyId]);
      if (rows.length === 0) throw new Error('User not found.');
      const user = rows[0];

      const match = await bcrypt.compare(current_password, user.password_hash);
      if (!match) {
        throw new Error('Current password does not match institutional records.');
      }

      const newHash = await bcrypt.hash(new_password, 10);
      await pool.query('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHash, facultyId]);

      await pool.query(`
        INSERT INTO audit_logs (id, user_id, action, status, details, created_at)
        VALUES (?, ?, 'FACULTY_CHANGE_PASSWORD', 'SUCCESS', 'Password updated successfully.', CURRENT_TIMESTAMP)
      `, [`aud-${Date.now()}`, facultyId]);

      return { success: true, message: 'Password changed successfully.' };
    } else {
      const user = fallbackStore.users.find(u => u.id === facultyId);
      if (!user) throw new Error('User not found.');

      const match = await bcrypt.compare(current_password, user.password_hash);
      if (!match) {
        throw new Error('Current password does not match institutional records.');
      }

      user.password_hash = await bcrypt.hash(new_password, 10);
      user.updated_at = new Date().toISOString();

      fallbackStore.audit_logs.unshift({
        id: `aud-${Date.now()}`,
        user_id: facultyId,
        action: 'FACULTY_CHANGE_PASSWORD',
        status: 'SUCCESS',
        ip_address: '127.0.0.1',
        details: 'Password updated successfully.',
        created_at: new Date().toISOString()
      });

      return { success: true, message: 'Password changed successfully.' };
    }
  }
};
