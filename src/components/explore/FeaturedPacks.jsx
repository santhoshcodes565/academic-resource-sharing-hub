import React from 'react';
import { Sparkles, ArrowRight, Star, Download, ShieldCheck, Flame } from 'lucide-react';
import { Badge } from '../common/Badge';

export const FeaturedPacks = ({ resources, onSelectResource, onBookmark, savedIds }) => {
  const highYieldResources = resources.filter(r => r.isHighYield).slice(0, 3);

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              High-Yield Exam Packs
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Top-rated exam study guides and solved midterms for upcoming exam seasons.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {highYieldResources.map((item) => {
          const isSaved = savedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                      {item.courseCode}
                    </span>
                    <Badge variant="highYield">High Yield</Badge>
                  </div>
                  {item.isVerified && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 
                  onClick={() => onSelectResource(item)}
                  className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer transition-colors line-clamp-2"
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.tags.slice(0, 3).map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer info & action */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {item.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    {item.downloads}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onBookmark(item.id)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      isSaved 
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 border-blue-200 dark:border-blue-700' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600'
                    }`}
                    title={isSaved ? "Saved" : "Save to Study Deck"}
                  >
                    ★
                  </button>

                  <button
                    onClick={() => onSelectResource(item)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-300 text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
