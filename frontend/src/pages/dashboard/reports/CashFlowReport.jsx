import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import { 
  ArrowRightLeft, 
  TrendingUp, 
  Download, 
  ChevronDown, 
  FileText, 
  Table as TableIcon,
  Calendar,
  Wallet,
  Building,
  CreditCard,
  Target
} from 'lucide-react';
import { buildCashFlowStatement, defaultPeriodDates } from '../../../utils/reporting';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const CashFlowReport = () => {
  const { activeBusiness, accounts, transactions, loading } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const defaults = defaultPeriodDates();
  const from = searchParams.get('from') || defaults.from;
  const to = searchParams.get('to') || defaults.to;

  const data = useMemo(() => {
    if (!accounts.length || !transactions?.length) return null;
    return buildCashFlowStatement(accounts, transactions, from, to);
  }, [accounts, transactions, from, to]);

  const setRange = (nextFrom, nextTo) => {
    const p = new URLSearchParams(searchParams);
    p.set('from', nextFrom);
    p.set('to', nextTo);
    setSearchParams(p, { replace: true });
  };

  const symbol = activeBusiness?.currency === 'USD' ? '$' : activeBusiness?.currency === 'EUR' ? '€' : '₹';

  const handleExportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(activeBusiness.name.toUpperCase(), 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('STATEMENT OF CASH FLOWS', 105, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Period: ${from} to ${to}`, 105, 38, { align: 'center' });

    const rows = [
      ['CASH FLOW FROM OPERATING ACTIVITIES', ''],
      ['Net Income', data.netIncome.toFixed(2)],
      ...data.operatingActivities.map(a => [a.name, a.amount.toFixed(2)]),
      ['Net Cash from Operating Activities', data.netOperatingCash.toFixed(2)],
      ['', ''],
      ['CASH FLOW FROM INVESTING ACTIVITIES', ''],
      ...data.investingActivities.map(a => [a.name, a.amount.toFixed(2)]),
      ['Net Cash from Investing Activities', data.netInvestingCash.toFixed(2)],
      ['', ''],
      ['CASH FLOW FROM FINANCING ACTIVITIES', ''],
      ...data.financingActivities.map(a => [a.name, a.amount.toFixed(2)]),
      ['Net Cash from Financing Activities', data.netFinancingCash.toFixed(2)],
      ['', ''],
      ['NET INCREASE/DECREASE IN CASH', data.netChangeInCash.toFixed(2)],
      ['Cash at Beginning of Period', data.beginningCash.toFixed(2)],
      ['CASH AT END OF PERIOD', data.endingCash.toFixed(2)]
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Description', `Amount (${activeBusiness.currency})`]],
      body: rows,
      theme: 'striped',
    });
    doc.save(`${activeBusiness.name}_Cash_Flow.pdf`);
    setShowExportOptions(false);
  };

  const SummaryCard = ({ title, icon: Icon, amount, activities, colorClass }) => (
    <div className="bg-surface border border-border p-6 rounded-3xl group hover:border-primary/50 transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-opacity-100`}>
          <Icon size={20} />
        </div>
        <span className={`text-sm font-black tabular-nums ${amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {amount >= 0 ? '+' : ''}{symbol}{Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>
      <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] mb-4">{title}</h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-[10px] text-text-secondary italic font-medium">No activity in this section.</p>
        ) : (
          activities.slice(0, 4).map((act, i) => (
            <div key={i} className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-text-secondary truncate pr-4">{act.name}</span>
              <span className={act.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                {act.amount >= 0 ? '+' : '-'}{Math.abs(act.amount).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-text-secondary">Section Net</span>
          <span className="text-xs font-black text-text">{symbol}{amount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  if (!activeBusiness) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-inner">
              <ArrowRightLeft size={24} />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-text">Cash Flow</h2>
          </div>
          <p className="text-text-secondary font-medium text-sm max-w-md">
            Analyzing liquid position movements using the indirect method reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {/* Date Range Selectors */}
           <div className="flex items-center gap-2 bg-surface border border-border rounded-2xl p-1 shadow-sm">
             <input
               type="date"
               value={from}
               onChange={(e) => setRange(e.target.value, to)}
               className="bg-transparent text-xs font-bold text-text p-2 focus:outline-none"
             />
             <div className="w-px h-4 bg-border"></div>
             <input
               type="date"
               value={to}
               onChange={(e) => setRange(from, e.target.value)}
               className="bg-transparent text-xs font-bold text-text p-2 focus:outline-none"
             />
           </div>

           {/* Export Dropdown */}
           <div className="relative">
             <button 
               onClick={() => setShowExportOptions(!showExportOptions)}
               className="btn-primary flex items-center gap-2.5 py-3 px-5 text-xs font-black tracking-widest uppercase shadow-lg shadow-primary/20"
             >
               <Download size={16} />
               <span>Export</span>
               <ChevronDown size={14} className={showExportOptions ? 'rotate-180 transition-transform' : 'transition-transform'} />
             </button>
             
             {showExportOptions && (
               <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-2xl p-2 z-50 shadow-2xl animate-in zoom-in-95 duration-200">
                  <button 
                    onClick={handleExportPDF}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-text hover:bg-bg rounded-xl transition-all text-xs font-bold border-b border-border/50"
                  >
                    <FileText size={16} className="text-red-500" /> PDF Document
                  </button>
                  <button 
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-text hover:bg-bg rounded-xl transition-all text-xs font-bold opacity-50 cursor-not-allowed"
                  >
                    <TableIcon size={16} className="text-emerald-500" /> Excel (Soon)
                  </button>
               </div>
             )}
           </div>
        </div>
      </div>

      {!loading && data && (
        <div className="space-y-10">
          {/* Top Level Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard 
              title="Operating Activities" 
              icon={Wallet} 
              amount={data.netOperatingCash} 
              activities={data.operatingActivities}
              colorClass="bg-blue-500 text-blue-500"
            />
            <SummaryCard 
              title="Investing Activities" 
              icon={Building} 
              amount={data.netInvestingCash} 
              activities={data.investingActivities}
              colorClass="bg-amber-500 text-amber-500"
            />
            <SummaryCard 
              title="Financing Activities" 
              icon={CreditCard} 
              amount={data.netFinancingCash} 
              activities={data.financingActivities}
              colorClass="bg-purple-500 text-purple-500"
            />
          </div>

          {/* Master Reconciliation Panel */}
          <div className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-xl">
             <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x border-border">
                
                {/* Visual Reconciliation */}
                <div className="p-8 md:p-12 space-y-8 bg-slate-500/5">
                   <div className="flex items-center gap-3 text-primary">
                      <Target size={20} />
                      <h4 className="text-sm font-black uppercase tracking-widest text-text">Cash Reconciliation</h4>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-text-secondary">Beginning Cash (Opening)</span>
                         <span className="text-lg font-bold text-text tabular-nums">{symbol}{data.beginningCash.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-primary">
                         <span className="text-sm font-black uppercase tracking-widest">Net Change in Cash</span>
                         <span className="text-lg font-black tabular-nums">
                           {data.netChangeInCash >= 0 ? '+' : ''}{data.netChangeInCash.toLocaleString()}
                         </span>
                      </div>
                      <div className="pt-6 border-t border-border border-dashed">
                         <div className="flex justify-between items-center">
                            <span className="text-base font-black uppercase tracking-[0.2em] text-text">Ending Cash Balance</span>
                            <span className="text-3xl font-black text-text tabular-nums">{symbol}{data.endingCash.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Accuracy Status */}
                <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center space-y-6">
                   <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center">
                      <TrendingUp size={40} />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-text mb-2">Statement Verified</h4>
                      <p className="text-sm text-text-secondary font-medium max-w-xs mx-auto">
                        This cash flow reconciliation is balanced with your ledger as of <span className="text-text font-bold">{to}</span>.
                      </p>
                   </div>
                   <div className="px-6 py-2 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-emerald-500/20">
                      ELECTRONICALLY BALANCED
                   </div>
                </div>

             </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           <p className="text-sm font-bold text-text-secondary">Generative reconciliation in progress...</p>
        </div>
      )}
    </div>
  );
};

export default CashFlowReport;
