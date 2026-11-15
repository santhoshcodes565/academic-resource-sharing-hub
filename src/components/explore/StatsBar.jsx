import React from 'react';
import { ShieldCheck, BookMarked, Users, Award } from 'lucide-react';

export const StatsBar = () => {
  const stats = [
    { label: 'Verified Resources', value: '14,820+', icon: BookMarked, color: 'text-blue-500' },
    { label: 'Universities & Colleges', value: '52', icon: Award, color: 'text-amber-500' },
    { label: 'Active Student Peers', value: '68,400+', icon: Users, color: 'text-emerald-500' },
    { label: 'Peer Verification Rate', value: '99.4%', icon: ShieldCheck, color: 'text-indigo-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className={`p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
