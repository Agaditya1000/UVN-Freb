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
      if (d.accountId !== account.id) continue;
      if (['Asset', 'Expense'].includes(cat)) balance += d.amount;
      else balance -= d.amount;
    }
    for (const c of tx.credits || []) {
      if (c.accountId !== account.id) continue;
      if (['Asset', 'Expense'].includes(cat)) balance -= c.amount;
      else balance += c.amount;
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

/** P&L for period: Revenue and Expense activity from period transactions only. */
export function buildProfitAndLoss(accounts, transactionsInPeriod) {
  const relevant = accounts.filter((a) => ['Revenue', 'Expense'].includes(a.category));
  const withBal = computeAllBalances(relevant, transactionsInPeriod);
  const revenueLines = [];
  const expenseLines = [];
  let revenue = 0;
  let expense = 0;
  for (const a of withBal) {
    if (a.category === 'Revenue') {
      revenueLines.push(a);
      revenue += a.balance;
    } else {
      expenseLines.push(a);
      expense += a.balance;
    }
  }
  return {
    revenueLines,
    expenseLines,
    revenue,
    expense,
    netIncome: revenue - expense,
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
