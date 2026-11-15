import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../../components/layout/FacultyLayout';
import { facultyApi } from '../../services/facultyApi';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Archive, 
  Trash2, 
  Eye, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  FileText, 
  RefreshCw,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const FacultyResourcesPage = ({ darkMode, setDarkMode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter States
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || 'all');
  const [subject, setSubject] = useState(searchParams.get('subject') || 'all');
  const [resourceType, setResourceType] = useState(searchParams.get('resourceType') || 'all');
  const [academicYear, setAcademicYear] = useState(searchParams.get('academicYear') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Metadata dropdown options
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // Data & UI states
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modals
  const [selectedResource, setSelectedResource] = useState(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Metadata
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [depts, subjs, types, years] = await Promise.all([
          facultyApi.getDepartments(),
          facultyApi.getSubjects(),
          facultyApi.getResourceTypes(),
          facultyApi.getAcademicYears()
        ]);
        setDepartments(depts);
        setSubjects(subjs);
        setResourceTypes(types);
        setAcademicYears(years);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    loadMeta();
  }, []);

  // Filter subjects based on selected department
  const filteredSubjects = department && department !== 'all'
    ? subjects.filter(s => s.department_id === department || s.department_code === department)
    : subjects;

  // Load Resources
  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await facultyApi.getResources({
        q,
        department,
        subject,
        resourceType,
        academicYear,
        status,
        sort,
        page,
        limit: 10
      });
      setResources(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error querying resources:', err);
      setError(err.message || 'Failed to query resources.');
    } finally {
      setLoading(false);
    }
  };

  // Synchronize URL parameters with filters
  useEffect(() => {
    fetchResources();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (department && department !== 'all') params.set('department', department);
    if (subject && subject !== 'all') params.set('subject', subject);
    if (resourceType && resourceType !== 'all') params.set('resourceType', resourceType);
    if (academicYear && academicYear !== 'all') params.set('academicYear', academicYear);
    if (status && status !== 'ALL') params.set('status', status);
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', page);
    setSearchParams(params, { replace: true });
  }, [department, subject, resourceType, academicYear, status, sort, page]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  // Reset all filters
  const resetFilters = () => {
    setQ('');
    setDepartment('all');
    setSubject('all');
    setResourceType('all');
    setAcademicYear('all');
    setStatus('ALL');
    setSort('newest');
    setPage(1);
  };

  // Archive Handler
  const handleArchive = async () => {
    if (!confirmArchiveId) return;
    setActionLoading(true);
    try {
      await facultyApi.archiveResource(confirmArchiveId);
      showToast('Resource status changed to ARCHIVED.');
      setConfirmArchiveId(null);
      fetchResources();
    } catch (err) {
      showToast(err.message || 'Failed to archive resource.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setActionLoading(true);
    try {
      await facultyApi.deleteResource(confirmDeleteId);
      showToast('Resource removed permanently.');
      setConfirmDeleteId(null);
      fetchResources();
    } catch (err) {
      showToast(err.message || 'Failed to delete resource.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            PUBLISHED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            PENDING
          </span>
        );
      case 'UNDER REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3" />
            UNDER REVIEW
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Archive className="w-3 h-3" />
            ARCHIVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" />
            REJECTED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            {st}
          </span>
        );
    }
  };

  return (
    <FacultyLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Manage Resources">
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Academic Resource Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curate, edit metadata, archive, and audit materials across all university faculties.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchResources}
              disabled={loading}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
            <Link
              to="/faculty/resources/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Resource</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, description, course code or keywords..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm transition-colors"
            >
              Search Repository
            </button>
            {(q || department !== 'all' || subject !== 'all' || resourceType !== 'all' || academicYear !== 'all' || status !== 'ALL' || sort !== 'newest') && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
              >
                Reset Filters
              </button>
            )}
          </form>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            
            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="PENDING">Pending Review</option>
                <option value="UNDER REVIEW">Under Review</option>
                <option value="ARCHIVED">Archived</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => { setDepartment(e.target.value); setSubject('all'); setPage(1); }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Subjects</option>
                {filteredSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Resource Type
              </label>
              <select
                value={resourceType}
                onChange={(e) => { setResourceType(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                {resourceTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => { setAcademicYear(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Terms</option>
                {academicYears.map(ay => (
                  <option key={ay.id} value={ay.name}>{ay.name} {ay.is_active ? '(Active)' : ''}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Sort Order
              </label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="downloads">Most Downloaded</option>
                <option value="title">Alphabetical (A-Z)</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

          </div>

        </div>

        {/* Resources Table Container */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
          
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{resources.length}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white">{pagination.total}</strong> registered materials
            </span>
            <span className="font-mono text-[11px]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Material Details</th>
                  <th className="px-4 py-3.5">Course & Dept</th>
                  <th className="px-4 py-3.5">Academic Term</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Uploader</th>
                  <th className="px-4 py-3.5 text-center">Downloads</th>
                  <th className="px-5 py-3.5 text-right">Faculty Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                      Querying resource repository...
                    </td>
                  </tr>
                ) : resources.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                      No matching resources found for the selected filter parameters.
                    </td>
                  </tr>
                ) : (
                  resources.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Title & Type */}
                      <td className="px-5 py-3.5 max-w-xs font-medium text-slate-900 dark:text-white">
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate leading-snug">{item.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {item.description || 'No description provided'}
                            </p>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                              {item.resource_type_name || 'Academic Material'} • {item.file_size}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course & Department */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">
                          {item.subject_code}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {item.department_name}
                        </div>
                      </td>

                      {/* Term & Semester */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        <div className="font-medium text-xs text-slate-900 dark:text-white">
                          {item.academic_year}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.semester} (Year {item.year})
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Uploader */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        <p className="font-medium text-xs text-slate-900 dark:text-white truncate">
                          {item.uploader_name || 'Faculty Member'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono capitalize">
                          {item.uploader_role}
                        </p>
                      </td>

                      {/* Downloads */}
                      <td className="px-4 py-3.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {item.download_count || 0}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Details Modal Trigger */}
                          <button
                            onClick={() => setSelectedResource(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Inspect details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Metadata */}
                          <Link
                            to={`/faculty/resources/${item.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit metadata"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Archive Action */}
                          {item.status !== 'ARCHIVED' && (
                            <button
                              onClick={() => setConfirmArchiveId(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Archive resource"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Action */}
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Remove resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Details Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedResource.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedResource.file_name} • {selectedResource.file_size}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedResource.department_name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Subject</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedResource.subject_code} - {selectedResource.subject_name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedResource.status)}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Term & Semester</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedResource.academic_year} • {selectedResource.semester}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Uploader</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedResource.uploader_name} ({selectedResource.uploader_role})</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Downloads</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedResource.download_count || 0}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Description / Summary</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 leading-relaxed">
                {selectedResource.description || 'No description provided.'}
              </p>
            </div>

            {selectedResource.staff_remarks && (
              <div>
                <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">Faculty Remarks</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                  "{selectedResource.staff_remarks}"
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                to={`/faculty/resources/${selectedResource.id}/edit`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Edit Metadata
              </Link>
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Dialog: Archive */}
      {confirmArchiveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600">
              <Archive className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Archive Academic Resource?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Archiving this resource will remove it from active student search discovery while preserving record history and download metrics.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmArchiveId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
              >
                {actionLoading ? 'Archiving...' : 'Confirm Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Permanently Remove Resource?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This action is permanent and will delete the resource file, download records, and student bookmarks. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl border animate-in slide-in-from-bottom-5 ${
          toast.type === 'error'
            ? 'bg-rose-900 text-white border-rose-700'
            : 'bg-indigo-900 text-white border-indigo-700'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.msg}</span>
        </div>
      )}

    </FacultyLayout>
  );
};
