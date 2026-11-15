# Academic Resource Sharing Hub (ARH)
## Comprehensive Architectural Codebase Audit & Gap Analysis

**Date:** November 15, 2026  
**Auditor:** Senior Full-Stack Software Architect, Backend Engineer, Database Architect & Security Engineer  
**Project:** Academic Resource Sharing Hub (ARH)  
**Status:** Audit Completed — Implementation Roadmap Ready  

---

## 1. Executive Summary

The Academic Resource Sharing Hub (ARH) is an enterprise academic repository and institutional peer-learning platform built with a modern stack:
- **Frontend:** React 18, Vite, React Router v7 (`react-router-dom`), Tailwind CSS v3, Lucide React icons, and Framer Motion.
- **Backend:** Node.js (ES modules), Express 5, Multer file processing, bcryptjs password hashing, jsonwebtoken (JWT).
- **Database Engine:** Dual-mode architecture combining MySQL 8.0+ connection pooling (`mysql2/promise`) with a fully reactive in-memory database fallback (`fallbackStore`) to guarantee zero downtime and graceful offline operation.

The project currently has extensive foundational workflows for student and faculty portals, role-based authorization, CRUD operations on curricular taxonomies, contribution submissions, and staff reviews. However, crucial security, governance, and user engagement features are either partially implemented or missing.

---

## 2. Codebase Audit Checklist & Component Mapping

| # | Inspection Item | Current Status | Findings & Implementation Details |
|---|-----------------|----------------|-----------------------------------|
| 1 | **Frontend Folder Structure** | ✅ Healthy | Organized under `src/` into `components/` (`about`, `auth`, `catalog`, `common`, `deck`, `explore`, `layout`, `preview`, `upload`), `context/`, `data/`, `pages/` (`auth`, `faculty`, `student`), and `services/` (`authApi.js`, `studentApi.js`, `facultyApi.js`). |
| 2 | **Backend Folder Structure** | ✅ Healthy | Organized under `server/` into `config/db.js`, `controllers/` (`authController.js`, `facultyController.js`, `metaController.js`, `studentController.js`), `middleware/` (`authMiddleware.js`, `uploadMiddleware.js`), `routes/` (`authRoutes.js`, `facultyRoutes.js`, `metaRoutes.js`, `studentRoutes.js`), and `uploads/`. |
| 3 | **React Components** | ⚠️ Partial | Reusable UI cards, badges, layouts, command palette, and modal containers exist. However, `DocumentModal.jsx` contained mocked static preview text and was unlinked; no in-app notification dropdown/bell existed. |
| 4 | **React Router Configuration** | ✅ Healthy | Configured in `src/App.jsx` using `react-router-dom` v7 with role-guarded routes via `ProtectedRoute`. |
| 5 | **Existing Authentication** | ⚠️ Partial | Student registration and sign-in functional; faculty login functional; public faculty registration was explicitly blocked (`blockFacultyRegistration`) with no self-service verification workflow. |
| 6 | **Student Portal Pages** | ✅ Healthy | Comprehensive pages: `StudentDashboardPage`, `StudentResourcesPage`, `StudentResourceDetailsPage`, `StudentBookmarksPage`, `StudentUploadPage`, `StudentContributionsPage`, `StudentRequestsPage`, `StudentProfilePage`. |
| 7 | **Faculty Portal Pages** | ✅ Healthy | Full suite: `FacultyDashboardPage`, `FacultyResourcesPage`, `FacultyResourceUploadPage`, `FacultyResourceEditPage`, `FacultyDepartmentsPage`, `FacultySubjectsPage`, `FacultyResourceTypesPage`, `FacultyAcademicYearsPage`, `FacultyVerificationPage`, `FacultyRequestsPage`, `FacultyReportsPage`, `FacultyProfilePage`. |
| 8 | **Existing API Endpoints** | ✅ Healthy | Structured under `/api/auth/*`, `/api/meta/*`, `/api/student/*`, `/api/faculty/*`. Standardized JSON responses with HTTP status codes and audit logging. |
| 9 | **Database Configuration** | ✅ Healthy | `server/config/db.js` auto-detects MySQL 8.0+ connection parameters (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) and seamlessly switches to in-memory store if the daemon is unavailable. |
| 10 | **Database Schema & Rel.** | ⚠️ Needs Migrations | Tables present: `users`, `password_resets`, `audit_logs`, `academic_years`, `departments`, `subjects`, `resource_types`, `resources`, `bookmarks`, `resource_downloads`, `resource_requests`, `resource_reviews`. Missing tables for authorized faculty emails, verification tokens, and user notifications. |
| 11 | **Resource Upload / Download** | ✅ Operational | Handled via Multer disk storage in `server/middleware/uploadMiddleware.js`. Downloads properly tracked in `resource_downloads` with counter increments. |
| 12 | **Verification Workflow** | ⚠️ Needs Enhancement | Multi-stage lifecycle (`PENDING` -> `UNDER REVIEW` -> `VERIFIED`/`REJECTED` -> `PUBLISHED` -> `ARCHIVED`) functional. Needs explicit state transition tracking (`action`, `previous_status`, `new_status`) and student-facing timeline display. |
| 13 | **Bookmark Functionality** | ✅ Operational | Supported via `/api/student/bookmarks` and MySQL table `bookmarks` with unique constraint on `(user_id, resource_id)`. |
| 14 | **Download Tracking** | ✅ Operational | Supported via `resource_downloads` with foreign keys to `users` and `resources`. Download count column on `resources` updated synchronously. |
| 15 | **Notification Components** | ❌ Missing | No notification tables, APIs, bell icons, or notification center components exist in the codebase. |

---

## 3. Detailed Gap Analysis Against Approved Requirements

### Requirement 1: Faculty Email Verification and Registration
- **Current State:**
  - Route `/api/auth/faculty/register` was mapped to `blockFacultyRegistration`, returning HTTP 403.
  - No database table or repository existed for an authorized faculty email allowlist.
  - No email verification token generation, hashing, expiration, or rate-limiting existed.
  - Frontend lacked faculty registration, token verification, and email expiry pages.
- **Identified Security Vulnerabilities:**
  - Without an allowlist, any user could potentially claim faculty status if registration was opened.
  - Need to prevent exposing plaintext verification tokens in logs or databases.
  - Need to protect against token reuse, brute force, and token expiration bypass.
- **Action Plan:**
  - Create table `authorized_faculty_emails` (allowlist of approved emails with department and designation).
  - Create table `faculty_verifications` (stores SHA-256 token hashes, expiration, single-use flag).
  - Implement zero-dependency native SMTP emailer with support for `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`, plus development simulation queue.
  - Build UI pages: Faculty Registration, Verify Email, Verification Success, Verification Expired, and Resend Verification.

### Requirement 2: In-Browser PDF Preview
- **Current State:**
  - A mock component `DocumentModal.jsx` existed in `src/components/preview/` but was unused and only rendered dummy text strings rather than real PDF files.
  - Clicking "Preview" on student pages or faculty verification either did nothing or linked directly to raw URLs without authorization validation.
  - No dedicated backend streaming endpoints existed to enforce role-based document streaming headers (`Content-Type: application/pdf`, `Content-Disposition: inline`).
- **Action Plan:**
  - Add backend streaming endpoints:
    - `GET /api/student/resources/:id/preview` (validates student auth, ensures resource is `PUBLISHED` or owned by requester, sets streaming headers, prevents path traversal).
    - `GET /api/faculty/resources/:id/preview` (allows faculty to stream pending, under-review, or published PDFs for inspection).
  - Create a production-grade `PdfPreviewModal.jsx` component:
    - Dual streaming support: authenticated Blob streaming via Bearer token and direct URL streaming with query ticket.
    - Built-in PDF reader controls: zoom in/out, fit to width, page navigation, fullscreen mode, download action, and complete academic metadata header (title, subject, department, uploader).

### Requirement 3: Resource Verification History
- **Current State:**
  - `resource_reviews` table records `staff_id`, `resource_id`, `review_status`, and `remarks`.
  - However, faculty could only see review remarks inside a basic modal, and previous vs new status transitions were not clearly tracked or categorized.
  - Students under "My Contributions" could only see current status and the latest `staff_remarks`; they could not see the historical review trail or timestamped progression.
- **Action Plan:**
  - Extend `resource_reviews` schema (via SQL migration and fallback store update) to record:
    - `action` (e.g. `SUBMITTED`, `ASSIGNED_REVIEW`, `VERIFIED`, `REJECTED`, `PUBLISHED`).
    - `previous_status`.
    - `new_status`.
  - Maintain append-only history invariant: every transition creates a permanent new review record.
  - Update `FacultyVerificationPage.jsx` to render an audit timeline of all transitions with reviewer names and timestamps.
  - Update `StudentContributionsPage.jsx` to allow students to expand any contribution to view the complete verification history and feedback timeline without modification capabilities.

### Requirement 4: In-App Notification System
- **Current State:**
  - Completely missing across frontend and backend.
  - No notifications table, no REST endpoints, no notification bell or dropdown in `Navbar`, `StudentLayout`, or `FacultyLayout`.
- **Action Plan:**
  - Create `notifications` table in MySQL and `fallbackStore`:
    - `id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`, `created_at`.
  - Create backend notification service and controller:
    - Auto-generate student notifications on resource submission, status changes (`UNDER REVIEW`, `VERIFIED`, `REJECTED`, `PUBLISHED`), and request responses.
    - Auto-generate faculty notifications when a student submits a new resource or creates a new resource request.
    - Expose APIs: `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/:id/read`, `POST /api/notifications/mark-all-read`.
  - Build UI notification bell with unread badge, dropdown menu, and dedicated notification management panel in both Student and Faculty layouts.

### Requirement 5: Trending and Popular Resources
- **Current State:**
  - Faculty Reports page had an aggregated table of all-time most downloaded resources.
  - Student Portal lacked a dedicated Trending & Popular section; students could only sort catalog items by downloads.
  - No time-window filtering existed (Last 7 Days, Last 30 Days, All-Time).
  - Subject-wise and department-wise popularity rankings were missing from the student experience.
- **Action Plan:**
  - Backend API:
    - `GET /api/student/trending` with query parameters `window` (`7d`, `30d`, `all`), `department`, and `subject`.
    - Calculate trending ranks using actual timestamped events in `resource_downloads` joined with `resources WHERE status = 'PUBLISHED'`.
    - Provide department-wise and subject-wise popularity aggregations.
    - Provide performance metrics for faculty (`GET /api/faculty/reports/trending-performance`).
  - Frontend UI:
    - Embed a high-impact, institutional "Trending & Popular Academic Resources" section with time-window tabs (7 Days, 30 Days, All-Time), popularity ranking badges, download counters, in-browser PDF preview trigger, and bookmark toggle.
    - Add department and subject trending carousels/grids.

---

## 4. Reusable Code & Architecture Plan

1. **Existing DB Layer (`server/config/db.js`):**
   - Retain full dual-mode architecture: all new methods (`getNotifications`, `createNotification`, `getTrendingResources`, `verifyFacultyEmail`, `checkFacultyAllowlist`, etc.) will execute real SQL queries on MySQL connection pool while maintaining identical synchronized logic in `fallbackStore`.
2. **Existing Middleware (`authMiddleware.js`, `uploadMiddleware.js`):**
   - Reuse `authenticateToken` and `requireRole`.
   - Update `authenticateToken` to accept authorization token from query string `?token=` for secure PDF streaming in native browser viewers.
3. **Existing UI Design System:**
   - Preserve slate/neutral surfaces, blue/indigo accent styling, Lucide icons, responsive navigation, dark/light mode toggles, and institutional typography.

---

## 5. Potential Conflicts & Mitigations

| Risk / Potential Conflict | Mitigation Strategy |
|---------------------------|---------------------|
| Public faculty sign-up security risk | Faculty registration endpoint strictly requires pre-authorization in `authorized_faculty_emails` allowlist and a cryptographic single-use verification token before account creation. Frontend role input is completely ignored; backend forces `role: 'faculty'`. |
| Unsafe document exposure | Document streaming routes strictly enforce authentication and authorization. Students cannot stream unverified documents unless they are the original uploader. Faculty can inspect pending submissions. Streaming endpoints validate path traversal and set `Content-Type: application/pdf` and `Content-Disposition: inline`. |
| Database schema divergence | Provide migration file `server/migrations/001_enhancements.sql` with idempotent `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE` statements. Dual-mode fallback in `db.js` handles both live MySQL and offline fallback identically. |
| Performance hit on trending queries | Add composite indexes on `resource_downloads(downloaded_at, resource_id)` and `resources(status, download_count)`. |

---
**Audit Approved. Moving to Phase B Implementation.**
