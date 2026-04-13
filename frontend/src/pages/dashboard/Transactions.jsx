import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, X, Loader2 } from 'lucide-react';
import Footer from '../../components/Footer';


const AnimatedDropdown = ({ label, value, setValue, options, color }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.id === value);

  return (
    <div className="space-y-1 relative">
      <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${color}`}>
        {label}
      </label>

      <div
        onClick={() => setOpen(!open)}
        className="w-full bg-bg border border-border rounded-xl md:rounded-2xl px-3 md:px-4 py-3 md:py-4 h-[44px] md:h-[52px] flex items-center cursor-pointer hover:border-primary transition-all"
      >
        <span className={`${selected ? "text-text" : "text-text-secondary"} truncate`}>
          {selected ? selected.name : "Select account"}
        </span>
      </div>

      <div
        className={`absolute left-0 w-full mt-2 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-50 transition-all duration-300 ${
          open ? "max-h-60 opacity-100 scale-100" : "max-h-0 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="overflow-y-auto max-h-60">
          {options.map(a => (
            <div
              key={a.id}
              onClick={() => {
                setValue(a.id);
                setOpen(false);
              }}
              className="px-4 py-3 cursor-pointer hover:bg-bg transition font-semibold text-text"
            >
              {a.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Transactions = () => {
  const { activeBusiness, accounts, transactions, addTransaction } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [debitAcc, setDebitAcc] = useState('');
  const [creditAcc, setCreditAcc] = useState('');
  const [amount, setAmount] = useState('');

  if (!activeBusiness) return null;

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (date && desc && debitAcc && creditAcc && parseFloat(amount) > 0) {
      const { success } = await addTransaction({
        date,
        description: desc,
        debits: [{ accountId: debitAcc, amount: parseFloat(amount) }],
        credits: [{ accountId: creditAcc, amount: parseFloat(amount) }]
      });

      if (success) {
        setShowModal(false);
        setDate('');
        setDesc('');
        setDebitAcc('');
        setCreditAcc('');
        setAmount('');
      }
    }

    setLoading(false);
  };

  const getAccountName = (id) => accounts.find(a => a.id === id)?.name || id;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10 pb-20 px-4 md:px-6">


      <div className="flex justify-between items-end border-b border-border pb-6">
        <h1 className="text-4xl font-extrabold text-text">Journal Entries</h1>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-3 px-6 py-3 font-black shadow-xl"
        >
          <Plus size={18} /> NEW ENTRY
        </button>
      </div>


      <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg text-[10px] uppercase font-black text-text-secondary">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-right">Debit</th>
                <th className="p-4 text-right">Credit</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-text-secondary">
                    No transactions yet
                  </td>
                </tr>
              ) : transactions.map(t => (
                <React.Fragment key={t.id}>
                  <tr className="border-b border-border">
                    <td className="p-4">{t.date}</td>
                    <td colSpan="3" className="p-4 font-medium">{t.description}</td>
                  </tr>

                  <tr className="border-b border-border hover:bg-bg/50">
                    <td></td>
                    <td className="p-4">
                      {t.debits.map(d => (
                        <div key={d.accountId} className="text-green-500">
                          Dr. {getAccountName(d.accountId)}
                        </div>
                      ))}
                      {t.credits.map(c => (
                        <div key={c.accountId} className="text-red-500">
                          Cr. {getAccountName(c.accountId)}
                        </div>
                      ))}
                    </td>

                    <td className="p-4 text-right">
                      {t.debits.map((d, i) => <div key={i}>{d.amount}</div>)}
                    </td>

                    <td className="p-4 text-right">
                      {t.credits.map((c, i) => <div key={i}>{c.amount}</div>)}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {showModal && (
        <div 
          className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-6 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-surface border border-border p-10 w-full max-w-xl rounded-[3rem] shadow-2xl relative">


            <button 
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 p-3 bg-bg border border-border rounded-2xl"
            >
              <X size={20} />
            </button>


            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Plus size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-text uppercase">
                  Post Transaction
                </h2>
                <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">
                  Record double-entry journal
                </p>
              </div>
            </div>


            <form onSubmit={handlePost} className="space-y-8">

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                    Date
                  </label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-bg border border-border rounded-2xl p-4" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                    Amount
                  </label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-bg border border-border rounded-2xl p-4" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                  Description
                </label>
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-bg border border-border rounded-2xl p-4" required />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <AnimatedDropdown label="Debit Account" value={debitAcc} setValue={setDebitAcc} options={accounts} color="text-emerald-500" />
                <AnimatedDropdown label="Credit Account" value={creditAcc} setValue={setCreditAcc} options={accounts} color="text-rose-500" />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black">
                  Cancel
                </button>

                <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 text-xs font-black">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Post Entry'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Transactions;