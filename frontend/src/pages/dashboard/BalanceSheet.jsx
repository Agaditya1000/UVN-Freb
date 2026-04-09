import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ChevronDown, FileText, Table as TableIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const BalanceSheet = () => {
  const { activeBusiness, accounts } = useApp();
  const [showExportOptions, setShowExportOptions] = useState(false);

  if (!activeBusiness) {
    return (
       <div className="text-center mt-20 text-grayText font-light">
          Please select an active business to view the financial statement.
       </div>
    );
  }

  const symbol = activeBusiness.currency === 'USD' ? '$' : activeBusiness.currency === 'EUR' ? '€' : '₹';

  // Helper to filter and sum
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

  // EXPORT LOGIC: EXCEL
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Create professional headers
    const header = [
      [activeBusiness.name.toUpperCase()],
      ['STATEMENT OF FINANCIAL POSITION'],
      [`As of ${new Date().toLocaleDateString()}`],
      [],
      ['ASSETS', activeBusiness.currency, '', 'LIABILITIES & EQUITY', activeBusiness.currency]
    ];

    const body = [];
    
    // Grouping rows side-by-side
    const maxRows = Math.max(
      currentAssets.group.length + fixedAssets.group.length + otherAssets.group.length + 5,
      currentLiabilities.group.length + longTermLiabilities.group.length + equity.group.length + 5
    );

    // This is a simplified but much cleaner AOW (Array of Arrays) mapping
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
    
    // Add columns width for readability
    worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 5 }, { wch: 25 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, worksheet, 'Balance Sheet');
    XLSX.writeFile(wb, `${activeBusiness.name}_Balance_Sheet.xlsx`);
    setShowExportOptions(false);
  };

  // EXPORT LOGIC: PDF (Fixed for corruption)
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const currencyCode = activeBusiness.currency; // Use Code (INR) instead of Symbol (₹) for PDF stability

    doc.setFontSize(22);
    doc.setTextColor(0, 0, 33);
    doc.text(activeBusiness.name.toUpperCase(), 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('STATEMENT OF FINANCIAL POSITION', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`As of ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' });

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

  const Section = ({ title, data, total, totalLabel }) => (
    <div className="mb-8">
      <h4 className="text-sm font-medium tracking-heading text-white italic border-b-[1.75px] border-borderDark pb-1 mb-3">{title}:</h4>
      <div className="space-y-2 mb-4">
        {data.length === 0 ? (
          <div className="text-xs text-grayText italic pl-4">No accounts found</div>
        ) : data.map(acc => (
          <div key={acc.id} className="flex justify-between text-xs text-lightWhite font-light pl-4">
            <span>{acc.name}</span>
            <span className="font-mono">{symbol}{Math.abs(acc.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-white font-medium bg-naviBlue px-4 py-2 text-xs uppercase tracking-heading">
        <span>{totalLabel}</span>
        <span className="font-mono">{symbol}{Math.abs(total).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center border-b-[1.75px] border-borderDark pb-4">
        <div>
          <h1 className="text-3xl font-medium tracking-heading text-white">Balance Sheet</h1>
          <p className="text-grayText font-light mt-1 text-sm">Professional statement for {activeBusiness.name}</p>
        </div>
        
        {/* Export Dropdown */}
        <div className="relative">
          <button 
             onClick={() => setShowExportOptions(!showExportOptions)}
             className="btn-primary text-xs flex items-center gap-2 min-w-[140px] justify-between"
          >
            <span>EXPORT STATEMENT</span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${showExportOptions ? 'rotate-180' : ''}`} />
          </button>
          
          {showExportOptions && (
            <div className="absolute right-0 mt-2 w-56 panel p-2 z-50 shadow-2xl anim-fade-up">
               <button 
                 onClick={handleExportPDF}
                 className="w-full text-left flex items-center gap-3 px-4 py-3 text-lightWhite hover:bg-naviBlue transition-colors text-sm font-light border-b border-borderDark"
               >
                 <FileText size={16} className="text-accent" />
                 Download as PDF
               </button>
               <button 
                 onClick={handleExportExcel}
                 className="w-full text-left flex items-center gap-3 px-4 py-3 text-lightWhite hover:bg-naviBlue transition-colors text-sm font-light"
               >
                 <TableIcon size={16} className="text-success" />
                 Download as Excel
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="panel p-0 anim-fade-up overflow-hidden">
        {/* Header Block */}
        <div className="bg-black border-b-[1.75px] border-borderDark p-8 text-center bg-grid-overlay">
           <h2 className="text-2xl font-medium tracking-heading text-white mb-1 uppercase tracking-widest">{activeBusiness.name}</h2>
           <h3 className="text-lg font-light text-accent uppercase tracking-heading">Statement of Financial Position</h3>
           <p className="text-sm text-grayText mt-4 font-light italic">As of {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Dual Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x-[1.75px] divide-borderDark">
          
          {/* ASSETS COLUMN */}
          <div className="p-8 space-y-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-5 w-1 bg-accent"></div>
              <h3 className="text-xl font-medium tracking-heading text-white uppercase">Assets</h3>
            </div>

            <Section 
              title="Current Assets" 
              data={currentAssets.group} 
              total={currentAssets.total} 
              totalLabel="Total Current Assets" 
            />

            <Section 
              title="Fixed Assets" 
              data={fixedAssets.group} 
              total={fixedAssets.total} 
              totalLabel="Total Fixed Assets" 
            />

            <Section 
              title="Other Assets" 
              data={otherAssets.group} 
              total={otherAssets.total} 
              totalLabel="Total Other Assets" 
            />

            <div className="mt-12 p-4 border-2 border-accent bg-accent/5 flex justify-between items-center">
               <span className="text-white font-medium uppercase tracking-heading">Total Assets</span>
               <span className="text-xl font-medium font-mono text-white">{symbol}{totalAssets.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>

          {/* LIABILITIES & EQUITY COLUMN */}
          <div className="p-8 space-y-2 bg-black/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-5 w-1 bg-success"></div>
              <h3 className="text-xl font-medium tracking-heading text-white uppercase">Liabilities & Equity</h3>
            </div>

            <Section 
              title="Current Liabilities" 
              data={currentLiabilities.group} 
              total={currentLiabilities.total} 
              totalLabel="Total Current Liabilities" 
            />

            <Section 
              title="Long-Term Liabilities" 
              data={longTermLiabilities.group} 
              total={longTermLiabilities.total} 
              totalLabel="Total Long-Term Liabilities" 
            />

            <div className="mb-8 p-3 bg-naviBlue/50 text-white font-medium text-xs flex justify-between">
               <span>TOTAL LIABILITIES</span>
               <span className="font-mono">{symbol}{totalLiabilities.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>

            <Section 
              title="Capital & Reserves" 
              data={equity.group} 
              total={equity.total} 
              totalLabel="Net Capital" 
            />

            <div className="mt-12 p-4 border-2 border-success bg-success/5 flex justify-between items-center">
               <span className="text-white font-medium uppercase tracking-heading">Total Liabilities and Equity</span>
               <span className="text-xl font-medium font-mono text-white">{symbol}{totalLiabilitiesEquity.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
