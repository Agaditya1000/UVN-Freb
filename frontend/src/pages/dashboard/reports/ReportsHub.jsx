import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, TrendingUp, BookOpen, Landmark, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { defaultPeriodDates, todayISODate } from '../../../utils/reporting';

const ReportsHub = () => {
  const { from, to } = defaultPeriodDates();
  const asOf = todayISODate();

  const cards = [
    {
      title: 'Trial balance',
      desc: 'List of accounts with debit and credit totals for a period. Total debits must equal total credits.',
      to: `/dashboard/reports/trial-balance?from=${from}&to=${to}`,
      icon: Scale,
    },
    {
      title: 'Trading Account',
      desc: 'Summary of direct revenue and cost of goods sold. Calculates Gross Profit before indirect expenses.',
      to: `/dashboard/reports/trading-account?from=${from}&to=${to}`,
      icon: TrendingUp,
    },
    {
      title: 'Profit & loss',
      desc: 'Income statement: revenue and expenses for a period, with net income.',
      to: `/dashboard/reports/profit-loss?from=${from}&to=${to}`,
      icon: TrendingUp,
    },
    {
      title: 'General ledger',
      desc: 'Detailed activity for a single account, in date order, with a running balance.',
      to: '/dashboard/reports/general-ledger',
      icon: BookOpen,
    },
    {
      title: 'Balance sheet',
      desc: 'Statement of financial position: assets, liabilities, and equity at a selected date.',
      to: `/dashboard/reports/balance-sheet?asOf=${asOf}`,
      icon: Landmark,
    },
    {
      title: 'Cash flow',
      desc: 'Statement of cash flows — available in a future release.',
      to: '/dashboard/reports/cash-flow',
      icon: ArrowRightLeft,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary font-medium leading-relaxed">
        Select a report below. Shortcuts open with the current month as the default period, or today’s date for the balance
        sheet as-of view. Adjust dates on each report before exporting.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ title, desc, to, icon: Icon }) => (
          <Link
            key={title}
            to={to}
            className="group flex flex-col p-6 rounded-2xl border border-border bg-surface hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all text-left"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Icon size={22} />
              </div>
              <ArrowRight
                size={18}
                className="text-text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-transform shrink-0 mt-1"
              />
            </div>
            <h2 className="text-lg font-bold text-text mb-1">{title}</h2>
            <p className="text-sm text-text-secondary font-medium leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ReportsHub;
