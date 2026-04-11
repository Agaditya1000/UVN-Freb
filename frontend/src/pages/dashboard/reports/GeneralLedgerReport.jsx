import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import { filterTransactionsByRange, buildGeneralLedger, defaultPeriodDates } from '../../../utils/reporting';

const GeneralLedgerReport = () => {
  const { activeBusiness, accounts, transactions, loading } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = defaultPeriodDates();

  const accountId = searchParams.get('account') || '';
  const from = searchParams.get('from') || defaults.from;
  const to = searchParams.get('to') || defaults.to;

  const selected = accounts.find((a) => a.id === accountId) || null;

  const lines = useMemo(() => {
    if (!selected || !transactions?.length) return [];
    const slice = filterTransactionsByRange(transactions, from, to);
    return buildGeneralLedger(selected, slice);
  }, [selected, transactions, from, to]);

  const updateParams = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
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
        <h2 className="text-xl font-bold text-text">General ledger</h2>
        <p className="text-sm text-text-secondary mt-1 font-medium leading-relaxed">
          Chronological detail for a single account within the selected period, including a running balance after each
          entry.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4 rounded-2xl border border-border bg-bg">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Account</label>
          <select
            value={accountId}
            onChange={(e) => updateParams('account', e.target.value)}
            className="input-field w-full"
          >
            <option value="">Select account…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} — {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => updateParams('from', e.target.value)}
            className="input-field w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => updateParams('to', e.target.value)}
            className="input-field w-full"
          />
        </div>
      </div>

      {loading && <p className="text-sm text-text-secondary">Loading…</p>}

      {!loading && !selected && (
        <p className="text-sm text-text-secondary font-medium">Choose an account to display the ledger.</p>
      )}

      {!loading && selected && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Description</th>
                <th className="p-4 font-bold text-right">Debit</th>
                <th className="p-4 font-bold text-right">Credit</th>
                <th className="p-4 font-bold text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    No activity in this period.
                  </td>
                </tr>
              ) : (
                lines.map((row) => (
                  <tr key={row.id} className="border-b border-border/80 hover:bg-bg/80">
                    <td className="p-4 font-mono text-text-secondary whitespace-nowrap">{row.date}</td>
                    <td className="p-4 text-text">{row.description}</td>
                    <td className="p-4 text-right font-mono tabular-nums">
                      {row.debit ? row.debit.toFixed(2) : '—'}
                    </td>
                    <td className="p-4 text-right font-mono tabular-nums">
                      {row.credit ? row.credit.toFixed(2) : '—'}
                    </td>
                    <td className="p-4 text-right font-mono font-semibold tabular-nums text-text">
                      {row.balance.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GeneralLedgerReport;
