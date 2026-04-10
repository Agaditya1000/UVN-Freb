import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';

import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import BusinessSetup from './pages/dashboard/BusinessSetup';
import ChartOfAccounts from './pages/dashboard/ChartOfAccounts';
import Transactions from './pages/dashboard/Transactions';
import BalanceSheet from './pages/dashboard/BalanceSheet';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-bg text-text antialiased transition-colors duration-300">
          <Routes>
            <Route path="/" element={<Landing />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Register />} />
            </Route>
            
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} 
            >
              <Route index element={<Overview />} />
              <Route path="business" element={<ProtectedRoute allowedRoles={['Owner']}><BusinessSetup /></ProtectedRoute>} />
              <Route path="accounts" element={<ChartOfAccounts />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="balance-sheet" element={<BalanceSheet />} />
            </Route>
            
            <Route 
              path="/unauthorized" 
              element={
                <div className="flex flex-col h-screen items-center justify-center bg-black text-error px-4 text-center">
                  <h2 className="text-4xl font-medium tracking-heading mb-4 pb-2 border-b-[1.75px] border-error">403 Unauthorized</h2>
                  <p className="text-lightWhite">You do not have the required role to view this page.</p>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AppProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
