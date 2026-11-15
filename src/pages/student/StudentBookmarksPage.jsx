import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StudentLayout } from '../../components/layout/StudentLayout';
import { studentApi } from '../../services/studentApi';
import { 
  Bookmark, 
  Trash2, 
  Download, 
  ExternalLink, 
  FileText, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight,
  Clock
} from 'lucide-react';

export const StudentBookmarksPage = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getBookmarks();
      setBookmarks(data || []);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      showToast('Could not load saved bookmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (resourceId, title) => {
    try {
      await studentApi.removeBookmark(resourceId);
      setBookmarks(prev => prev.filter(b => b.id !== resourceId));
      showToast(`Removed "${title}" from bookmarks`);
    } catch (err) {
      showToast(err.message || 'Failed to remove bookmark');
    }
  };

  const handleDownload = async (item) => {
    try {
      showToast(`Downloading ${item.file_name}...`);
      await studentApi.downloadResource(item.id, item.file_name);
      showToast('Download complete!');
    } catch (err) {
      showToast(`Download failed: ${err.message}`);
    }
  };

  return (
    <StudentLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Saved Bookmarks">
      <div className="space-y-6">

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom duration-200">
            {toastMessage}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Saved Bookmarks
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personal study deck and quick-reference materials saved for your courses.
            </p>
          </div>

          <Link
            to="/student/resources"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Library</span>
          </Link>
        </div>

        {/* Bookmarks List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 animate-pulse" />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto">
              <Bookmark className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No saved bookmarks yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save high-yield exams, cheatsheets, and lecture notes to your personal study deck for instant access during midterm and finals week.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/student/resources"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500 shadow-sm shadow-blue-500/20"
              >
                <span>Explore Academic Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
            {bookmarks.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                        • {item.semester} • {item.academic_year}
                      </span>
                    </div>

                    <Link
                      to={`/student/resources/${item.id}`}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                    >
                      {item.title}
                    </Link>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.description || 'Saved academic material.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-mono text-slate-400 hidden md:block">
                    {item.file_size}
                  </span>

                  <button
                    onClick={() => handleDownload(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => handleRemoveBookmark(item.id, item.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </StudentLayout>
  );
};
