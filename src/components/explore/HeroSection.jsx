import React, { useState } from 'react';
import { Search, Sparkles, Filter, ArrowRight, ShieldCheck } from 'lucide-react';
import { RESOURCE_CATEGORIES } from '../../data/mockResources';

export const HeroSection = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  onSearchSubmit,
  onSelectCourseQuick
}) => {
  const quickCourses = ['CS-106B', 'MATH-215', 'CS-229', 'EE-201', 'PHYS-150', 'ECON-101'];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-blue-800/40">
      
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto text-center space-y-6">
        
        {/* Verification badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Faculty Endorsed & Community Peer-Reviewed</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
          Master Your Courses with <br />
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            Verified Academic Resources
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          High-yield exam packs, LaTeX formula cheatsheets, and lecture notes structured by university course codes and vetted by teaching assistants.
        </p>

        {/* Search bar inside Hero */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course code (e.g. CS-106B), topic, or exam term..."
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-slate-400 text-sm sm:text-base border border-white/15 focus:border-blue-400/60 focus:outline-none focus:ring-4 focus:ring-blue-500/20 backdrop-blur-md transition-all shadow-xl"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-transform active:scale-95 flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Course Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-400">Popular Courses:</span>
          {quickCourses.map((code) => (
            <button
              key={code}
              onClick={() => onSelectCourseQuick(code)}
              className="font-mono px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-blue-300 hover:text-white border border-white/10 transition-colors"
            >
              {code}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
