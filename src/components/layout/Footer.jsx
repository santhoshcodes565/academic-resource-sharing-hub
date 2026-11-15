import React from 'react';
import { GraduationCap, Github, Heart, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                Academia<span className="text-blue-600">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Open-access academic resource sharing platform connecting university students with verified course packs, solved midterms, and lecture summaries.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Core Departments
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Computer Science (CS)</li>
              <li>Mathematics & Statistics (MATH)</li>
              <li>Electrical Engineering (EE)</li>
              <li>Physics & Quantum Mechanics (PHYS)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Academic Standards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Peer Verification Guidelines</li>
              <li>University Honor Code Policy</li>
              <li>Creative Commons Licensing</li>
              <li>Takedown & Copyright Requests</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Integrity Affirmation
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                All study packs are moderated to preserve academic integrity under FERPA and university honor guidelines.
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Academic Resource Sharing Hub. Built with React, Vite & Tailwind CSS.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Access</span>
            <span>Honor Code</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
