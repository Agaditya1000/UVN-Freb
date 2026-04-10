import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { getAuthRedirectOrigin } from '../../services/supabase';
import { User, Mail, ShieldCheck, KeyRound, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleResetPassword = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    const redirectTo = `${getAuthRedirectOrigin()}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
    }
    setLoading(false);
  };

  const fullName = user?.user_metadata?.full_name || 'Agaditya User';
  const email = user?.email || 'user@example.com';
  const role = user?.user_metadata?.role || 'Owner';

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-text tracking-tight mb-2">Account Profile</h1>
        <p className="text-text-secondary text-lg font-medium">Manage your personal identity and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar and Quick Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-surface border border-border p-8 rounded-3xl shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
              {fullName[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-extrabold text-text mb-1">{fullName}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{role}</span>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary font-bold uppercase tracking-wider">Identity</span>
                <span className="text-text font-black">Verified</span>
              </div>
             
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Identity Card */}
          <div className="bg-surface border border-border p-10 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border">
              <div className="p-3 bg-bg text-primary rounded-2xl border border-border">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">Identity Details</h3>
                <p className="text-xs text-text-secondary font-medium">Core information associated with your account.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Full Name</label>
                <div className="p-4 bg-bg border border-border rounded-2xl text-text font-bold shadow-inner">
                  {fullName}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Email Address</label>
                <div className="p-4 bg-bg border border-border rounded-2xl text-text font-bold shadow-inner truncate">
                  {email}
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-surface border border-border p-10 rounded-3xl shadow-sm relative overflow-hidden">
             {/* Decorative pattern */}
             <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>

            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border">
              <div className="p-3 bg-bg text-primary rounded-2xl border border-border">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">Security Utilities</h3>
                <p className="text-xs text-text-secondary font-medium">Protect your financial workspace identity.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 bg-bg border border-border rounded-2xl">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-surface text-primary rounded-2xl border border-border shadow-sm">
                  <KeyRound size={28} />
                </div>
                <div>
                  <h4 className="font-extrabold text-text">Update Password</h4>
                  <p className="text-sm text-text-secondary font-medium">Request a secure reset link to your email.</p>
                </div>
              </div>
              
              <button 
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                Reset Password
              </button>
            </div>

            {message.text && (
              <div className={`mt-8 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="text-sm font-bold">{message.text}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
