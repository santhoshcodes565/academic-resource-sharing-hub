import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Bookmark, 
  UploadCloud, 
  FileCheck, 
  HelpCircle, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Search, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Bell
} from 'lucide-react';

export const StudentLayout = ({ children, darkMode, setDarkMode, title = 'Student Portal' }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const displayName = currentUser?.full_name || currentUser?.name || 'Student';
  const email = currentUser?.email || 'student@university.edu';
  const department = currentUser?.department || 'Computer Science';
  const semester = currentUser?.semester || 'Semester 1';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') || 'ST';

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Resource Library', path: '/student/resources', icon: BookOpen },
    { name: 'My Bookmarks', path: '/student/bookmarks', icon: Bookmark },
    { name: 'Upload Resource', path: '/student/upload', icon: UploadCloud },
    { name: 'My Contributions', path: '/student/contributions', icon: FileCheck },
    { name: 'Resource Requests', path: '/student/requests', icon: HelpCircle },
    { name: 'My Profile', path: '/student/profile', icon: User },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left brand & mobile toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/student/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                      ARH<span className="text-blue-600 dark:text-blue-400">Hub</span>
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800/60">
                      Student
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block leading-none">
                    Academic Resource Sharing Hub
                  </p>
                </div>
              </Link>
            </div>

            {/* Middle Quick Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <button
                onClick={() => navigate('/student/resources')}
                className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-inner group"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span>Search published notes, exams, problem sets...</span>
                </div>
                <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded">
                  /
                </kbd>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Quick Upload CTA */}
              <Link
                to="/student/upload"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload</span>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Color Theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Profile Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-500/30">
                    {initials}
                  </div>
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{displayName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Student</p>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                      <p className="text-slate-500 dark:text-slate-400 truncate text-[11px] font-mono">{email}</p>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1">{department} • {semester}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/student/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Manage Profile</span>
                      </Link>
                      <Link
                        to="/student/contributions"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <FileCheck className="w-4 h-4 text-slate-400" />
                        <span>My Submissions</span>
                      </Link>
                      <Link
                        to="/student/bookmarks"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Saved Bookmarks</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex py-6 gap-6">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-24 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-6">
            
            {/* User Academic Badge */}
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-slate-900 border border-blue-100 dark:border-blue-900/40 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</h4>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 truncate">{department}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{semester}</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Student Navigation
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/student/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive: active }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
                      ${active 
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Term & System Info Box */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                  <span>Current Term</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">2024–2025</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Database Connected</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* Mobile Slide-Out Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col space-y-6 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    ARH
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Student Portal</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <p className="font-bold text-xs text-slate-900 dark:text-white">{displayName}</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">{department}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{semester}</p>
              </div>

              <nav className="space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                        ${isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Content Outlet */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>

    </div>
  );
};
