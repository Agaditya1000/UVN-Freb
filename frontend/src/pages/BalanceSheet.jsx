import React, { useMemo, useState } from 'react';

const BALANCE_SHEET_TEMPLATE = {
  assets: [
    {
      id: 'current_assets',
      title: 'Current Assets',
      totalLabel: 'Total Current Assets',
      fields: [
        'Cash at Hand',
        'Cash at Bank',
        'Accounts Receivable',
        'Less: Reserve for Bad Debts',
        'Stock',
        'Prepaid Expenses',
        'Notes Receivable',
      ],
    },
    {
      id: 'fixed_assets',
      title: 'Fixed Assets',
      totalLabel: 'Total Fixed Assets',
      fields: [
        'Vehicles',
        'Less: Accumulated Depreciation - Vehicles',
        'Furniture and Fixtures',
        'Less: Accumulated Depreciation - Furniture',
        'Equipment',
        'Less: Accumulated Depreciation - Equipment',
        'Buildings',
        'Less: Accumulated Depreciation - Buildings',
        'Land',
      ],
    },
    {
      id: 'other_assets',
      title: 'Other Assets',
      totalLabel: 'Total Other Assets',
      fields: ['Goodwill'],
    },
  ],
  liabilitiesEquity: [
    {
      id: 'current_liabilities',
      title: 'Current Liabilities',
      totalLabel: 'Total Current Liabilities',
      fields: [
        'Accounts Payable',
        'Sales Taxes Payable',
        'Payroll Taxes Payable',
        'Income Taxes Payable',
        'Accrued Wages Payable',
        'Unearned Revenues',
        'Bank Overdraft',
        'Short-Term Loan Payable',
      ],
    },
    {
      id: 'long_term_liabilities',
      title: 'Long-Term Liabilities',
      totalLabel: 'Total Long-Term Liabilities',
      fields: ['Long-Term Bank Loans Payable', 'Mortgage Payable'],
    },
    {
      id: 'capital_reserves',
      title: 'Capital and Reserves',
      totalLabel: 'Net Capital',
      fields: ['Capital', 'Add: Net Profit', 'Less: Drawings'],
    },
  ],
};

const makeFieldKey = (sectionId, fieldLabel) =>
  `${sectionId}__${fieldLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

const buildInitialState = () => {
  const initial = {};

  Object.values(BALANCE_SHEET_TEMPLATE).forEach((columnSections) => {
    columnSections.forEach((section) => {
      section.fields.forEach((field) => {
        initial[makeFieldKey(section.id, field)] = '';
      });
    });
  });

  return initial;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0);

function BalanceSheet() {
  const [values, setValues] = useState(buildInitialState);

  const sectionTotals = useMemo(() => {
    const totals = {};

    Object.values(BALANCE_SHEET_TEMPLATE).forEach((columnSections) => {
      columnSections.forEach((section) => {
        totals[section.id] = section.fields.reduce((acc, field) => {
          const key = makeFieldKey(section.id, field);
          const numericValue = Number(values[key] || 0);
          return Number.isNaN(numericValue) ? acc : acc + numericValue;
        }, 0);
      });
    });

    return totals;
  }, [values]);

  const totalAssets =
    sectionTotals.current_assets + sectionTotals.fixed_assets + sectionTotals.other_assets;
  const totalLiabilities = sectionTotals.current_liabilities + sectionTotals.long_term_liabilities;
  const totalLiabilitiesAndEquity = totalLiabilities + sectionTotals.capital_reserves;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  const handleChange = (fieldKey, inputValue) => {
    setValues((prev) => ({
      ...prev,
      [fieldKey]: inputValue,
    }));
  };

  const renderSection = (section) => (
    <section key={section.id} className="mb-6">
      <h3 className="text-lg font-semibold italic text-white mb-3">{section.title}</h3>
      <div className="space-y-2">
        {section.fields.map((field) => {
          const key = makeFieldKey(section.id, field);
          return (
            <div key={key} className="grid grid-cols-[1fr_150px] gap-3 items-center">
              <label className="text-sm text-lightWhite/90">{field}</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={values[key]}
                onChange={(event) => handleChange(key, event.target.value)}
                className="input-field text-right"
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 border-t border-white/10 pt-3 grid grid-cols-[1fr_150px] gap-3 items-center">
        <p className="font-semibold text-white">{section.totalLabel}</p>
        <p className="text-right font-semibold text-white">{formatCurrency(sectionTotals[section.id])}</p>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-black text-lightWhite">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-10">
        <div className="glass rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="teal-badge mb-3">Professional Template</p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">Balance Sheet</h1>
              <p className="text-sm md:text-base text-lightWhite/70">Reference-aligned layout for team input entry</p>
            </div>
            <div
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                isBalanced
                  ? 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10'
                  : 'border-amber-400/40 text-amber-200 bg-amber-500/10'
              }`}
            >
              {isBalanced ? 'Balanced' : 'Not Balanced'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 md:p-7">
            <div className="mb-5 pb-3 border-b border-white/10">
              <h2 className="text-2xl font-semibold text-white">Assets</h2>
            </div>
            {BALANCE_SHEET_TEMPLATE.assets.map(renderSection)}
            <div className="mt-6 border-t border-teal-400/30 pt-4 grid grid-cols-[1fr_150px] gap-3 items-center">
              <p className="text-xl font-semibold text-teal-300">Total Assets</p>
              <p className="text-right text-xl font-semibold text-teal-300">{formatCurrency(totalAssets)}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 md:p-7">
            <div className="mb-5 pb-3 border-b border-white/10">
              <h2 className="text-2xl font-semibold text-white">Liabilities and Equity</h2>
            </div>
            {BALANCE_SHEET_TEMPLATE.liabilitiesEquity.map(renderSection)}
            <div className="mt-2 border-t border-white/20 pt-3 grid grid-cols-[1fr_150px] gap-3 items-center">
              <p className="text-lg font-semibold text-white">Total Liabilities</p>
              <p className="text-right text-lg font-semibold text-white">{formatCurrency(totalLiabilities)}</p>
            </div>
            <div className="mt-4 border-t border-teal-400/30 pt-4 grid grid-cols-[1fr_150px] gap-3 items-center">
              <p className="text-xl font-semibold text-teal-300">Total Liabilities and Equity</p>
              <p className="text-right text-xl font-semibold text-teal-300">
                {formatCurrency(totalLiabilitiesAndEquity)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Validation</h3>
          <p className="text-lightWhite/70">
            Equation check: <span className="text-white font-medium">Assets = Liabilities + Equity</span>
          </p>
          <p className="text-sm mt-2 text-lightWhite/60">
            Extend the template sections to your full 300+ required inputs while keeping this format.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BalanceSheet;
