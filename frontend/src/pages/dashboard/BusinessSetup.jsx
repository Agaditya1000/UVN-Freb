import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

const BusinessSetup = () => {
  const { businesses, addBusiness } = useApp();
  
  const [name, setName] = useState('');
  const [country, setCountry] = useState('USA');
  const [currency, setCurrency] = useState('USD');
  const [taxId, setTaxId] = useState('');
  
  const [msg, setMsg] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if(!name || !taxId) {
      setMsg("Please provide all required fields.");
      return;
    }
    addBusiness({ name, country, currency, taxId });
    setMsg("Business context added successfully.");
    setName('');
    setTaxId('');
  };

  const taxLabel = currency === 'USD' ? 'EIN' : currency === 'EUR' ? 'VAT' : 'GST';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b-[1.75px] border-borderDark pb-4">
        <h1 className="text-3xl font-medium tracking-heading text-white">Business Setup</h1>
        <p className="text-grayText font-light mt-1 text-sm">Manage organizations or provision new entities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="panel p-6 sm:p-8 anim-fade-up">
          <h2 className="text-xl font-medium tracking-heading mb-6 border-b-[1.75px] border-borderDark pb-2 inline-block">Create New Business</h2>
          
          {msg && <div className={`p-3 mb-6 border-[1.75px] text-sm text-center ${msg.includes('successfully') ? 'border-success text-success bg-black' : 'border-error text-error bg-black'}`}>{msg}</div>}

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">Business Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light" 
                placeholder="Enter registered name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">Region Context</label>
                <select 
                  value={country} 
                  onChange={e => {
                    setCountry(e.target.value);
                    setCurrency(e.target.value === 'USA' ? 'USD' : e.target.value === 'EU' ? 'EUR' : 'INR');
                  }} 
                  className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light appearance-none"
                >
                  <option value="USA">USA (GAAP)</option>
                  <option value="EU">EU (IFRS)</option>
                  <option value="India">India (IND-AS)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">Base Currency</label>
                <select 
                  value={currency} 
                  onChange={e => setCurrency(e.target.value)} 
                  className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light appearance-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium tracking-heading mb-1.5 text-lightWhite">{taxLabel}</label>
              <input 
                type="text" 
                value={taxId} 
                onChange={e => setTaxId(e.target.value)} 
                className="w-full bg-black border-[1.75px] border-borderDark p-3 text-white focus:outline-none focus:border-accent font-light uppercase" 
                placeholder={`Enter ${taxLabel}`}
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-2">Provision Entity</button>
          </form>
        </div>

        <div className="panel p-6 sm:p-8 anim-fade-up anim-delay-1 h-fit">
          <h2 className="text-xl font-medium tracking-heading mb-6 border-b-[1.75px] border-borderDark pb-2 inline-block">Managed Entities</h2>
          
          <div className="space-y-4">
            {businesses.map(b => (
              <div key={b.id} className="p-4 border-[1.75px] border-borderDark bg-black hover:border-accent transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-white tracking-heading">{b.name}</h3>
                  <div className="teal-badge text-[0.65rem] py-0.5">{b.country}</div>
                </div>
                <div className="text-sm font-light text-grayText">Currency: <span className="text-lightWhite">{b.currency}</span></div>
                <div className="text-sm font-light text-grayText">Tax ID: <span className="text-lightWhite uppercase">{b.taxId}</span></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BusinessSetup;
