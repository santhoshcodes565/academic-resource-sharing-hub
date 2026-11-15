import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StudentLayout } from '../../components/layout/StudentLayout';
import { studentApi } from '../../services/studentApi';
import { 
  ArrowLeft, 
  Download, 
  Bookmark, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  User, 
  Layers, 
  Clock, 
  Share2, 
  Star, 
  Sparkles,
  CheckCircle,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export const StudentResourceDetailsPage = ({ darkMode, setDarkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadResource() {
      setLoading(true);
      setError(null);
      try {
        const data = await studentApi.getResourceById(id);
        setResource(data);
        setIsBookmarked(!!data.is_bookmarked);
      } catch (err) {
        console.error('Failed to load resource details:', err);
        setError(err.message || 'Resource not found or restricted');
      } finally {
        setLoading(false);
      }
    }
    loadResource();
  }, [id]);

  const handleToggleBookmark = async () => {
    if (!resource) return;
    try {
      if (isBookmarked) {
        await studentApi.removeBookmark(resource.id);
        setIsBookmarked(false);
        showToast('Removed material from bookmarks');
      } else {
        await studentApi.addBookmark(resource.id);
        setIsBookmarked(true);
        showToast('Saved to your bookmarks ★');
      }
    } catch (err) {
      showToast(err.message || 'Bookmark action failed');
    }
  };

  const handleDownload = async () => {
    if (!resource || isDownloading) return;
    setIsDownloading(true);
    try {
      showToast('Downloading document...');
      await studentApi.downloadResource(resource.id, resource.file_name);
      setResource(prev => ({ ...prev, download_count: (prev.download_count || 0) + 1 }));
      showToast('Download successful!');
    } catch (err) {
      showToast(`Download failed: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Direct link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <StudentLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Resource Details">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom duration-200">
            {toastMessage}
          </div>
        )}

        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/student/resources')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Resource Library</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Resource'}</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 animate-pulse">
            <div className="w-28 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="w-3/4 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl mt-6" />
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-[#0F172A] border border-red-200 dark:border-red-900/40 rounded-3xl p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Unable to view resource</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">{error}</p>
            <Link
              to="/student/resources"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500"
            >
              Return to Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Top Overview Card */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/50">
                    {resource.subject_code}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {resource.subject_name}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {resource.department_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{resource.status}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleBookmark}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isBookmarked
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-amber-400 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    <span>{isBookmarked ? 'Bookmarked' : 'Save'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloading ? 'Downloading...' : 'Download File'}</span>
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {resource.title}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {resource.description || 'No detailed description provided for this academic resource.'}
                </p>
              </div>

              {/* Staff Remarks if verified */}
              {resource.staff_remarks && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs space-y-1">
                  <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Faculty Review Notes</span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    "{resource.staff_remarks}"
                  </p>
                </div>
              )}

              {/* Resource Metadata Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Resource Type
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {resource.resource_type_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Term / Semester
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {resource.academic_year} • {resource.semester}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Uploaded By
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {resource.uploader_name} ({resource.uploader_role})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Total Downloads
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {resource.download_count ?? 0} verified downloads
                  </span>
                </div>
              </div>

            </div>

            {/* File Details & Preview Box */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Attached Document File
                  </h3>
                </div>
                <span className="font-mono text-xs text-slate-500">{resource.file_size}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{resource.file_name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {resource.file_mime || 'application/pdf'} • {resource.file_size}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>

            {/* Peer Reviews & Comments */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Verified Reviews ({resource.reviews?.length || 0})
                  </h3>
                </div>
              </div>

              {!resource.reviews || resource.reviews.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No reviews submitted yet for this material.</p>
              ) : (
                <div className="space-y-3">
                  {resource.reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{rev.user_name}</span>
                        <div className="flex items-center text-amber-500">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{rev.review_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </StudentLayout>
  );
};
