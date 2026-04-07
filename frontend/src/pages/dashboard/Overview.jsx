import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { DollarSign, Landmark, Building2, TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, amount, icon, isPositive, currency }) => (
  <div className="panel p-6 anim-fade-up">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-grayText text-sm font-light tracking-heading uppercase mb-1">{title}</p>
        <h3 className="text-2xl font-medium text-white tracking-heading">
          {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹'}
          {amount.toLocaleString()}
        </h3>
      </div>
      <div className={`p-2 rounded bg-black border-[1.75px] ${isPositive ? 'border-success text-success' : isPositive === false ? 'border-error text-error' : 'border-borderDark text-accent'}`}>
        {icon}
      </div>
    </div>
    {isPositive !== undefined && (
      <div className={`text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-success' : 'text-error'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{isPositive ? '+12.5%' : '-4.2%'} from last month</span>
      </div>
    )}
  </div>
);

const Overview = () => {
  const { activeBusiness, accounts } = useApp();

  if (!activeBusiness) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Building2 size={64} className="text-borderDark mb-4" />
        <h2 className="text-2xl font-medium tracking-heading mb-2">No Active Business</h2>
        <p className="text-grayText font-light">Please select or create a business profile from the navigation menu.</p>
      </div>
    );
  }

  const totalAssets = accounts.filter(a => a.category === 'Asset').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.category === 'Liability').reduce((sum, a) => sum + a.balance, 0);
  const totalRevenue = accounts.filter(a => a.category === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accounts.filter(a => a.category === 'Expense').reduce((sum, a) => sum + a.balance, 0);
  
  const netIncome = totalRevenue - totalExpenses;



  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b-[1.75px] border-borderDark pb-4">
        <div>
          <h1 className="text-3xl font-medium tracking-heading text-white">Financial Overview</h1>
          <p className="text-grayText font-light mt-1 text-sm">Real-time snapshot for {activeBusiness.name}</p>
        </div>
        <div className="teal-badge relative top-0">{activeBusiness.country} Region</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Assets" amount={totalAssets} icon={<Landmark size={20} />} currency={activeBusiness.currency} />
        <MetricCard title="Total Liabilities" amount={totalLiabilities} icon={<DollarSign size={20} />} isPositive={false} currency={activeBusiness.currency} />
        <MetricCard title="Total Revenue" amount={totalRevenue} icon={<TrendingUp size={20} />} isPositive={true} currency={activeBusiness.currency} />
        <MetricCard title="Net Income" amount={netIncome} icon={<DollarSign size={20} />} isPositive={netIncome >= 0} currency={activeBusiness.currency} />
      </div>

      <div className="panel p-8 mt-8 border-t-[1.75px] border-accent anim-fade-up anim-delay-2">
        <h3 className="text-xl font-medium tracking-heading mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary text-sm shrink-0">Record Transaction</button>
          <button className="btn-ghost text-sm shrink-0">Add Account</button>
          <button className="btn-ghost text-sm shrink-0">Generate Balance Sheet</button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
