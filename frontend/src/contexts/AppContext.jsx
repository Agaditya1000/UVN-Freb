import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { user, role } = useAuth();
  
  const [businesses, setBusinesses] = useState([]);
  const [activeBusinessId, setActiveBusinessId] = useState(null);
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch businesses user has access to
  useEffect(() => {
    if (!user) return;
    
    const loadBusinesses = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setBusinesses(data);
        if (data.length > 0 && !activeBusinessId) {
          setActiveBusinessId(data[0].id);
        }
      }
    };
    
    loadBusinesses();
  }, [user]);

  // Fetch accounts and transactions when activeBusinessId changes
  useEffect(() => {
    if (!activeBusinessId) return;

    const fetchData = async () => {
      setLoading(true);
      
      // Load Accounts
      const { data: accData, error: accError } = await supabase
        .from('accounts')
        .select('*')
        .eq('business_id', activeBusinessId)
        .order('id', { ascending: true });
      
      if (!accError && accData) setAccounts(accData);

      // Load Transactions
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('business_id', activeBusinessId)
        .order('date', { ascending: false });

      if (!transError && transData) setTransactions(transData);
      
      setLoading(false);
    };

    fetchData();
  }, [activeBusinessId]);

  const activeBusiness = businesses.find(b => b.id === activeBusinessId) || null;

  // Insert business and map it to the user
  const addBusiness = async (businessData) => {
    if (!user) return { success: false, error: 'No User' };
    
    const newId = crypto.randomUUID();

    const { error: bError } = await supabase
      .from('businesses')
      .insert([{ id: newId, ...businessData }]);
      
    if (bError) return { success: false, error: bError };
    
    const { error: mapError } = await supabase
      .from('business_users')
      .insert([{
        business_id: newId,
        user_id: user.id,
        role: 'Owner'
      }]);
      
    if (mapError) return { success: false, error: mapError };
    
    const newBusiness = { id: newId, ...businessData };
    setBusinesses(prev => [newBusiness, ...prev]);
    setActiveBusinessId(newId);
    return { success: true };
  };

  const addAccount = async (accountData) => {
    if (!activeBusinessId) return { success: false, error: 'No Active Business' };

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ 
        business_id: activeBusinessId,
        ...accountData,
        balance: accountData.balance || 0
      }])
      .select();

    if (error) return { success: false, error };

    setAccounts(prev => [...prev, data[0]]);
    return { success: true };
  };

  const addTransaction = async (tData) => {
    if (!activeBusinessId) return { success: false, error: 'No Active Business' };

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ 
        business_id: activeBusinessId,
        ...tData 
      }])
      .select();

    if (error) return { success: false, error };

    setTransactions(prev => [data[0], ...prev]);
    return { success: true };
  };

  // Calculate balances dynamically from transactions
  const accountsWithBalances = accounts.map(account => {
    let balance = 0;
    
    transactions.forEach(tx => {
      // Check debits
      tx.debits?.forEach(d => {
        if (d.accountId === account.id) {
          if (['Asset', 'Expense'].includes(account.category)) {
            balance += d.amount;
          } else {
            balance -= d.amount;
          }
        }
      });
      
      // Check credits
      tx.credits?.forEach(c => {
        if (c.accountId === account.id) {
          if (['Asset', 'Expense'].includes(account.category)) {
            balance -= c.amount;
          } else {
            balance += c.amount;
          }
        }
      });
    });

    return { ...account, balance };
  });

  const value = {
    businesses,
    activeBusiness,
    setActiveBusinessId,
    addBusiness,
    accounts: accountsWithBalances,
    addAccount,
    transactions,
    addTransaction,
    loading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
