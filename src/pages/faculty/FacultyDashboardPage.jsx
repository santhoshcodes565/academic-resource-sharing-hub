import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../../components/layout/FacultyLayout';
import { facultyApi } from '../../services/facultyApi';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  HelpCircle, 
  UploadCloud, 
  Layers, 
  Building2, 
  BookMarked, 
  ArrowUpRight, 
  RefreshCw,
  AlertCircle,
  FileCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Eye
} from 'lucide-react';

export const FacultyDashboardPage = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facultyApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading faculty dashboard stats:', err);
      setError(err.message || 'Failed to retrieve database statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <FacultyLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Faculty Dashboard">
      <div className="space-y-6">
        
        {/* Top Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Institutional Faculty Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time curricular statistics, moderation queues, and academic resource distribution.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardStats}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
              <span>Sync Stats</span>
            </button>
            <Link
              to="/faculty/resources/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Material</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Database Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          
          {/* Total Resources */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Resources</span>
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : (stats?.totalResources ?? 0)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across all departments</p>
          </div>

          {/* Published Resources */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Published</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : (stats?.publishedResources ?? 0)}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Curricularly live</p>
          </div>

          {/* Pending Submissions */}
          <Link
            to="/faculty/verification?status=PENDING"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 shadow-sm relative overflow-hidden group transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
              {loading ? '...' : (stats?.pendingSubmissions ?? 0)}
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1 font-medium flex items-center gap-1">
              <span>Verify submissions</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </Link>

          {/* Under Review */}
          <Link
            to="/faculty/verification?status=UNDER%20REVIEW"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 hover:border-blue-400 shadow-sm relative overflow-hidden group transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Under Review</span>
              <Layers className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400">
              {loading ? '...' : (stats?.underReviewSubmissions ?? 0)}
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium flex items-center gap-1">
              <span>Active reviews</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </Link>

          {/* Total Downloads */}
          <Link
            to="/faculty/reports"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 hover:border-purple-400 shadow-sm relative overflow-hidden group transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Total Downloads</span>
              <Download className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-400">
              {loading ? '...' : (stats?.totalDownloads ?? 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-medium flex items-center gap-1">
              <span>View analytics</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </Link>

          {/* Active Student Requests */}
          <Link
            to="/faculty/requests"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 hover:border-rose-400 shadow-sm relative overflow-hidden group transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Active Requests</span>
              <HelpCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-400">
              {loading ? '...' : (stats?.activeStudentRequests ?? 0)}
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium flex items-center gap-1">
              <span>Manage requests</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </Link>

        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Quick Administrative Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            
            <Link
              to="/faculty/verification"
              className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-amber-500/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-all flex items-start gap-3.5 group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Verify Contributions
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Review student uploads, approve, reject with remarks, and publish
                </p>
              </div>
            </Link>

            <Link
              to="/faculty/requests"
              className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-rose-500/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-all flex items-start gap-3.5 group"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Resource Requests
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  View student academic material needs, respond, and resolve
                </p>
              </div>
            </Link>

            <Link
              to="/faculty/reports"
              className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-purple-500/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all flex items-start gap-3.5 group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Reports & Analytics
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Real database analytics on downloads, uploads, and departments
                </p>
              </div>
            </Link>

            <Link
              to="/faculty/resources/new"
              className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all flex items-start gap-3.5 group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Upload Resource
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Publish lecture notes, exams, or lab manuals
                </p>
              </div>
            </Link>

            <Link
              to="/faculty/resources"
              className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all flex items-start gap-3.5 group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Manage Resources
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Search, filter, edit, archive or remove files
                </p>
              </div>
            </Link>

            <Link
              to="/faculty/departments"
              className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all flex items-start gap-3.5 group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Departments & Subjects
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Academic taxonomy and curricular course catalog
                </p>
              </div>
            </Link>

          </div>
        </div>

        {/* 2-Column Section: Recently Uploaded Resources & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recently Uploaded Resources (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recently Uploaded Academic Resources
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Latest materials registered in the institutional repository
                </p>
              </div>
              <Link
                to="/faculty/resources"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 flex-1">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading resources...</div>
              ) : !stats?.recentlyUploaded?.length ? (
                <div className="py-12 text-center text-xs text-slate-400">No resources found in database.</div>
              ) : (
                <div className="space-y-3">
                  {stats.recentlyUploaded.map((res) => {
                    const statusColors = {
                      PUBLISHED: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                      PENDING: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                      'UNDER REVIEW': 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                      ARCHIVED: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    };

                    return (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800/50">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {res.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {res.subject_code || 'COURSE'}
                              </span>
                              <span>•</span>
                              <span>{res.department_name}</span>
                              <span>•</span>
                              <span>{res.resource_type_name || 'Material'}</span>
                              <span>•</span>
                              <span>{res.academic_year}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${statusColors[res.status] || statusColors.PUBLISHED}`}>
                            {res.status}
                          </span>
                          <Link
                            to={`/faculty/resources/${res.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Edit metadata"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Timeline (1 col) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Institutional Activity Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit trail of moderation and system events
              </p>
            </div>

            <div className="p-5 flex-1">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading activities...</div>
              ) : !stats?.recentActivities?.length ? (
                <div className="py-12 text-center text-xs text-slate-400">No recent activities recorded.</div>
              ) : (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {stats.recentActivities.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">
                          {act.details}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                          <span>{act.userName || 'Faculty'}</span>
                          <span>•</span>
                          <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </FacultyLayout>
  );
};
