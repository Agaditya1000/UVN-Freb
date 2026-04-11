import React from 'react';
import { useSearchParams } from 'react-router-dom';
import BalanceSheet from '../BalanceSheet';

/**
 * Reporting entry for balance sheet: same component as /dashboard/balance-sheet
 * with an explicit as-of control synced to ?asOf=
 */
const ReportBalanceSheetShell = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const asOf = searchParams.get('asOf') ?? '';

  const onChangeAsOf = (value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set('asOf', value);
    else p.delete('asOf');
    setSearchParams(p, { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 p-4 rounded-2xl border border-border bg-bg">
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            As of (optional cutoff)
          </label>
          <input
            type="date"
            value={asOf}
            onChange={(e) => onChangeAsOf(e.target.value)}
            className="input-field w-auto min-w-[10rem]"
          />
        </div>
        <button
          type="button"
          onClick={() => onChangeAsOf('')}
          className="text-sm font-semibold text-primary hover:underline mb-2"
        >
          Clear — use all loaded activity
        </button>
      </div>
      {!asOf && (
        <p className="text-xs text-text-secondary font-medium">
          No cutoff: balances match the main dashboard balance sheet (all transactions in context).
        </p>
      )}
      <BalanceSheet />
    </div>
  );
};

export default ReportBalanceSheetShell;
