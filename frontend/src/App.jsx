import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-lightWhite font-roboto font-light antialiased">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <div className="flex flex-col h-screen items-center justify-center bg-black text-white px-4">
                    <h2 className="text-3xl font-medium tracking-heading mb-4">Dashboard Protected View</h2>
                    <p className="text-lightWhite">Available to Owner, Accountant, and Viewer.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={['Owner']}>
                  <div className="flex flex-col h-screen items-center justify-center bg-black text-white px-4">
                    <h2 className="text-3xl font-medium tracking-heading text-success mb-4 pb-2 border-b-[1.75px] border-success">Owner Settings</h2>
                    <p className="text-lightWhite">Only users with the 'Owner' role can access this page.</p>
                  </div>
                </ProtectedRoute>
              } 
            />

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
    </AuthProvider>
  );
}

export default App;
