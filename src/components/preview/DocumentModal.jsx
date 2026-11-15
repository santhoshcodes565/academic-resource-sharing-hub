import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Bookmark, 
  Share2, 
  CheckCircle, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  Send, 
  Sparkles,
  FileText,
  ThumbsUp,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const DocumentModal = ({ resource, isOpen, onClose, onBookmark, isSaved }) => {
  if (!isOpen || !resource) return null;

  const [activePage, setActivePage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [comments, setComments] = useState(resource.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const previewPages = resource.previewPages || [
    {
      pageNumber: 1,
      title: 'Course Overview & Core Axioms',
      content: resource.description
    }
  ];

  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(20);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsDownloading(false), 800);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const commentObj = {
      id: `c-${Date.now()}`,
      author: 'Alex Chen (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Student',
      text: newComment.trim(),
      time: 'Just now',
      upvotes: 0
    };
    setComments([commentObj, ...comments]);
    setNewComment('');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-6xl h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col">
        
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
              {resource.courseCode}
            </span>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 max-w-lg">
              {resource.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => onBookmark(resource.id)}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                isSaved 
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 border-blue-200 dark:border-blue-700' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isSaved ? "Saved" : "Save"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Split Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Interactive Reader Canvas (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-100/70 dark:bg-slate-950 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 h-full overflow-hidden">
            
            {/* Document Reader Controls */}
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  Page {activePage + 1} of {previewPages.length}
                </span>
                <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-md">
                  <button
                    disabled={activePage === 0}
                    onClick={() => setActivePage(p => Math.max(0, p - 1))}
                    className="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={activePage === previewPages.length - 1}
                    onClick={() => setActivePage(p => Math.min(previewPages.length - 1, p + 1))}
                    className="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setZoomLevel(z => Math.max(80, z - 10))}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px]">{zoomLevel}%</span>
                <button 
                  onClick={() => setZoomLevel(z => Math.min(130, z + 10))}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Page Canvas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
              <div 
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-xl bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 transition-transform font-serif leading-relaxed text-slate-800 dark:text-slate-200"
              >
                {/* Simulated Paper Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between font-sans text-xs text-slate-500">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {resource.courseCode} — {resource.semester}
                  </span>
                  <span>{resource.university}</span>
                </div>

                <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white pt-2">
                  {previewPages[activePage]?.title || resource.title}
                </h3>

                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto leading-normal">
                  {previewPages[activePage]?.content || resource.description}
                </div>

                <div className="font-sans text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-2">
                  <p>
                    <strong>Syllabus Alignment:</strong> Verified for Fall 2024 final exams. All notation follows course lecture slides and official textbook chapters.
                  </p>
                  <p className="italic text-[11px] text-slate-400">
                    Document verified by Teaching Assistant on {resource.uploadedAt}.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Metadata, Download Hub, Discussion (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 flex flex-col h-full overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Download CTA Hub */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-200/80 dark:border-blue-900/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Full Document Export
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {resource.fileType} • {resource.fileSize}
                </span>
              </div>

              {isDownloading ? (
                <div className="space-y-1.5 py-1">
                  <div className="flex justify-between text-xs text-blue-600 font-semibold">
                    <span>Downloading package...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-950 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-200"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Verified PDF ({resource.fileSize})</span>
                </button>
              )}
            </div>

            {/* Quality Scorecard */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-sm font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{resource.rating}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Rating</div>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {resource.downloads}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Downloads</div>
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100%</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Verified</div>
              </div>
            </div>

            {/* Author Profile */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <img 
                src={resource.author.avatar} 
                alt={resource.author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white">{resource.author.name}</h4>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                    TA
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">{resource.author.role}</p>
              </div>
            </div>

            {/* Peer Discussion & Q&A */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Peer Discussion ({comments.length})</span>
                </h4>
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask a question about this material..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Comments Feed */}
              <div className="space-y-3 pt-2 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
                {comments.map((c) => (
                  <div key={c.id} className="pt-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{c.author}</span>
                      <span className="text-[10px] text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
