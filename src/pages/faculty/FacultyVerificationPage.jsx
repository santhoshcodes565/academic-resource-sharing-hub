import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FacultyLayout } from '../../components/layout/FacultyLayout';
import { facultyApi } from '../../services/facultyApi';
import { 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Globe, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  User, 
  BookOpen, 
  Building2, 
  Calendar, 
  AlertCircle, 
  Check, 
  X, 
  RefreshCw, 
  FileText, 
  ChevronRight, 
  MessageSquare,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const FacultyVerificationPage = ({ darkMode, setDarkMode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    underReview: 0,
    verified: 0,
    rejected: 0,
    published: 0
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [activeTab, setActiveTab] = useState(initialStatus.toUpperCase());
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Review Modal State
  const [selectedResource, setSelectedResource] = useState(null);
  const [reviewDetails, setReviewDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Load Departments for Filter Dropdown
  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await facultyApi.getDepartments();
        setDepartments(depts);
      } catch (e) {
        console.error('Failed to load departments', e);
      }
    }
    loadDepts();
  }, []);

  // Fetch Verifications Queue
  const fetchVerifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facultyApi.getVerifications({
        status: activeTab,
        department: selectedDept,
        search: searchQuery,
        page,
        limit: 10
      });
      setItems(data.items);
      setPagination(data.pagination);
      setCounts(data.counts);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError(err.message || 'Failed to fetch student contributions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [activeTab, selectedDept, page]);

  const handleTabChange = (status) => {
    setActiveTab(status);
    setPage(1);
    setSearchParams(status === 'ALL' ? {} : { status });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVerifications();
  };

  // Open Review Details Modal
  const openReviewModal = async (resource) => {
    setSelectedResource(resource);
    setLoadingDetails(true);
    setReviewError(null);
    setActionSuccess(null);
    setReviewRemarks(resource.staff_remarks || '');
    
    // Default action suggested by current status
    if (resource.status === 'PENDING') {
      setTargetStatus('UNDER REVIEW');
    } else if (resource.status === 'UNDER REVIEW') {
      setTargetStatus('VERIFIED');
    } else if (resource.status === 'VERIFIED') {
      setTargetStatus('PUBLISHED');
    } else {
      setTargetStatus(resource.status);
    }

    try {
      const data = await facultyApi.getVerificationDetails(resource.id);
      setReviewDetails(data);
    } catch (err) {
      console.error('Error loading review details:', err);
      setReviewError(err.message || 'Failed to load submission review details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeReviewModal = () => {
    setSelectedResource(null);
    setReviewDetails(null);
    setReviewError(null);
    setActionSuccess(null);
    setReviewRemarks('');
  };

  // Submit Review Action
  const handleSubmitReview = async () => {
    if (!targetStatus) {
      setReviewError('Please select a target verification status.');
      return;
    }

    if (targetStatus === 'REJECTED' && (!reviewRemarks || !reviewRemarks.trim())) {
      setReviewError('Institutional remarks are mandatory when rejecting a submission to provide feedback.');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      await facultyApi.updateVerificationStatus(selectedResource.id, {
        status: targetStatus,
        remarks: reviewRemarks.trim()
      });

      setActionSuccess(`Submission successfully transitioned to "${targetStatus}".`);
      
      // Refresh current details modal
      const refreshed = await facultyApi.getVerificationDetails(selectedResource.id);
      setReviewDetails(refreshed);
      setSelectedResource(refreshed.resource);

      // Refresh main queue in background
      fetchVerifications();

      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewError(err.message || 'Failed to submit verification status update.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Pending Review</span>
          </span>
        );
      case 'UNDER REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
            <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Under Review</span>
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Verified</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>Rejected</span>
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
            <Globe className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Published</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <span>Archived</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const tabs = [
    { key: 'ALL', label: 'All Submissions', count: counts.all },
    { key: 'PENDING', label: 'Pending', count: counts.pending, color: 'text-amber-600 dark:text-amber-400' },
    { key: 'UNDER REVIEW', label: 'Under Review', count: counts.underReview, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'VERIFIED', label: 'Verified', count: counts.verified, color: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'REJECTED', label: 'Rejected', count: counts.rejected, color: 'text-rose-600 dark:text-rose-400' },
    { key: 'PUBLISHED', label: 'Published', count: counts.published, color: 'text-indigo-600 dark:text-indigo-400' }
  ];

  return (
    <FacultyLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Verify Student Contributions">
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Verify Student Contributions
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                Institutional Quality Assurance
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review and certify peer materials submitted by students. Student contributions are never auto-published without verified faculty review.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchVerifications}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Mandatory Workflow Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/40 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-semibold">
              <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Institutional Verification Protocol:</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 flex-wrap">
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded font-bold">1. PENDING</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 rounded font-bold">2. UNDER REVIEW</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded font-bold">3. VERIFIED</span>
              <span className="text-slate-400">or</span>
              <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 rounded font-bold">REJECTED</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 rounded font-bold">4. PUBLISHED</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Department Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, title, course code or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </form>

          <div className="flex items-center gap-2.5">
            <div className="relative min-w-[200px]">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
                setActiveTab('ALL');
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              title="Reset all filters"
            >
              Reset
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Verification Management Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
              <p>Loading student contribution records...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No submissions found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No student contributions match your active status filter and search query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/80">
                  <tr>
                    <th className="py-3 px-4">Student Contributor</th>
                    <th className="py-3 px-4">Resource Details</th>
                    <th className="py-3 px-4">Subject & Dept</th>
                    <th className="py-3 px-4">Type & Format</th>
                    <th className="py-3 px-4">Submission Date</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {items.map((res) => (
                    <tr 
                      key={res.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Student info */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-800/50">
                            {(res.student_name || 'S')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{res.student_name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{res.student_email}</p>
                            <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-medium">
                              {res.student_department || 'Student'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Resource Title & description */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {res.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {res.description || 'No description provided by student.'}
                        </p>
                      </td>

                      {/* Subject & Dept */}
                      <td className="py-3 px-4 align-top">
                        <div className="space-y-0.5">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {res.subject_code}
                          </span>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                            {res.subject_name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {res.department_name}
                          </p>
                        </div>
                      </td>

                      {/* Resource Type */}
                      <td className="py-3 px-4 align-top">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                            {res.resource_type_name}
                          </span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {res.file_size || 'PDF'}
                          </p>
                        </div>
                      </td>

                      {/* Submission Date */}
                      <td className="py-3 px-4 align-top text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-700 dark:text-slate-300">
                            {new Date(res.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(res.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>

                      {/* Current Status */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        {getStatusBadge(res.status)}
                      </td>

                      {/* Review Action Button */}
                      <td className="py-3 px-4 align-top text-right">
                        <button
                          onClick={() => openReviewModal(res)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-200/80 dark:border-indigo-800 transition-all shadow-sm group-hover:border-indigo-500"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Showing page <strong className="text-slate-900 dark:text-white">{pagination.page}</strong> of <strong className="text-slate-900 dark:text-white">{pagination.totalPages}</strong> ({pagination.total} submissions)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODULE 2: RESOURCE REVIEW DETAILS MODAL */}
        {selectedResource && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/25">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Submission Review & Verification
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      ID: <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedResource.id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedResource.status)}
                  <button
                    onClick={closeReviewModal}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                
                {actionSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{actionSuccess}</span>
                  </div>
                )}

                {reviewError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {loadingDetails ? (
                  <div className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                    <span>Loading comprehensive verification details...</span>
                  </div>
                ) : (
                  <>
                    {/* Grid of Key Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Resource Information */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Resource Metadata</span>
                        </h4>

                        <div className="space-y-1.5">
                          <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {selectedResource.title}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                            {selectedResource.description || 'No detailed abstract provided by student.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Department</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedResource.department_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Subject</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedResource.subject_code} - {selectedResource.subject_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Resource Type</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedResource.resource_type_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Academic Term</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedResource.academic_year} • {selectedResource.semester}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Student Information */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Student Contributor Information</span>
                        </h4>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                            {(selectedResource.student_name || 'S')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedResource.student_name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{selectedResource.student_email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Department</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedResource.student_department}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Cohort Standing</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedResource.student_academic_year || 'Senior'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Submission Timestamp</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {new Date(selectedResource.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Verified By</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {selectedResource.verifier_name || 'Pending assignment'}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Uploaded Document & File Preview/Download Bar */}
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{selectedResource.file_name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {selectedResource.file_size} • {selectedResource.file_mime || 'application/pdf'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={selectedResource.file_url}
                          target="_blank"
                          rel="noreferrer"
                          download={selectedResource.file_name}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all hover:scale-[1.02]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Document</span>
                        </a>
                        <a
                          href={selectedResource.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Preview</span>
                        </a>
                      </div>
                    </div>

                    {/* Review History Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Previous Review History</span>
                      </h4>

                      {reviewDetails?.reviewHistory && reviewDetails.reviewHistory.length > 0 ? (
                        <div className="space-y-2.5">
                          {reviewDetails.reviewHistory.map((rev, index) => (
                            <div 
                              key={rev.id || index}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(rev.review_status)}
                                  <span className="font-semibold text-slate-900 dark:text-white">
                                    {rev.staff_name || 'Institutional Faculty'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ({rev.staff_email || 'faculty@university.edu'})
                                  </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-[11px] pl-1 border-l-2 border-indigo-400/50 ml-1">
                                  {rev.remarks || 'No recorded review remarks.'}
                                </p>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                {new Date(rev.created_at).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800 text-slate-500 text-center text-xs">
                          No previous review transitions recorded. This submission is at initial state.
                        </div>
                      )}
                    </div>

                    {/* Faculty Review Actions & Decision Form */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Faculty Decision & Curricular Action
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Select the target verification state and provide academic remarks.
                        </p>
                      </div>

                      {/* Action Radio Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setTargetStatus('UNDER REVIEW')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            targetStatus === 'UNDER REVIEW'
                              ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Layers className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-xs">Mark Under Review</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Queue for detailed syllabus audit
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTargetStatus('VERIFIED')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            targetStatus === 'VERIFIED'
                              ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="font-bold text-xs">Approve / Verify</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Certify accuracy & standards
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTargetStatus('PUBLISHED')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            targetStatus === 'PUBLISHED'
                              ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-4 h-4 text-indigo-500" />
                            <span className="font-bold text-xs">Publish to Hub</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Make live for all university students
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTargetStatus('REJECTED')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            targetStatus === 'REJECTED'
                              ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <span className="font-bold text-xs">Reject Submission</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Requires feedback remarks
                          </p>
                        </button>
                      </div>

                      {/* Remarks Textarea */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Institutional Remarks & Review Notes {targetStatus === 'REJECTED' && <span className="text-rose-500 font-bold">* (Mandatory for rejection)</span>}
                        </label>
                        <textarea
                          rows={3}
                          value={reviewRemarks}
                          onChange={(e) => setReviewRemarks(e.target.value)}
                          placeholder={
                            targetStatus === 'REJECTED'
                              ? 'Explain why this submission was rejected (e.g. low resolution, missing citations, syllabus mismatch)...'
                              : 'Add verification notes, curricular commendation or syllabus references...'
                          }
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Action Buttons Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Close Window
                </button>

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || loadingDetails}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {submittingReview ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Verification...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Submit Verification Decision</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </FacultyLayout>
  );
};
