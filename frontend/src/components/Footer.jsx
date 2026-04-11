import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface py-16 px-8 md:px-24 border-t border-border mt-20 rounded-t-[3rem]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
         <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-primary text-white flex items-center justify-center rounded-xl font-bold italic tracking-tighter shadow-xl shadow-primary/40 border border-white/10 shrink-0">UV</div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl tracking-tight text-text leading-tight">UV Netware</span>
                <span className="text-primary font-black text-sm tracking-[0.3em] uppercase">Utilities</span>
              </div>
            </div>
            <p className="text-text-secondary max-w-sm font-medium text-lg leading-relaxed opacity-90">
               The unified system of record for the next generation of agile enterprises. Multi-standard, multi-tenant.
            </p>
         </div>
         <div>
            <h4 className="font-black text-[11px] mb-8 uppercase tracking-[0.3em] text-text border-l-4 border-primary pl-4">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-text-secondary">
               <li><Link to="/dashboard" className="hover:text-primary transition-colors">Infrastructure</Link></li>
               <li><Link to="/dashboard/accounts" className="hover:text-primary transition-colors">API Reference</Link></li>
               <li><Link to="/dashboard/balance-sheet" className="hover:text-primary transition-colors">Status Board</Link></li>
            </ul>
         </div>
         <div>
            <h4 className="font-black text-[11px] mb-8 uppercase tracking-[0.3em] text-text border-l-4 border-primary pl-4">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-text-secondary">
               <li><Link to="#" className="hover:text-primary transition-colors">Privacy Council</Link></li>
               <li><Link to="#" className="hover:text-primary transition-colors">Terms of Utility</Link></li>
            </ul>
         </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-text-secondary font-black uppercase tracking-[0.25em] gap-6">
        <span>© 2026 UV NETWARE UTILITIES. ENGINEERED FOR SUPREMACY.</span>
        <div className="flex items-center gap-3 px-4 py-2 bg-bg border border-border rounded-full">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> 
           <span className="text-text tracking-[0.3em]">Network Active</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
