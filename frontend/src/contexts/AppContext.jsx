/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([
    { id: '1', name: 'Acme Corp', country: 'USA', currency: 'USD', taxId: 'EIN-123456' },
  ]);
  const [activeBusinessId, setActiveBusinessId] = useState('1');

  const [accounts, setAccounts] = useState([
    { id: '100', name: 'Cash', category: 'Asset', balance: 50000 },
    { id: '120', name: 'Accounts Receivable', category: 'Asset', balance: 10000 },
    { id: '200', name: 'Accounts Payable', category: 'Liability', balance: 5000 },
    { id: '300', name: 'Owner Equity', category: 'Equity', balance: 55000 },
    { id: '400', name: 'Sales Revenue', category: 'Revenue', balance: 0 },
    { id: '500', name: 'Operating Expense', category: 'Expense', balance: 0 },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 't1', date: '2026-04-01', description: 'Initial Capital', debits: [{ accountId: '100', amount: 55000 }], credits: [{ accountId: '300', amount: 55000 }] },
  ]);

  const activeBusiness = businesses.find(b => b.id === activeBusinessId) || null;

  const addBusiness = (businessData) => {
    const newBusiness = { id: Date.now().toString(), ...businessData };
    setBusinesses([...businesses, newBusiness]);
    setActiveBusinessId(newBusiness.id);
  };

  const addAccount = (accountData) => {
    setAccounts([...accounts, { id: Date.now().toString(), balance: 0, ...accountData }]);
  };

  const addTransaction = (tData) => {
    setTransactions([{ id: Date.now().toString(), ...tData }, ...transactions]);
  };

  const value = {
    businesses,
    activeBusiness,
    setActiveBusinessId,
    addBusiness,
    accounts,
    addAccount,
    transactions,
    addTransaction
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
