import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

const CashFlowReport = () => {
  return (
    <div className="max-w-xl space-y-4">
      <div className="p-4 rounded-xl bg-primary/10 text-primary w-fit">
        <ArrowRightLeft size={28} />
      </div>
      <h2 className="text-xl font-bold text-text">Cash flow statement</h2>
      <p className="text-sm text-text-secondary font-medium leading-relaxed">
        A production cash flow report is usually built after the trial balance, profit &amp; loss, and balance sheet are
        locked to posted journals. The next implementation step is an <strong className="text-text">indirect method</strong>{' '}
        reconciliation (changes in working capital + net income) or <strong className="text-text">direct method</strong> from
        cash accounts.
      </p>
      <p className="text-xs text-text-secondary font-medium border border-border rounded-xl p-4 bg-bg">
        Tip: use <strong className="text-text">Trial balance</strong> and <strong className="text-text">Profit &amp; loss</strong>{' '}
        first to validate numbers, then we can add operating / investing / financing sections here.
      </p>
    </div>
  );
};

export default CashFlowReport;
