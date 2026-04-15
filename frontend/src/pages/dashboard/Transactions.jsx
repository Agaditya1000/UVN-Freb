import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, X, Loader2, Edit, Trash2, Calendar, Receipt, Search, Filter } from 'lucide-react';
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
  const { activeBusiness, accounts, transactions, addTransaction, postGstJournal, updateTransaction, deleteTransaction, userRole } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [debitAcc, setDebitAcc] = useState('');
  const [creditAcc, setCreditAcc] = useState('');
  const [amount, setAmount] = useState('');
  const [includeTax, setIncludeTax] = useState(false);
  const [taxType, setTaxType] = useState('IGST');
  const [taxRate, setTaxRate] = useState('18');
  const [voucherKind, setVoucherKind] = useState('purchase');
  const [hsnSac, setHsnSac] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [itcEligible, setItcEligible] = useState(true);

  if (!activeBusiness) return null;

  const openAddModal = () => {
    setModalMode('add');
    setSelectedTx(null);
    setDate(new Date().toISOString().split('T')[0]);
    setDesc('');
    setDebitAcc('');
    setCreditAcc('');
    setAmount('');
    setIncludeTax(false);
    setTaxType('IGST');
    setTaxRate('18');
    setVoucherKind('purchase');
    setHsnSac('');
    setPlaceOfSupply('');
    setItcEligible(true);
    setShowModal(true);
  };

  const openEditModal = (tx) => {
    const multiLine =
      (tx.debits?.length || 0) > 1 ||
      (tx.credits?.length || 0) > 1 ||
      tx.tax?.posting_engine === 'rpc_v1';
    if (multiLine) {
      window.alert(
        'This entry was posted with split GST lines (server-side). Edit it in the database or delete and re-post; the form cannot safely rewrite these vouchers.'
      );
      return;
    }
    setModalMode('edit');
    setSelectedTx(tx);
    setDate(tx.date);
    setDesc(tx.description);
    setDebitAcc(tx.debits[0].accountId);
    setCreditAcc(tx.credits[0].accountId);
    setAmount(tx.debits[0].amount);
    setIncludeTax(Boolean(tx.tax));
    setTaxType(tx.tax?.type || 'IGST');
    setTaxRate(String(tx.tax?.rate ?? '18'));
    setVoucherKind(tx.tax?.kind === 'sale' ? 'sale' : 'purchase');
    setHsnSac(tx.tax?.hsn_sac || '');
    setPlaceOfSupply(tx.tax?.place_of_supply || '');
    setItcEligible(tx.tax?.itc_eligible !== false);
    setShowModal(true);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (date && desc && debitAcc && creditAcc && parseFloat(amount) > 0) {
      const baseAmount = parseFloat(amount);
      const useIndiaGstRpc =
        activeBusiness?.country === 'India' &&
        includeTax &&
        modalMode === 'add';

      let result;
      if (useIndiaGstRpc) {
        const mainAccountId = voucherKind === 'purchase' ? debitAcc : creditAcc;
        const counterpartyAccountId = voucherKind === 'purchase' ? creditAcc : debitAcc;
        result = await postGstJournal({
          date,
          description: desc,
          kind: voucherKind,
          mainAccountId,
          counterpartyAccountId,
          taxableBase: baseAmount,
          taxType,
          taxRate: Number(taxRate) || 0,
          hsnSac: hsnSac.trim() || null,
          placeOfSupply: placeOfSupply.trim() || null,
          itcEligible,
        });
      } else {
        const tax =
          includeTax && !useIndiaGstRpc
            ? {
                regime: activeBusiness?.country === 'India' ? 'GST' : 'TAX',
                type: taxType,
                rate: Number(taxRate) || 0,
                base: baseAmount,
                amount: Number(((baseAmount * (Number(taxRate) || 0)) / 100).toFixed(2)),
                ...(activeBusiness?.country === 'India'
                  ? {
                      kind: voucherKind,
                      hsn_sac: hsnSac.trim() || undefined,
                      place_of_supply: placeOfSupply.trim() || undefined,
                      itc_eligible: itcEligible,
                    }
                  : {}),
              }
            : null;

        const payload = {
          date,
          description: desc,
          debits: [{ accountId: debitAcc, amount: parseFloat(amount) }],
          credits: [{ accountId: creditAcc, amount: parseFloat(amount) }],
          ...(tax ? { tax } : {}),
        };

        result =
          modalMode === 'edit'
            ? await updateTransaction(selectedTx.id, payload)
            : await addTransaction(payload);
      }

      if (result.success) {
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

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, t) => {
    const date = t.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(t);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

  const symbol = activeBusiness?.currency === 'USD' ? '$' : activeBusiness?.currency === 'EUR' ? '€' : '₹';

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
      <div className="w-24 h-24 bg-surface border border-border rounded-full flex items-center justify-center text-text-secondary opacity-20">
        <Receipt size={48} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-text">No Journal Entries</h3>
        <p className="text-text-secondary text-sm max-w-xs mx-auto font-medium">
          Start recording your business transactions to see them plotted in this ledger.
        </p>
      </div>
      {userRole !== 'Viewer' && (
        <button
          onClick={openAddModal}
          className="btn-primary px-8 py-3.5 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20"
        >
          Post First Entry
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10 pb-20 px-4 md:px-6">


      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-inner">
               <Receipt size={24} />
             </div>
             <h2 className="text-4xl font-extrabold tracking-tight text-text">Journal Ledger</h2>
          </div>
          <p className="text-text-secondary font-medium text-sm max-w-md">
            Reviewing all double-entry records authenticated for <span className="text-text font-bold">{activeBusiness.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           {userRole !== 'Viewer' && (
             <button
               onClick={openAddModal}
               className="btn-primary flex items-center gap-3 px-6 py-4 font-black shadow-xl shadow-primary/20 w-full md:w-auto justify-center"
             >
               <Plus size={18} /> NEW ENTRY
             </button>
           )}
        </div>
      </div>

      {transactions.length === 0 ? emptyState : (
        <div className="space-y-12">
          {sortedDates.map(dateStr => (
            <div key={dateStr} className="space-y-6">
              {/* DATE HEADER */}
              <div className="flex items-center gap-4">
                <div className="px-4 py-1.5 bg-surface border border-border rounded-full flex items-center gap-2.5 shadow-sm">
                  <Calendar size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text">
                    {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="h-px flex-1 bg-border/50"></div>
              </div>

              {/* TRANSACTIONS FOR THIS DATE */}
              <div className="grid grid-cols-1 gap-6">
                {groupedTransactions[dateStr].map(t => (
                  <div key={t.id} className="group bg-surface border border-border rounded-[2.5rem] p-8 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
                       <div className="space-y-1">
                          <h3 className="text-lg font-bold text-text">{t.description}</h3>
                          <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest opacity-40">Entry: {t.id.substring(0, 8)}</p>
                       </div>
                       
                       {userRole !== 'Viewer' && (
                         <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openEditModal(t)}
                              className="p-3 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                              title="Edit Entry"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                if(window.confirm('Permanently delete this journal entry?')) {
                                  deleteTransaction(t.id);
                                }
                              }}
                              className="p-3 text-red-400 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
                              title="Delete Entry"
                            >
                              <Trash2 size={18} />
                            </button>
                         </div>
                       )}
                    </div>

                    {/* Ledger Body */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                       
                       {/* DEBITS */}
                       <div className="space-y-3">
                          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-4 pl-4 border-l-2 border-emerald-500/20">DEBIT ACCOUNTS</div>
                          {t.debits.map((d, i) => (
                            <div key={i} className="flex justify-between items-center bg-emerald-500/[0.03] p-4 rounded-2xl border border-emerald-500/10">
                               <span className="text-xs font-bold text-emerald-600 truncate mr-4">
                                  {getAccountName(d.accountId)}
                               </span>
                               <span className="text-sm font-black text-text tabular-nums">
                                  {symbol}{d.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                               </span>
                            </div>
                          ))}
                       </div>

                       {/* CREDITS */}
                       <div className="space-y-3">
                          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-500/60 mb-4 pl-4 border-l-2 border-rose-500/20 text-right md:text-left">CREDIT ACCOUNTS</div>
                          {t.credits.map((c, i) => (
                            <div key={i} className="flex justify-between items-center bg-rose-500/[0.03] p-4 rounded-2xl border border-rose-500/10 md:ml-8">
                               <span className="text-xs font-bold text-rose-600 truncate mr-4 italic">
                                  {getAccountName(c.accountId)}
                               </span>
                               <span className="text-sm font-black text-text tabular-nums">
                                  {symbol}{c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                               </span>
                            </div>
                          ))}
                       </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


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
                {modalMode === 'edit' ? <Edit size={28} /> : <Plus size={28} />}
              </div>
              <div>
                <h2 className="text-2xl font-black text-text uppercase">
                  {modalMode === 'edit' ? 'Edit Transaction' : 'Post Transaction'}
                </h2>
                <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">
                  {modalMode === 'edit' ? 'Update ledger entry' : 'Record double-entry journal'}
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
                    {activeBusiness?.country === 'India' && includeTax ? 'Taxable base (ex-GST)' : 'Amount'}
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

              {activeBusiness?.country === 'India' && (
                <div className="bg-bg border border-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                        Tax (GST)
                      </p>
                      <p className="text-xs text-text-secondary font-medium mt-1 leading-relaxed">
                        {modalMode === 'add'
                          ? 'New entries with GST use a server RPC to post balanced split tax lines and a normalized tax row (audit trail).'
                          : 'Tax fields on edit apply to simple single-line vouchers only.'}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                      <input
                        type="checkbox"
                        checked={includeTax}
                        onChange={(e) => setIncludeTax(e.target.checked)}
                      />
                      Include
                    </label>
                  </div>

                  {includeTax && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                          Voucher type
                        </label>
                        <select
                          value={voucherKind}
                          onChange={(e) => setVoucherKind(e.target.value)}
                          disabled={modalMode === 'edit'}
                          className="w-full bg-surface border border-border rounded-2xl p-4 text-text focus:outline-none focus:border-primary font-bold appearance-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="purchase">Purchase (Dr expense/stock · Cr creditor)</option>
                          <option value="sale">Sale (Dr debtor · Cr revenue)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                          GST type
                        </label>
                        <select
                          value={taxType}
                          onChange={(e) => setTaxType(e.target.value)}
                          className="w-full bg-surface border border-border rounded-2xl p-4 text-text focus:outline-none focus:border-primary font-bold appearance-none cursor-pointer"
                        >
                          <option value="IGST">IGST (inter-state)</option>
                          <option value="CGST_SGST">CGST + SGST (intra-state)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                          GST rate
                        </label>
                        <select
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          className="w-full bg-surface border border-border rounded-2xl p-4 text-text focus:outline-none focus:border-primary font-bold appearance-none cursor-pointer"
                        >
                          {['0', '5', '12', '18', '28'].map((r) => (
                            <option key={r} value={r}>
                              {r}%
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 text-xs text-text-secondary font-medium">
                        Computed tax: <span className="text-text font-bold tabular-nums">
                          {Number(((parseFloat(amount || '0') * (Number(taxRate) || 0)) / 100).toFixed(2)).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                          HSN / SAC (optional)
                        </label>
                        <input
                          type="text"
                          value={hsnSac}
                          onChange={(e) => setHsnSac(e.target.value)}
                          className="w-full bg-surface border border-border rounded-2xl p-4 text-text"
                          placeholder="e.g. 6204"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                          Place of supply (optional)
                        </label>
                        <input
                          type="text"
                          value={placeOfSupply}
                          onChange={(e) => setPlaceOfSupply(e.target.value)}
                          className="w-full bg-surface border border-border rounded-2xl p-4 text-text"
                          placeholder="State code or name"
                        />
                      </div>
                      <label className="col-span-2 flex items-center gap-2 text-xs font-bold text-text-secondary">
                        <input
                          type="checkbox"
                          checked={itcEligible}
                          onChange={(e) => setItcEligible(e.target.checked)}
                        />
                        ITC eligible (purchases)
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black">
                  Cancel
                </button>

                <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 text-xs font-black">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : (modalMode === 'edit' ? 'Save Changes' : 'Post Entry')}
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