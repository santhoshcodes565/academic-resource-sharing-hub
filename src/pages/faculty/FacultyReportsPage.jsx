import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FacultyLayout } from '../../components/layout/FacultyLayout';
import { facultyApi } from '../../services/facultyApi';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Building2, 
  Layers, 
  Printer, 
  RefreshCw, 
  AlertCircle, 
  Calendar,
  Users,
  ShieldCheck,
  FileText,
  PieChart,
  ArrowUpRight
} from 'lucide-react';

export const FacultyReportsPage = ({ darkMode, setDarkMode }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await facultyApi.getReportsAnalytics();
      setData(result);
    } catch (err) {
      console.error('Error loading reports analytics:', err);
      setError(err.message || 'Failed to load reports and analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const summary = data?.summary || {};
  const mostDownloaded = data?.mostDownloaded || [];
  const distributionByDepartment = data?.distributionByDepartment || [];
  const distributionByType = data?.distributionByType || [];
  const monthlyUploadActivity = data?.monthlyUploadActivity || [];

  // Max count for scaling chart bars
  const maxMonthly = Math.max(...monthlyUploadActivity.map(m => m.total), 1);
  const maxDept = Math.max(...distributionByDepartment.map(d => d.resource_count), 1);
  const maxType = Math.max(...distributionByType.map(t => t.count), 1);

  return (
    <FacultyLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Institutional Reports & Analytics">
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Institutional Reports & Analytics
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
                MySQL Real-Time Data
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curricular repository analytics, student submission velocity, department utilization, and download records.
            </p>
          </div>

          <div className="flex items-center gap-2.5 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Recompute Data</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* PRIMARY KPI METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          {/* Total Resources */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Resources</span>
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : (summary.totalResources ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">All registered items</p>
          </div>

          {/* Published */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Published</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {loading ? '...' : (summary.publishedResources ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {summary.totalResources ? Math.round(((summary.publishedResources || 0) / summary.totalResources) * 100) : 0}% of repository
            </p>
          </div>

          {/* Pending Submissions */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {loading ? '...' : (summary.pendingSubmissions ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Awaiting faculty audit</p>
          </div>

          {/* Rejected Submissions */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Rejected</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {loading ? '...' : (summary.rejectedSubmissions ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Returned with remarks</p>
          </div>

          {/* Total Downloads */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Downloads</span>
              <Download className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {loading ? '...' : (summary.totalDownloads ?? 0).toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Verified student usage</p>
          </div>

          {/* Student Contributions */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Student Uploads</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {loading ? '...' : (summary.studentContributionsTotal ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Peer submissions</p>
          </div>

        </div>

        {/* TWO-COLUMN CHARTS: Monthly Activity & Verification Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Monthly Upload Activity Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span>Monthly Upload Velocity</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Chronological distribution of student vs faculty materials.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-600"></span>
                  Faculty
                </span>
                <span className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                  Student
                </span>
              </div>
            </div>

            {monthlyUploadActivity.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No monthly timeline data recorded yet.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {monthlyUploadActivity.map((m) => {
                  const studentPct = m.total > 0 ? (m.student / maxMonthly) * 100 : 0;
                  const facultyPct = m.total > 0 ? (m.faculty / maxMonthly) * 100 : 0;
                  const totalPct = (m.total / maxMonthly) * 100;

                  return (
                    <div key={m.month} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 w-20">{m.label}</span>
                        <div className="flex-1 mx-3 h-5 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex">
                          <div
                            style={{ width: `${(m.faculty / maxMonthly) * 100}%` }}
                            className="bg-indigo-600 h-full transition-all duration-500"
                            title={`Faculty: ${m.faculty}`}
                          />
                          <div
                            style={{ width: `${(m.student / maxMonthly) * 100}%` }}
                            className="bg-blue-500 h-full transition-all duration-500"
                            title={`Student: ${m.student}`}
                          />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white w-12 text-right">
                          {m.total} <span className="text-[10px] text-slate-400 font-normal">files</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resource Distribution by Type Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-500" />
                  <span>Resource Distribution by Type</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Proportion of lecture notes, exam packs, formula sheets and lab manuals.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {distributionByType.map((t) => (
                <div key={t.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 w-36 truncate">{t.name}</span>
                    <div className="flex-1 mx-3 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(t.percentage, t.count > 0 ? 5 : 0)}%` }}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white w-16 text-right">
                      {t.count} <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">({t.percentage}%)</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* DEPARTMENT DISTRIBUTION BAR TABLE */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>Department Repository Distribution & Engagement</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Curricular resources and total cumulative download volume across departments.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Resources</th>
                  <th className="py-2.5 px-3">Volume Visual</th>
                  <th className="py-2.5 px-3">Total Downloads</th>
                  <th className="py-2.5 px-3 text-right">Share of Catalog</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {distributionByDepartment.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {d.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {d.code}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {d.resource_count} items
                    </td>
                    <td className="py-3 px-3 w-48">
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(d.percentage, d.resource_count > 0 ? 5 : 0)}%` }}
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-purple-600 dark:text-purple-400 font-semibold">
                      {d.download_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {d.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOST DOWNLOADED RESOURCES LEADERBOARD TABLE */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Download className="w-4 h-4 text-purple-500" />
                <span>Top Downloaded Academic Materials</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Highest yield materials ranked by verified student download count.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                  <th className="py-2.5 px-3">Resource Title</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Format / Type</th>
                  <th className="py-2.5 px-3">Uploader</th>
                  <th className="py-2.5 px-3 text-right">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {mostDownloaded.map((res, index) => (
                  <tr key={res.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-extrabold text-[11px] ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : index === 1
                          ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                          : index === 2
                          ? 'bg-amber-50 text-amber-900 dark:bg-amber-900/40 dark:text-amber-400'
                          : 'text-slate-400 font-mono'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {res.title}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                      {res.subject_code} - {res.subject_name}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {res.department_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                        {res.resource_type_name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{res.uploader_name}</span>
                        {res.uploader_role === 'faculty' && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            Faculty
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono font-extrabold text-sm text-purple-600 dark:text-purple-400">
                        {res.download_count.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </FacultyLayout>
  );
};
