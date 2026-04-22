    import React from 'react';
    import { useNavigate } from "react-router-dom";
    import { useApp } from '../../contexts/AppContext';
    import { DollarSign, Landmark, Building2, TrendingUp, TrendingDown } from 'lucide-react';
    import Footer from '../../components/Footer';

    const Overview = () => {
      const { activeBusiness, accounts = [], userRole } = useApp();
      const navigate = useNavigate();

      if (!activeBusiness) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text text-center p-6 bg-gradient-to-b from-bg to-surface/30">
            <div className="w-28 h-28 bg-white border border-border rounded-[2.5rem] flex items-center justify-center text-primary mb-8 shadow-2xl shadow-primary/10 relative">
              <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] animate-pulse"></div>
              <Building2 size={56} className="relative z-10" />
            </div>
            
            <h2 className="text-4xl font-extrabold mb-4 tracking-tighter text-text">Initialize Your Workspace</h2>
            <p className="text-text-secondary max-w-sm mx-auto font-medium mb-12 leading-relaxed text-lg">
              Welcome to the elite financial engine. To begin managing your utilities, you must first establish your business profile.
            </p>
            
            {userRole === 'Owner' ? (
              <button 
                onClick={() => navigate('/dashboard/business')}
                className="group relative px-10 py-5 bg-primary text-white font-bold rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <Building2 size={22} />
                  <span className="uppercase tracking-[0.2em] text-xs">Establish First Business</span>
                </div>
              </button>
            ) : (
                <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="w-12 h-1 border-t-2 border-primary/20 mb-2"></div>
                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.3em] opacity-60">
                        Synchronizing Collaborative Workspace...
                    </p>
                </div>
            )}
            
            <div className="mt-16 pt-8 border-t border-border/50 w-full max-w-xs opacity-40">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">UV Netware Security Enforcement</p>
            </div>
          </div>
        );
      }

      const totalAssets = accounts.filter(a => a.category === 'Asset').reduce((sum, a) => sum + a.balance, 0);
      const totalLiabilities = accounts.filter(a => a.category === 'Liability').reduce((sum, a) => sum + a.balance, 0);
      const totalRevenue = accounts.filter(a => a.category === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
      const totalExpenses = accounts.filter(a => a.category === 'Expense').reduce((sum, a) => sum + a.balance, 0);
      const netIncome = totalRevenue - totalExpenses;

    const MetricCard = ({ title, amount, icon, desc, isPositive }) => (
      <div className="group p-6 bg-gradient-to-br from-bg to-surface border border-border rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">

        {/* subtle glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition"></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
          
          <div>
            <p className="text-text-secondary text-[11px] font-bold uppercase tracking-widest mb-2">
              {title}
            </p>

            <h3 className="text-3xl font-bold text-text tracking-tight">
              {activeBusiness.currency === 'USD' ? '$' : activeBusiness.currency === 'EUR' ? '€' : '₹'}
              {amount.toLocaleString()}
            </h3>

            <p className="text-xs text-text-secondary mt-2 leading-relaxed max-w-[220px]">
              {desc}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110">
            {icon}
          </div>
        </div>

        {isPositive !== undefined && (
          <div className={`text-xs flex items-center gap-1 font-medium ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
          
          </div>
        )}
      </div>
    );

      return (
        <div className="min-h-screen bg-bg text-text">

          <div className="max-w-6xl mx-auto space-y-10 px-6 py-10">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Financial Overview</h1>
                <p className="text-text-secondary mt-2 text-lg md:text-xl font-semibold tracking-wide">
                  Real-time financial snapshot for {activeBusiness.name}
                </p>
              </div>

              <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
                {activeBusiness.country} Region
              </div>
            </div>

            {/* ✅ METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              
              <MetricCard 
                title="Total Assets"
                amount={totalAssets}
                icon={<Landmark size={20} />}
                desc="Total value of all assets owned by your business including cash and accounts."
              />

              <MetricCard 
                title="Total Liabilities"
                amount={totalLiabilities}
                icon={<DollarSign size={20} />}
                desc="Total outstanding obligations and dues payable by your business."
                isPositive={false}
              />

              <MetricCard 
                title="Total Revenue"
                amount={totalRevenue}
                icon={<TrendingUp size={20} />}
                desc="Total income generated from all business operations over time."
                isPositive={true}
              />

              <MetricCard 
                title="Net Income"
                amount={netIncome}
                icon={<DollarSign size={20} />}
                desc="Net profit after deducting all expenses from total revenue."
                isPositive={netIncome >= 0}
              />

            </div>

            {/* QUICK ACTIONS */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  ...(userRole !== 'Viewer' ? [
                    { title: "Record Transaction", desc: "Add income or expense entry", icon: <DollarSign size={20} />, path: "transactions" },
                    { title: "Add Account", desc: "Create a new ledger account", icon: <Landmark size={20} />, path: "accounts" }
                  ] : []),
                  { title: "Balance Sheet", desc: "Generate reports", icon: <TrendingUp size={20} />, path: "balance-sheet" }
                ].map((item, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(item.path)}
                    className="p-5 bg-surface border border-border rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-bold text-text">{item.title}</p>
                        <p className="text-xs text-text-secondary">{item.desc}</p>
                      </div>
                    </div>
                    <span className="text-text-secondary">→</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <Footer />

        </div>
      );
    };

    export default Overview;