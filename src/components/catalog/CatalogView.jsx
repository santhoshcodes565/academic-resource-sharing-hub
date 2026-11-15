import React, { useState, useMemo } from 'react';
import { 
  Search, 
  LayoutGrid, 
  List, 
  SlidersHorizontal, 
  X, 
  BookOpen, 
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { FilterPanel } from './FilterPanel';
import { ResourceCard } from './ResourceCard';

export const CatalogView = ({ 
  resources, 
  onSelectResource, 
  onBookmark, 
  savedIds,
  initialCategory = 'all',
  initialDept = 'all',
  initialQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyHighYield, setOnlyHighYield] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'pages'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter & Sort calculation
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      // Search query check
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          item.title.toLowerCase().includes(q) ||
          item.courseCode.toLowerCase().includes(q) ||
          item.professor.toLowerCase().includes(q) ||
          item.departmentName.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Department check
      if (selectedDept !== 'all' && item.department !== selectedDept) {
        return false;
      }

      // Category check
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Verified check
      if (onlyVerified && !item.isVerified) {
        return false;
      }

      // High Yield check
      if (onlyHighYield && !item.isHighYield) {
        return false;
      }

      // Min Rating check
      if (minRating > 0 && item.rating < minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.downloads - a.downloads;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'pages') return b.pages - a.pages;
      return 0;
    });
  }, [resources, searchQuery, selectedDept, selectedCategory, onlyVerified, onlyHighYield, minRating, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedDept('all');
    setSelectedCategory('all');
    setOnlyVerified(false);
    setOnlyHighYield(false);
    setMinRating(0);
    setSortBy('popular');
  };

  return (
    <div className="py-6 sm:py-8">
      
      {/* Top Title & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Resource Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse verified course materials, past midterm papers, and study guides across departments.
          </p>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code, keyword..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterPanel
            selectedDept={selectedDept}
            setSelectedDept={setSelectedDept}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onlyVerified={onlyVerified}
            setOnlyVerified={setOnlyVerified}
            onlyHighYield={onlyHighYield}
            setOnlyHighYield={setOnlyHighYield}
            minRating={minRating}
            setMinRating={setMinRating}
            onReset={handleReset}
          />
        </div>

        {/* Results Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Subheader: counts, mobile filter trigger, sorting & view toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              <span className="font-medium text-slate-600 dark:text-slate-300">
                Found <span className="font-bold text-slate-900 dark:text-white">{filteredResources.length}</span> materials
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort by */}
              <div className="flex items-center gap-1.5 text-slate-500">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="popular">Most Downloaded</option>
                  <option value="rating">Highest Rated</option>
                  <option value="pages">Document Length</option>
                </select>
              </div>

              {/* View Switcher (Grid / List) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Cards Grid / List */}
          {filteredResources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  No academic resources match your filters
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Try broadening your search term, switching categories, or resetting the filters.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 gap-5" 
                : "space-y-3"
            }>
              {filteredResources.map((item) => (
                <ResourceCard
                  key={item.id}
                  resource={item}
                  onSelect={onSelectResource}
                  onBookmark={onBookmark}
                  isSaved={savedIds.includes(item.id)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto shadow-2xl z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Refine Search</h3>
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterPanel
                selectedDept={selectedDept}
                setSelectedDept={setSelectedDept}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onlyVerified={onlyVerified}
                setOnlyVerified={setOnlyVerified}
                onlyHighYield={onlyHighYield}
                setOnlyHighYield={setOnlyHighYield}
                minRating={minRating}
                setMinRating={setMinRating}
                onReset={handleReset}
              />
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
