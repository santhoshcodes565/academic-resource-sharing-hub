import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  School, 
  LayoutDashboard, 
  BookOpen, 
  UploadCloud, 
  Building2, 
  BookMarked, 
  Tags, 
  Calendar, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  FileCheck,
  HelpCircle,
  BarChart3,
  User
} from 'lucide-react';

export const FacultyLayout = ({ children, darkMode, setDarkMode, title = 'Faculty Administration' }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const displayName = currentUser?.full_name || currentUser?.name || 'Faculty Member';
  const email = currentUser?.email || 'faculty@university.edu';
  const department = currentUser?.department || 'Academic Department';
  const academicRole = currentUser?.role === 'admin' ? 'System Administrator' : 'Faculty Member';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') || 'FC';

  const navItems = [
    { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'Manage Resources', path: '/faculty/resources', icon: BookOpen },
    { name: 'Verify Contributions', path: '/faculty/verification', icon: FileCheck },
    { name: 'Resource Requests', path: '/faculty/requests', icon: HelpCircle },
    { name: 'Reports & Analytics', path: '/faculty/reports', icon: BarChart3 },
    { name: 'Upload Resource', path: '/faculty/resources/new', icon: UploadCloud },
    { name: 'Departments', path: '/faculty/departments', icon: Building2 },
    { name: 'Subjects', path: '/faculty/subjects', icon: BookMarked },
    { name: 'Resource Types', path: '/faculty/resource-types', icon: Tags },
    { name: 'Academic Years', path: '/faculty/academic-years', icon: Calendar },
    { name: 'Faculty Profile', path: '/faculty/profile', icon: User },
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Institutional Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md transition-colors shadow-sm">
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

              <Link to="/faculty/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                      ARH<span className="text-indigo-600 dark:text-indigo-400">Faculty</span>
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800/80">
                      Institutional Governance
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block leading-none">
                    Curricular Governance & Resource Administration
                  </p>
                </div>
              </Link>
            </div>

            {/* Quick Action Navigation Bar */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/faculty/resources/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02]"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Material</span>
              </Link>
              <Link
                to="/faculty/resources"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Manage Repository</span>
              </Link>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-500/30">
                    {initials}
                  </div>
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{displayName}</p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-medium">{department}</p>
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
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">{academicRole}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/faculty/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Faculty Dashboard</span>
                      </Link>
                      <Link
                        to="/faculty/verification"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <FileCheck className="w-4 h-4 text-slate-400" />
                        <span>Verify Contributions</span>
                      </Link>
                      <Link
                        to="/faculty/requests"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <span>Student Requests</span>
                      </Link>
                      <Link
                        to="/faculty/reports"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        <span>Reports & Analytics</span>
                      </Link>
                      <Link
                        to="/faculty/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Faculty Profile</span>
                      </Link>
                      <Link
                        to="/faculty/resources"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>All Academic Resources</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Institutional Info Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 text-white py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-200 shrink-0" />
            <span className="font-semibold text-indigo-100">Authenticated Faculty:</span>
            <span className="font-medium text-white">{displayName}</span>
            <span className="text-indigo-300 hidden md:inline">• {department}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Curricular Moderation & Governance Session</span>
          </div>
        </div>
      </div>

      {/* Main Container with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex py-6 gap-6">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-24 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-6">
            
            {/* Faculty Academic Profile Card */}
            <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</h4>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate font-medium">{department}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Institutional Faculty</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Faculty Governance
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/faculty/dashboard' && item.path !== '/faculty/resources' && location.pathname.startsWith(item.path)) ||
                  (item.path === '/faculty/resources' && location.pathname.startsWith('/faculty/resources/') && !location.pathname.startsWith('/faculty/resources/new'));
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={() => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25' 
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

            {/* Institutional Information Card */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                  <span>University Term</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">2024–2025</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                  <span>Role Authorization</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Institutional Faculty</span>
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
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    ARH
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Faculty Portal</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                <p className="font-bold text-xs text-slate-900 dark:text-white">{displayName}</p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400">{department}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Faculty Member</p>
              </div>

              <nav className="space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive: active }) => `
                        flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                        ${active 
                          ? 'bg-indigo-600 text-white' 
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
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Session</span>
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
