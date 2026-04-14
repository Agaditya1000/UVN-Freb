import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
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
import Profile from './pages/dashboard/Profile';
import ReportsLayout from './pages/dashboard/reports/ReportsLayout';
import ReportsHub from './pages/dashboard/reports/ReportsHub';
import TrialBalanceReport from './pages/dashboard/reports/TrialBalanceReport';
import ProfitLossReport from './pages/dashboard/reports/ProfitLossReport';
import GeneralLedgerReport from './pages/dashboard/reports/GeneralLedgerReport';
import CashFlowReport from './pages/dashboard/reports/CashFlowReport';
import ReportBalanceSheetShell from './pages/dashboard/reports/ReportBalanceSheetShell';
import AssignedUsers from './pages/dashboard/AssignedUsers';

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
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
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
              <Route path="reports" element={<ReportsLayout />}>
                <Route index element={<ReportsHub />} />
                <Route path="trial-balance" element={<TrialBalanceReport />} />
                <Route path="profit-loss" element={<ProfitLossReport />} />
                <Route path="general-ledger" element={<GeneralLedgerReport />} />
                <Route path="balance-sheet" element={<ReportBalanceSheetShell />} />
                <Route path="cash-flow" element={<CashFlowReport />} />
              </Route>
              <Route path="assigned" element={<AssignedUsers />} />
              <Route path="profile" element={<Profile />} />
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
