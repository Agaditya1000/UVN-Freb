import React from 'react';
import { useSearchParams } from 'react-router-dom';
import BalanceSheet from '../BalanceSheet';

/** Balance sheet under Financial reporting: optional as-of date via query string. */
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
            Report date (as of)
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
          Clear date — cumulative balances
        </button>
      </div>
      {!asOf && (
        <p className="text-xs text-text-secondary font-medium leading-relaxed">
          No report date selected: amounts reflect all activity currently loaded for this business (same basis as the
          standalone balance sheet view).
        </p>
      )}
      <BalanceSheet />
    </div>
  );
};

export default ReportBalanceSheetShell;
