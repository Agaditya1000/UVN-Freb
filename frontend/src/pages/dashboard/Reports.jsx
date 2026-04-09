import React, { useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import html2pdf from 'html2pdf.js';

const Reports = () => {
  const { activeBusiness, accounts } = useApp();
  const reportRef = useRef();

  if (!activeBusiness) {
    return <div className="text-center mt-20 text-grayText font-light">Please select an active business.</div>;
  }

  // --- Dynamic Categorization Logic ---
  const assets = accounts.filter(a => a.category === 'Asset');
  const liabilities = accounts.filter(a => a.category === 'Liability');
  const equity = accounts.filter(a => a.category === 'Equity');

  // Creativity applied: Automatically sort assets based on common keywords
  const isFixedAsset = (name) => /(equipment|vehicle|furniture|fixture|building|land|property|machinery)/i.test(name);
  const currentAssets = assets.filter(a => !isFixedAsset(a.name));
  const fixedAssets = assets.filter(a => isFixedAsset(a.name));

  const isLongTermLiab = (name) => /(loan|mortgage|long-term|bond)/i.test(name);
  const currentLiabilities = liabilities.filter(a => !isLongTermLiab(a.name));
  const longTermLiabilities = liabilities.filter(a => isLongTermLiab(a.name));

  const sum = (accs) => accs.reduce((tot, a) => tot + a.balance, 0);

  const totalCurrentAssets = sum(currentAssets);
  const totalFixedAssets = sum(fixedAssets);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = sum(currentLiabilities);
  const totalLongTermLiabilities = sum(longTermLiabilities);
  const totalLiabilitiesVal = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = sum(equity);
  const totalLiabilitiesAndEquity = totalLiabilitiesVal + totalEquity;

  const handleExportPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin:       0.5,
      filename:     `${activeBusiness.name}_Balance_Sheet.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const formatCurrency = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const ItemRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Roboto", sans-serif', fontWeight: 300, color: '#EEEEEE', fontSize: '0.9rem', marginBottom: '6px', lineHeight: 'normal' }}>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );

  const SubHeader = ({ children }) => (
    <div style={{ fontFamily: '"Roboto", sans-serif', fontStyle: 'italic', fontWeight: 500, color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '10px', marginTop: '16px', lineHeight: 'normal', borderBottom: '1px solid #000055', paddingBottom: '4px' }}>
      {children}
    </div>
  );

  const TotalRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Roboto", sans-serif', fontWeight: 500, color: '#FFFFFF', fontSize: '0.95rem', background: '#000021', padding: '8px 12px', margin: '8px 0 16px 0', border: '1.75px solid #000055', lineHeight: 'normal' }}>
      <span style={{ fontStyle: 'italic' }}>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );

  return (
    <div style={{ background: '#000000', fontFamily: '"Roboto", sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1.75px solid #000055', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Roboto", sans-serif', fontWeight: 500, fontSize: '1.8rem', letterSpacing: '-0.75px', color: '#FFFFFF', margin: 0, lineHeight: 'normal' }}>Balance Sheet</h1>
          <p style={{ fontFamily: '"Roboto", sans-serif', fontWeight: 300, fontSize: '0.9rem', color: '#757575', margin: '4px 0 0 0', lineHeight: 'normal' }}>View and export your standard financial statements.</p>
        </div>
        <button 
          onClick={handleExportPDF}
          style={{
            background: 'transparent',
            border: '2px solid #FFFFFF',
            borderRadius: '145px',
            color: '#FFFFFF',
            padding: '8px 24px',
            fontFamily: '"Roboto", sans-serif',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
            lineHeight: 'normal'
          }}
          onMouseEnter={(e) => { e.target.style.background = '#FFFFFF'; e.target.style.color = '#000000'; }}
          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#FFFFFF'; }}
        >
          Export PDF
        </button>
      </div>

      {/* Identical Layout applied locally, dynamic rows */}
      <div ref={reportRef} style={{ border: '1.75px solid #000055', background: '#000000' }}>
        
        {/* Top Header Section */}
        <div style={{ background: '#000021', borderBottom: '1.75px solid #000055', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: '"Roboto", sans-serif', fontWeight: 500, fontSize: '1.75rem', letterSpacing: '-0.75px', color: '#FFFFFF', margin: '0 0 6px 0', lineHeight: 'normal' }}>
            {activeBusiness.name}
          </h2>
          <div style={{ fontFamily: '"Roboto", sans-serif', fontWeight: 500, fontSize: '1.1rem', color: '#EEEEEE', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px', lineHeight: 'normal' }}>
            Balance Sheet
          </div>
          <div style={{ fontFamily: '"Roboto", sans-serif', fontWeight: 300, fontSize: '0.95rem', color: '#757575', lineHeight: 'normal' }}>
            As of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ fontFamily: '"Roboto", sans-serif', fontWeight: 300, fontSize: '0.85rem', color: '#757575', marginTop: '4px', lineHeight: 'normal' }}>
            <span style={{ color: '#00BFA5' }}>{activeBusiness.currency}</span> • {activeBusiness.currency === 'USD' ? 'EIN' : activeBusiness.currency === 'EUR' ? 'VAT' : 'GST'}: {activeBusiness.taxId || 'N/A'}
          </div>
        </div> 

        {/* Columns Wrapper */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          
          {/* Left Column - ASSETS */}
          <div style={{ borderRight: '1.75px solid #000055' }}>
            <div style={{ background: '#000021', borderBottom: '1.75px solid #000055', padding: '12px 16px', fontFamily: '"Roboto", sans-serif', fontWeight: 500, color: '#FFFFFF', letterSpacing: '-0.75px', lineHeight: 'normal' }}>
              ASSETS
            </div>
            
            <div style={{ padding: '8px 16px 16px 16px' }}>
              <SubHeader>Current Assets:</SubHeader>
              {currentAssets.length > 0 ? (
                currentAssets.map(a => <ItemRow key={a.id} label={a.name} value={a.balance} />)
              ) : (
                <div style={{ color: '#757575', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '6px' }}>No Data Found</div>
              )}
              <TotalRow label="Total Current Assets" value={totalCurrentAssets} />

              <SubHeader>Fixed Assets:</SubHeader>
              {fixedAssets.length > 0 ? (
                fixedAssets.map(a => <ItemRow key={a.id} label={a.name} value={a.balance} />)
              ) : (
                <div style={{ color: '#757575', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '6px' }}>No Data Found</div>
              )}
              <TotalRow label="Total Fixed Assets" value={totalFixedAssets} />
            </div>
          </div>

          {/* Right Column - LIABILITIES & EQUITY */}
          <div>
            <div style={{ background: '#000021', borderBottom: '1.75px solid #000055', padding: '12px 16px', fontFamily: '"Roboto", sans-serif', fontWeight: 500, color: '#FFFFFF', letterSpacing: '-0.75px', lineHeight: 'normal' }}>
              LIABILITIES & EQUITY
            </div>
            
            <div style={{ padding: '8px 16px 16px 16px' }}>
              <SubHeader>Current Liabilities:</SubHeader>
              {currentLiabilities.length > 0 ? (
                currentLiabilities.map(a => <ItemRow key={a.id} label={a.name} value={a.balance} />)
              ) : (
                <div style={{ color: '#757575', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '6px' }}>No Data Found</div>
              )}
              <TotalRow label="Total Current Liabilities" value={totalCurrentLiabilities} />

              <SubHeader>Long-Term Liabilities:</SubHeader>
              {longTermLiabilities.length > 0 ? (
                longTermLiabilities.map(a => <ItemRow key={a.id} label={a.name} value={a.balance} />)
              ) : (
                <div style={{ color: '#757575', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '6px' }}>No Data Found</div>
              )}
              <TotalRow label="Total Long-Term Liabilities" value={totalLongTermLiabilities} />

              <div style={{ height: '32px' }} /> {/* Spacing spacer */}
              <TotalRow label="Total Liabilities" value={totalLiabilitiesVal} />

              <SubHeader>Capital & Reserves</SubHeader>
              {equity.length > 0 ? (
                equity.map(a => <ItemRow key={a.id} label={a.name} value={a.balance} />)
              ) : (
                 <div style={{ color: '#757575', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '6px' }}>No Data Found</div>
              )}
              <TotalRow label="Net Capital" value={totalEquity} />
            </div>
          </div>
        </div>

        {/* Grand Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#0000EE', borderTop: '1.75px solid #000055' }}>
          <div style={{ padding: '16px', borderRight: '1.75px solid #000055', display: 'flex', justifyContent: 'space-between', fontFamily: '"Roboto", sans-serif', fontWeight: 500, color: '#FFFFFF', fontSize: '1.05rem', letterSpacing: '-0.75px', lineHeight: 'normal' }}>
            <span>Total Assets</span>
            <span>{formatCurrency(totalAssets)}</span>
          </div>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', fontFamily: '"Roboto", sans-serif', fontWeight: 500, color: '#FFFFFF', fontSize: '1.05rem', letterSpacing: '-0.75px', lineHeight: 'normal' }}>
            <span>Total Liabilities and Equity</span>
            <span>{formatCurrency(totalLiabilitiesAndEquity)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
