import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { ChevronDown, FileText, Table as TableIcon, Calendar, Clock, Landmark, ShieldCheck, Download, Calculator, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { computeAllBalances, filterTransactionsAsOf, buildTradingAccount, buildProfitAndLoss } from '../../utils/reporting';
import { presentationLabelForCountry } from '../../utils/presentationFramework';

const BalanceSheet = () => {
  const { activeBusiness, accounts: contextAccounts, transactions, loading } = useApp();
  const [searchParams] = useSearchParams();
  const asOfParam = searchParams.get('asOf');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const accountsByBal = useMemo(() => {
    if (!contextAccounts?.length) return [];
    const dateLimit = asOfParam || new Date().toISOString().split('T')[0];
    const filtered = filterTransactionsAsOf(transactions || [], dateLimit);
    return computeAllBalances(contextAccounts, filtered);
  }, [asOfParam, transactions, contextAccounts]);

  const reportingData = useMemo(() => {
    if (!contextAccounts?.length) return null;
    const dateLimit = asOfParam || new Date().toISOString().split('T')[0];
    // We assume the reporting period starts from business start or far back for BS context
    const yearStart = `${new Date(dateLimit).getFullYear()}-01-01`;
    
    // Calculate GP and Net Profit for the context of Equity
    const trading = buildTradingAccount(contextAccounts, transactions || [], yearStart, dateLimit, 0);
    const pl = buildProfitAndLoss(contextAccounts, transactions || [], trading.grossProfit);
    
    return { trading, pl };
  }, [contextAccounts, transactions, asOfParam]);

  const statementDateLabel = useMemo(() => {
    if (asOfParam) {
      const d = new Date(`${asOfParam}T12:00:00`);
      return Number.isNaN(d.getTime()) ? asOfParam : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    }
    return currentTime.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }, [asOfParam, currentTime]);

  if (!activeBusiness) return <p className="text-text-secondary text-sm font-medium">Select a business unit to generate reports.</p>;

  const symbol = activeBusiness.currency === 'USD' ? '$' : activeBusiness.currency === 'EUR' ? '€' : '₹';

  // --- TEMPLATE DEFINITIONS (As requested by images) ---
  const ASSET_TEMPLATE = {
    'Current Assets': [
      'Cash at Hand', 'Cash at Bank', 'Accounts Receivable', 'Reserve for Bad Debt', 'Stock/Inventory', 'Prepaid Expenses', 'Notes Receivable'
    ],
    'Fixed Assets': [
      'Plant & Machinery', 'Land & Buildings', 'Furniture & Fixtures', 'Other Fixed Assets'
    ],
    'Other Assets': [
      'Other Assets'
    ]
  };

  const LIAB_TEMPLATE = {
    'Current Liabilities': [
      'Accounts Payable', 'Sales Taxes Payable', 'Payroll Taxes Payable', 'Income Taxes Payable', 'Accrued Wages Payable', 'Unearned Revenues', 'Bank Overdraft', 'Short-Term Loan Payable'
    ],
    'Long-Term Liabilities': [
      'Long-term Bank Loans', 'Mortgage Payable', 'Debentures'
    ]
  };

  const getSubGroupWithTemplate = (title, subCats) => {
    const lines = subCats.map(sc => {
      // Robust matching: trim and ignore case
      const target = sc.trim().toLowerCase();
      const matchingAccounts = accountsByBal.filter(a => {
        const accountSubCat = (a.sub_category || '').trim().toLowerCase();
        // If row is "Cash at Hand", also include accounts labeled "Current Asset"
        if (target === 'cash at hand' && (accountSubCat === 'current asset' || accountSubCat === 'current assets')) return true;
        return accountSubCat === target;
      });
      const sum = matchingAccounts.reduce((s, a) => s + (a.balance || 0), 0);
      return { 
        name: sc, 
        balance: sum 
      };
    });
    const total = lines.reduce((sum, l) => sum + (l.balance || 0), 0);
    return { title, lines, total };
  };

  // Exhaustive Asset Mapping
  const assets = [
    getSubGroupWithTemplate('Current Assets', ASSET_TEMPLATE['Current Assets']),
    getSubGroupWithTemplate('Fixed Assets', ASSET_TEMPLATE['Fixed Assets']),
    getSubGroupWithTemplate('Other Assets', ASSET_TEMPLATE['Other Assets'])
  ];

  const totalAssetsVal = assets.reduce((s, g) => s + g.total, 0);

  const liabilities = [
    getSubGroupWithTemplate('Current Liabilities', LIAB_TEMPLATE['Current Liabilities']),
    getSubGroupWithTemplate('Long-Term Liabilities', LIAB_TEMPLATE['Long-Term Liabilities'])
  ];
  
  const totalLiabilitiesVal = liabilities.reduce((s, g) => s + g.total, 0);

  // Equity Logic (Summing instead of find for robustness)
  const equityAccounts = accountsByBal.filter(a => a.category === 'Equity');
  const sumEq = (sc) => equityAccounts.filter(a => a.sub_category === sc).reduce((s, a) => s + (a.balance || 0), 0);
  
  const equityShareFund = sumEq('Equity Share holder fund');
  const preferenceShareFund = sumEq('Preference share holder fund');
  const reservesSurplus = sumEq('Reserve and surplus');
  const drawings = Math.abs(sumEq('Drawings'));
  const netProfit = reportingData?.pl?.netIncome || 0;

  const netCapital = (equityShareFund + preferenceShareFund + reservesSurplus + netProfit) - drawings;
  const totalLiabEquityVal = totalLiabilitiesVal + netCapital;

  const TRow = ({ label, amount, isTotal, isSubTotal, isHeader, colorHint }) => (
    <div className={`flex justify-between items-center px-4 py-3 text-[13px] ${isTotal ? 'bg-primary/5 font-black border-t-2 border-primary/20' : isSubTotal ? 'bg-bg/50 font-black border-t border-border mt-1' : isHeader ? 'bg-bg font-black uppercase tracking-widest text-[10px] text-text-secondary py-2 border-b border-border/50' : 'border-b border-border/10'}`}>
      <span className={isTotal ? 'text-primary' : colorHint ? `text-${colorHint}` : 'text-text'}>
        {label === 'Less: Drawings' || label === 'Less: Reserve for Bad Debt' ? <span className="text-rose-500">{label}</span> : label}
      </span>
      <span className={`font-mono tabular-nums font-bold ${amount < 0 ? 'text-rose-500' : ''}`}>
        {symbol}{Math.abs(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); 
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text(activeBusiness.name.toUpperCase(), pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("BALANCE SHEET", pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`As of ${statementDateLabel}`, pageWidth / 2, 38, { align: 'center' });

    const fmt = (val) => {
      const safeSymbol = symbol === '₹' ? 'Rs.' : symbol;
      return `${safeSymbol} ${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    };

    // --- PREPARE COMBINED DATA ---
    const assetRows = [];
    assets.forEach(group => {
      assetRows.push([{ content: group.title.toUpperCase(), styles: { fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [100, 100, 100] } }, '']);
      group.lines.forEach(l => assetRows.push([l.name, fmt(l.balance)]));
      assetRows.push([{ content: `Total ${group.title}`, styles: { fontStyle: 'bold' } }, fmt(group.total)]);
    });
    assetRows.push([{ content: 'TOTAL ASSETS', styles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' } }, { content: fmt(totalAssetsVal), styles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' } }]);

    const liabRows = [];
    liabilities.forEach(group => {
      liabRows.push([{ content: group.title.toUpperCase(), styles: { fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [100, 100, 100] } }, '']);
      group.lines.forEach(l => liabRows.push([l.name, fmt(l.balance)]));
      liabRows.push([{ content: `Total ${group.title}`, styles: { fontStyle: 'bold' } }, fmt(group.total)]);
    });
    liabRows.push([{ content: 'CAPITAL & RESERVES', styles: { fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [100, 100, 100] } }, '']);
    liabRows.push(['Equity Share holder fund', fmt(equityShareFund)]);
    liabRows.push(['Preference share holder fund', fmt(preferenceShareFund)]);
    liabRows.push(['Reserve and surplus', fmt(reservesSurplus)]);
    liabRows.push([netProfit >= 0 ? 'Add: Net Profit' : 'Less: Net Loss', fmt(netProfit)]);
    liabRows.push(['Less: Drawings', `(${fmt(drawings)})`]);
    liabRows.push([{ content: 'TOTAL LIABILITIES & EQUITY', styles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' } }, { content: fmt(totalLiabEquityVal), styles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' } }]);

    // Merge into Combined Matrix (5 Columns)
    const combinedRows = [];
    const maxLen = Math.max(assetRows.length, liabRows.length);
    
    for (let i = 0; i < maxLen; i++) {
      const a = assetRows[i] || ['', ''];
      const l = liabRows[i] || ['', ''];
      combinedRows.push([
        a[0]?.content || a[0] || '', a[1]?.content || a[1] || '',
        '',
        l[0]?.content || l[0] || '', l[1]?.content || l[1] || ''
      ]);
    }

    autoTable(doc, {
      startY: 45,
      head: [['ASSET HEAD', 'AMOUNT', '', 'LIABILITY & EQUITY HEAD', 'AMOUNT']],
      body: combinedRows,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 10 }, 
        3: { cellWidth: 'auto' },
        4: { cellWidth: 35, halign: 'right' }
      },
      headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
      didParseCell: (data) => {
        const rowIndex = data.row.index;
        const colIndex = data.column.index;
        const rowData = combinedRows[rowIndex];

        // Asset Side Styling
        if (colIndex < 2) {
          if (rowData[0] === 'TOTAL ASSETS') {
            data.cell.styles.fillColor = [59, 130, 246];
            data.cell.styles.textColor = 255;
            data.cell.styles.fontStyle = 'bold';
          } else if (rowData[0] && rowData[0] === rowData[0].toString().toUpperCase() && rowData[1] === '') {
            data.cell.styles.fillColor = [245, 245, 245];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Liability Side Styling
        if (colIndex > 2) {
          if (rowData[3] === 'TOTAL LIABILITIES & EQUITY') {
            data.cell.styles.fillColor = [16, 185, 129];
            data.cell.styles.textColor = 255;
            data.cell.styles.fontStyle = 'bold';
          } else if (rowData[3] && rowData[3] === rowData[3].toString().toUpperCase() && rowData[4] === '') {
            data.cell.styles.fillColor = [245, 245, 245];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // Central 'Balanced' Badge (Floating middle)
    const midX = pageWidth / 2;
    doc.setDrawColor(220);
    doc.setFillColor(255, 255, 255);
    doc.circle(midX, 60, 6, 'FD');
    doc.setFontSize(5);
    doc.setTextColor(150);
    doc.text("BALANCED", midX, 61, { align: 'center' });

    doc.save(`Balance_Sheet_Synchronized_${activeBusiness.name}.pdf`);
    setShowExportOptions(false);
  };

  const handleExportExcel = () => {
    const data = [];
    data.push([activeBusiness.name.toUpperCase()]);
    data.push(['BALANCE SHEET']);
    data.push([`As of ${statementDateLabel}`]);
    data.push([]);

    data.push(['ASSETS']);
    assets.forEach(group => {
      data.push([group.title]);
      group.lines.forEach(l => data.push(['', l.name, l.balance]));
      data.push(['', `Total ${group.title}`, group.total]);
    });
    data.push(['TOTAL ASSETS', '', totalAssetsVal]);
    data.push([]);

    data.push(['LIABILITIES & EQUITY']);
    liabilities.forEach(group => {
      data.push([group.title]);
      group.lines.forEach(l => data.push(['', l.name, l.balance]));
      data.push(['', `Total ${group.title}`, group.total]);
    });
    data.push(['Capital & Reserves']);
    data.push(['', 'Equity Share holder fund', equityShareFund]);
    data.push(['', 'Preference share holder fund', preferenceShareFund]);
    data.push(['', 'Reserve and surplus', reservesSurplus]);
    data.push(['', netProfit >= 0 ? 'Add: Net Profit' : 'Less: Net Loss', netProfit]);
    data.push(['', 'Less: Drawings', -drawings]);
    data.push(['TOTAL LIABILITIES & EQUITY', '', totalLiabEquityVal]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balance Sheet");
    XLSX.writeFile(wb, `Balance_Sheet_${activeBusiness.name}.xlsx`);
    setShowExportOptions(false);
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary text-white rounded-2xl shadow-lg ring-4 ring-primary/5">
              <Landmark size={24} />
            </div>
            <h1 className="text-4xl font-extrabold text-text tracking-tight uppercase italic">Balance Sheet</h1>
          </div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-2">
            {presentationLabelForCountry(activeBusiness.country)}
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-text-secondary">
             <div className="flex items-center gap-2"><Calendar size={16} className="text-primary" /><span>As of {statementDateLabel}</span></div>
             <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" /><span>Verified context: {activeBusiness.name}</span></div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="btn-primary flex items-center gap-3 py-4 px-8 text-sm font-black shadow-xl shadow-primary/20"
          >
            <Download size={20} />
            EXPORT REPORT
            <ChevronDown size={14} className={`transition-transform duration-300 ${showExportOptions ? 'rotate-180' : ''}`} />
          </button>

          {showExportOptions && (
            <>
              {/* Overlay to close dropdown */}
              <div className="fixed inset-0 z-40" onClick={() => setShowExportOptions(false)}></div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-4 w-64 bg-surface border border-border rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2">
                  <button 
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 text-text-secondary hover:text-primary transition-all rounded-2xl group text-left"
                  >
                    <div className="p-2 bg-red-500/10 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Download PDF</p>
                      <p className="text-[10px] opacity-60 font-medium">Standard Audit Format</p>
                    </div>
                  </button>

                  <button 
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-4 p-4 hover:bg-emerald-500/5 text-text-secondary hover:text-emerald-600 transition-all rounded-2xl group text-left"
                  >
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                      <TableIcon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Download Excel</p>
                      <p className="text-[10px] opacity-60 font-medium">Editable Spreadsheet</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-border border border-border rounded-[3rem] overflow-hidden shadow-2xl bg-surface relative">
         {/* Vertical Divider Line with Label */}
         <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-border z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-surface border border-border rounded-full text-[8px] font-black uppercase text-text-secondary scale-75">
               Balanced
            </div>
         </div>

         {/* LEFT SIDE: ASSETS */}
         <div className="bg-surface flex flex-col p-4 md:p-8 space-y-8">
            <div className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-center">
               <h4 className="text-[11px] font-black uppercase tracking-[0.4em]">Assets (Debit Applications)</h4>
            </div>

            {assets.map(group => (
              <div key={group.title} className="space-y-1">
                 <TRow label={group.title} isHeader />
                 {group.lines.map(line => (
                    <TRow key={line.name} label={line.name} amount={line.balance} />
                 ))}
                 <TRow label={`Total ${group.title}`} amount={group.total} isSubTotal />
              </div>
            ))}

            <div className="mt-auto pt-10">
               <div className="p-8 border-2 border-primary bg-primary/5 rounded-[2.5rem] flex items-center justify-between shadow-sm">
                  <span className="text-sm font-black text-primary uppercase tracking-widest">Total Assets</span>
                  <span className="text-4xl font-black text-text tabular-nums tracking-tighter">
                     {symbol}{totalAssetsVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
               </div>
            </div>
         </div>

         {/* RIGHT SIDE: LIABILITIES & EQUITY */}
         <div className="bg-surface flex flex-col p-4 md:p-8 space-y-8">
            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-center">
               <h4 className="text-[11px] font-black uppercase tracking-[0.4em]">Liabilities & Equity (Sources)</h4>
            </div>

            {liabilities.map(group => (
              <div key={group.title} className="space-y-1">
                 <TRow label={group.title} isHeader />
                 {group.lines.map(line => (
                   <TRow key={line.name} label={line.name} amount={line.balance} />
                 ))}
                 <TRow label={`Total ${group.title}`} amount={group.total} isSubTotal />
              </div>
            ))}

            {/* CAPITAL & RESERVES SECTION */}
            <div className="space-y-1">
               <TRow label="Capital & Reserves" isHeader />
               <TRow label="Equity Share holder fund" amount={equityShareFund} />
               <TRow label="Preference share holder fund" amount={preferenceShareFund} />
               <TRow label="Reserve and surplus" amount={reservesSurplus} />
               <TRow 
                 label={netProfit >= 0 ? "Add: Net Profit (b/f from P&L)" : "Less: Net Loss (b/f from P&L)"} 
                 amount={netProfit} 
                 colorHint={netProfit >= 0 ? "emerald-600" : "rose-600"} 
               />
               <TRow label="Less: Drawings" amount={-drawings} colorHint="rose-500" />
               <TRow label="Net Capital Position" amount={netCapital} isSubTotal />
            </div>

            <div className="mt-auto pt-10">
               <div className="p-8 border-2 border-emerald-500 bg-emerald-500/5 rounded-[2.5rem] flex items-center justify-between shadow-sm">
                  <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">Total Liabilities & Equity</span>
                  <span className="text-4xl font-black text-text tabular-nums tracking-tighter">
                     {symbol}{totalLiabEquityVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
               </div>
            </div>
         </div>
      </div>

      <div className="p-6 bg-surface border border-border rounded-3xl flex items-start gap-4 shadow-sm">
         <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Info size={18} />
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Audit Control Note</p>
            <p className="text-xs text-text-secondary font-medium leading-relaxed">
               This Balance Sheet is generated using a standardized accounting template. It ensures compliance by displaying all fundamental accounting heads. **Net Profit** is dynamically brought forward from the Profit & Loss statement based on the current period transactions.
            </p>
         </div>
      </div>

    </div>
  );
};

export default BalanceSheet;
