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
      desc: 'Debit and credit totals by account for a period. Debits should equal credits.',
      to: `/dashboard/reports/trial-balance?from=${from}&to=${to}`,
      icon: Scale,
    },
    {
      title: 'Profit & loss',
      desc: 'Revenue and expense activity for a period and net income.',
      to: `/dashboard/reports/profit-loss?from=${from}&to=${to}`,
      icon: TrendingUp,
    },
    {
      title: 'General ledger',
      desc: 'Chronological lines for one account with a running balance.',
      to: '/dashboard/reports/general-ledger',
      icon: BookOpen,
    },
    {
      title: 'Balance sheet',
      desc: 'Statement of financial position with optional as-of cutoff.',
      to: `/dashboard/reports/balance-sheet?asOf=${asOf}`,
      icon: Landmark,
    },
    {
      title: 'Cash flow',
      desc: 'Indirect cash flow statement (coming next; requires stable P&L and BS).',
      to: '/dashboard/reports/cash-flow',
      icon: ArrowRightLeft,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary font-medium">
        Choose a report. Default links use the current calendar month or today’s date where relevant.
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
