import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, BookText, FileSpreadsheet, FileBarChart2, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabase';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { businesses, activeBusiness, setActiveBusinessId } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Chart of Accounts', path: '/dashboard/accounts', icon: <BookText size={20} /> },
    { name: 'Transactions', path: '/dashboard/transactions', icon: <FileSpreadsheet size={20} /> },
    { name: 'Reports', path: '/dashboard/reports', icon: <FileBarChart2 size={20} /> },
    { name: 'Business Profile', path: '/dashboard/business', icon: <Building2 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-black text-white font-roboto overflow-hidden">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-naviBlue border-r-[1.75px] border-borderDark transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b-[1.75px] border-borderDark bg-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-medium text-sm">UV</div>
            <span className="font-medium tracking-heading text-lg">UVN <span className="text-success">SaaS</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-grayText hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="mb-6">
            <div className="text-xs text-grayText tracking-heading uppercase mb-3 px-2">Navigation</div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded hover:bg-borderDark transition-colors font-light text-sm ${
                      isActive ? 'bg-borderDark/40 text-success border-l-2 border-success' : 'text-lightWhite'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-naviBlue border-b-[1.75px] border-borderDark shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-lightWhite hover:text-white">
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-grayText font-light">Active Entity:</span>
              <select 
                value={activeBusiness?.id || ''}
                onChange={(e) => setActiveBusinessId(e.target.value)}
                className="bg-black border-[1.75px] border-borderDark px-3 py-1.5 text-sm outline-none focus:border-accent text-white"
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.country})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-grayText hidden sm:block tracking-heading">{user?.email}</div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-error hover:text-white transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
