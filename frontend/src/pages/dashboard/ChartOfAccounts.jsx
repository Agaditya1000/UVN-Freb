import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Plus, Building2, ShieldAlert, Users, TrendingUp, 
  CreditCard, ChevronDown, Landmark, Calendar, Clock,
  Search, Filter, MoreVertical, Loader2, CheckCircle2,
  AlertCircle, X, Edit, Trash2, ShieldCheck, History
} from 'lucide-react';
import Footer from '../../components/Footer';

const ChartOfAccounts = () => {
  const { activeBusiness, accounts, addAccount, updateAccount, deleteAccount, userRole } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'delete'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [newAccntCode, setNewAccntCode] = useState('');
  const [newAccntName, setNewAccntName] = useState('');
  const [newAccntCat, setNewAccntCat] = useState('Asset');
  const [newAccntGroup, setNewAccntGroup] = useState('Current Assets');
  const [newAccntSubCat, setNewAccntSubCat] = useState('Cash at Bank');
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedAccount(null);
    setNewAccntCode('');
    setNewAccntName('');
    setNewAccntCat('Asset');
    setNewAccntSubCat('Current Asset');
    setShowModal(true);
  };

  const openEditModal = (acc) => {
    // Determine the group by searching subCatMap
    let groupMatch = Object.keys(subCatMap[acc.category] || {}).find(g => 
      subCatMap[acc.category][g].includes(acc.sub_category)
    ) || Object.keys(subCatMap[acc.category] || {})[0];

    setModalMode('edit');
    setSelectedAccount(acc);
    setNewAccntCode(acc.id);
    setNewAccntName(acc.name);
    setNewAccntCat(acc.category);
    setNewAccntGroup(groupMatch);
    setNewAccntSubCat(acc.sub_category);
    setShowModal(true);
  };

  const openDeleteModal = (acc) => {
    setModalMode('delete');
    setSelectedAccount(acc);
    setShowModal(true);
  };

  const isEditable = (createdAt) => {
    if (!createdAt) return true; // For local/unsaved items
    const createdDate = new Date(createdAt);
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    return (currentTime - createdDate) < thirtyDaysInMs;
  };

  const getDaysRemaining = (createdAt) => {
    if (!createdAt) return 30;
    const createdDate = new Date(createdAt);
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const remaining = thirtyDaysInMs - (currentTime - createdDate);
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormMsg({ type: '', text: '' });

    if (modalMode === 'delete') {
      const { success, error } = await deleteAccount(selectedAccount.id, activeBusiness.id);
      if (success) {
        setFormMsg({ type: 'success', text: 'Account successfully removed from ledger.' });
        setTimeout(() => setShowModal(false), 1500);
      } else {
        setFormMsg({ type: 'error', text: error?.message || error || 'Deletion failed.' });
      }
    } else {
      const accountData = { 
        id: newAccntCode, 
        name: newAccntName, 
        category: newAccntCat,
        sub_category: newAccntSubCat,
        business_id: activeBusiness.id
      };

      const result = modalMode === 'add' 
        ? await addAccount(accountData)
        : await updateAccount(selectedAccount.id, activeBusiness.id, accountData);
      
      if(result.success) {
        setFormMsg({ type: 'success', text: `Account successfully ${modalMode === 'add' ? 'created' : 'updated'}.` });
        setTimeout(() => setShowModal(false), 1500);
      } else {
        const errorDetail = result.error?.message || (typeof result.error === 'string' ? result.error : 'Conflict detected in ledger update');
        setFormMsg({ type: 'error', text: errorDetail });
      }
    }
    setLoading(false);
  };

  if (!activeBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-surface border border-border rounded-3xl animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
          <Landmark size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Portfolio Context Required</h2>
        <p className="max-w-xs text-text-secondary font-medium">Select a business unit to manage your organizational ledger and chart of accounts.</p>
      </div>
    );
  }

  const subCatMap = {
    'Asset': {
      'Current Assets': ['Cash at Hand', 'Cash at Bank', 'Accounts Receivable', 'Reserve for Bad Debt', 'Stock/Inventory', 'Prepaid Expenses', 'Notes Receivable'],
      'Fixed Assets': ['Plant & Machinery', 'Land & Buildings', 'Furniture & Fixtures', 'Other Fixed Assets'],
      'Other Assets': ['Other Assets']
    },
    'Liability': {
      'Current Liabilities': ['Accounts Payable', 'Sales Taxes Payable', 'Payroll Taxes Payable', 'Income Taxes Payable', 'Accrued Wages Payable', 'Unearned Revenues', 'Bank Overdraft', 'Short-Term Loan Payable'],
      'Long-Term Liabilities': ['Long-term Bank Loans', 'Mortgage Payable', 'Debentures']
    },
    'Equity': {
      'Capital & Reserves': ['Equity Share holder fund', 'Preference share holder fund', 'Reserve and surplus', 'Drawings', 'Retained Earnings']
    },
    'Revenue': {
      'Direct Income': ['Direct Revenue', 'Service Income'],
      'Indirect Income': ['Interest Received', 'Discount Received', 'Commission Received', 'Other Revenue']
    },
    'Expense': {
      'Direct Expenses': ['Purchases', 'Carriage Inward', 'Manufacturing Wages', 'Direct Expense'],
      'Indirect Expenses': ['Salaries', 'Rent', 'Electricity', 'Printing & Stationery', 'Insurance', 'Depreciation', 'Finance Cost', 'Tax']
    }
  };

  const categoryIcons = {
    'Asset': <Building2 size={24} />,
    'Liability': <ShieldAlert size={24} />,
    'Equity': <Users size={24} />,
    'Revenue': <TrendingUp size={24} />,
    'Expense': <CreditCard size={24} />
  };

  const categoryColors = {
    'Asset': 'primary',
    'Liability': 'amber-500',
    'Equity': 'emerald-500',
    'Revenue': 'indigo-500',
    'Expense': 'rose-500'
  };

  const categories = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
  const symbol = activeBusiness.currency === 'USD' ? '$' : activeBusiness.currency === 'EUR' ? '€' : '₹';

  return (
    <div className="max-w-screen-2xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Landmark size={24} />
            </div>
            <h1 className="text-4xl font-extrabold text-text tracking-tight">Chart of Accounts</h1>
          </div>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-bold text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full pulse"></span>
              <span className="uppercase tracking-widest text-[10px]">{activeBusiness.name} Unit</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={openAddModal} 
          className="btn-primary flex items-center gap-3 py-4 px-8 text-sm font-black shadow-xl shadow-primary/20"
        >
          <Plus size={20} />
          PROVISION NEW ACCOUNT
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-12">
        {categories.map(cat => {
          const accs = accounts.filter(a => a.category === cat);
          if(accs.length === 0) return null;

          const color = categoryColors[cat];

          return (
            <div key={cat} className="animate-in fade-in slide-in-from-left duration-500">
              <div className="flex items-center justify-between mb-6 group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-${color}/10 text-${color} rounded-2xl flex items-center justify-center shadow-lg shadow-${color}/5 group-hover:scale-110 transition-transform duration-300`}>
                    {categoryIcons[cat]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-text uppercase tracking-tight">{cat}s</h3>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Operational Classification</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 bg-${color}/10 border border-${color}/20 rounded-full text-[10px] font-black text-${color} uppercase tracking-widest`}>
                  {accs.length} Ledgers Active
                </div>
              </div>

              <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg text-[10px] uppercase font-black tracking-widest text-text-secondary border-b border-border">
                        <th className="px-8 py-5 w-32">Unique Code</th>
                        <th className="px-8 py-5">Account Descriptor</th>
                        <th className="px-8 py-5 w-56">Sub-Classification</th>
                        <th className="px-8 py-5 text-right w-56">Liquid Balance</th>
                        <th className="px-8 py-5 text-right w-48">Lifecycle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {accs.map(acc => {
                        const editable = isEditable(acc.created_at);
                        const daysRemaining = getDaysRemaining(acc.created_at);

                        return (
                          <tr key={acc.id} className="group hover:bg-bg/50 transition-colors">
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-surface border border-border rounded-lg text-xs font-black text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                {acc.id}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-extrabold text-text group-hover:text-primary transition-colors">{acc.name}</span>
                                <span className="text-[10px] font-medium text-text-secondary">Verified Ledger Account</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-xs font-bold text-text-secondary bg-surface/50 px-3 py-1 rounded-full border border-border/50">
                                {acc.sub_category}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex flex-col items-end">
                                 <span className="text-lg font-black text-text tabular-nums tracking-tighter">
                                   {symbol}{Math.abs(acc.balance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                 </span>
                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Basis</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               {userRole !== 'Viewer' ? (
                                 editable ? (
                                   <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => openEditModal(acc)}
                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title={`Editable for ${daysRemaining} more days`}
                                      >
                                        <Edit size={18} />
                                      </button>
                                      <button 
                                        onClick={() => openDeleteModal(acc)}
                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Delete record"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                   </div>
                                 ) : (
                                   <div className="flex items-center justify-end gap-2 text-text-secondary" title="Audit Locked: Permanent Ledger Record">
                                      <ShieldCheck size={18} className="opacity-40" />
                                      <span className="text-[9px] font-black uppercase tracking-[0.1em]">Locked</span>
                                   </div>
                                 )
                               ) : (
                                 <div className="flex items-center justify-end gap-2 text-text-secondary">
                                    <ShieldCheck size={18} className="opacity-40" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em]">View Only</span>
                                 </div>
                               )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Modal (Provision/Update/Delete) */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-6 z-[9999] animate-in fade-in duration-300 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-surface border border-border p-10 w-full max-w-xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 my-auto">
            {/* Background design */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
            
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 p-3 bg-bg border border-border rounded-2xl text-text-secondary hover:text-text hover:bg-surface transition-all active:scale-95 z-50 cursor-pointer shadow-sm group"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-5 mb-10">
              <div className={`w-14 h-14 ${modalMode === 'delete' ? 'bg-rose-50 text-rose-500' : 'bg-primary/10 text-primary'} rounded-2xl flex items-center justify-center`}>
                {modalMode === 'delete' ? <Trash2 size={28} /> : modalMode === 'edit' ? <Edit size={28} /> : <Landmark size={28} />}
              </div>
              <div>
                <h2 className="text-2xl font-black text-text tracking-tight uppercase">
                  {modalMode === 'delete' ? 'Remove Record' : modalMode === 'edit' ? 'Update Ledger' : 'Provision Ledger'}
                </h2>
                <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">
                  {modalMode === 'delete' ? 'Permanent Deletion Action' : 'Modify financial account structure'}
                </p>
              </div>
            </div>

            {formMsg.text && (
              <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${
                formMsg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
              }`}>
                {formMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <p className="text-xs font-black uppercase tracking-widest">{formMsg.text}</p>
              </div>
            )}

            {modalMode === 'delete' ? (
              <div className="space-y-10">
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl space-y-3">
                   <p className="text-rose-900 font-bold text-sm leading-relaxed">
                     Are you sure you want to remove <span className="underline decoration-2">{selectedAccount?.name}</span> ({selectedAccount?.id})?
                   </p>
                   <p className="text-rose-700/60 text-xs font-medium"> This action will permanently remove the account from the chart of accounts and cannot be undone.</p>
                </div>
                <div className="flex gap-4">
                   <button 
                     onClick={() => setShowModal(false)}
                     className="flex-1 py-4 text-xs font-black text-text-secondary uppercase tracking-widest hover:text-text"
                   >
                     Abort Action
                   </button>
                   <button 
                     onClick={handleAction}
                     disabled={loading}
                     className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all"
                   >
                     {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Deletion'}
                   </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAction} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Account Code</label>
                    <input 
                      type="text" 
                      value={newAccntCode} 
                      onChange={e=>setNewAccntCode(e.target.value)} 
                      className="w-full bg-bg border border-border rounded-2xl p-4 text-text focus:outline-none focus:border-primary font-bold shadow-inner placeholder:text-text-secondary/20" 
                      required 
                      disabled={modalMode === 'edit'}
                      placeholder="e.g. 1001" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Classification</label>
                    <div className="relative">
                      <select 
                        value={newAccntCat} 
                        onChange={e=>{
                          const cat = e.target.value;
                          const firstGroup = Object.keys(subCatMap[cat])[0];
                          setNewAccntCat(cat); 
                          setNewAccntGroup(firstGroup);
                          setNewAccntSubCat(subCatMap[cat][firstGroup][0]);
                        }} 
                        className="w-full bg-bg border border-border rounded-2xl p-4 text-text focus:outline-none focus:border-primary font-bold appearance-none cursor-pointer"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Account Descriptor</label>
                  <input 
                    type="text" 
                    value={newAccntName} 
                    onChange={e=>setNewAccntName(e.target.value)} 
                    className="w-full bg-bg border border-border rounded-2xl p-4 text-text focus:outline-none focus:border-primary font-bold shadow-inner placeholder:text-text-secondary/20" 
                    required 
                    placeholder="e.g. Operational Cash Reserve" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Account Group</label>
                    <div className="relative">
                      <select 
                        value={newAccntGroup} 
                        onChange={e => {
                          const group = e.target.value;
                          setNewAccntGroup(group);
                          setNewAccntSubCat(subCatMap[newAccntCat][group][0]);
                        }} 
                        className="w-full bg-bg border border-border rounded-2xl p-4 text-text focus:outline-none focus:border-primary font-bold appearance-none cursor-pointer"
                      >
                        {Object.keys(subCatMap[newAccntCat]).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Sub-Heading</label>
                    <div className="relative">
                      <select 
                        value={newAccntSubCat} 
                        onChange={e => setNewAccntSubCat(e.target.value)} 
                        className="w-full bg-bg border border-border rounded-2xl p-4 text-text focus:outline-none focus:border-primary font-bold appearance-none cursor-pointer"
                      >
                        {(subCatMap[newAccntCat]?.[newAccntGroup] || []).map(sc => <option key={sc} value={sc}>{sc}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" size={16} />
                    </div>
                  </div>
                </div>

                {modalMode === 'edit' && (
                  <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                     <History size={16} className="text-primary" />
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                       Revision authorized for {getDaysRemaining(selectedAccount?.created_at)} more days.
                     </p>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="flex-1 py-4 text-xs font-black text-text-secondary uppercase tracking-[0.2em] hover:text-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-primary flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : modalMode === 'add' ? 'Provision Account' : 'Commit Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ChartOfAccounts;

