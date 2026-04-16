import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import { buildProfitAndLoss, buildTradingAccount, defaultPeriodDates } from '../../../utils/reporting';
import { Calculator, LayoutGrid, Info, ArrowDownRight, Loader2 } from 'lucide-react';

const ProfitLossReport = () => {
  const { activeBusiness, accounts, transactions, loading } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = defaultPeriodDates();
  
  const from = searchParams.get('from') || defaults.from;
  const to = searchParams.get('to') || defaults.to;
  
  // Closing stock input to calculate GP which then flows into P&L
  const [closingStock, setClosingStock] = useState(0);

  const data = useMemo(() => {
    if (!accounts.length) return null;
    const trading = buildTradingAccount(accounts, transactions || [], from, to, closingStock);
    const pl = buildProfitAndLoss(accounts, transactions || [], trading.grossProfit);
    return { trading, pl };
  }, [accounts, transactions, from, to, closingStock]);

  const setRange = (nFrom, nTo) => {
    const p = new URLSearchParams(searchParams);
    p.set('from', nFrom);
    p.set('to', nTo);
    setSearchParams(p, { replace: true });
  };

  const symbol = activeBusiness?.currency === 'USD' ? '$' : activeBusiness?.currency === 'EUR' ? '€' : '₹';

  if (!activeBusiness) return <p className="text-text-secondary text-sm font-medium">Select a business unit to generate reports.</p>;

  const TRow = ({ label, amount, isTotal, isHeader, isTransfer }) => (
    <div className={`flex justify-between items-center px-4 py-3 text-[13px] ${isTotal ? 'bg-primary/5 font-black border-t-2 border-primary/20 mt-auto' : isHeader ? 'bg-bg font-black uppercase tracking-widest text-[10px] text-text-secondary' : isTransfer ? 'bg-emerald-50 text-emerald-700 font-bold border-b border-emerald-100' : 'border-b border-border/50'}`}>
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
          <h2 className="text-2xl font-black text-text uppercase tracking-tight">Profit & Loss Account</h2>
          <p className="text-sm text-text-secondary font-medium">Secondary Statement of Income & Expenditure</p>
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

      <div className="bg-surface border border-border rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border-l-4 border-l-primary/40">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
               <ArrowDownRight size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Data Link Active</p>
               <h3 className="text-lg font-bold text-text">Trading Account Sync</h3>
               <p className="text-xs text-text-secondary font-medium">Closing Stock adjustment from Trading phase is required for accurate GP.</p>
            </div>
         </div>
         <div className="w-full md:w-64">
            <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-secondary">{symbol}</span>
               <input 
                 type="number" 
                 value={closingStock} 
                 onChange={e => setClosingStock(e.target.value)} 
                 className="w-full bg-bg border border-border rounded-2xl py-3 pl-10 pr-4 text-sm font-black focus:border-primary outline-none transition-all"
                 placeholder="Ref. Closing Stock"
               />
            </div>
         </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
           <Loader2 className="animate-spin text-primary" size={32} />
           <p className="text-xs font-black uppercase tracking-widest text-text-secondary">Syncing Final Accounts...</p>
        </div>
      ) : !data ? (
        <div className="p-20 text-center border-2 border-dashed border-border rounded-[3rem]">
           <LayoutGrid size={48} className="mx-auto text-text-secondary opacity-20 mb-4" />
           <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No accounts found to generate P&L view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-border border border-border rounded-[2.5rem] overflow-hidden shadow-2xl bg-surface">
           
           {/* DEBIT SIDE (Left) - Expenses */}
           <div className="bg-surface flex flex-col min-h-[500px]">
              <div className="bg-bg px-8 py-5 border-b border-border text-center">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-500">Particulars (Debit)</h4>
              </div>
              
              <div className="flex-1 flex flex-col divide-y divide-border/30">
                 {data.trading.grossProfit < 0 && (
                   <TRow label="To Gross Loss b/d" amount={data.trading.grossProfit} isTransfer />
                 )}

                 <TRow label="To Indirect Expenses" isHeader />
                 {data.pl.expenseLines.map(l => (
                    <TRow key={l.id} label={l.name} amount={l.balance} />
                 ))}
                 {data.pl.expenseLines.length === 0 && <div className="px-8 py-4 text-[10px] italic text-text-secondary">No indirect expenses recorded.</div>}

                 {data.pl.netIncome > 0 && (
                   <TRow label="To Net Profit (Trf to Capital)" amount={data.pl.netIncome} isTotal />
                 )}
              </div>
              
              <div className="p-8 bg-bg/50 border-t border-border flex justify-between items-center bg-slate-500/5 mt-auto">
                 <span className="text-xs font-black uppercase tracking-widest">Total Debit</span>
                 <span className="text-xl font-black font-mono tracking-tighter">
                   {symbol}{(Math.max(data.pl.netIncome, 0) + data.pl.totalOtherExpenses + Math.max(-data.trading.grossProfit, 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                 </span>
              </div>
           </div>

           {/* CREDIT SIDE (Right) - Income */}
           <div className="bg-surface flex flex-col min-h-[500px] border-l border-border">
              <div className="bg-bg px-8 py-5 border-b border-border text-center">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500">Particulars (Credit)</h4>
              </div>
              
              <div className="flex-1 flex flex-col divide-y divide-border/30">
                 {data.trading.grossProfit >= 0 && (
                   <TRow label="By Gross Profit b/d" amount={data.trading.grossProfit} isTransfer />
                 )}

                 <TRow label="By Other Income" isHeader />
                 {data.pl.revenueLines.map(l => (
                    <TRow key={l.id} label={l.name} amount={l.balance} />
                 ))}
                 {data.pl.revenueLines.length === 0 && <div className="px-8 py-4 text-[10px] italic text-text-secondary">No other income records.</div>}

                 {data.pl.netIncome < 0 && (
                   <TRow label="By Net Loss (Trf to Capital)" amount={data.pl.netIncome} isTotal />
                 )}
              </div>

              <div className="p-8 bg-bg/50 border-t border-border flex justify-between items-center bg-slate-500/5 mt-auto">
                 <span className="text-xs font-black uppercase tracking-widest">Total Credit</span>
                 <span className="text-xl font-black font-mono tracking-tighter">
                   {symbol}{(Math.max(data.trading.grossProfit, 0) + data.pl.totalOtherIncome + Math.max(-data.pl.netIncome, 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Accounting Basis</p>
            <p className="text-xs text-text-secondary font-medium leading-relaxed">
              This statement displays indirect income and expenses. It begins with the **Gross Profit brought down** (b/d) from the Trading Account. The resulting **Net Profit** represents the final surplus intended for capital distribution.
            </p>
         </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
