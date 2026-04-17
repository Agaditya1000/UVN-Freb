import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface py-12 px-6 md:px-12 border-t border-border mt-auto w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-12">
         <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-lg font-bold italic tracking-tighter shadow-lg shadow-primary/30 border border-white/10 shrink-0">UV</div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-text leading-tight">UV Netware</span>
                <span className="text-primary font-black text-xs tracking-[0.2em] uppercase">Utilities</span>
              </div>
            </div>
            <p className="text-text-secondary font-medium text-sm leading-relaxed opacity-90">
               The unified system of record for the next generation of agile enterprises. Multi-standard, multi-tenant.
            </p>
         </div>
        
         <div className="flex gap-16 md:justify-end">
            <div>
               <h4 className="font-black text-[10px] mb-4 uppercase tracking-[0.2em] text-text border-l-2 border-primary pl-3">Legal</h4>
               <ul className="space-y-2 text-sm font-semibold text-text-secondary">
                  <li><Link to="#" className="hover:text-primary transition-colors">Privacy Council</Link></li>
                  <li><Link to="#" className="hover:text-primary transition-colors">Terms of Utility</Link></li>
               </ul>
            </div>
         </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-text-secondary font-bold uppercase tracking-widest gap-4">
        <span>© 2026 UV NETWARE UTILITIES. ENGINEERED FOR SUPREMACY.</span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg border border-border rounded-full shadow-sm">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> 
           <span className="text-text font-black tracking-[0.15em]">Network Active</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
