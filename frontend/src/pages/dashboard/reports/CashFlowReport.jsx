import React from 'react';
import { ArrowRightLeft, Lock, TrendingUp, Info } from 'lucide-react';

const CashFlowReport = () => {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-5xl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-text">Cash Flow Statement</h2>
            <p className="text-text-secondary font-medium mt-1 text-sm">Indirect Method Reconciliation</p>
          </div>
        </div>
      </div>

      {/* Hero / Notice Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface to-bg p-8 shadow-sm">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-4 bg-bg border border-border border-l-4 border-l-primary rounded-2xl">
           <Lock size={32} className="text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-text mb-2">Reconciliation Engine Pending</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              The Cash Flow engine requires your Trial Balance and Profit & Loss statements to be fully structured before it can compute. Dynamic direct and indirect method reconciliations will automatically map in a future release.
            </p>
          </div>
        </div>
      </div>

      {/* Structure Preview (Empty / Locked state using Skeleton elements) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Operating Activities */}
        <div className="bg-surface border border-border p-6 rounded-3xl relative group hover:border-primary/50 transition-colors">
          <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
            Operating Activities
            <TrendingUp size={14} className="text-text-secondary/50" />
          </h4>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-text">Net Income</span>
              <div className="h-4 w-16 bg-border/50 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-text">Depreciation</span>
              <div className="h-4 w-12 bg-border/50 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-text">Working Capital Diffs</span>
              <div className="h-4 w-20 bg-border/50 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-border/50 flex justify-between items-center">
             <span className="text-xs font-bold text-text">Net Operating Cash</span>
             <div className="h-5 w-24 bg-primary/20 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Investing Activities */}
        <div className="bg-surface border border-border p-6 rounded-3xl relative group hover:border-primary/50 transition-colors">
          <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
            Investing Activities
            <TrendingUp size={14} className="text-text-secondary/50" />
          </h4>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-text">Capital Expenditures</span>
              <div className="h-4 w-16 bg-border/50 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-text">Asset Sales</span>
              <div className="h-4 w-14 bg-border/50 rounded animate-pulse"></div>
            </div>
          </div>
           <div className="mt-14 pt-4 border-t border-border/50 flex justify-between items-center">
             <span className="text-xs font-bold text-text">Net Investing Cash</span>
             <div className="h-5 w-24 bg-primary/20 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Financing Activities */}
        <div className="bg-surface border border-border p-6 rounded-3xl relative group hover:border-primary/50 transition-colors">
          <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
            Financing Activities
            <TrendingUp size={14} className="text-text-secondary/50" />
          </h4>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-text">Debt Issuance</span>
              <div className="h-4 w-16 bg-border/50 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-text">Dividends Paid</span>
              <div className="h-4 w-12 bg-border/50 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="mt-14 pt-4 border-t border-border/50 flex justify-between items-center">
             <span className="text-xs font-bold text-text">Net Financing Cash</span>
             <div className="h-5 w-24 bg-primary/20 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CashFlowReport;
