import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import { buildGstSummary, defaultPeriodDates } from '../../../utils/reporting';
import { buildGstr1Draft } from '../../../utils/gstrExport';
import { ReceiptIndianRupee, Download } from 'lucide-react';

const GstReport = () => {
  const { activeBusiness, transactions, loading } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = defaultPeriodDates();

  const from = searchParams.get('from') || defaults.from;
  const to = searchParams.get('to') || defaults.to;

  const summary = useMemo(() => buildGstSummary(transactions || [], from, to), [transactions, from, to]);

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

  if (activeBusiness.country !== 'India') {
    return (
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-bg border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Available for India workspaces
        </div>
        <h2 className="text-xl font-bold text-text">GST summary</h2>
        <p className="text-sm text-text-secondary font-medium leading-relaxed">
          This report is enabled when your organization’s country is set to India and transactions include GST metadata.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-primary mb-2">
          <ReceiptIndianRupee size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Compliance</span>
        </div>
        <h2 className="text-xl font-bold text-text">GST summary</h2>
        <p className="text-sm text-text-secondary mt-1 font-medium leading-relaxed">
          Aggregates GST captured on journal entries for the selected period. This is an operational summary and is not a
          filed return.
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
        <div className="flex flex-col justify-end gap-1">
          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider"
            onClick={() => {
              const draft = buildGstr1Draft(transactions || [], from, to);
              const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `gstr1-style-draft-${from}-to-${to}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download size={16} />
            GSTR-1 style JSON
          </button>
          <span className="text-[10px] text-text-secondary font-medium max-w-xs">
            Internal draft from sale lines with GST metadata — not a fileable return.
          </span>
        </div>
      </div>

      {loading && <p className="text-sm text-text-secondary">Loading…</p>}

      {!loading && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-xs uppercase tracking-wider text-text-secondary">
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold text-right">Rate</th>
                <th className="p-4 font-bold text-right">Taxable base</th>
                <th className="p-4 font-bold text-right">Tax</th>
                <th className="p-4 font-bold text-right">Entries</th>
              </tr>
            </thead>
            <tbody>
              {summary.rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    No GST-tagged entries found for this period.
                  </td>
                </tr>
              ) : (
                summary.rows.map((r) => (
                  <tr key={`${r.type}-${r.rate}`} className="border-b border-border/80 hover:bg-bg/80">
                    <td className="p-4 font-medium text-text">{r.type}</td>
                    <td className="p-4 text-right font-mono tabular-nums">{r.rate}%</td>
                    <td className="p-4 text-right font-mono tabular-nums">
                      {r.base.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right font-mono tabular-nums">
                      {r.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right font-mono tabular-nums">{r.count}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-primary/10 font-bold text-text">
                <td className="p-4" colSpan={2}>
                  Totals
                </td>
                <td className="p-4 text-right font-mono tabular-nums">
                  {summary.totalBase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-right font-mono tabular-nums">
                  {summary.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-right font-mono tabular-nums">{summary.txCount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default GstReport;

