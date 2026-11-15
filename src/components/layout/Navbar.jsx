import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  UploadCloud, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Bookmark, 
  Sparkles, 
  Command, 
  Info, 
  LogIn, 
  LogOut, 
  User, 
  ShieldCheck 
} from 'lucide-react';

export const Navbar = ({ 
  darkMode, 
  setDarkMode, 
  onOpenUpload, 
  onOpenSearch, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  activeView,
  setActiveView,
  savedCount = 0,
  currentUser,
  onLogout
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const displayName = currentUser ? (currentUser.full_name || currentUser.name || 'User') : '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') || 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link 
              to={currentUser ? (currentUser.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard') : '/'}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    ARH<span className="text-blue-600 dark:text-blue-400">Hub</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Academic Resource Sharing Hub
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Search Bar (Cmd+K) - Only visible when authenticated */}
          {currentUser && onOpenSearch && (
            <div className="flex-1 max-w-md hidden md:block">
              <button
                onClick={onOpenSearch}
                className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-inner group"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-slate-600 dark:text-slate-300 font-normal">
                    Search courses, notes, exams...
                  </span>
                </div>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-sm">
                  <Command className="w-3 h-3" /> K
                </kbd>
              </button>
            </div>
          )}

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Authenticated user quick actions */}
            {currentUser && (
              <>
                {/* Search icon for mobile */}
                {onOpenSearch && (
                  <button
                    onClick={onOpenSearch}
                    className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}

                {/* About Navigation Link */}
                {setActiveView && (
                  <button
                    onClick={() => setActiveView('about')}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      activeView === 'about'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>About</span>
                  </button>
                )}

                {/* My Study Deck Shortcut */}
                {setActiveView && (
                  <button
                    onClick={() => setActiveView('deck')}
                    className={`relative flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      activeView === 'deck' 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span className="hidden sm:inline">Study Deck</span>
                    {savedCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-blue-600 text-white leading-none">
                        {savedCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Upload Button */}
                {onOpenUpload && (
                  <button
                    onClick={onOpenUpload}
                    className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload Resource</span>
                  </button>
                )}
              </>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Authenticated User Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-500/30">
                    {initials}
                  </div>
                  <div className="text-left text-xs hidden lg:block">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {displayName}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      <span>{currentUser.role === 'faculty' ? 'Faculty' : 'Verified Student'}</span>
                    </div>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-[10px] font-bold uppercase">
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">
                          • {currentUser.department}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {currentUser.role === 'student' && setActiveView && (
                        <button
                          onClick={() => {
                            setActiveView('deck');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-blue-500" />
                          <span>My Study Deck</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          if (onLogout) onLogout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth/student/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm transition-colors ml-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Hamburger */}
            {currentUser && setMobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && currentUser && setActiveView && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2">
          <button
            onClick={() => { setActiveView('explore'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${activeView === 'explore' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Explore & Highlights
          </button>
          <button
            onClick={() => { setActiveView('catalog'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${activeView === 'catalog' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
          >
            Resource Catalog
          </button>
          <button
            onClick={() => { setActiveView('deck'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${activeView === 'deck' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
          >
            My Study Deck ({savedCount})
          </button>
          <button
            onClick={() => { setActiveView('about'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${activeView === 'about' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
          >
            About & Overview
          </button>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => { if (onLogout) onLogout(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600"
            >
              Sign Out ({displayName})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
