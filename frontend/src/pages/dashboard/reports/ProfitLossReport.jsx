import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import { filterTransactionsByRange, buildProfitAndLoss, defaultPeriodDates } from '../../../utils/reporting';

const ProfitLossReport = () => {
  const { activeBusiness, accounts, transactions, loading } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = defaultPeriodDates();
  const from = searchParams.get('from') || defaults.from;
  const to = searchParams.get('to') || defaults.to;

  const pl = useMemo(() => {
    if (!accounts.length) return null;
    const slice = filterTransactionsByRange(transactions || [], from, to);
    return buildProfitAndLoss(accounts, slice);
  }, [accounts, transactions, from, to]);

  const setRange = (nextFrom, nextTo) => {
    const p = new URLSearchParams(searchParams);
    p.set('from', nextFrom);
    p.set('to', nextTo);
    setSearchParams(p, { replace: true });
  };

  const symbol =
    activeBusiness?.currency === 'USD' ? '$' : activeBusiness?.currency === 'EUR' ? '€' : '₹';

  if (!activeBusiness) {
    return (
      <p className="text-text-secondary text-sm font-medium">
        Select a business unit to generate financial reports.
      </p>
    );
  }

  const LineBlock = ({ title, lines, tone }) => (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">{title}</h3>
      <div className="rounded-xl border border-border divide-y divide-border bg-surface overflow-hidden">
        {lines.length === 0 ? (
          <div className="p-4 text-sm text-text-secondary">No accounts in this section.</div>
        ) : (
          lines.map((a) => (
            <div key={a.id} className="flex justify-between items-center px-4 py-3 text-sm">
              <span className="font-medium text-text">
                <span className="font-mono text-text-secondary mr-2">{a.id}</span>
                {a.name}
              </span>
              <span className={`font-mono tabular-nums font-semibold ${tone}`}>
                {symbol}
                {Math.abs(a.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text">Profit & loss</h2>
        <p className="text-sm text-text-secondary mt-1 font-medium leading-relaxed">
          Income statement for the selected period: revenue, expenses, and net income on an accrual basis from recorded
          activity.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 p-4 rounded-2xl border border-border bg-bg">
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setRange(e.target.value, to)}
            className="input-field w-auto min-w-[10rem]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setRange(from, e.target.value)}
            className="input-field w-auto min-w-[10rem]"
          />
        </div>
      </div>

      {loading && <p className="text-sm text-text-secondary">Loading…</p>}

      {!loading && pl && (
        <>
          <LineBlock title="Revenue" lines={pl.revenueLines} tone="text-emerald-600" />
          <LineBlock title="Expenses" lines={pl.expenseLines} tone="text-red-600" />

          <div className="flex justify-between items-center p-6 rounded-2xl border-2 border-primary bg-primary/5">
            <span className="text-sm font-bold text-text uppercase tracking-wide">Net income</span>
            <span
              className={`text-2xl font-black font-mono tabular-nums ${
                pl.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {symbol}
              {Math.abs(pl.netIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitLossReport;
