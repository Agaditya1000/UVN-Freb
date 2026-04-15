/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { getCoaTemplateForCountry } from '../utils/coaTemplates';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { user, role } = useAuth();
  
  const [businesses, setBusinesses] = useState([]);
  const [activeBusinessId, setActiveBusinessId] = useState(null);
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [team, setTeam] = useState([]);
  const [userRole, setUserRole] = useState(role); // Initialize with global role
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

  // Fetch data when activeBusinessId changes
  useEffect(() => {
    if (!activeBusinessId || !user) return;

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // 1. Load Current User's Role for this business
        const { data: roleData, error: roleError } = await supabase
          .from('business_users')
          .select('role')
          .eq('business_id', activeBusinessId)
          .eq('user_id', user.id)
          .single();
        
        if (!roleError && roleData) {
          setUserRole(roleData.role);
        } else {
          setUserRole(null);
        }

        // 2. Load Accounts
        const { data: accData, error: accError } = await supabase
          .from('accounts')
          .select('*')
          .eq('business_id', activeBusinessId)
          .order('id', { ascending: true });
        
        if (!accError && accData) setAccounts(accData);

        // 3. Load Transactions
        const { data: transData, error: transError } = await supabase
          .from('transactions')
          .select('*')
          .eq('business_id', activeBusinessId)
          .order('date', { ascending: false });

        if (!transError && transData) setTransactions(transData);
        
        // 4. Load Team Members (if possible)
        const { data: teamData, error: teamError } = await supabase
          .from('business_users')
          .select('*, users(email, full_name, id, role)')
          .eq('business_id', activeBusinessId);
        
        if (!teamError && teamData) {
          setTeam(teamData);
        }
      } catch (err) {
        console.error("Critical error fetching context data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeBusinessId, user, role]);

  // Sync role for new users or when business list is empty
  useEffect(() => {
    if (!activeBusinessId && role) {
      setUserRole(role);
    }
  }, [activeBusinessId, role]);

  const activeBusiness = businesses.find(b => b.id === activeBusinessId) || null;

  // Insert business and map it to the user
  const addBusiness = async (businessData) => {
    if (!user) return { success: false, error: 'No User' };
    
    const newId = crypto.randomUUID();

    const { error: bError } = await supabase
      .from('businesses')
      .insert([{ id: newId, ...businessData }]);
      
    if (bError) {
      console.error("Business provision error:", bError);
      return { success: false, error: bError };
    }
    
    const { error: mapError } = await supabase
      .from('business_users')
      .insert([{
        business_id: newId,
        user_id: user.id,
        role: 'Owner'
      }]);
      
    if (mapError) {
      console.error("Mapping error:", mapError);
      return { success: false, error: mapError };
    }
    
    const newBusiness = { id: newId, ...businessData };
    setBusinesses(prev => [newBusiness, ...prev]);
    setActiveBusinessId(newId);

    // Seed a region-appropriate Chart of Accounts template.
    // Note: backend schema currently uses a global PK on accounts.id; templates use region prefixes
    // to avoid collisions across multiple businesses.
    try {
      const template = getCoaTemplateForCountry(businessData?.country);
      if (template?.length) {
        const rows = template.map((a) => ({
          ...a,
          business_id: newId,
          balance: 0,
        }));
        const { error: seedError } = await supabase
          .from('accounts')
          .upsert(rows, { onConflict: 'id' });
        if (seedError) {
          console.warn('COA seed skipped/failed:', seedError.message || seedError);
        }
      }
    } catch (e) {
      console.warn('COA seed failed:', e);
    }

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

  /** India GST: balanced split lines + transaction_tax_lines via SECURITY DEFINER RPC (Step 08). */
  const postGstJournal = async ({
    date,
    description,
    kind,
    mainAccountId,
    counterpartyAccountId,
    taxableBase,
    taxType,
    taxRate,
    hsnSac,
    placeOfSupply,
    itcEligible,
  }) => {
    if (!activeBusinessId) return { success: false, error: 'No Active Business' };

    const { data: txId, error } = await supabase.rpc('post_gst_journal', {
      p_business_id: activeBusinessId,
      p_date: date,
      p_description: description,
      p_kind: kind,
      p_main_account_id: mainAccountId,
      p_counterparty_account_id: counterpartyAccountId,
      p_taxable_base: taxableBase,
      p_tax_type: taxType,
      p_tax_rate: taxRate,
      p_hsn_sac: hsnSac || null,
      p_place_of_supply: placeOfSupply || null,
      p_itc_eligible: itcEligible !== false,
    });

    if (error) return { success: false, error };

    const { data: row, error: fetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', txId)
      .eq('business_id', activeBusinessId)
      .single();

    if (fetchErr || !row) return { success: false, error: fetchErr || new Error('Journal fetch failed') };

    setTransactions((prev) => [row, ...prev]);
    return { success: true };
  };

  const updateTransaction = async (id, updatedData) => {
    if (!activeBusinessId) return { success: false, error: 'No Active Business' };

    const { data, error } = await supabase
      .from('transactions')
      .update(updatedData)
      .eq('id', id)
      .eq('business_id', activeBusinessId)
      .select();

    if (error) return { success: false, error };

    setTransactions(prev => prev.map(t => t.id === id ? data[0] : t));
    return { success: true };
  };

  const deleteTransaction = async (id) => {
    if (!activeBusinessId) return { success: false, error: 'No Active Business' };

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('business_id', activeBusinessId);

    if (error) return { success: false, error };

    setTransactions(prev => prev.filter(t => t.id !== id));
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

  const updateAccount = async (accountId, businessId, updatedData) => {
    // Remove keys that involve the identity of the record
    const { id, business_id, ...dataToUpdate } = updatedData;
    
    const { data, error } = await supabase
      .from('accounts')
      .update(dataToUpdate)
      .eq('id', accountId)
      .eq('business_id', businessId)
      .select();

    if (error) return { success: false, error };
    
    if (data && data.length > 0) {
      setAccounts(prev => prev.map(acc => (acc.id === accountId && acc.business_id === businessId) ? data[0] : acc));
      return { success: true };
    }
    return { success: false, error: 'Authorization error or record not found' };
  };

  const deleteAccount = async (accountId, businessId) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)
      .eq('business_id', businessId);

    if (error) return { success: false, error };

    setAccounts(prev => prev.filter(acc => !(acc.id === accountId && acc.business_id === businessId)));
    return { success: true };
  };

  const assignUser = async (email, role) => {
    if (!activeBusinessId) return { success: false, error: 'No active business' };

    // 1. Find user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) return { success: false, error: 'User not found' };

    // 2. Insert into business_users
    const { error: assignError } = await supabase
      .from('business_users')
      .insert([{
        business_id: activeBusinessId,
        user_id: userData.id,
        role: role
      }]);

    if (assignError) return { success: false, error: assignError };

    // Refresh team
    const { data: teamData } = await supabase
      .from('business_users')
      .select('*, users(email, full_name, id, role)')
      .eq('business_id', activeBusinessId);
    
    if (teamData) setTeam(teamData);

    return { success: true };
  };

  const revokeUser = async (userId) => {
    if (!activeBusinessId) return { success: false, error: 'No active business' };

    const { error } = await supabase
      .from('business_users')
      .delete()
      .eq('business_id', activeBusinessId)
      .eq('user_id', userId);

    if (error) return { success: false, error };

    setTeam(prev => prev.filter(t => t.user_id !== userId));
    return { success: true };
  };

  // Invitation Management
  const createInviteLink = async (role) => {
    if (!activeBusinessId) return { success: false, error: 'No active business' };
    
    // In a real app, this would create a token in the 'invitations' table
    // For now, we simulate a shareable business link
    const inviteLink = `${window.location.origin}/signup?businessId=${activeBusinessId}&role=${role}`;
    return { success: true, link: inviteLink };
  };

  const value = {
    businesses,
    activeBusiness,
    setActiveBusinessId,
    addBusiness,
    accounts: accountsWithBalances,
    addAccount,
    updateAccount,
    deleteAccount,
    transactions,
    addTransaction,
    postGstJournal,
    updateTransaction,
    deleteTransaction,
    loading,
    userRole,
    team,
    assignUser,
    revokeUser,
    createInviteLink
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
