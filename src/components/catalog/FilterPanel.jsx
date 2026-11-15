import React from 'react';
import { Filter, Check, RotateCcw, ShieldCheck, Flame, Star } from 'lucide-react';
import { DEPARTMENTS, RESOURCE_CATEGORIES } from '../../data/mockResources';

export const FilterPanel = ({
  selectedDept,
  setSelectedDept,
  selectedCategory,
  setSelectedCategory,
  onlyVerified,
  setOnlyVerified,
  onlyHighYield,
  setOnlyHighYield,
  minRating,
  setMinRating,
  onReset
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Filters
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Verification & Quality Toggles */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Quality Badges
        </label>
        
        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Peer Verified Only</span>
          </div>
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={(e) => setOnlyVerified(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>High-Yield Exam Packs</span>
          </div>
          <input
            type="checkbox"
            checked={onlyHighYield}
            onChange={(e) => setOnlyHighYield(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
      </div>

      {/* Departments */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Department
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedDept('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
              selectedDept === 'all'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>All Departments</span>
            {selectedDept === 'all' && <Check className="w-3.5 h-3.5" />}
          </button>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                selectedDept === dept.id
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-400">{dept.code}</span>
                <span>{dept.name}</span>
              </div>
              {selectedDept === dept.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Types */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Material Type
        </label>
        <div className="space-y-1">
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat.id
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>{cat.label}</span>
              {selectedCategory === cat.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Minimum Rating
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { val: 0, label: 'Any' },
            { val: 4.5, label: '4.5+ ★' },
            { val: 4.8, label: '4.8+ ★' },
          ].map((r) => (
            <button
              key={r.val}
              onClick={() => setMinRating(r.val)}
              className={`py-1.5 px-2 text-center rounded-lg text-xs font-medium transition-all ${
                minRating === r.val
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
