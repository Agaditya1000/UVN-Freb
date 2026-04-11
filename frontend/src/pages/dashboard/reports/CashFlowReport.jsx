import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

const CashFlowReport = () => {
  return (
    <div className="max-w-xl space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200">
        Coming soon
      </div>
      <div className="p-4 rounded-xl bg-primary/10 text-primary w-fit">
        <ArrowRightLeft size={28} />
      </div>
      <h2 className="text-xl font-bold text-text">Statement of cash flows</h2>
      <p className="text-sm text-text-secondary font-medium leading-relaxed">
        This report is not available in the current release. Use trial balance, profit &amp; loss, and balance sheet in this
        section for period-end work until cash flow is enabled.
      </p>
    </div>
  );
};

export default CashFlowReport;
