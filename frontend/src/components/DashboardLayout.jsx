import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Menu, MoreVertical, Sun, Moon, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabase';

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEntity, setShowEntity] = useState(false);

  const menuRef = useRef(null);
  const entityRef = useRef(null);

  const { user } = useAuth();
  const { businesses, activeBusiness, setActiveBusinessId } = useApp();
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
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
    { name: 'Home', path: '/dashboard' },
    { name: 'Accounts', path: '/dashboard/accounts' },
    { name: 'Transactions', path: '/dashboard/transactions' },
    { name: 'Reports', path: '/dashboard/balance-sheet' },
    { name: 'Business', path: '/dashboard/business' },
  ];

  const isDark = dark;

  return (
    <div className={`${isDark ? 'bg-black text-white' : 'bg-[#f8f8f8] text-black'} min-h-screen`}>

      <header className={`flex items-center justify-between px-4 md:px-8 py-3 border-b 
        ${isDark ? 'border-[#555]' : 'border-[#e5e5e5] bg-white'} relative z-10`}>

        <div className="flex items-center gap-4">
          <button onClick={() => setOpen(!open)} className="md:hidden">
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white text-black flex items-center justify-center rounded-lg font-bold">
              UV
            </div>
            <p className="text-sm font-medium">UVN Utility B</p>
          </div>

          <div className="hidden md:flex items-center gap-2 relative" ref={entityRef}>
            <span className={`${isDark ? 'text-[#757575]' : 'text-[#555]'}`}>Entity</span>

            <button
              onClick={() => setShowEntity(!showEntity)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm border
                ${isDark ? 'border-[#555] hover:bg-[#111]' : 'border-[#ddd] hover:bg-[#f2f2f2]'}`}
            >
              {activeBusiness?.name || "Select"}
              <ChevronDown size={14} />
            </button>

            {showEntity && (
              <div className={`absolute top-10 w-48 rounded-lg z-[999]
                ${isDark
                  ? 'bg-black border border-[#555]'
                  : 'bg-white border border-[#e5e5e5] shadow-lg'}`}>

                {businesses.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleEntityChange(b.id)}
                    className={`w-full text-left px-3 py-2 text-sm
                      ${activeBusiness?.id === b.id
                        ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                        : isDark ? 'hover:bg-[#111] text-[#757575]' : 'hover:bg-[#f5f5f5] text-[#555]'}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`hidden md:flex gap-2 rounded-full px-2 py-1 border
          ${isDark ? 'bg-[#111] border-[#555]' : 'bg-white border-[#e5e5e5]'}`}>
          {nav.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `px-4 py-1.5 text-sm rounded-full
                ${isActive
                  ? isDark
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : isDark
                    ? 'text-[#757575] hover:text-white'
                    : 'text-[#555] hover:text-black'}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3 relative" ref={menuRef}>
          <div
            onClick={() => setDark(!dark)}
            className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
          >
            <div className="toggle-circle">
              {isDark ? <Moon size={12} /> : <Sun size={12} />}
            </div>
          </div>

          <p className="hidden md:block text-xs">{user?.email}</p>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 border rounded-full"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 w-36 bg-white text-black border rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowConfirm(true);
                }}
                className={`w-full px-4 py-2 text-sm text-left rounded-md
                  ${isDark
                    ? 'bg-black text-white'
                    : 'bg-white text-black'}`}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {open && (
        <div className="md:hidden px-4 py-4 space-y-4">
          <div className="relative" ref={entityRef}>
            <p className="text-xs text-[#757575] mb-1">Entity</p>

            <button
              onClick={() => setShowEntity(!showEntity)}
              className="w-full flex items-center justify-between border border-[#555] px-3 py-2 rounded-md text-sm"
            >
              {activeBusiness?.name || "Select"}
              <ChevronDown size={16} />
            </button>

            {showEntity && (
              <div className="mt-2 bg-black border border-[#555] rounded-lg">
                {businesses.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      handleEntityChange(b.id);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#111]"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {nav.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className="block text-sm text-[#757575] hover:text-white"
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {showConfirm && (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center 
          ${isDark ? 'bg-black/70' : 'bg-black/40'} backdrop-blur-sm`}>

          <div className={`w-[90%] max-w-sm p-6 rounded-2xl shadow-2xl transition-all
            ${isDark ? 'bg-[#111] text-white border border-[#333]' : 'bg-white text-black'}`}>

            <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-[#aaa]' : 'text-gray-600'}`}>
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className={`px-4 py-2 text-sm rounded-lg border transition
                  ${isDark
                    ? 'border-[#444] hover:bg-[#222]'
                    : 'border-gray-300 hover:bg-gray-100'}`}
              >
                Cancel
              </button>

              <button
                onClick={logout}
                className={`px-4 py-2 text-sm rounded-lg transition font-medium
                  ${isDark
                    ? 'bg-white text-black hover:opacity-90'
                    : 'bg-black text-white hover:opacity-90'}`}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="p-4 md:p-8">
        <Outlet />
      </main>

    </div>
  );
};

export default DashboardLayout;