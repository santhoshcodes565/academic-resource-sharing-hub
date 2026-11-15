import React, { useState, useEffect } from 'react';
import { StudentLayout } from '../../components/layout/StudentLayout';
import { studentApi } from '../../services/studentApi';
import { 
  HelpCircle, 
  Plus, 
  Clock, 
  CheckCircle, 
  X, 
  MessageSquare, 
  AlertCircle,
  FileQuestion,
  Loader2
} from 'lucide-react';

export const StudentRequestsPage = ({ darkMode, setDarkMode }) => {
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Request Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDept, setReqDept] = useState('');
  const [reqSubj, setReqSubj] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqList, deptList] = await Promise.all([
        studentApi.getRequests(),
        studentApi.getDepartments()
      ]);
      setRequests(reqList || []);
      setDepartments(deptList || []);
      if (deptList?.length > 0) setReqDept(deptList[0].id);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update subjects when department changes in modal
  useEffect(() => {
    async function updateSubjects() {
      if (!reqDept) return;
      const subList = await studentApi.getSubjects(reqDept);
      setSubjects(subList || []);
      if (subList?.length > 0) {
        setReqSubj(subList[0].id);
      } else {
        setReqSubj('');
      }
    }
    updateSubjects();
  }, [reqDept]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setError(null);

    if (!reqTitle.trim()) return setError('Please enter a request title.');
    if (!reqDept) return setError('Please select an academic department.');
    if (!reqSubj) return setError('Please select a course / subject.');
    if (!reqDesc.trim()) return setError('Please provide details on what resource you need.');

    setSubmitting(true);
    try {
      const res = await studentApi.createRequest({
        department_id: reqDept,
        subject_id: reqSubj,
        title: reqTitle.trim(),
        description: reqDesc.trim()
      });

      setRequests(prev => [res.request, ...prev]);
      setModalOpen(false);
      setReqTitle('');
      setReqDesc('');
      showToast('Resource request created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to submit resource request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      case 'IN PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>IN PROGRESS</span>
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            CLOSED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <StudentLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Resource Requests">
      <div className="space-y-6">

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom duration-200">
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Course Resource Requests
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Can't find a study guide or solved paper? Submit a request to faculty and peer contributors.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Request Resource</span>
          </button>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <FileQuestion className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No resource requests submitted
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                If you are missing solutions, formulas, or lab instructions for any course, request it and our faculty and peer review board will help fulfill it.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Your First Request</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                          {req.subject_code}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {req.subject_name || req.department_name}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {req.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {req.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 sm:self-start">
                    {getStatusBadge(req.status)}
                  </div>
                </div>

                {/* Staff Remarks if available */}
                {req.staff_remarks && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Staff Response: </span>
                      <span>"{req.staff_remarks}"</span>
                    </div>
                  </div>
                )}

                {/* Footer Timestamp */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Requested: {new Date(req.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  {req.resolved_by_name && (
                    <span>Assigned to: {req.resolved_by_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Request Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setModalOpen(false)}
            />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 z-10 animate-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Submit New Resource Request
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
                
                {/* Department & Subject Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Department *
                    </label>
                    <select
                      value={reqDept}
                      onChange={(e) => setReqDept(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      required
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Course / Subject *
                    </label>
                    <select
                      value={reqSubj}
                      onChange={(e) => setReqSubj(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      required
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resource Title */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Resource / Topic Title *
                  </label>
                  <input
                    type="text"
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    placeholder="e.g. 2024 Final Exam Solved Question Paper with Grading Rubric"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Detailed Requirements *
                  </label>
                  <textarea
                    value={reqDesc}
                    onChange={(e) => setReqDesc(e.target.value)}
                    rows={3}
                    placeholder="Specify particular chapters, derivations, or problem numbers needed..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Request...' : 'Submit Request'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  );
};
