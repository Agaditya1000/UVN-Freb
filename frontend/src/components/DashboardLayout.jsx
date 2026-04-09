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
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-naviBlue border-r-[1.75px] border-borderDark transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b-[1.75px] border-borderDark bg-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-medium text-sm">UV</div>
            <span className="font-medium tracking-heading text-sm text-success uppercase leading-tight">UV Netware <br/><span className="text-white">Accounting Utilities</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-grayText hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded hover:bg-borderDark text-sm ${isActive ? 'bg-borderDark/40 text-success border-l-2 border-success' : 'text-lightWhite'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-naviBlue border-b-[1.75px] border-borderDark">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-lightWhite">
              <Menu size={24} />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-grayText">Active Entity:</span>
              <select
                value={activeBusiness?.id || ''}
                onChange={(e) => setActiveBusinessId(e.target.value)}
                className="bg-black border-[1.75px] border-borderDark px-3 py-1.5 text-sm text-white"
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative flex items-center gap-4" ref={menuRef}>
            <span className="text-sm text-grayText hidden sm:block">{user?.email}</span>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="hover:text-white"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-32 bg-black border-[1.75px] border-borderDark rounded animate-dropdown">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowConfirm(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-error hover:bg-borderDark"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-[#000021] border-[1.75px] border-borderDark p-6 rounded w-80 text-center animate-dropdown">
              <h3 className="text-white mb-4">Are you sure?</h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLogout}
                  className="border-2 border-white px-4 py-1 rounded-[145px] hover:bg-white hover:text-black"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="border-2 border-white px-4 py-1 rounded-[145px]"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;