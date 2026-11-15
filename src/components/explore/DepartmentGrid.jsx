import React from 'react';
import { 
  Code, 
  Sigma, 
  Cpu, 
  Atom, 
  TrendingUp, 
  Dna, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { DEPARTMENTS } from '../../data/mockResources';

export const DepartmentGrid = ({ onSelectDepartment }) => {
  const iconMap = {
    Code: Code,
    Sigma: Sigma,
    Cpu: Cpu,
    Atom: Atom,
    TrendingUp: TrendingUp,
    Dna: Dna,
  };

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Browse by Department
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Curated collections sorted by university faculty and course syllabus.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {DEPARTMENTS.map((dept) => {
          const Icon = iconMap[dept.icon] || BookOpen;

          return (
            <button
              key={dept.id}
              onClick={() => onSelectDepartment(dept.id)}
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/50 hover:shadow-lg transition-all text-left flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {dept.code}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mt-0.5">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {dept.count} resources
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
