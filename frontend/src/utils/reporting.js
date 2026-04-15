/**
 * Client-side reporting helpers over the current transactions JSON model.
 * Replace with Supabase RPC / materialized balances when scaling.
 */

export function filterTransactionsByRange(transactions, fromDate, toDate) {
  if (!transactions?.length) return [];
  return transactions.filter((t) => {
    if (fromDate && t.date < fromDate) return false;
    if (toDate && t.date > toDate) return false;
    return true;
  });
}

export function filterTransactionsAsOf(transactions, asOfDate) {
  if (!asOfDate) return transactions || [];
  return (transactions || []).filter((t) => t.date <= asOfDate);
}

export function computeBalanceForAccount(account, transactionsFiltered) {
  let balance = 0;
  const cat = account.category;
  for (const tx of transactionsFiltered) {
    for (const d of tx.debits || []) {
      if (String(d.accountId) !== String(account.id)) continue;
      const amt = Number(d.amount) || 0;
      if (['Asset', 'Expense'].includes(cat)) balance += amt;
      else balance -= amt;
    }
    for (const c of tx.credits || []) {
      if (String(c.accountId) !== String(account.id)) continue;
      const amt = Number(c.amount) || 0;
      if (['Asset', 'Expense'].includes(cat)) balance -= amt;
      else balance += amt;
    }
  }
  return balance;
}

export function computeAllBalances(accounts, transactionsFiltered) {
  return accounts.map((a) => ({
    ...a,
    balance: computeBalanceForAccount(a, transactionsFiltered),
  }));
}

/** Trial balance: sum raw debits and credits per account in period (should tie). */
export function buildTrialBalance(accounts, transactionsInPeriod) {
  const map = {};
  for (const a of accounts) {
    map[a.id] = {
      id: a.id,
      name: a.name,
      category: a.category,
      sub_category: a.sub_category,
      debit: 0,
      credit: 0,
    };
  }
  for (const tx of transactionsInPeriod) {
    for (const d of tx.debits || []) {
      if (map[d.accountId]) map[d.accountId].debit += Number(d.amount) || 0;
    }
    for (const c of tx.credits || []) {
      if (map[c.accountId]) map[c.accountId].credit += Number(c.amount) || 0;
    }
  }
  const rows = Object.values(map).sort((x, y) => String(x.id).localeCompare(String(y.id)));
  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
  const delta = totalDebit - totalCredit;
  return {
    rows,
    totalDebit,
    totalCredit,
    balanced: Math.abs(delta) < 0.01,
    delta,
  };
}

/** P&L for period: Indirect Revenue and Indirect Expense activity. */
export function buildProfitAndLoss(accounts, transactionsInPeriod, grossProfit = 0) {
  // Only include items that ARE NOT Direct (those go to the Trading Account)
  const tradingRevenueSubCats = ['Direct Revenue', 'Service Income'];
  const tradingExpenseSubCats = ['Purchases', 'Carriage Inward', 'Manufacturing Wages', 'Direct Expense'];

  const indirectRevenueAccounts = accounts.filter((a) => a.category === 'Revenue' && !tradingRevenueSubCats.includes(a.sub_category));
  const indirectExpenseAccounts = accounts.filter((a) => a.category === 'Expense' && !tradingExpenseSubCats.includes(a.sub_category));

  const revenueLines = indirectRevenueAccounts.map(a => ({
    ...a,
    balance: computeBalanceForAccount(a, transactionsInPeriod)
  })).filter(a => a.balance !== 0);

  const expenseLines = indirectExpenseAccounts.map(a => ({
    ...a,
    balance: computeBalanceForAccount(a, transactionsInPeriod)
  })).filter(a => a.balance !== 0);

  const totalOtherIncome = revenueLines.reduce((s, a) => s + a.balance, 0);
  const totalOtherExpenses = expenseLines.reduce((s, a) => s + a.balance, 0);

  return {
    revenueLines,
    expenseLines,
    totalOtherIncome,
    totalOtherExpenses,
    grossProfitPrefilled: grossProfit,
    netIncome: grossProfit + totalOtherIncome - totalOtherExpenses,
  };
}

/** Trading Account: Focuses on Gross Profit (Direct Revenue - COGS) */
export function buildTradingAccount(accounts, transactions, fromDate, toDate, manualClosingStock = 0) {
  const periodTransactions = filterTransactionsByRange(transactions, fromDate, toDate);
  const startTransactions = transactions.filter(t => t.date < fromDate);
  
  // 1. Calculate Opening Stock (Inventory balances at start date)
  const inventoryAccounts = accounts.filter(a => a.sub_category.toLowerCase().includes('asset') && (a.name.toLowerCase().includes('stock') || a.name.toLowerCase().includes('inventory')));
  const openingStock = inventoryAccounts.reduce((sum, a) => sum + computeBalanceForAccount(a, startTransactions), 0);

  // 2. Fetch Direct Revenue (Sales)
  const salesSubCats = ['Direct Revenue', 'Service Income'];
  const salesLines = accounts.filter(a => salesSubCats.includes(a.sub_category)).map(a => ({
    ...a,
    balance: computeBalanceForAccount(a, periodTransactions)
  })).filter(a => a.balance !== 0);

  // 3. Fetch Direct Expenses (Purchases, Wages, etc.)
  const directExpSubCats = ['Purchases', 'Carriage Inward', 'Manufacturing Wages', 'Direct Expense'];
  const directExpenseLines = accounts.filter(a => directExpSubCats.includes(a.sub_category)).map(a => ({
    ...a,
    balance: computeBalanceForAccount(a, periodTransactions)
  })).filter(a => a.balance !== 0);

  // Split Purchases from other Direct Expenses for the UI
  const purchaseLines = directExpenseLines.filter(a => a.sub_category === 'Purchases' || a.name.toLowerCase().includes('purchase'));
  const otherDirectExpenseLines = directExpenseLines.filter(a => a.sub_category !== 'Purchases' && !a.name.toLowerCase().includes('purchase'));

  const netSales = salesLines.reduce((sum, a) => sum + a.balance, 0);
  const netPurchases = purchaseLines.reduce((sum, a) => sum + a.balance, 0);
  const otherDirectExps = otherDirectExpenseLines.reduce((sum, a) => sum + a.balance, 0);

  // Formula: GP = (Sales + ClosingStock) - (OpeningStock + Purchases + DirectExpenses)
  const grossProfit = (netSales + Number(manualClosingStock)) - (openingStock + netPurchases + otherDirectExps);

  return {
    openingStock,
    salesLines,
    purchaseLines,
    otherDirectExpenseLines,
    manualClosingStock: Number(manualClosingStock),
    netSales,
    netPurchases,
    otherDirectExps,
    grossProfit
  };
}

/** General ledger lines for one account, chronological, with running balance. */
export function buildGeneralLedger(account, allTransactionsSortedAsc) {
  const lines = [];
  let running = 0;
  const cat = account.category;
  const sorted = [...(allTransactionsSortedAsc || [])].sort((a, b) => {
    const da = a.date.localeCompare(b.date);
    if (da !== 0) return da;
    return (a.id || '').localeCompare(b.id || '');
  });

  for (const tx of sorted) {
    let lineDebit = 0;
    let lineCredit = 0;
    for (const d of tx.debits || []) {
      if (d.accountId === account.id) lineDebit += Number(d.amount) || 0;
    }
    for (const c of tx.credits || []) {
      if (c.accountId === account.id) lineCredit += Number(c.amount) || 0;
    }
    if (lineDebit === 0 && lineCredit === 0) continue;

    if (['Asset', 'Expense'].includes(cat)) {
      running += lineDebit - lineCredit;
    } else {
      running += lineCredit - lineDebit;
    }

    lines.push({
      id: tx.id,
      date: tx.date,
      description: tx.description,
      debit: lineDebit,
      credit: lineCredit,
      balance: running,
    });
  }
  return lines;
}

/** GST summary (India): aggregates transaction.tax metadata by rate/type for a period. */
export function buildGstSummary(transactions, fromDate, toDate) {
  const slice = filterTransactionsByRange(transactions || [], fromDate, toDate);
  const rows = [];
  const map = new Map();

  for (const tx of slice) {
    const t = tx.tax;
    if (!t || t.regime !== 'GST') continue;
    const key = `${t.type || 'GST'}|${t.rate || 0}`;
    const prev = map.get(key) || { type: t.type || 'GST', rate: Number(t.rate) || 0, base: 0, tax: 0, count: 0 };
    prev.base += Number(t.base) || 0;
    prev.tax += Number(t.amount) || 0;
    prev.count += 1;
    map.set(key, prev);
  }

  for (const v of map.values()) rows.push(v);
  rows.sort((a, b) => (a.type || '').localeCompare(b.type || '') || a.rate - b.rate);
  const totalBase = rows.reduce((s, r) => s + r.base, 0);
  const totalTax = rows.reduce((s, r) => s + r.tax, 0);
  return { rows, totalBase, totalTax, txCount: rows.reduce((s, r) => s + r.count, 0) };
}

export function buildCashFlowStatement(accounts, transactions, fromDate, toDate) {
  const pnl = buildProfitAndLoss(accounts, filterTransactionsByRange(transactions, fromDate, toDate));
  
  // 1. Get Balances at Start and End
  const startTransactions = (transactions || []).filter(t => t.date < fromDate);
  const endTransactions = (transactions || []).filter(t => t.date <= toDate);
  
  const startBalances = computeAllBalances(accounts, startTransactions);
  const endBalances = computeAllBalances(accounts, endTransactions);
  
  // 2. Identify Cash Accounts (Sub-categories with Cash or Bank)
  const isCashAccount = (a) => a.category === 'Asset' && (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank') || a.sub_category.toLowerCase().includes('cash') || a.sub_category.toLowerCase().includes('bank'));
  
  const cashAccounts = accounts.filter(isCashAccount);
  const beginningCash = cashAccounts.reduce((sum, a) => sum + (startBalances.find(b => b.id === a.id)?.balance || 0), 0);
  const endingCash = cashAccounts.reduce((sum, a) => sum + (endBalances.find(b => b.id === a.id)?.balance || 0), 0);
  
  // 3. Operating Activities
  const operatingActivities = [];
  let netOperatingCash = pnl.netIncome;
  
  // Search for non-cash expenses like Depreciation (if any)
  const nonCashAccounts = accounts.filter(a => a.name.toLowerCase().includes('depreciation') || a.name.toLowerCase().includes('amortization'));
  for (const a of nonCashAccounts) {
    const bal = computeBalanceForAccount(a, filterTransactionsByRange(transactions, fromDate, toDate));
    if (bal !== 0) {
      // Depreciation is usually an expense (debit), adding it back
      const addBack = Math.abs(bal);
      operatingActivities.push({ name: `Adjust: ${a.name}`, amount: addBack });
      netOperatingCash += addBack;
    }
  }

  // Changes in Working Capital
  const workingCapitalAccounts = accounts.filter(a => 
    !isCashAccount(a) && 
    (a.sub_category.toLowerCase().includes('current') || a.category === 'Asset' || a.category === 'Liability') &&
    !a.sub_category.toLowerCase().includes('fixed') &&
    !a.sub_category.toLowerCase().includes('long-term') &&
    a.category !== 'Equity' &&
    a.category !== 'Revenue' &&
    a.category !== 'Expense'
  );

  for (const a of workingCapitalAccounts) {
    const start = startBalances.find(b => b.id === a.id)?.balance || 0;
    const end = endBalances.find(b => b.id === a.id)?.balance || 0;
    const delta = end - start;
    if (delta === 0) continue;

    let adjustment = 0;
    if (a.category === 'Asset') {
      adjustment = -delta; // Asset increase is cash outflow
    } else {
      adjustment = delta; // Liability increase is cash inflow
    }

    operatingActivities.push({ 
      name: `Change in ${a.name}`, 
      amount: adjustment 
    });
    netOperatingCash += adjustment;
  }

  // 4. Investing Activities
  const investingActivities = [];
  let netInvestingCash = 0;
  const investingAccounts = accounts.filter(a => a.sub_category.toLowerCase().includes('fixed') || a.sub_category.toLowerCase().includes('investment'));
  
  for (const a of investingAccounts) {
    const start = startBalances.find(b => b.id === a.id)?.balance || 0;
    const end = endBalances.find(b => b.id === a.id)?.balance || 0;
    const delta = end - start;
    if (delta === 0) continue;

    const adjustment = -delta; // Asset purchase is cash out
    investingActivities.push({ name: delta > 0 ? `Purchase of ${a.name}` : `Sale of ${a.name}`, amount: adjustment });
    netInvestingCash += adjustment;
  }

  // 5. Financing Activities
  const financingActivities = [];
  let netFinancingCash = 0;
  const financingAccounts = accounts.filter(a => a.sub_category.toLowerCase().includes('long-term') || a.category === 'Equity');
  
  for (const a of financingAccounts) {
    // Skip Retained Earnings / Net Income since we started with it in Operating
    if (a.name.toLowerCase().includes('retained earnings') || a.name.toLowerCase().includes('profit')) continue;
    
    const start = startBalances.find(b => b.id === a.id)?.balance || 0;
    const end = endBalances.find(b => b.id === a.id)?.balance || 0;
    const delta = end - start;
    if (delta === 0) continue;

    const adjustment = delta; // Liability/Equity increase is cash in
    financingActivities.push({ name: `Movement in ${a.name}`, amount: adjustment });
    netFinancingCash += adjustment;
  }

  return {
    netIncome: pnl.netIncome,
    operatingActivities,
    netOperatingCash,
    investingActivities,
    netInvestingCash,
    financingActivities,
    netFinancingCash,
    netChangeInCash: netOperatingCash + netInvestingCash + netFinancingCash,
    beginningCash,
    endingCash
  };
}

export function defaultPeriodDates() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const first = `${y}-${m}-01`;
  const last = new Date(y, now.getMonth() + 1, 0);
  const lastStr = `${y}-${m}-${String(last.getDate()).padStart(2, '0')}`;
  return { from: first, to: lastStr };
}

export function todayISODate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
