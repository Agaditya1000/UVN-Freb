    import React from 'react';
    import { useNavigate } from "react-router-dom";
    import { useApp } from '../../contexts/AppContext';
    import { DollarSign, Landmark, Building2, TrendingUp, TrendingDown } from 'lucide-react';
    import Footer from '../../components/Footer';

    const Overview = () => {
      const { activeBusiness, accounts = [] } = useApp();
      const navigate = useNavigate();

      if (!activeBusiness) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text text-center">
            <Building2 size={64} className="text-text-secondary mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Active Business</h2>
            <p className="text-text-secondary">
              Please select or create a business profile from the navigation menu.
            </p>
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
                  { title: "Record Transaction", desc: "Add income or expense entry", icon: <DollarSign size={20} />, path: "transactions" },
                  { title: "Add Account", desc: "Create a new ledger account", icon: <Landmark size={20} />, path: "accounts" },
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