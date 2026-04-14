import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import { buildTradingAccount, defaultPeriodDates } from '../../../utils/reporting';
import { Calculator, LayoutGrid, Info, Loader2 } from 'lucide-react';

const TradingAccountReport = () => {
  const { activeBusiness, accounts, transactions, loading } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = defaultPeriodDates();
  
  const from = searchParams.get('from') || defaults.from;
  const to = searchParams.get('to') || defaults.to;
  const [closingStock, setClosingStock] = useState(0);

  const data = useMemo(() => {
    if (!accounts.length) return null;
    return buildTradingAccount(accounts, transactions || [], from, to, closingStock);
  }, [accounts, transactions, from, to, closingStock]);

  const setRange = (nFrom, nTo) => {
    const p = new URLSearchParams(searchParams);
    p.set('from', nFrom);
    p.set('to', nTo);
    setSearchParams(p, { replace: true });
  };

  const symbol = activeBusiness?.currency === 'USD' ? '$' : activeBusiness?.currency === 'EUR' ? '€' : '₹';

  if (!activeBusiness) return <p className="text-text-secondary text-sm font-medium">Select a business unit to generate reports.</p>;

  const TRow = ({ label, amount, isTotal, isHeader }) => (
    <div className={`flex justify-between items-center px-4 py-3 text-[13px] ${isTotal ? 'bg-primary/5 font-black border-t-2 border-primary/20 mt-auto' : isHeader ? 'bg-bg font-black uppercase tracking-widest text-[10px] text-text-secondary' : 'border-b border-border/50'}`}>
      <span className={isTotal ? 'text-primary' : 'text-text'}>{label}</span>
      <span className="font-mono tabular-nums font-bold">
        {symbol}{Math.abs(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-text uppercase tracking-tight">Trading Account</h2>
          <p className="text-sm text-text-secondary font-medium">Measurement of Operational Gross Performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-surface p-3 border border-border rounded-2xl shadow-sm">
           <div className="flex flex-col">
             <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1 ml-1">Period From</label>
             <input type="date" value={from} onChange={e => setRange(e.target.value, to)} className="bg-bg border border-border rounded-xl px-3 py-1.5 text-xs font-bold focus:border-primary outline-none" />
           </div>
           <div className="flex flex-col">
             <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1 ml-1">Period To</label>
             <input type="date" value={to} onChange={e => setRange(from, e.target.value)} className="bg-bg border border-border rounded-xl px-3 py-1.5 text-xs font-bold focus:border-primary outline-none" />
           </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
         <div className="absolute -right-8 -bottom-8 text-primary/5 rotate-12">
            <Calculator size={120} />
         </div>
         <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
               <Calculator size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Manual Adjustment Required</p>
               <h3 className="text-lg font-bold text-text">Closing Stock Valuation</h3>
            </div>
         </div>
         <div className="w-full md:w-64 relative z-10">
            <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-secondary">{symbol}</span>
               <input 
                 type="number" 
                 value={closingStock} 
                 onChange={e => setClosingStock(e.target.value)} 
                 className="w-full bg-surface border border-primary/30 rounded-2xl py-4 pl-10 pr-4 text-sm font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                 placeholder="Enter Closing Value"
               />
            </div>
         </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
           <Loader2 className="animate-spin text-primary" size={32} />
           <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Crunching Ledger Data...</p>
        </div>
      ) : !data ? (
        <div className="p-20 text-center border-2 border-dashed border-border rounded-[3rem]">
           <LayoutGrid size={48} className="mx-auto text-text-secondary opacity-20 mb-4" />
           <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No accounts found to generate Trading view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-border border border-border rounded-[2.5rem] overflow-hidden shadow-2xl bg-surface">
           
           {/* DEBIT SIDE (Left) */}
           <div className="bg-surface flex flex-col min-h-[500px]">
              <div className="bg-bg px-8 py-5 border-b border-border text-center">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-500">Particulars (Debit)</h4>
              </div>
              
              <div className="flex-1 flex flex-col divide-y divide-border/30">
                 <TRow label="To Opening Stock" amount={data.openingStock} />
                 
                 <TRow label="To Purchases" isHeader />
                 {data.purchaseLines.map(l => (
                    <TRow key={l.id} label={l.name} amount={l.balance} />
                 ))}
                 {data.purchaseLines.length === 0 && <div className="px-8 py-4 text-[10px] italic text-text-secondary">No purchase records found.</div>}

                 <TRow label="To Direct Expenses" isHeader />
                 {data.otherDirectExpenseLines.map(l => (
                    <TRow key={l.id} label={l.name} amount={l.balance} />
                 ))}
                 {data.otherDirectExpenseLines.length === 0 && <div className="px-8 py-4 text-[10px] italic text-text-secondary">No other direct expenses recorded.</div>}

                 {data.grossProfit > 0 && (
                   <TRow label="To Gross Profit (Trf to P&L)" amount={data.grossProfit} isTotal />
                 )}
              </div>
              
              <div className="p-8 bg-bg/50 border-t border-border flex justify-between items-center bg-slate-500/5 mt-auto">
                 <span className="text-xs font-black uppercase tracking-widest">Total Debit Side</span>
                 <span className="text-xl font-black font-mono tracking-tighter">
                   {symbol}{(Math.max(data.grossProfit, 0) + data.openingStock + data.netPurchases + data.otherDirectExps).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                 </span>
              </div>
           </div>

           {/* CREDIT SIDE (Right) */}
           <div className="bg-surface flex flex-col min-h-[500px] border-l border-border">
              <div className="bg-bg px-8 py-5 border-b border-border text-center">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500">Particulars (Credit)</h4>
              </div>
              
              <div className="flex-1 flex flex-col divide-y divide-border/30">
                 <TRow label="By Sales" isHeader />
                 {data.salesLines.map(l => (
                    <TRow key={l.id} label={l.name} amount={l.balance} />
                 ))}
                 {data.salesLines.length === 0 && <div className="px-8 py-4 text-[10px] italic text-text-secondary">No sales records found.</div>}

                 <div className="mt-auto"></div>
                 <TRow label="By Closing Stock (Adjusted)" amount={data.manualClosingStock} />
                 
                 {data.grossProfit < 0 && (
                   <TRow label="By Gross Loss (Trf to P&L)" amount={data.grossProfit} isTotal />
                 )}
              </div>

              <div className="p-8 bg-bg/50 border-t border-border flex justify-between items-center bg-slate-500/5 mt-auto">
                 <span className="text-xs font-black uppercase tracking-widest">Total Credit Side</span>
                 <span className="text-xl font-black font-mono tracking-tighter">
                   {symbol}{(data.netSales + data.manualClosingStock + Math.max(-data.grossProfit, 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                 </span>
              </div>
           </div>
        </div>
      )}

      <div className="p-6 bg-surface border border-border rounded-3xl flex items-start gap-4 shadow-sm">
         <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Info size={18} />
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Accounting Standard Note</p>
            <p className="text-xs text-text-secondary font-medium leading-relaxed">
              This Trading Account summarizes direct revenue and cost of goods sold. Gross Profit is transferred to the <span className="text-text font-bold uppercase tracking-tighter">Profit & Loss Account</span> to calculate net operational income after indirect expenses.
            </p>
         </div>
      </div>
    </div>
  );
};

export default TradingAccountReport;
