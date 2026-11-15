import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { StudentLayout } from '../../components/layout/StudentLayout';
import { studentApi } from '../../services/studentApi';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  RotateCcw, 
  BookOpen, 
  FileText, 
  Download, 
  Bookmark, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

export const StudentResourcesPage = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('department') || 'all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(searchParams.get('academic_year') || 'all');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || 'all');
  const [selectedSemester, setSelectedSemester] = useState(searchParams.get('semester') || 'all');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all');
  const [selectedResourceType, setSelectedResourceType] = useState(searchParams.get('resource_type') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Metadata Lists
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);

  // Data & View state
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [bookmarkedMap, setBookmarkedMap] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch metadata on mount
  useEffect(() => {
    async function loadMetadata() {
      const [deptList, typeList] = await Promise.all([
        studentApi.getDepartments(),
        studentApi.getResourceTypes()
      ]);
      setDepartments(deptList || []);
      setResourceTypes(typeList || []);
    }
    loadMetadata();
  }, []);

  // 2. Fetch subjects when department changes
  useEffect(() => {
    async function loadSubjects() {
      const subjList = await studentApi.getSubjects(selectedDept);
      setSubjects(subjList || []);
    }
    loadSubjects();
  }, [selectedDept]);

  // 3. Fetch resources from backend API
  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        q: keyword,
        department: selectedDept,
        academic_year: selectedAcademicYear,
        year: selectedYear,
        semester: selectedSemester,
        subject: selectedSubject,
        resource_type: selectedResourceType,
        sort: sortBy,
        page: currentPage,
        limit: 12
      };

      const result = await studentApi.getResources(filters);
      setResources(result.items || []);
      setPagination(result.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });

      // Load bookmark status for this student
      try {
        const bookmarks = await studentApi.getBookmarks();
        const map = {};
        bookmarks.forEach(b => { map[b.id] = true; });
        setBookmarkedMap(map);
      } catch (e) {}

    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedDept, selectedAcademicYear, selectedYear, selectedSemester, selectedSubject, selectedResourceType, sortBy, currentPage]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchResources();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setKeyword('');
    setSelectedDept('all');
    setSelectedAcademicYear('all');
    setSelectedYear('all');
    setSelectedSemester('all');
    setSelectedSubject('all');
    setSelectedResourceType('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Bookmark Toggle
  const handleToggleBookmark = async (resourceId, e) => {
    e.stopPropagation();
    e.preventDefault();
    const isCurrentlyBookmarked = !!bookmarkedMap[resourceId];

    try {
      if (isCurrentlyBookmarked) {
        await studentApi.removeBookmark(resourceId);
        setBookmarkedMap(prev => ({ ...prev, [resourceId]: false }));
        showToast('Removed from saved bookmarks');
      } else {
        await studentApi.addBookmark(resourceId);
        setBookmarkedMap(prev => ({ ...prev, [resourceId]: true }));
        showToast('Saved to your bookmarks ★');
      }
    } catch (err) {
      showToast(err.message || 'Action failed');
    }
  };

  // Download Action
  const handleDownload = async (resource, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      showToast(`Initiating download for ${resource.file_name}...`);
      await studentApi.downloadResource(resource.id, resource.file_name);
      showToast('Download complete!');
      // Update local download count
      setResources(prev => prev.map(r => r.id === resource.id ? { ...r, download_count: (r.download_count || 0) + 1 } : r));
    } catch (err) {
      showToast(`Download failed: ${err.message}`);
    }
  };

  return (
    <StudentLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Resource Library">
      <div className="space-y-6">

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom duration-200">
            {toastMessage}
          </div>
        )}

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Academic Resource Library
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore peer-verified lecture notes, exam papers, formulas and lab manuals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/student/upload"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-all"
            >
              <span>Submit Resource</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar (Combined Queries) */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          
          {/* Keyword Search Row */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by keywords, course code, topics, or faculty..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20"
            >
              Search
            </button>
          </form>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            
            {/* Department Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setSelectedSubject('all'); setCurrentPage(1); }}
                className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => { setSelectedSubject(e.target.value); setCurrentPage(1); }}
                className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Resource Type
              </label>
              <select
                value={selectedResourceType}
                onChange={(e) => { setSelectedResourceType(e.target.value); setCurrentPage(1); }}
                className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {resourceTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Academic Year
              </label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => { setSelectedAcademicYear(e.target.value); setCurrentPage(1); }}
                className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                <option value="2025-2026">2025–2026</option>
                <option value="2024-2025">2024–2025</option>
                <option value="2023-2024">2023–2024</option>
                <option value="2022-2023">2022–2023</option>
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => { setSelectedSemester(e.target.value); setCurrentPage(1); }}
                className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Semesters</option>
                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="downloads">Most Downloaded</option>
                <option value="title">Title (A–Z)</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

          </div>

          {/* Active Filter Indicators & Reset Action */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{pagination.total}</span> verified resource{pagination.total === 1 ? '' : 's'}
            </span>
            <button
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>

        </div>

        {/* Resources Grid / List Container */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3 animate-pulse">
                <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No matching academic resources found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try broadening your search keywords or resetting some of the filters.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-200"
              >
                Reset Filters
              </button>
              <Link
                to="/student/requests"
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500 shadow-sm shadow-blue-500/20"
              >
                Request This Resource
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((item) => {
              const isSaved = !!bookmarkedMap[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/student/resources/${item.id}`)}
                  className="group bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer space-y-4"
                >
                  <div className="space-y-3">
                    
                    {/* Top Row: Course Code & Verification Badge & Bookmark */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/40">
                          {item.subject_code}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {item.department_name}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleToggleBookmark(item.id, e)}
                        className={`p-1.5 rounded-lg transition-colors ${isSaved ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title={isSaved ? 'Remove Bookmark' : 'Save to Bookmarks'}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.description || 'Academic resource uploaded for course study and exam preparation.'}
                    </p>

                    {/* Tags / Metadata */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                        {item.resource_type_name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                        {item.semester}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                        {item.academic_year}
                      </span>
                    </div>

                  </div>

                  {/* Bottom Stats & Download Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {item.file_size} • {item.download_count ?? 0} dl
                    </span>

                    <button
                      onClick={(e) => handleDownload(item, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 font-semibold transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
            {resources.map((item) => {
              const isSaved = !!bookmarkedMap[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/student/resources/${item.id}`)}
                  className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
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
                          • {item.academic_year} • {item.semester}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {item.description || 'Verified course document.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0 ml-12 sm:ml-0">
                    <span className="text-xs font-mono text-slate-400 hidden md:block">
                      {item.file_size} • {item.download_count ?? 0} dl
                    </span>
                    <button
                      onClick={(e) => handleToggleBookmark(item.id, e)}
                      className={`p-2 rounded-lg transition-colors ${isSaved ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-400 hover:text-amber-500'}`}
                      title={isSaved ? 'Remove Bookmark' : 'Save to Bookmarks'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={(e) => handleDownload(item, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Navigation */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  );
};
