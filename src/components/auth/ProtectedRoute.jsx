import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4 animate-bounce">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Verifying ARH institutional credentials...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to student login by default (or auth landing), preserving destination
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/auth/student/login" state={{ from: location }} replace />;
  }

  // Check role-based access control
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // If student attempts to access faculty portal, redirect to student dashboard
    if (currentUser.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // If faculty attempts to access student-only portal, redirect to faculty dashboard
    if (currentUser.role === 'faculty') {
      return <Navigate to="/faculty/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
