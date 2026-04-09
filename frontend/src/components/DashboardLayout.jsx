import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, BookText, FileSpreadsheet, FileBarChart2, Menu, X, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabase';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const menuRef = useRef();

  const { user, role } = useAuth();
  const { businesses, activeBusiness, setActiveBusinessId } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Chart of Accounts', path: '/dashboard/accounts', icon: <BookText size={20} /> },
    { name: 'Transactions', path: '/dashboard/transactions', icon: <FileSpreadsheet size={20} /> },
    { name: 'Balance Sheet', path: '/dashboard/balance-sheet', icon: <FileBarChart2 size={20} /> },
    { name: 'Business Profile', path: '/dashboard/business', icon: <Building2 size={20} />, roles: ['Owner'] },
  ];

  const filteredNavItems = navItems.filter(item =>
    !item.roles || item.roles.includes(role)
  );

  return (
    <div className="flex h-screen bg-black text-white font-roboto overflow-hidden">

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🔥 SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-naviBlue border-r border-borderDark transform transition-all duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-borderDark bg-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-black font-bold shadow-lg">
              UV
            </div>
            <div className="leading-tight">
              <p className="text-success text-xs uppercase tracking-widest">UV Netware</p>
              <p className="text-white text-[11px] opacity-70">Accounting Suite</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <div className="p-4 space-y-2">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-accent/20 to-transparent border-l-4 border-accent text-success shadow-inner'
                  : 'hover:bg-borderDark text-lightWhite hover:pl-5'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-screen">

        {/* 🔥 HEADER */}
        <header className="h-16 flex items-center justify-between px-6 bg-naviBlue border-b border-borderDark">

          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
              <Menu size={24} />
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-black px-3 py-1.5 rounded-md border border-borderDark">
              <span className="text-xs text-grayText">Entity</span>
              <select
                value={activeBusiness?.id || ''}
                onChange={(e) => setActiveBusinessId(e.target.value)}
                className="bg-transparent text-white text-sm outline-none"
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4 relative" ref={menuRef}>
            <div className="hidden sm:block text-xs text-grayText">
              {user?.email}
            </div>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-borderDark transition"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-36 bg-black border border-borderDark rounded-lg shadow-xl">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowConfirm(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-borderDark"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* LOGOUT MODAL */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-[#000021] border border-borderDark p-6 rounded w-80 text-center">
              <h3 className="text-white mb-4">Are you sure?</h3>
              <div className="flex justify-center gap-4">
                <button onClick={handleLogout} className="border px-4 py-1 rounded hover:bg-white hover:text-black">
                  Yes
                </button>
                <button onClick={() => setShowConfirm(false)} className="border px-4 py-1 rounded">
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;