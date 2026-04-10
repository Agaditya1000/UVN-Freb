import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

const ChartOfAccounts = () => {
  const { activeBusiness, accounts, addAccount } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAccntCode, setNewAccntCode] = useState('');
  const [newAccntName, setNewAccntName] = useState('');
  const [newAccntCat, setNewAccntCat] = useState('Asset');
  const [newAccntSubCat, setNewAccntSubCat] = useState('Current Asset');

  if (!activeBusiness) {
    return (
      <div className="text-center mt-20 text-grayText font-light">
        Please select an active business to view the Chart of Accounts.
      </div>
    );
  }

  const subCatMap = {
    'Asset': ['Current Asset', 'Fixed Asset', 'Other Asset'],
    'Liability': ['Current Liability', 'Long-Term Liability'],
    'Equity': ['Capital & Reserves'],
    'Revenue': ['Operating Revenue', 'Other Revenue'],
    'Expense': ['Operating Expense', 'Finance Cost', 'Tax']
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    if(newAccntCode && newAccntName) {
      const { success } = await addAccount({ 
        id: newAccntCode, 
        name: newAccntName, 
        category: newAccntCat,
        sub_category: newAccntSubCat 
      });
      if(success) {
        setShowModal(false);
        setNewAccntCode('');
        setNewAccntName('');
      }
    }
    setLoading(false);
  };

  const categories = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b-[1.75px] border-borderDark pb-4">
        <div>
          <h1 className="text-3xl font-medium tracking-heading text-white">Chart of Accounts</h1>
          <p className="text-grayText font-light mt-1 text-sm">Standardized ledgers for {activeBusiness.name} ({activeBusiness.country})</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-ghost text-sm">Add Account</button>
      </div>

      <div className="space-y-8 anim-fade-up">
        {categories.map(cat => {
          const accs = accounts.filter(a => a.category === cat);
          if(accs.length === 0) return null;

          return (
            <div key={cat} className="panel overflow-hidden">
              <div className="bg-black/50 px-6 py-4 border-b-[1.75px] border-borderDark">
                <h3 className="text-lg font-medium tracking-heading text-white uppercase">{cat}s</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-naviBlue text-xs uppercase tracking-heading text-grayText border-b-[1.75px] border-borderDark">
                      <th className="p-4 font-medium w-24 border-r-[1.75px] border-borderDark">Code</th>
                      <th className="p-4 font-medium border-r-[1.75px] border-borderDark">Account Name</th>
                      <th className="p-4 font-medium w-40 border-r-[1.75px] border-borderDark">Sub-Category</th>
                      <th className="p-4 font-medium text-right w-40">Current Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accs.map(acc => (
                      <tr key={acc.id} className="border-b-[1.75px] border-borderDark bg-black hover:bg-naviBlue/50 transition-colors">
                        <td className="p-4 text-white font-medium border-r-[1.75px] border-borderDark">{acc.id}</td>
                        <td className="p-4 text-lightWhite font-light border-r-[1.75px] border-borderDark">{acc.name}</td>
                        <td className="p-4 text-grayText text-xs font-light border-r-[1.75px] border-borderDark">{acc.sub_category}</td>
                        <td className="p-4 text-right text-white font-medium font-mono">
                           {activeBusiness.currency === 'USD' ? '$' : activeBusiness.currency === 'EUR' ? '€' : '₹'}
                           {Math.abs(acc.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="panel p-6 sm:p-8 w-full max-w-md anim-fade-up">
             <h2 className="text-xl font-medium tracking-heading mb-6 text-white border-b-[1.75px] border-borderDark pb-2 inline-block">New Ledger Account</h2>
             <form onSubmit={handleAdd} className="space-y-5">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">Code</label>
                    <input type="text" value={newAccntCode} onChange={e=>setNewAccntCode(e.target.value)} className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light" required placeholder="e.g. 1001" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">Category</label>
                    <select value={newAccntCat} onChange={e=>{setNewAccntCat(e.target.value); setNewAccntSubCat(subCatMap[e.target.value][0]);}} className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light appearance-none">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
               </div>
               <div>
                  <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">Account Name</label>
                  <input type="text" value={newAccntName} onChange={e=>setNewAccntName(e.target.value)} className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light" required placeholder="e.g. Current Bank Account" />
               </div>
               <div>
                  <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">Sub-Category</label>
                  <select value={newAccntSubCat} onChange={e=>setNewAccntSubCat(e.target.value)} className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light appearance-none">
                    {subCatMap[newAccntCat].map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
               </div>
               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'SAVING...' : 'SAVE ACCOUNT'}
                  </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccounts;
