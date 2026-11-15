import React from 'react';
import { 
  FileText, 
  Download, 
  Star, 
  ShieldCheck, 
  Bookmark, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const ResourceCard = ({ 
  resource, 
  onSelect, 
  onBookmark, 
  isSaved,
  viewMode = 'grid'
}) => {
  if (viewMode === 'list') {
    return (
      <div className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left icon & details */}
        <div className="flex items-start gap-3.5 flex-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                {resource.courseCode}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {resource.departmentName}
              </span>
              {resource.isVerified && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            <h3 
              onClick={() => onSelect(resource)}
              className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer transition-colors"
            >
              {resource.title}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {resource.professor} • {resource.semester} • {resource.pages} pages • {resource.fileSize}
            </p>
          </div>
        </div>

        {/* Right stats & action */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {resource.rating}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              {resource.downloads}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBookmark(resource.id)}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                isSaved 
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 border-blue-200 dark:border-blue-700' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600'
              }`}
              title={isSaved ? "Saved" : "Save"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
            </button>

            <button
              onClick={() => onSelect(resource)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Preview
            </button>
          </div>
        </div>

      </div>
    );
  }

  // Grid Mode (Default)
  return (
    <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
              {resource.courseCode}
            </span>
            {resource.isHighYield && (
              <Badge variant="highYield">High Yield</Badge>
            )}
          </div>
          {resource.isVerified && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelect(resource)}
          className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer transition-colors line-clamp-2"
        >
          {resource.title}
        </h3>

        {/* Metadata info */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>{resource.departmentName}</span>
          <span>•</span>
          <span>{resource.semester}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Author chip */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <img 
            src={resource.author.avatar} 
            alt={resource.author.name}
            className="w-6 h-6 rounded-full object-cover" 
          />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {resource.author.name}
            </span>
            <span className="text-slate-400 ml-1.5 hidden sm:inline">
              ({resource.author.role})
            </span>
          </div>
        </div>
      </div>

      {/* Card bottom bar */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {resource.rating}
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            {resource.fileSize}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onBookmark(resource.id)}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              isSaved 
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 border-blue-200 dark:border-blue-700' 
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600'
            }`}
            title={isSaved ? "Saved" : "Save to Deck"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => onSelect(resource)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Preview
          </button>
        </div>
      </div>

    </div>
  );
};
