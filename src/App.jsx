import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthEntryPage } from './pages/auth/AuthEntryPage';
import { StudentLoginPage } from './pages/auth/StudentLoginPage';
import { StudentRegisterPage } from './pages/auth/StudentRegisterPage';
import { FacultyLoginPage } from './pages/auth/FacultyLoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentResourcesPage } from './pages/student/StudentResourcesPage';
import { StudentResourceDetailsPage } from './pages/student/StudentResourceDetailsPage';
import { StudentBookmarksPage } from './pages/student/StudentBookmarksPage';
import { StudentUploadPage } from './pages/student/StudentUploadPage';
import { StudentContributionsPage } from './pages/student/StudentContributionsPage';
import { StudentRequestsPage } from './pages/student/StudentRequestsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';
import { FacultyResourcesPage } from './pages/faculty/FacultyResourcesPage';
import { FacultyResourceUploadPage } from './pages/faculty/FacultyResourceUploadPage';
import { FacultyResourceEditPage } from './pages/faculty/FacultyResourceEditPage';
import { FacultyDepartmentsPage } from './pages/faculty/FacultyDepartmentsPage';
import { FacultySubjectsPage } from './pages/faculty/FacultySubjectsPage';
import { FacultyResourceTypesPage } from './pages/faculty/FacultyResourceTypesPage';
import { FacultyAcademicYearsPage } from './pages/faculty/FacultyAcademicYearsPage';
import { FacultyVerificationPage } from './pages/faculty/FacultyVerificationPage';
import { FacultyRequestsPage } from './pages/faculty/FacultyRequestsPage';
import { FacultyReportsPage } from './pages/faculty/FacultyReportsPage';
import { FacultyProfilePage } from './pages/faculty/FacultyProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('arh_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('arh_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('arh_theme', 'light');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Entry Point (MANDATORY entry point at /) */}
          <Route 
            path="/" 
            element={<AuthEntryPage darkMode={darkMode} setDarkMode={setDarkMode} />} 
          />

          {/* Dedicated Authentication Routes */}
          <Route path="/auth/student/login" element={<StudentLoginPage />} />
          <Route path="/auth/student/register" element={<StudentRegisterPage />} />
          <Route path="/auth/faculty/login" element={<FacultyLoginPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Student Portal Routes (Accessible only to authenticated students) */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboardPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/resources"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentResourcesPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/resources/:id"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentResourceDetailsPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/bookmarks"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentBookmarksPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/upload"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentUploadPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/contributions"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentContributionsPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/requests"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentRequestsPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProfilePage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />

          {/* Protected Faculty Portal Routes (Accessible only to authenticated faculty/admin) */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyDashboardPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/resources"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyResourcesPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/resources/new"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyResourceUploadPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/resources/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyResourceEditPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/departments"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyDepartmentsPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/subjects"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultySubjectsPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/resource-types"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyResourceTypesPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/academic-years"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyAcademicYearsPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/verification"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyVerificationPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/requests"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyRequestsPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/reports"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyReportsPage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/profile"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <FacultyProfilePage darkMode={darkMode} setDarkMode={setDarkMode} />
              </ProtectedRoute>
            }
          />

          {/* Fallback: any unknown route redirects to authentication root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
