import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { FileBarChart, Scale, TrendingUp, BookOpen, ArrowRightLeft, Landmark } from 'lucide-react';
import Footer from '../../../components/Footer';

const links = [
  { to: '/dashboard/reports', end: true, label: 'Overview', icon: FileBarChart },
  { to: '/dashboard/reports/trial-balance', end: false, label: 'Trial balance', icon: Scale },
  { to: '/dashboard/reports/profit-loss', end: false, label: 'Profit & loss', icon: TrendingUp },
  { to: '/dashboard/reports/general-ledger', end: false, label: 'General ledger', icon: BookOpen },
  { to: '/dashboard/reports/balance-sheet', end: false, label: 'Balance sheet', icon: Landmark },
  { to: '/dashboard/reports/cash-flow', end: false, label: 'Cash flow', icon: ArrowRightLeft },
];

const ReportsLayout = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      <div className="flex-1 space-y-8">
        <div className="border-b border-border pb-6">
          <h1 className="text-3xl font-bold text-text tracking-tight">Financial reporting</h1>
          <p className="text-sm text-text-secondary mt-2 max-w-xl font-medium leading-relaxed">
            Set period or as-of on each report before export. Balance sheet here accepts an optional as-of the same view is
            available{' '}
            <Link
              to="/dashboard/balance-sheet"
              className="text-primary font-semibold hover:underline underline-offset-2"
            >
              standalone
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <nav className="lg:w-56 shrink-0 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border
                  ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 border-primary'
                      : 'text-text-secondary hover:bg-bg hover:text-text border-transparent hover:border-border'
                  }`
                }
              >
                <Icon size={18} className="shrink-0 opacity-90" />
                {link.label}
              </NavLink>
              );
            })}
          </nav>

          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default ReportsLayout;
