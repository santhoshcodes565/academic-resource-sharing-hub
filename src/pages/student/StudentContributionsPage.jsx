import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StudentLayout } from '../../components/layout/StudentLayout';
import { studentApi } from '../../services/studentApi';
import { 
  FileCheck, 
  Clock, 
  UploadCloud, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  MessageSquare,
  FileText
} from 'lucide-react';

export const StudentContributionsPage = ({ darkMode, setDarkMode }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'PUBLISHED' | 'REJECTED'

  const loadContributions = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getContributions();
      setContributions(data || []);
    } catch (err) {
      console.error('Failed to load contributions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributions();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>PUBLISHED</span>
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>VERIFIED</span>
          </span>
        );
      case 'UNDER REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>UNDER REVIEW</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>REJECTED</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            ARCHIVED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>PENDING REVIEW</span>
          </span>
        );
    }
  };

  const filteredItems = contributions.filter(item => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return item.status === 'PENDING' || item.status === 'UNDER REVIEW';
    if (activeTab === 'PUBLISHED') return item.status === 'PUBLISHED' || item.status === 'VERIFIED';
    if (activeTab === 'REJECTED') return item.status === 'REJECTED';
    return true;
  });

  return (
    <StudentLayout darkMode={darkMode} setDarkMode={setDarkMode} title="My Contributions">
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Resource Contributions
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track the status, faculty verification, and remarks for all materials you submitted.
            </p>
          </div>

          <Link
            to="/student/upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New Resource</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs">
          {[
            { id: 'ALL', label: 'All Submissions', count: contributions.length },
            { id: 'PENDING', label: 'In Review', count: contributions.filter(c => c.status === 'PENDING' || c.status === 'UNDER REVIEW').length },
            { id: 'PUBLISHED', label: 'Published & Verified', count: contributions.filter(c => c.status === 'PUBLISHED' || c.status === 'VERIFIED').length },
            { id: 'REJECTED', label: 'Returned', count: contributions.filter(c => c.status === 'REJECTED').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 px-3 font-semibold transition-all relative ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Contributions List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <FileCheck className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No contributions under this filter
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help build the hub by sharing previous exam papers, formula sheets, and study notes for your courses.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/student/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500 shadow-sm"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Submit Your First Resource</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                          {item.subject_code}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {item.department_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          • {item.semester} • {item.academic_year}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description || 'Uploaded course material.'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 sm:self-start">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Staff Remarks if available */}
                {item.staff_remarks && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Staff Remarks: </span>
                      <span>"{item.staff_remarks}"</span>
                    </div>
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Submitted: {new Date(item.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span>File: {item.file_name} ({item.file_size})</span>
                  {item.status === 'PUBLISHED' && (
                    <Link
                      to={`/student/resources/${item.id}`}
                      className="text-blue-600 dark:text-blue-400 font-sans font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>View in Catalog</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </StudentLayout>
  );
};
