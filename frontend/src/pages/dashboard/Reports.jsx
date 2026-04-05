import React from 'react';
import { useApp } from '../../contexts/AppContext';

const Reports = () => {
  const { activeBusiness, accounts } = useApp();

  if (!activeBusiness) {
    return <div className="text-center mt-20 text-grayText font-light">Please select an active business.</div>;
  }

  const assets = accounts.filter(a => a.category === 'Asset');
  const liabilities = accounts.filter(a => a.category === 'Liability');
  const equity = accounts.filter(a => a.category === 'Equity');

  const sum = (accs) => accs.reduce((tot, a) => tot + a.balance, 0);

  const totalAssets = sum(assets);
  const totalLiab = sum(liabilities);
  const totalEquity = sum(equity);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b-[1.75px] border-borderDark pb-4">
        <div>
          <h1 className="text-3xl font-medium tracking-heading text-white">Financial Reports</h1>
          <p className="text-grayText font-light mt-1 text-sm">Generated per region compliance ({activeBusiness.country}).</p>
        </div>
        <button className="btn-primary text-sm">Export PDF</button>
      </div>

      <div className="panel p-8 anim-fade-up">
        <div className="text-center border-b-[1.75px] border-borderDark pb-6 mb-6">
           <h2 className="text-2xl font-medium tracking-heading text-white">{activeBusiness.name}</h2>
           <h3 className="text-xl font-light text-lightWhite mt-1">Balance Sheet</h3>
           <p className="text-sm text-grayText mt-2">As of {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div>
              <h4 className="text-lg font-medium tracking-heading text-white border-b-[1.75px] border-borderDark pb-2 mb-4">Assets</h4>
              <div className="space-y-3">
                 {assets.map(a => (
                    <div key={a.id} className="flex justify-between text-lightWhite font-light text-sm">
                       <span>{a.name}</span>
                       <span className="font-mono">{a.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                 ))}
                 <div className="flex justify-between text-success font-medium pt-4 border-t-[1.75px] border-borderDark">
                    <span>Total Assets</span>
                    <span className="font-mono">{totalAssets.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                 </div>
              </div>
           </div>

           <div>
              <h4 className="text-lg font-medium tracking-heading text-white border-b-[1.75px] border-borderDark pb-2 mb-4">Liabilities</h4>
              <div className="space-y-3 mb-8">
                 {liabilities.map(a => (
                    <div key={a.id} className="flex justify-between text-lightWhite font-light text-sm">
                       <span>{a.name}</span>
                       <span className="font-mono">{a.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                 ))}
                 <div className="flex justify-between text-white font-medium pt-4 border-t-[1.75px] border-borderDark text-sm">
                    <span>Total Liabilities</span>
                    <span className="font-mono">{totalLiab.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                 </div>
              </div>

              <h4 className="text-lg font-medium tracking-heading text-white border-b-[1.75px] border-borderDark pb-2 mb-4">Equity</h4>
              <div className="space-y-3">
                 {equity.map(a => (
                    <div key={a.id} className="flex justify-between text-lightWhite font-light text-sm">
                       <span>{a.name}</span>
                       <span className="font-mono">{a.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                 ))}
                 <div className="flex justify-between text-white font-medium pt-4 border-t-[1.75px] border-borderDark text-sm">
                    <span>Total Equity</span>
                    <span className="font-mono">{totalEquity.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                 </div>
              </div>

              <div className="flex justify-between text-accent font-medium pt-6 mt-6 border-t-2 border-accent">
                 <span>Total Liabilities & Equity</span>
                 <span className="font-mono">{(totalLiab + totalEquity).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
