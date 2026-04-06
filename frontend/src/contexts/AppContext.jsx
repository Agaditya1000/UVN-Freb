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

  // Fetch businesses user has access to
  useEffect(() => {
    if (!user) return;
    
    const loadBusinesses = async () => {
      // Because of our RLS policies, this safely returns only 
      // businesses the user is linked to via business_users.
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

  const activeBusiness = businesses.find(b => b.id === activeBusinessId) || null;

  // Insert business and map it to the user
  const addBusiness = async (businessData) => {
    if (!user) return { success: false, error: 'No User' };
    
    const newId = crypto.randomUUID();

    // 1. Insert into businesses table
    const { error: bError } = await supabase
      .from('businesses')
      .insert([{ id: newId, ...businessData }]);
      
    if (bError) {
      console.error("Error creating business:", bError);
      return { success: false, error: bError };
    }
    
    // 2. Map Owner in business_users
    const { error: mapError } = await supabase
      .from('business_users')
      .insert([{
        business_id: newId,
        user_id: user.id,
        role: 'Owner' // Creator is always the Owner globally/locally
      }]);
      
    if (mapError) {
      console.error("Error mapping business to user:", mapError);
      return { success: false, error: mapError };
    }
    
    // 3. Update UI state
    const newBusiness = { id: newId, ...businessData };
    setBusinesses(prev => [newBusiness, ...prev]);
    setActiveBusinessId(newId);
    return { success: true };
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
