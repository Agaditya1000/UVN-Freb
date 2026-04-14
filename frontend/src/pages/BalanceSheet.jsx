import React, { useEffect, useMemo, useState } from 'react';

const FRAMEWORK_CONFIG = {
  'GAAP (USA)': { defaultCurrency: 'USD', allowedCurrencies: ['USD'], locale: 'en-US' },
  'IFRS (EU)': { defaultCurrency: 'EUR', allowedCurrencies: ['EUR', 'GBP'], locale: 'en-IE' },
  'IND-AS (India)': { defaultCurrency: 'INR', allowedCurrencies: ['INR'], locale: 'en-IN' },
};

const REPORT_FRAMEWORKS = Object.keys(FRAMEWORK_CONFIG);

const BALANCE_SHEET_TEMPLATE = {
  assets: [
    {
      id: 'current_assets',
      title: 'Current Assets',
      totalLabel: 'Total Current Assets',
      fields: [
        { label: 'Cash at Hand' },
        { label: 'Cash at Bank' },
        { label: 'Accounts Receivable' },
        { label: 'Allowance for Doubtful Debts', isContra: true },
        { label: 'Stock' },
        { label: 'Prepaid Expenses' },
        { label: 'Notes Receivable' },
      ],
    },
    {
      id: 'fixed_assets',
      title: 'Fixed Assets',
      totalLabel: 'Total Fixed Assets',
      fields: [
        { label: 'Vehicles' },
        { label: 'Accumulated Depreciation - Vehicles', isContra: true },
        { label: 'Furniture and Fixtures' },
        { label: 'Accumulated Depreciation - Furniture', isContra: true },
        { label: 'Equipment' },
        { label: 'Accumulated Depreciation - Equipment', isContra: true },
        { label: 'Buildings' },
        { label: 'Accumulated Depreciation - Buildings', isContra: true },
        { label: 'Land' },
      ],
    },
    {
      id: 'other_assets',
      title: 'Other Assets',
      totalLabel: 'Total Other Assets',
      fields: [{ label: 'Goodwill' }],
    },
  ],
  liabilitiesEquity: [
    {
      id: 'current_liabilities',
      title: 'Current Liabilities',
      totalLabel: 'Total Current Liabilities',
      fields: [
        { label: 'Accounts Payable' },
        { label: 'Sales Taxes Payable' },
        { label: 'Payroll Taxes Payable' },
        { label: 'Income Taxes Payable' },
        { label: 'Accrued Wages Payable' },
        { label: 'Unearned Revenues' },
        { label: 'Bank Overdraft' },
        { label: 'Short-Term Loan Payable' },
      ],
    },
    {
      id: 'long_term_liabilities',
      title: 'Long-Term Liabilities',
      totalLabel: 'Total Long-Term Liabilities',
      fields: [{ label: 'Long-Term Bank Loans Payable' }, { label: 'Mortgage Payable' }],
    },
    {
      id: 'capital_reserves',
      title: 'Capital and Reserves',
      totalLabel: 'Net Capital',
      fields: [
        { label: 'Capital' },
        { label: 'Net Profit' },
        { label: 'Drawings', isContra: true },
      ],
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
        initial[makeFieldKey(section.id, field.label)] = '';
      });
    });
  });

  return initial;
};

function BalanceSheet() {
  const [values, setValues] = useState(buildInitialState);
  const [reportMeta, setReportMeta] = useState({
    entity: 'UV Netware Demo Co.',
    periodEnd: '2026-03-31',
    framework: REPORT_FRAMEWORKS[0],
    currency: FRAMEWORK_CONFIG[REPORT_FRAMEWORKS[0]].defaultCurrency,
  });

  const currentFrameworkConfig = FRAMEWORK_CONFIG[reportMeta.framework];

  useEffect(() => {
    if (!currentFrameworkConfig.allowedCurrencies.includes(reportMeta.currency)) {
      setReportMeta((prev) => ({
        ...prev,
        currency: currentFrameworkConfig.defaultCurrency,
      }));
    }
  }, [currentFrameworkConfig, reportMeta.currency]);

  const formatDate = (rawDate) => {
    if (!rawDate) return 'N/A';
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return rawDate;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (value) => {
    const absolute = Math.abs(value || 0);
    const formatted = new Intl.NumberFormat(currentFrameworkConfig.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absolute);
    return value < 0 ? `(${formatted})` : formatted;
  };

  const sectionTotals = useMemo(() => {
    const totals = {};

    Object.values(BALANCE_SHEET_TEMPLATE).forEach((columnSections) => {
      columnSections.forEach((section) => {
        totals[section.id] = section.fields.reduce((acc, field) => {
          const key = makeFieldKey(section.id, field.label);
          const numericValue = Number(values[key] || 0);
          if (Number.isNaN(numericValue)) return acc;
          return field.isContra ? acc - numericValue : acc + numericValue;
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
      <h3 className="text-lg font-semibold italic text-white mb-3 border-l-2 border-teal pl-3">{section.title}</h3>
      <div className="space-y-2">
        {section.fields.map((field, idx) => {
          const key = makeFieldKey(section.id, field.label);
          return (
            <div
              key={key}
              className={`grid grid-cols-[1fr_150px] gap-3 items-center px-2 py-1.5 rounded ${
                idx % 2 === 0 ? 'bg-white/[0.02]' : ''
              }`}
            >
              <label className="text-sm text-lightWhite/90 flex items-center gap-2">
                {field.isContra ? <span className="text-amber-300 text-xs">Less:</span> : null}
                <span>{field.label}</span>
              </label>
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
        <p className="text-right font-semibold text-white">{formatAmount(sectionTotals[section.id])}</p>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-black text-lightWhite">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-10">
        <div className="glass rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-5">
            <div>
              <p className="teal-badge mb-3">Professional Template</p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">Balance Sheet</h1>
              <p className="text-sm md:text-base text-lightWhite/70">
                Classified statement format aligned with project accounting flow
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="block">
              <span className="text-xs text-lightWhite/70 uppercase tracking-wider">Entity</span>
              <input
                value={reportMeta.entity}
                onChange={(event) => setReportMeta((prev) => ({ ...prev, entity: event.target.value }))}
                className="input-field mt-2"
              />
            </label>
            <label className="block">
              <span className="text-xs text-lightWhite/70 uppercase tracking-wider">As At</span>
              <input
                type="date"
                value={reportMeta.periodEnd}
                onChange={(event) => setReportMeta((prev) => ({ ...prev, periodEnd: event.target.value }))}
                className="input-field mt-2"
              />
            </label>
            <label className="block">
              <span className="text-xs text-lightWhite/70 uppercase tracking-wider">Framework</span>
              <select
                value={reportMeta.framework}
                onChange={(event) => {
                  const nextFramework = event.target.value;
                  setReportMeta((prev) => ({
                    ...prev,
                    framework: nextFramework,
                    currency: FRAMEWORK_CONFIG[nextFramework].defaultCurrency,
                  }));
                }}
                className="input-field mt-2"
              >
                {REPORT_FRAMEWORKS.map((framework) => (
                  <option key={framework} value={framework}>
                    {framework}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-lightWhite/70 uppercase tracking-wider">Currency</span>
              <select
                value={reportMeta.currency}
                onChange={(event) => setReportMeta((prev) => ({ ...prev, currency: event.target.value }))}
                className="input-field mt-2"
              >
                {currentFrameworkConfig.allowedCurrencies.map((currencyCode) => (
                  <option key={currencyCode} value={currencyCode}>
                    {currencyCode}
                  </option>
                ))}
              </select>
            </label>
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
              <p className="text-right text-xl font-semibold text-teal-300">{formatAmount(totalAssets)}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 md:p-7">
            <div className="mb-5 pb-3 border-b border-white/10">
              <h2 className="text-2xl font-semibold text-white">Liabilities and Equity</h2>
            </div>
            {BALANCE_SHEET_TEMPLATE.liabilitiesEquity.map(renderSection)}
            <div className="mt-2 border-t border-white/20 pt-3 grid grid-cols-[1fr_150px] gap-3 items-center">
              <p className="text-lg font-semibold text-white">Total Liabilities</p>
              <p className="text-right text-lg font-semibold text-white">{formatAmount(totalLiabilities)}</p>
            </div>
            <div className="mt-4 border-t border-teal-400/30 pt-4 grid grid-cols-[1fr_150px] gap-3 items-center">
              <p className="text-xl font-semibold text-teal-300">Total Liabilities and Equity</p>
              <p className="text-right text-xl font-semibold text-teal-300">{formatAmount(totalLiabilitiesAndEquity)}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Report Notes and Validation</h3>
          <p className="text-lightWhite/70 mb-2">
            Prepared for <span className="text-white font-medium">{reportMeta.entity}</span> as at{' '}
            <span className="text-white font-medium">{formatDate(reportMeta.periodEnd)}</span> under{' '}
            <span className="text-white font-medium">{reportMeta.framework}</span> framework in{' '}
            <span className="text-white font-medium">{reportMeta.currency}</span>.
          </p>
          <p className="text-lightWhite/70">
            Equation check: <span className="text-white font-medium">Assets = Liabilities + Equity</span>
          </p>
          <p className="text-sm mt-2 text-lightWhite/60">
            Keep each line item mapped to chart-of-accounts codes when you scale this to 300+ inputs.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BalanceSheet;
