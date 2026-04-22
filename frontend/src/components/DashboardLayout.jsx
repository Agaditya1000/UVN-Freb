import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, MoreVertical, ChevronDown, User, LogOut, Settings, LayoutDashboard, Building2, Users, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../services/supabase';
import ThemeToggle from './ThemeToggle';

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEntity, setShowEntity] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const menuRef = useRef(null);
  const entityRef = useRef(null);

  const { user } = useAuth();
  const { theme } = useTheme();
  const { businesses, activeBusiness, setActiveBusinessId, userRole } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    try {
      setSigningOut(true);
      await supabase.auth.signOut();
      setShowConfirm(false);
      navigate('/');
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if there's an error, we should probably force navigate to clear local state
      navigate('/');
    } finally {
      setSigningOut(false);
    }
  };

  const handleEntityChange = (id) => {
    setActiveBusinessId(id);
    setShowEntity(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (entityRef.current && !entityRef.current.contains(e.target)) setShowEntity(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nav = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Accounts', path: '/dashboard/accounts' },
    { name: 'Transactions', path: '/dashboard/transactions' },
    { name: 'Reporting', path: '/dashboard/reports' },
    ...(userRole === 'Owner' ? [{ name: 'Business', path: '/dashboard/business', icon: <Settings size={18} /> }] : []),
  ];

  const isReportingActive =
    location.pathname.startsWith('/dashboard/reports') || location.pathname === '/dashboard/balance-sheet';

  return (
    <div className="bg-bg text-text min-h-screen transition-colors duration-300">
      
      {/* HEADERBAR */}
      <header className="flex items-center justify-between px-6 md:px-10 py-4 bg-surface border-b border-border sticky top-0 z-50 shadow-sm">
        
        <div className="flex items-center gap-6">
          <button onClick={() => setOpen(!open)} className="md:hidden text-text-secondary hover:text-text transition-colors">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-xl shadow-lg shadow-primary/30 font-bold italic tracking-tighter shrink-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/dashboard')}>
              UV
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm md:text-lg tracking-tight text-text leading-tight">UV Netware</span>
              <span className="text-primary font-black text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] uppercase -mt-0.5 sm:-mt-1">Utilities</span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-border mx-2 hidden md:block"></div>

          {/* BUSINESS UNIT SELECTOR - ONLY FOR OWNERS */}
          {userRole === 'Owner' && (
            <div className="hidden md:flex items-center gap-6 relative pl-6 border-l border-border" ref={entityRef}>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">Business Unit</span>
                <button
                  onClick={() => setShowEntity(!showEntity)}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-surface border border-border text-sm font-bold text-text hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all group relative overflow-hidden active:scale-95"
                >
                  <div className="p-1.5 bg-bg rounded-lg text-primary border border-border group-hover:bg-primary/10 transition-colors">
                    <Building2 size={16} />
                  </div>
                  <span className="max-w-[140px] truncate">{activeBusiness?.name || "Select Portfolio"}</span>
                  <ChevronDown size={14} className={`text-text-secondary transition-transform duration-300 ${showEntity ? 'rotate-180' : ''}`} />
                  
                  {/* Subtle highlight line */}
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </button>
              </div>

              {showEntity && (
                <div className="absolute top-full left-6 mt-3 w-72 bg-surface border border-border rounded-[2rem] p-3 z-50 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 mb-2">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Available Business Units</p>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                    {businesses.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleEntityChange(b.id)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                          activeBusiness?.id === b.id 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'text-text hover:bg-bg hover:translate-x-1'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${activeBusiness?.id === b.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                            {b.name[0].toUpperCase()}
                          </div>
                          <span className="truncate">{b.name}</span>
                        </div>
                        {activeBusiness?.id === b.id && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex justify-center">
                    <button 
                      onClick={() => { setShowEntity(false); navigate('/dashboard/business'); }}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Manage Business Units
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CENTER NAV (DESKTOP) */}
        <nav className="hidden xl:flex items-center gap-1 bg-bg border border-border p-1 rounded-2xl">
          {nav.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => {
                const active =
                  item.path === '/dashboard/reports'
                    ? isReportingActive
                    : isActive;
                return `px-5 py-2 text-sm font-semibold rounded-xl transition-all
                ${active
                  ? 'bg-surface text-primary shadow-sm border border-border ring-1 ring-border'
                  : 'text-text-secondary hover:text-text hover:bg-surface/50'}`;
              }}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4 relative" ref={menuRef}>
          <div className="scale-90">
            <ThemeToggle />
          </div>

          <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block"></div>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-bg transition-colors border border-transparent hover:border-border group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
              {user?.email?.[0].toUpperCase()}
            </div>
            <p className="hidden md:block text-xs font-semibold text-text-secondary group-hover:text-text transition-colors">
              {user?.email?.split('@')[0]}
            </p>
            <ChevronDown size={14} className="text-text-secondary group-hover:text-text transition-colors" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-14 w-56 bg-surface border border-border rounded-xl shadow-2xl z-50 p-1.5 animate-in zoom-in-95 duration-200">
              <div className="px-3 py-3 border-b border-border mb-1">
                <p className="text-xs font-bold text-text truncate">{user?.email}</p>
                <p className="text-[10px] text-text-secondary font-medium">Session ID: {user?.id?.slice(0,8)}</p>
              </div>
              
              {userRole === 'Owner' && (
                <>
                <button 
                  onClick={() => { setShowMenu(false); navigate('/dashboard/assigned'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-bg rounded-lg transition-colors"
                >
                  <Users size={16} /> Team Management
                </button>
                <button 
                  onClick={() => { setShowMenu(false); navigate('/dashboard/audit-log'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-bg rounded-lg transition-colors"
                >
                  <History size={16} /> Audit Log
                </button>
                </>
              )}

              <button 
                onClick={() => { setShowMenu(false); navigate('/dashboard/profile'); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-bg rounded-lg transition-colors"
              >
                <User size={16} /> Profile
              </button>
              <button 
                onClick={() => { setShowMenu(false); setShowConfirm(true); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1 font-medium"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[100] bg-surface/95 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col p-8 pt-20">
          <button onClick={() => setOpen(false)} className="absolute top-6 right-8 text-text-secondary">
             <Menu size={32} />
          </button>
          
          <div className="space-y-6">
            {userRole === 'Owner' && (
              <>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border pb-2">Business Units</p>
                <div className="space-y-2">
                  {businesses.map(b => (
                    <button
                      key={b.id}
                      onClick={() => { handleEntityChange(b.id); setOpen(false); }}
                      className={`w-full text-left px-5 py-3 rounded-2xl font-bold transition-all
                        ${activeBusiness?.id === b.id ? 'bg-primary text-white shadow-lg' : 'bg-bg text-text'}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border pb-2 mt-8">Navigation</p>
            <div className="grid grid-cols-1 gap-3">
              {nav.map(item => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) => {
                    const active =
                      item.path === '/dashboard/reports'
                        ? isReportingActive
                        : isActive;
                    return `flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all
                    ${active ? 'bg-primary/10 text-primary' : 'bg-bg text-text-secondary'}`;
                  }}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-border flex justify-between items-center">
            <ThemeToggle />
            <button onClick={() => setShowConfirm(true)} className="flex items-center gap-2 text-red-500 font-bold text-sm">
               <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-[90%] max-w-sm p-8 bg-surface rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <LogOut size={28} />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">End Session?</h2>
            <p className="text-sm text-text-secondary mb-8">
              Are you sure you want to sign out of the accounting utilities suite?
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-3 text-sm font-bold rounded-xl border border-border text-text-secondary hover:bg-bg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                disabled={signingOut}
                className="px-6 py-3 text-sm font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {signingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing Out...
                  </>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="p-6 md:p-12 xl:p-16 max-w-screen-2xl mx-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;
