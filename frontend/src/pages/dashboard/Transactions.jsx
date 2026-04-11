import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

const Transactions = () => {
  const { activeBusiness, accounts, transactions, addTransaction } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [debitAcc, setDebitAcc] = useState('');
  const [creditAcc, setCreditAcc] = useState('');
  const [amount, setAmount] = useState('');

  if (!activeBusiness) {
    return <div className="text-center mt-20 text-grayText font-light">Please select an active business.</div>;
  }

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    if(date && desc && debitAcc && creditAcc && amount > 0) {
      const { success } = await addTransaction({
        date,
        description: desc,
        debits: [{ accountId: debitAcc, amount: parseFloat(amount) }],
        credits: [{ accountId: creditAcc, amount: parseFloat(amount) }]
      });
      if(success) {
        setShowForm(false);
        setDate(''); setDesc(''); setDebitAcc(''); setCreditAcc(''); setAmount('');
      }
    }
    setLoading(false);
  };

  const getAccountName = (id) => accounts.find(a => a.id === id)?.name || id;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b-[1.75px] border-borderDark pb-4">
        <div>
          <h1 className="text-3xl font-medium tracking-heading text-white">Journal Entries</h1>
          <p className="text-grayText font-light mt-1 text-sm">Double-entry transaction ledger.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel Entry' : '+ New Journal Entry'}
        </button>
      </div>

      {showForm && (
        <div className="panel p-6 sm:p-8 anim-fade-up">
          <h2 className="text-xl font-medium tracking-heading mb-6 border-b-[1.75px] border-borderDark pb-2 inline-block">Post Transaction</h2>
          <form onSubmit={handlePost} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">Date</label>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} required className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light" />
               </div>
               <div>
                  <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">Description</label>
                  <input type="text" value={desc} onChange={e=>setDesc(e.target.value)} required placeholder="e.g. Paid Office Rent" className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
               <div>
                  <label className="block text-sm font-medium tracking-heading mb-1.5 text-success">Debit Account</label>
                  <select value={debitAcc} onChange={e=>setDebitAcc(e.target.value)} required className="w-full bg-black border-[1.75px] border-success p-3 text-white focus:outline-none font-light appearance-none">
                     <option value="" disabled>Select Account...</option>
                     {accounts.map(a => <option key={a.id} value={a.id}>{a.id} - {a.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium tracking-heading mb-1.5 text-error">Credit Account</label>
                  <select value={creditAcc} onChange={e=>setCreditAcc(e.target.value)} required className="w-full bg-black border-[1.75px] border-error p-3 text-white focus:outline-none font-light appearance-none">
                     <option value="" disabled>Select Account...</option>
                     {accounts.map(a => <option key={a.id} value={a.id}>{a.id} - {a.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">Amount</label>
                  <input type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required placeholder="0.00" className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light font-mono" />
               </div>
            </div>
            
            <button type="submit" className="btn-primary w-full">Post Entry</button>
          </form>
        </div>
      )}

      <div className="panel overflow-x-auto anim-fade-up">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-naviBlue text-xs uppercase tracking-heading text-grayText border-b-[1.75px] border-borderDark">
              <th className="p-4 font-medium w-32 border-r-[1.75px] border-borderDark">Date</th>
              <th className="p-4 font-medium border-r-[1.75px] border-borderDark">Description / Accounts</th>
              <th className="p-4 font-medium text-right w-40 border-r-[1.75px] border-borderDark">Debit</th>
              <th className="p-4 font-medium text-right w-40">Credit</th>
            </tr>
          </thead>
          <tbody>
             {transactions.length === 0 ? (
               <tr><td colSpan="4" className="p-8 text-center text-grayText font-light">No transactions recorded yet.</td></tr>
             ) : transactions.map(t => (
               <React.Fragment key={t.id}>
                 <tr className="bg-black/80 border-b-[1.75px] border-borderDark">
                    <td className="p-4 text-lightWhite font-mono text-sm border-r-[1.75px] border-borderDark align-top" rowSpan={2}>{t.date}</td>
                    <td className="p-4 text-white font-medium border-r-[1.75px] border-borderDark" colSpan={3}>{t.description}</td>
                 </tr>
                 <tr className="border-b-[1.75px] border-borderDark bg-black hover:bg-naviBlue/50 transition-colors">
                    <td className="p-4 border-r-[1.75px] border-borderDark">
                       {t.debits.map(d => <div key={d.accountId} className="text-success text-sm font-light">Dr. {getAccountName(d.accountId)}</div>)}
                       {t.credits.map(c => <div key={c.accountId} className="text-error text-sm pl-4 mt-1 font-light">Cr. {getAccountName(c.accountId)}</div>)}
                    </td>
                    <td className="p-4 text-right text-lightWhite font-mono text-sm border-r-[1.75px] border-borderDark align-top">
                       {t.debits.map((d,i) => <div key={i}>{d.amount.toFixed(2)}</div>)}
                    </td>
                    <td className="p-4 text-right text-lightWhite font-mono text-sm align-bottom">
                       {t.credits.map((c,i) => <div key={i}>{c.amount.toFixed(2)}</div>)}
                    </td>
                 </tr>
               </React.Fragment>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
