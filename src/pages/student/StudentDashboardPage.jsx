import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StudentLayout } from '../../components/layout/StudentLayout';
import { studentApi } from '../../services/studentApi';
import { 
  BookOpen, 
  Bookmark, 
  Download, 
  HelpCircle, 
  UploadCloud, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  RefreshCw,
  FolderPlus
} from 'lucide-react';

export const StudentDashboardPage = ({ darkMode, setDarkMode }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName = currentUser?.full_name || currentUser?.name || 'Student';
  const department = currentUser?.department || 'Computer Science';
  const academicYear = currentUser?.academic_year || 'Senior (4th Year)';
  const semester = currentUser?.semester || 'Semester 7';

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError(err.message || 'Unable to connect to database stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <StudentLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Student Dashboard">
      <div className="space-y-6">

        {/* 1. Personalized Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Academic Resource Sharing Hub</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {displayName}!
            </h1>

            <p className="text-sm text-blue-100/90 leading-relaxed">
              Explore verified lecture notes, previous examination packs, and peer-reviewed problem solutions for <span className="font-semibold text-white">{department}</span>.
            </p>

            {/* Academic Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-black/20 text-white text-xs font-mono font-medium border border-white/10">
                {department}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/20 text-white text-xs font-mono font-medium border border-white/10">
                {academicYear}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/20 text-white text-xs font-mono font-medium border border-white/10">
                {semester}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 text-xs font-medium border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Student
              </span>
            </div>
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 bottom-0 -mb-12 w-64 h-64 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadDashboardData}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-500"
            >
              Retry
            </button>
          </div>
        )}

        {/* 2. Key Metrics Bar (Loaded from Live Database) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Available Resources */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Available Resources
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {loading ? <span className="inline-block w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /> : (stats?.totalAvailable ?? 0)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Verified repository total</p>
            </div>
          </div>

          {/* Total Bookmarks */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Saved Bookmarks
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {loading ? <span className="inline-block w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /> : (stats?.totalBookmarks ?? 0)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Personal study collection</p>
            </div>
          </div>

          {/* Total Downloads */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Downloads
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {loading ? <span className="inline-block w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /> : (stats?.totalDownloads ?? 0)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Materials downloaded</p>
            </div>
          </div>

          {/* Active Requests */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Requests
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {loading ? <span className="inline-block w-12 h-7 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /> : (stats?.activeRequests ?? 0)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pending peer response</p>
            </div>
          </div>

        </div>

        {/* 3. Quick Action Buttons */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/student/resources"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Browse Hub
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Search materials</p>
              </div>
            </Link>

            <Link
              to="/student/upload"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Upload Notes
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Submit for review</p>
              </div>
            </Link>

            <Link
              to="/student/requests"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Request Resource
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Ask the hub</p>
              </div>
            </Link>

            <Link
              to="/student/bookmarks"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  Saved Deck
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Study bookmarks</p>
              </div>
            </Link>
          </div>
        </div>

        {/* 4. Split Section: Recently Published Materials & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recently Published Resources (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recently Published Resources
                </h3>
              </div>
              <Link
                to="/student/resources"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : !stats?.recentlyPublished?.length ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No recent resources published yet.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentlyPublished.map((res) => (
                  <Link
                    key={res.id}
                    to={`/student/resources/${res.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                            {res.subject_code}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {res.department_name}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-0.5">
                          {res.title}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4 hidden sm:block">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {res.download_count ?? 0} downloads
                      </span>
                      <p className="text-[9px] text-slate-400 font-mono">{res.semester}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contributions Summary & Recent Activity (1 col) */}
          <div className="space-y-6">
            
            {/* My Contributions Widget */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  My Contributions
                </h3>
                <Link
                  to="/student/contributions"
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Manage
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats?.myContributions?.total ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Total</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {stats?.myContributions?.pending ?? 0}
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">Pending</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {stats?.myContributions?.published ?? 0}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Published</p>
                </div>
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Recent Activity
                </h3>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : !stats?.recentActivity?.length ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No recent activity logged.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stats.recentActivity.map((act) => (
                    <div key={act.id} className="flex items-start gap-2.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-800 dark:text-slate-200 truncate font-medium">
                          {act.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </StudentLayout>
  );
};
