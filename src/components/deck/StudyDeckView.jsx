import React, { useState } from 'react';
import { 
  Bookmark, 
  UploadCloud, 
  History, 
  FolderPlus, 
  Star, 
  Download, 
  Sparkles, 
  Award,
  BookOpen,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { ResourceCard } from '../catalog/ResourceCard';

export const StudyDeckView = ({ 
  allResources, 
  savedIds, 
  onBookmark, 
  onSelectResource,
  onOpenUpload 
}) => {
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'uploads' | 'history'
  const [folders, setFolders] = useState([
    { id: 'f1', name: 'CS 106B Midterm Prep', count: 2 },
    { id: 'f2', name: 'Multivariable Calc Formulas', count: 1 },
  ]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const savedResources = allResources.filter(r => savedIds.includes(r.id));
  const userUploads = allResources.filter(r => r.author.name.includes('Alex Chen'));

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setFolders([...folders, { id: `f-${Date.now()}`, name: newFolderName.trim(), count: 0 }]);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  return (
    <div className="py-6 sm:py-8 space-y-8">
      
      {/* Top Profile & Contributor Stats Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" 
            alt="User Avatar" 
            className="w-16 h-16 rounded-2xl ring-4 ring-blue-500/40 object-cover shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Alex Chen</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>Tier 4: Master Contributor</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Computer Science & Applied Math • Class of 2025 • Stanford University
            </p>
          </div>
        </div>

        {/* Reputation Score Metric Cards */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <div className="text-lg font-extrabold text-blue-400">4,820</div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Rep Karma</div>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <div className="text-lg font-extrabold text-emerald-400">{userUploads.length}</div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Published</div>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <div className="text-lg font-extrabold text-amber-400">{savedResources.length}</div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Saved</div>
          </div>
        </div>

      </div>

      {/* Tabs navigation & folder tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Bookmarks ({savedResources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'uploads'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>My Contributions ({userUploads.length})</span>
          </button>
        </div>

        {/* Action Button */}
        {activeTab === 'saved' ? (
          <button
            onClick={() => setIsCreatingFolder(!isCreatingFolder)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <FolderPlus className="w-4 h-4 text-blue-500" />
            <span>New Study Folder</span>
          </button>
        ) : (
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Document</span>
          </button>
        )}
      </div>

      {/* New Folder Inline Form */}
      {isCreatingFolder && activeTab === 'saved' && (
        <form onSubmit={handleAddFolder} className="flex gap-2 max-w-md p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name (e.g. Physics Final Review)..."
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingFolder(false)}
            className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Study Deck Folders Pills */}
      {activeTab === 'saved' && folders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {folders.map(f => (
            <div 
              key={f.id}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-xs"
            >
              <span>📁 {f.name}</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">
                {f.count} items
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 1 Content: Saved Bookmarks */}
      {activeTab === 'saved' && (
        <div>
          {savedResources.length === 0 ? (
            <div className="text-center py-16 p-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl space-y-3">
              <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Your study deck is currently empty
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the bookmark star on any exam pack or lecture notes in the catalog to pin it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedResources.map(item => (
                <ResourceCard
                  key={item.id}
                  resource={item}
                  onSelect={onSelectResource}
                  onBookmark={onBookmark}
                  isSaved={true}
                  viewMode="grid"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: My Contributions */}
      {activeTab === 'uploads' && (
        <div>
          {userUploads.length === 0 ? (
            <div className="text-center py-16 p-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl space-y-3">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                You haven't uploaded any study materials yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Share your solved problem sets or course summaries with fellow peers to earn academic reputation badges.
              </p>
              <button
                onClick={onOpenUpload}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
              >
                Upload First Material (+50 Rep)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {userUploads.map(item => (
                <ResourceCard
                  key={item.id}
                  resource={item}
                  onSelect={onSelectResource}
                  onBookmark={onBookmark}
                  isSaved={savedIds.includes(item.id)}
                  viewMode="grid"
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
