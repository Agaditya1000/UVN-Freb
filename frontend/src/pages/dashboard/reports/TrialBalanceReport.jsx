import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import { filterTransactionsByRange, buildTrialBalance, defaultPeriodDates } from '../../../utils/reporting';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const TrialBalanceReport = () => {
  const { activeBusiness, accounts, transactions, loading } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = defaultPeriodDates();

  const from = searchParams.get('from') || defaults.from;
  const to = searchParams.get('to') || defaults.to;

  const result = useMemo(() => {
    if (!accounts.length) return null;
    const slice = filterTransactionsByRange(transactions || [], from, to);
    return buildTrialBalance(accounts, slice);
  }, [accounts, transactions, from, to]);

  const setRange = (nextFrom, nextTo) => {
    const p = new URLSearchParams(searchParams);
    p.set('from', nextFrom);
    p.set('to', nextTo);
    setSearchParams(p, { replace: true });
  };

  if (!activeBusiness) {
    return (
      <p className="text-text-secondary text-sm font-medium">
        Select a business unit to generate financial reports.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text">Trial balance</h2>
        <p className="text-sm text-text-secondary mt-1 font-medium leading-relaxed">
          Lists debit and credit totals by account for the selected period. In a balanced ledger, aggregate debits equal
          aggregate credits.
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

      {loading && <p className="text-sm text-text-secondary">Loading ledger…</p>}

      {!loading && result && (
        <>
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold ${
              result.balanced
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {result.balanced ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {result.balanced ? (
              <span>Debit and credit totals are in balance for this period.</span>
            ) : (
              <span>
                Out of balance by {result.delta.toFixed(2)}. Review journal entries in this period for missing lines or
                amounts that do not balance.
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-xs uppercase tracking-wider text-text-secondary">
                  <th className="p-4 font-bold">Code</th>
                  <th className="p-4 font-bold">Account</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold text-right">Debit</th>
                  <th className="p-4 font-bold text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/80 hover:bg-bg/80">
                    <td className="p-4 font-mono text-text-secondary">{r.id}</td>
                    <td className="p-4 font-medium text-text">{r.name}</td>
                    <td className="p-4 text-text-secondary">{r.category}</td>
                    <td className="p-4 text-right font-mono tabular-nums">
                      {r.debit ? r.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className="p-4 text-right font-mono tabular-nums">
                      {r.credit ? r.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-primary/10 font-bold text-text">
                  <td colSpan={3} className="p-4">
                    Totals
                  </td>
                  <td className="p-4 text-right font-mono tabular-nums">
                    {result.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right font-mono tabular-nums">
                    {result.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TrialBalanceReport;
