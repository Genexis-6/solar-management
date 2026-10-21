import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Sun,
  Wrench,
  Bell,
  Mail,
  ShieldCheck,
  LogOut,
  Search,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [remindersCount, setRemindersCount] = useState(0);
  const [tick, setTick] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const f = () => setTick((t) => t + 1);
    window.addEventListener('notes', f);
    return () => window.removeEventListener('notes', f);
  }, []);

  useEffect(() => {
    api.get('/notifications')
      .then((d) => setUnread(d.unread || 0))
      .catch(() => {});
    api.get('/reminders?days=7')
      .then((d) => setRemindersCount((d && d.length) || 0))
      .catch(() => {});
  }, [pathname, tick]);

  // Close mobile drawer on route navigation and scroll to top smoothly
  useEffect(() => {
    setMobileMenuOpen(false);
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate('/customers?q=' + encodeURIComponent(searchVal.trim()));
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/installations', label: 'Installations', icon: Sun },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unread > 0 ? unread : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      to: '/mailing',
      label: 'Mailing Center',
      icon: Mail,
      badge: remindersCount > 0 ? remindersCount : null,
      badgeColor: 'bg-amber-400 text-zinc-900',
    },
    { to: '/users', label: 'Team & Roles', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAFAFA] text-zinc-900 relative">
      {/* Subtle organic pattern */}
      <div className="inspo-bg-pattern" />

      {/* Mobile Top App Bar (visible on md:hidden) */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-xl text-zinc-700 hover:bg-zinc-100 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              <span>S</span>
              <span className="text-amber-400">.</span>
            </div>
            <span className="font-extrabold text-base tracking-tight text-zinc-900">
              SolarGuard
            </span>
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          {unread > 0 && (
            <NavLink to="/notifications" className="relative p-2 text-zinc-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </NavLink>
          )}

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 to-rose-200 p-0.5 shadow-2xs">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-zinc-800">
              {user?.name ? user.name[0] : 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full z-10 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                    <span>S</span>
                    <span className="text-amber-400">.</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 leading-none">
                      SolarGuard
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-semibold">
                      Operations & Maintenance
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Links */}
              <nav className="space-y-1.5 mt-5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-zinc-900 text-white shadow-sm'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom Profile & Logout */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-200 to-rose-200 text-zinc-800 flex items-center justify-center font-extrabold text-sm shadow-inner shrink-0">
                  {user?.name?.slice(0, 2).toUpperCase() || 'SO'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-zinc-900 truncate">{user?.name}</p>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 uppercase tracking-wider border ${
                      user?.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : user?.role === 'technician'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-sky-100 text-sky-800 border-sky-200'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-rose-50 text-zinc-700 hover:text-rose-700 font-bold text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Left Dock Sidebar */}
      <aside className="hidden md:flex w-20 lg:w-24 bg-[#FAFAFA] border-r border-gray-100 flex-col items-center justify-between py-6 shrink-0 h-screen sticky top-0 z-30">
        {/* Brand Logo */}
        <NavLink
          to="/dashboard"
          className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-extrabold text-xl tracking-tight shadow-md hover:scale-105 transition-transform"
          title="SolarGuard Operations"
        >
          <div className="flex items-center">
            <span>S</span>
            <span className="text-amber-400 text-base leading-none">.</span>
          </div>
        </NavLink>

        {/* Nav Icons */}
        <nav className="flex flex-col items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  `relative p-3.5 rounded-2xl transition-all group flex items-center justify-center ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-xs ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="flex flex-col items-center gap-2.5">
          <button
            onClick={logout}
            title="Log out"
            className="p-3 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-200 to-rose-200 text-zinc-800 flex items-center justify-center font-bold text-xs shadow-inner cursor-pointer"
            title={`${user?.name} (${user?.role})`}
          >
            {user?.name?.slice(0, 2).toUpperCase() || 'SO'}
          </div>
        </div>
      </aside>

      {/* Main Full-Width Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-white">
        {/* Top Header Bar (Full width across screen) */}
        <header className="px-6 sm:px-10 py-5 border-b border-gray-100/80 bg-white/90 backdrop-blur-md sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                Welcome back
              </h1>
              <span className="text-2xl sm:text-3xl animate-pulse">👋</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5">
              <span>Solar Operations</span>
              <span>•</span>
              <span className="capitalize text-zinc-700 font-semibold">{user?.role}</span>
              <span>•</span>
              <span className="font-semibold text-zinc-600">{user?.name}</span>
            </p>
          </div>

          {/* Right Header: Search pill and User Avatar badge */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customer, location..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="pl-11 pr-5 py-2.5 rounded-full bg-[#F4F5F7] text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900/10 border border-transparent transition-all w-56 sm:w-72"
              />
            </form>

            <div className="hidden sm:flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-900 leading-tight">{user?.name}</p>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 uppercase tracking-wider border ${
                    user?.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : user?.role === 'technician'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-sky-100 text-sky-800 border-sky-200'
                  }`}
                >
                  {user?.role}
                </span>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-200 via-rose-200 to-amber-200 p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-zinc-800">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content (Smooth Scrolling, Full Width) */}
        <main ref={mainRef} className="flex-1 px-6 sm:px-10 py-7 overflow-y-auto scroll-smooth">
          <div key={pathname} className="comp-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

