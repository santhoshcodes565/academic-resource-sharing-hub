import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FacultyLayout } from '../../components/layout/FacultyLayout';
import { facultyApi } from '../../services/facultyApi';
import { 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Building2, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  X, 
  User, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  ArrowRight,
  Filter,
  Layers,
  Send
} from 'lucide-react';

export const FacultyRequestsPage = ({ darkMode, setDarkMode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    closed: 0
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

  // Request Management Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [staffRemarks, setStaffRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);

  // Load Departments
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

  // Fetch Requests Queue
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facultyApi.getRequests({
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
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to fetch student requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, selectedDept, page]);

  const handleTabChange = (status) => {
    setActiveTab(status);
    setPage(1);
    setSearchParams(status === 'ALL' ? {} : { status });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const openRequestModal = (request) => {
    setSelectedRequest(request);
    setTargetStatus(request.status);
    setStaffRemarks(request.staff_remarks || '');
    setModalError(null);
    setModalSuccess(null);
  };

  const closeRequestModal = () => {
    setSelectedRequest(null);
    setModalError(null);
    setModalSuccess(null);
    setStaffRemarks('');
  };

  // Submit Request Update
  const handleUpdateRequest = async () => {
    if (!targetStatus) {
      setModalError('Please choose a target status.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const result = await facultyApi.updateRequestStatus(selectedRequest.id, {
        status: targetStatus,
        staff_remarks: staffRemarks.trim()
      });

      setModalSuccess(`Request successfully updated to "${targetStatus}".`);
      setSelectedRequest(result.request);
      
      // Refresh list in background
      fetchRequests();

      setTimeout(() => {
        setModalSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating request:', err);
      setModalError(err.message || 'Failed to update request status.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Pending</span>
          </span>
        );
      case 'IN PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
            <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>In Progress</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Completed</span>
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>Closed</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const tabs = [
    { key: 'ALL', label: 'All Requests', count: counts.all },
    { key: 'PENDING', label: 'Pending', count: counts.pending, color: 'text-amber-600 dark:text-amber-400' },
    { key: 'IN PROGRESS', label: 'In Progress', count: counts.inProgress, color: 'text-blue-600 dark:text-blue-400' },
    { key: 'COMPLETED', label: 'Completed', count: counts.completed, color: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'CLOSED', label: 'Closed', count: counts.closed, color: 'text-slate-600 dark:text-slate-400' }
  ];

  return (
    <FacultyLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Student Resource Requests">
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Resource Request Management
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
                Curricular Assistance Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Respond to student syllabus inquiries and requests for past exams, notes, or supplemental materials.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-500' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Workflow Info Banner */}
        <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-950 dark:text-rose-200 font-semibold">
              <HelpCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Faculty Request Fulfillment Workflow:</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 flex-wrap">
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded font-bold">Student Creates Request</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 rounded font-bold">Faculty Evaluates / In Progress</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded font-bold">Faculty Provides Material & Completes</span>
            </div>
          </div>
        </div>

        {/* Status Navigation Tabs */}
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
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/25'
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

        {/* Search & Department Filter */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, requested resource, course code or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
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
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
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

        {/* Requests Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
              <p>Loading student resource requests...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No requests found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No student requests match your selected status filter and search term.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/80">
                  <tr>
                    <th className="py-3 px-4">Student Requester</th>
                    <th className="py-3 px-4">Requested Resource</th>
                    <th className="py-3 px-4">Subject & Department</th>
                    <th className="py-3 px-4">Request Description</th>
                    <th className="py-3 px-4">Request Date</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Faculty Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {items.map((req) => (
                    <tr 
                      key={req.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Student info */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-800/50">
                            {(req.student_name || 'S')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{req.student_name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{req.student_email}</p>
                            <span className="text-[9px] text-rose-600 dark:text-rose-400 font-medium">
                              {req.student_department || 'Student'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Requested Resource */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {req.title}
                        </p>
                        {req.staff_remarks && (
                          <div className="mt-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-rose-600 dark:text-rose-400">Response:</span> {req.staff_remarks}
                          </div>
                        )}
                      </td>

                      {/* Subject & Dept */}
                      <td className="py-3 px-4 align-top">
                        <div className="space-y-0.5">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {req.subject_code}
                          </span>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                            {req.subject_name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {req.department_name}
                          </p>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 align-top max-w-sm">
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">
                          {req.description}
                        </p>
                      </td>

                      {/* Request Date */}
                      <td className="py-3 px-4 align-top text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-700 dark:text-slate-300">
                            {new Date(req.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>

                      {/* Current Status */}
                      <td className="py-3 px-4 align-top whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 align-top text-right">
                        <button
                          onClick={() => openRequestModal(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white border border-rose-200/80 dark:border-rose-800 transition-all shadow-sm group-hover:border-rose-500"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Respond</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Page <strong className="text-slate-900 dark:text-white">{pagination.page}</strong> of <strong className="text-slate-900 dark:text-white">{pagination.totalPages}</strong> ({pagination.total} requests)
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

        {/* REQUEST RESPONSE & STATUS MODAL */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/25">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Manage Student Resource Request
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      ID: <span className="font-mono text-rose-600 dark:text-rose-400">{selectedRequest.id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedRequest.status)}
                  <button
                    onClick={closeRequestModal}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 text-xs">
                
                {modalSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{modalSuccess}</span>
                  </div>
                )}

                {modalError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Request Overview */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center text-xs">
                        {(selectedRequest.student_name || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{selectedRequest.student_name}</span>
                        <span className="text-slate-400 text-[10px] ml-1">({selectedRequest.student_email})</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {selectedRequest.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 leading-relaxed">
                      {selectedRequest.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {selectedRequest.subject_code} • {selectedRequest.subject_name}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {selectedRequest.department_name}
                    </span>
                  </div>
                </div>

                {/* Status Selection Buttons */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Update Request Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetStatus('PENDING')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        targetStatus === 'PENDING'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                      }`}
                    >
                      <Clock className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                      <span className="font-bold text-xs">Pending</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('IN PROGRESS')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        targetStatus === 'IN PROGRESS'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                      }`}
                    >
                      <Layers className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <span className="font-bold text-xs">In Progress</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('COMPLETED')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        targetStatus === 'COMPLETED'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                      <span className="font-bold text-xs">Completed</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('CLOSED')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        targetStatus === 'CLOSED'
                          ? 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <XCircle className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                      <span className="font-bold text-xs">Close Request</span>
                    </button>
                  </div>
                </div>

                {/* Faculty Response / Staff Remarks */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Faculty Official Response & Notes for Student
                  </label>
                  <textarea
                    rows={4}
                    value={staffRemarks}
                    onChange={(e) => setStaffRemarks(e.target.value)}
                    placeholder="Enter official resolution notes or reference to uploaded material (e.g., 'Uploaded official exam pack to CS201 library archive')..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    This response will be immediately visible to the requesting student on their Student Requests portal.
                  </p>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeRequestModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleUpdateRequest}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/25 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Response...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Save & Notify Student</span>
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
