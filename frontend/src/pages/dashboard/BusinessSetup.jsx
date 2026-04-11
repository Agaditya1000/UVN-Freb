import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Building2, ChevronDown } from 'lucide-react';

const BusinessSetup = () => {
  const { businesses, addBusiness } = useApp();
  
  const [name, setName] = useState('');
  const [country, setCountry] = useState('USA');
  const [currency, setCurrency] = useState('USD');
  const [taxId, setTaxId] = useState('');
  const [finYear, setFinYear] = useState('Jan-Dec');
  
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if(!name || !taxId) {
      setMsg("Please provide all required fields.");
      return;
    }
    
    setLoading(true);
    setMsg('');
    setErrorDetail('');
    
    // Map to exact Supabase column names
    const result = await addBusiness({ 
      name, 
      country, 
      currency, 
      tax_id: taxId,
      financial_year: finYear
    });
    
    setLoading(false);
    
    if (result && result.success) {
      setMsg("Business context provisioned securely.");
      setName('');
      setTaxId('');
      setFinYear('Jan-Dec');
    } else {
      const stageLabel =
        result?.stage === 'create_business'
          ? 'Creating business'
          : result?.stage === 'map_business_user'
            ? 'Linking you to the business'
            : 'Provisioning';
      const message =
        typeof result?.error === 'string'
          ? result.error
          : result?.error?.message || result?.error?.hint || 'Unknown error';

      setMsg("Error provisioning entity. Ensure you have the right permissions.");
      setErrorDetail(`${stageLabel} failed: ${message}`);
    }
  };

  const taxLabel = currency === 'USD' ? 'EIN' : currency === 'EUR' ? 'VAT' : 'GST';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="border-b border-border pb-6 flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text">Business Unit Management</h1>
          <p className="text-text-secondary font-medium mt-1 text-sm">Provision new operational entities or manage existing registered units.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        <div className="bg-surface border border-border p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <h2 className="text-xl font-bold text-text mb-8">Provision New Unit</h2>
          
          {msg && (
            <div
              className={`p-4 mb-8 border rounded-2xl text-xs font-black uppercase text-center tracking-widest ${
                msg.includes('provisioned') ? 'border-emerald-100 text-emerald-600 bg-emerald-50' : 'border-red-100 text-red-600 bg-red-50'
              }`}
            >
              {msg}
              {!msg.includes('provisioned') && errorDetail && (
                <div className="mt-2 normal-case font-semibold tracking-normal text-[11px] opacity-90">
                  {errorDetail}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Unit Legal Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-bg border border-border rounded-xl p-4 text-text focus:outline-none focus:border-primary font-bold shadow-inner placeholder:text-text-secondary/30" 
                placeholder="e.g. UV Holdings Ltd."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Region Context</label>
                <div className="relative">
                  <select 
                    value={country} 
                    onChange={e => {
                      setCountry(e.target.value);
                      setCurrency(e.target.value === 'USA' ? 'USD' : e.target.value === 'EU' ? 'EUR' : 'INR');
                    }} 
                    className="w-full bg-bg border border-border rounded-xl p-4 text-text focus:outline-none focus:border-primary font-bold appearance-none cursor-pointer"
                  >
                    <option value="USA">USA (GAAP)</option>
                    <option value="EU">EU (IFRS)</option>
                    <option value="India">India (IND-AS)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" size={16} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Base Currency</label>
                <div className="relative">
                  <select 
                    value={currency} 
                    onChange={e => setCurrency(e.target.value)} 
                    className="w-full bg-bg border border-border rounded-xl p-4 text-text focus:outline-none focus:border-primary font-bold appearance-none cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" size={16} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">{taxLabel}</label>
                <input 
                  type="text" 
                  value={taxId} 
                  onChange={e => setTaxId(e.target.value)} 
                  className="w-full bg-bg border border-border rounded-xl p-4 text-text focus:outline-none focus:border-primary font-bold uppercase shadow-inner placeholder:text-text-secondary/30" 
                  placeholder={`Enter ${taxLabel}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Financial Year</label>
                <div className="relative">
                  <select 
                    value={finYear} 
                    onChange={e => setFinYear(e.target.value)} 
                    className="w-full bg-bg border border-border rounded-xl p-4 text-text focus:outline-none focus:border-primary font-bold appearance-none cursor-pointer"
                  >
                    <option value="Jan-Dec">Jan - Dec</option>
                    <option value="Apr-Mar">Apr - Mar</option>
                    <option value="Jul-Jun">Jul - Jun</option>
                    <option value="Oct-Sep">Oct - Sep</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" size={16} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 disabled:opacity-50">
              {loading ? 'Provisioning...' : 'Provision Business Unit'}
            </button>
          </form>
        </div>

        <div className="bg-surface border border-border p-8 rounded-3xl shadow-sm h-fit">
          <h2 className="text-xl font-bold text-text mb-8">Registered Business Units</h2>
          
          {businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-3xl bg-bg/50">
              <Building2 size={40} className="text-text-secondary/20 mb-4" />
              <p className="text-text-secondary font-bold text-xs uppercase tracking-widest">No units provisioned yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {businesses.map(b => (
                <div key={b.id} className="p-5 border border-border bg-bg hover:border-primary transition-all rounded-2xl group cursor-default">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-extrabold text-text tracking-tight group-hover:text-primary transition-colors">{b.name}</h3>
                    <div className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{b.country}</div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">
                    <span>{b.currency} Registry</span>
                    <span className="w-1 h-1 bg-border rounded-full self-center"></span>
                    <span>FY: {b.financial_year}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50 text-xs font-bold text-text-secondary">
                    Tax Identity: <span className="text-text ml-1 uppercase">{b.tax_id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BusinessSetup;
