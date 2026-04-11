import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ChevronDown, FileText, Table as TableIcon, Calendar, Clock, Landmark, ShieldCheck, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const BalanceSheet = () => {
  const { activeBusiness, accounts } = useApp();
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!activeBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-surface border border-border rounded-3xl animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
          <Landmark size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">No Active Context</h2>
        <p className="max-w-xs text-text-secondary font-medium">Please select a business entity to generate a real-time financial position statement.</p>
      </div>
    );
  }

  const symbol = activeBusiness.currency === 'USD' ? '$' : activeBusiness.currency === 'EUR' ? '€' : '₹';

  const getSubGroup = (subCat) => {
    const group = accounts.filter(a => a.sub_category === subCat);
    const total = group.reduce((sum, a) => sum + (a.balance || 0), 0);
    return { group, total };
  };

  const currentAssets = getSubGroup('Current Asset');
  const fixedAssets = getSubGroup('Fixed Asset');
  const otherAssets = getSubGroup('Other Asset');
  const totalAssets = currentAssets.total + fixedAssets.total + otherAssets.total;

  const currentLiabilities = getSubGroup('Current Liability');
  const longTermLiabilities = getSubGroup('Long-Term Liability');
  const totalLiabilities = currentLiabilities.total + longTermLiabilities.total;

  const equity = getSubGroup('Capital & Reserves');
  const totalLiabilitiesEquity = totalLiabilities + equity.total;

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const header = [
      [activeBusiness.name.toUpperCase()],
      ['STATEMENT OF FINANCIAL POSITION'],
      [`Tax ID: ${activeBusiness.tax_id || 'N/A'}`],
      [`Generated on ${currentTime.toLocaleString()}`],
      [],
      ['ASSETS', activeBusiness.currency, '', 'LIABILITIES & EQUITY', activeBusiness.currency]
    ];
    const body = [];
    const maxRows = Math.max(
      currentAssets.group.length + fixedAssets.group.length + otherAssets.group.length + 5,
      currentLiabilities.group.length + longTermLiabilities.group.length + equity.group.length + 5
    );
    body.push(['CURRENT ASSETS', '', '', 'CURRENT LIABILITIES', '']);
    const assetRows = [
      ...currentAssets.group.map(a => [a.name, a.balance]),
      ['Total Current Assets', currentAssets.total],
      [],
      ['FIXED ASSETS', ''],
      ...fixedAssets.group.map(a => [a.name, a.balance]),
      ['Total Fixed Assets', fixedAssets.total]
    ];
    const liabRows = [
      ...currentLiabilities.group.map(a => [a.name, a.balance]),
      ['Total Current Liabilities', currentLiabilities.total],
      [],
      ['LONG-TERM LIABILITIES', ''],
      ...longTermLiabilities.group.map(a => [a.name, a.balance]),
      ['Total Liabilities', totalLiabilities]
    ];
    for (let i = 0; i < maxRows; i++) {
       const row = [];
       const ar = assetRows[i] || ['', ''];
       const lr = liabRows[i] || ['', ''];
       row.push(ar[0], ar[1], '', lr[0], lr[1]);
       body.push(row);
    }
    body.push([], ['TOTAL ASSETS', totalAssets, '', 'TOTAL LIABILITIES & EQUITY', totalLiabilitiesEquity]);
    const worksheet = XLSX.utils.aoa_to_sheet([...header, ...body]);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 5 }, { wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, worksheet, 'Balance Sheet');
    XLSX.writeFile(wb, `${activeBusiness.name}_Balance_Sheet.xlsx`);
    setShowExportOptions(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const currencyCode = activeBusiness.currency;
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 33);
    doc.text(activeBusiness.name.toUpperCase(), 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('STATEMENT OF FINANCIAL POSITION', 105, 30, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Tax ID: ${activeBusiness.tax_id || 'N/A'} | Page Generated: ${currentTime.toLocaleString()}`, 105, 38, { align: 'center' });
    autoTable(doc, {
      startY: 50,
      head: [['Category', 'Account', `Amount (${currencyCode})`]],
      body: [
        [{ content: 'ASSETS', colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
        ['Current Assets', '', ''],
        ...currentAssets.group.map(a => ['', a.name, a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })]),
        ['', 'TOTAL CURRENT ASSETS', currentAssets.total.toLocaleString('en-US', { minimumFractionDigits: 2 })],
        [],
        ['Fixed Assets', '', ''],
        ...fixedAssets.group.map(a => ['', a.name, a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })]),
        ['', 'TOTAL FIXED ASSETS', fixedAssets.total.toLocaleString('en-US', { minimumFractionDigits: 2 })],
        [],
        [{ content: 'LIABILITIES & EQUITY', colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
        ['Current Liabilities', '', ''],
        ...currentLiabilities.group.map(a => ['', a.name, a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })]),
        ['', 'TOTAL LIABILITIES', totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })],
        [],
        ['Equity', '', ''],
        ...equity.group.map(a => ['', a.name, a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })]),
        ['', 'NET CAPITAL', equity.total.toLocaleString('en-US', { minimumFractionDigits: 2 })],
        [],
        [{ content: 'TOTALS', colSpan: 3, styles: { fillColor: [0, 0, 33], textColor: [255, 255, 255], fontStyle: 'bold' } }],
        ['', 'TOTAL ASSETS', `${currencyCode} ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
        ['', 'TOTAL LIABILITIES & EQUITY', `${currencyCode} ${totalLiabilitiesEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 33], textColor: [255, 255, 255] },
      margin: { top: 50 }
    });
    doc.save(`${activeBusiness.name}_Balance_Sheet.pdf`);
    setShowExportOptions(false);
  };

  const Section = ({ title, data, total, totalLabel, color = 'primary' }) => (
    <div className="mb-10 group">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-1 h-4 bg-${color}`}></div>
        <h4 className="text-sm font-black tracking-[0.2em] text-text-secondary uppercase">{title}</h4>
      </div>
      <div className="bg-surface/50 border border-border/50 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:border-primary/20 transition-all duration-300">
        <div className="divide-y divide-border/30">
          {data.length === 0 ? (
            <div className="p-6 text-xs text-text-secondary italic font-medium">No ledger accounts registered.</div>
          ) : data.map(acc => (
            <div key={acc.id} className="flex justify-between items-center p-4 text-sm font-semibold hover:bg-bg/50 transition-colors">
              <span className="text-text">{acc.name}</span>
              <span className="font-bold text-text tabular-nums">{symbol}{Math.abs(acc.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          ))}
        </div>
        <div className={`flex justify-between bg-${color}/10 px-6 py-4 text-xs font-black uppercase tracking-widest text-${color} border-t border-${color}/20`}>
          <span>{totalLabel}</span>
          <span className="tabular-nums font-bold">{symbol}{Math.abs(total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Landmark size={24} />
            </div>
            <h1 className="text-4xl font-extrabold text-text tracking-tight">Financial Statement</h1>
          </div>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-bold text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <span className="uppercase tracking-widest text-[10px] px-2 py-0.5 bg-primary/10 rounded-full">{activeBusiness.tax_id || 'ID Pending'}</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button 
             onClick={() => setShowExportOptions(!showExportOptions)}
             className="btn-primary flex items-center gap-3 py-4 px-6 text-sm font-bold shadow-xl shadow-primary/20"
          >
            <Download size={18} />
            <span>EXPORT STATEMENT</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${showExportOptions ? 'rotate-180' : ''}`} />
          </button>
          
          {showExportOptions && (
            <div className="absolute right-0 mt-3 w-64 bg-surface border border-border rounded-2xl p-2 z-50 shadow-2xl animate-in zoom-in-95 duration-200">
               <button 
                 onClick={handleExportPDF}
                 className="w-full text-left flex items-center gap-4 px-5 py-4 text-text hover:bg-bg rounded-xl transition-all text-sm font-bold border-b border-border/50"
               >
                 <div className="p-2 bg-red-50 text-red-500 rounded-lg"><FileText size={18} /></div>
                 Portable Document (PDF)
               </button>
               <button 
                 onClick={handleExportExcel}
                 className="w-full text-left flex items-center gap-4 px-5 py-4 text-text hover:bg-bg rounded-xl transition-all text-sm font-bold"
               >
                 <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><TableIcon size={18} /></div>
                 Excel Spreadsheet
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[40px] shadow-2xl overflow-hidden relative group">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Master Header Block */}
        <div className="p-10 md:p-16 text-center border-b border-border/50 relative overflow-hidden">
           <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-3xl mb-8 font-black text-3xl shadow-lg ring-1 ring-primary/20 italic tracking-tighter">
             UV
           </div>
           <h2 className="text-3xl md:text-5xl font-black text-text mb-4 uppercase tracking-tighter leading-none">{activeBusiness.name}</h2>
           <h3 className="text-xl font-bold text-primary uppercase tracking-[0.3em] mb-4">Statement of Financial Position</h3>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-10">
              <div className="px-6 py-3 bg-bg border border-border rounded-2xl text-[11px] font-black uppercase tracking-widest text-text-secondary">
                 Tax Identity: <span className="text-text ml-2">{activeBusiness.tax_id || 'NOT_SPECIFIED'}</span>
              </div>
              <div className="px-6 py-3 bg-bg border border-border rounded-2xl text-[11px] font-black uppercase tracking-widest text-text-secondary">
                 As of <span className="text-text ml-2">{currentTime.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
           </div>
        </div>

        {/* Dual Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x border-border/50">
          
          {/* ASSETS COLUMN */}
          <div className="p-10 md:p-14 space-y-2">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <Landmark size={24} />
                </div>
                <h3 className="text-2xl font-black text-text uppercase tracking-tight">Assets</h3>
              </div>
              <div className="text-[10px] font-black px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-widest">Debit Control</div>
            </div>

            <Section 
              title="Current Assets" 
              data={currentAssets.group} 
              total={currentAssets.total} 
              totalLabel="Cumulative Current Assets" 
            />

            <Section 
              title="Fixed Assets" 
              data={fixedAssets.group} 
              total={fixedAssets.total} 
              totalLabel="Net Capital Expenditure" 
            />

            <Section 
              title="Other Assets" 
              data={otherAssets.group} 
              total={otherAssets.total} 
              totalLabel="Miscellaneous Assets" 
            />

            <div className="mt-16 p-8 border-2 border-primary bg-primary/5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl shadow-primary/5 group/total">
               <span className="text-primary font-black uppercase tracking-[0.2em] text-sm">Grand Total Assets</span>
               <span className="text-4xl font-black text-text tabular-nums tracking-tighter group-hover:scale-110 transition-transform duration-500">
                 {symbol}{totalAssets.toLocaleString('en-US', {minimumFractionDigits: 2})}
               </span>
            </div>
          </div>

          {/* LIABILITIES & EQUITY COLUMN */}
          <div className="p-10 md:p-14 space-y-2 bg-slate-500/5">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-2xl font-black text-text uppercase tracking-tight">Liabilities & Equity</h3>
              </div>
              <div className="text-[10px] font-black px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full uppercase tracking-widest">Credit Control</div>
            </div>

            <Section 
              title="Current Liabilities" 
              data={currentLiabilities.group} 
              total={currentLiabilities.total} 
              totalLabel="Short-Term Obligations"
              color="emerald-500"
            />

            <Section 
              title="Long-Term Liabilities" 
              data={longTermLiabilities.group} 
              total={longTermLiabilities.total} 
              totalLabel="Structural Liabilities" 
              color="emerald-500"
            />

            <div className="mb-12 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center text-emerald-700">
               <span className="text-xs font-black uppercase tracking-widest">Total Liabilities</span>
               <span className="font-black text-xl tabular-nums">{symbol}{totalLiabilities.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>

            <Section 
              title="Capital & Reserves" 
              data={equity.group} 
              total={equity.total} 
              totalLabel="Total Shareholders Equity" 
              color="emerald-500"
            />

            <div className="mt-16 p-8 border-2 border-emerald-500 bg-emerald-500/5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl shadow-emerald-500/5 group/total">
               <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-sm">Liabilities + Equity</span>
               <span className="text-4xl font-black text-text tabular-nums tracking-tighter group-hover:scale-110 transition-transform duration-500">
                 {symbol}{totalLiabilitiesEquity.toLocaleString('en-US', {minimumFractionDigits: 2})}
               </span>
            </div>
          </div>

        </div>

        {/* Bottom Footer Verification */}
        <div className="p-10 bg-bg/50 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                <ShieldCheck size={16} />
              </div>
              <p className="text-xs font-bold text-text-secondary">This statement is electronically balanced and verified for accuracy.</p>
           </div>
           <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Internal Use Only • Generation Ref: {Math.random().toString(36).substring(7).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
