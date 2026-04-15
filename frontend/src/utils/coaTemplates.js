const US_GAAP = [
  // Assets
  { id: 'US-1000', name: 'Cash at bank', category: 'Asset', sub_category: 'Current Asset' },
  { id: 'US-1100', name: 'Accounts receivable', category: 'Asset', sub_category: 'Current Asset' },
  { id: 'US-1200', name: 'Inventory', category: 'Asset', sub_category: 'Current Asset' },
  { id: 'US-1500', name: 'Property, plant & equipment', category: 'Asset', sub_category: 'Fixed Asset' },
  // Liabilities
  { id: 'US-2000', name: 'Accounts payable', category: 'Liability', sub_category: 'Current Liability' },
  { id: 'US-2100', name: 'Accrued expenses', category: 'Liability', sub_category: 'Current Liability' },
  { id: 'US-2500', name: 'Long-term debt', category: 'Liability', sub_category: 'Long-Term Liability' },
  // Equity
  { id: 'US-3000', name: 'Owner capital', category: 'Equity', sub_category: 'Capital & Reserves' },
  { id: 'US-3100', name: 'Retained earnings', category: 'Equity', sub_category: 'Capital & Reserves' },
  // Revenue / Expense
  { id: 'US-4000', name: 'Sales revenue', category: 'Revenue', sub_category: 'Indirect Income' },
  { id: 'US-5000', name: 'Cost of goods sold', category: 'Expense', sub_category: 'Direct Expenses' },
  { id: 'US-5100', name: 'Operating expenses', category: 'Expense', sub_category: 'Indirect Expenses' },
];

const EU_IFRS = [
  // Assets
  { id: 'EU-1000', name: 'Cash and cash equivalents', category: 'Asset', sub_category: 'Current Asset' },
  { id: 'EU-1100', name: 'Trade receivables', category: 'Asset', sub_category: 'Current Asset' },
  { id: 'EU-1200', name: 'Inventories', category: 'Asset', sub_category: 'Current Asset' },
  { id: 'EU-1500', name: 'Property, plant and equipment', category: 'Asset', sub_category: 'Fixed Asset' },
  // Liabilities
  { id: 'EU-2000', name: 'Trade payables', category: 'Liability', sub_category: 'Current Liability' },
  { id: 'EU-2100', name: 'Accruals', category: 'Liability', sub_category: 'Current Liability' },
  { id: 'EU-2500', name: 'Borrowings (non-current)', category: 'Liability', sub_category: 'Long-Term Liability' },
  // Equity
  { id: 'EU-3000', name: 'Share capital', category: 'Equity', sub_category: 'Capital & Reserves' },
  { id: 'EU-3100', name: 'Retained earnings', category: 'Equity', sub_category: 'Capital & Reserves' },
  // Revenue / Expense
  { id: 'EU-4000', name: 'Revenue', category: 'Revenue', sub_category: 'Indirect Income' },
  { id: 'EU-5000', name: 'Cost of sales', category: 'Expense', sub_category: 'Direct Expenses' },
  { id: 'EU-5100', name: 'Administrative expenses', category: 'Expense', sub_category: 'Indirect Expenses' },
];

const IN_INDAS_GST = [
  // Assets
  { id: 'IN-1000', name: 'Bank', category: 'Asset', sub_category: 'Current Asset' },
  { id: 'IN-1100', name: 'Sundry debtors', category: 'Asset', sub_category: 'Current Asset' },
  { id: 'IN-1200', name: 'Stock-in-trade', category: 'Asset', sub_category: 'Current Asset' },
  { id: 'IN-1500', name: 'Fixed assets', category: 'Asset', sub_category: 'Fixed Asset' },
  // GST ledgers (simplified; real implementations split by rate and tax head)
  { id: 'IN-1400', name: 'Input GST', category: 'Asset', sub_category: 'Other Asset' },
  // Liabilities
  { id: 'IN-2000', name: 'Sundry creditors', category: 'Liability', sub_category: 'Current Liability' },
  { id: 'IN-2400', name: 'Output GST', category: 'Liability', sub_category: 'Current Liability' },
  { id: 'IN-2500', name: 'Secured loans', category: 'Liability', sub_category: 'Long-Term Liability' },
  // Equity
  { id: 'IN-3000', name: 'Capital', category: 'Equity', sub_category: 'Capital & Reserves' },
  { id: 'IN-3100', name: 'Reserves & surplus', category: 'Equity', sub_category: 'Capital & Reserves' },
  // Revenue / Expense
  { id: 'IN-4000', name: 'Sales', category: 'Revenue', sub_category: 'Direct Income' },
  { id: 'IN-5000', name: 'Purchases', category: 'Expense', sub_category: 'Direct Expenses' },
  { id: 'IN-5100', name: 'Indirect expenses', category: 'Expense', sub_category: 'Indirect Expenses' },
];

export function getCoaTemplateForCountry(country) {
  if (country === 'India') return IN_INDAS_GST;
  if (country === 'EU') return EU_IFRS;
  return US_GAAP;
}

