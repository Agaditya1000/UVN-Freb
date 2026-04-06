import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);
  const [activeBusinessId, setActiveBusinessId] = useState(null);

  const [accounts, setAccounts] = useState([]);

  const [transactions, setTransactions] = useState([]);

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
