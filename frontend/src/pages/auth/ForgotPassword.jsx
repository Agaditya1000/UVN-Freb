import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, getAuthRedirectOrigin } from '../../services/supabase';
import AuthModal from '../../components/AuthModal';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    const redirectTo = `${getAuthRedirectOrigin()}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setInfoMsg(
      'If an account exists for that email, you will receive a link to reset your password shortly. Check your inbox.'
    );
  };

  return (
    <AuthModal>
      <div className="p-8 md:p-12 bg-surface">
        
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mb-6">
            <span className="text-xl font-bold tracking-tighter italic">UV</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Reset Password</h1>
          <p className="text-sm text-text-secondary font-normal">Enter your email and we'll send you a reset link.</p>
        </div>

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium animate-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl text-center font-medium animate-in slide-in-from-top-2">
            {infoMsg}
          </div>
        )}

        {!infoMsg && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="input-label">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@company.com" 
                required
                autoComplete="email"
                className="input-field"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4.5 text-base shadow-sm mt-4"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-10 text-center text-sm font-normal space-y-3">
          <div>
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Back to Sign In
            </Link>
          </div>
          <div>
            <span className="text-text-secondary">New here? </span>
            <Link to="/signup" className="text-primary font-semibold hover:underline">Create Account</Link>
          </div>
        </div>
      </div>
    </AuthModal>
  );
};

export default ForgotPassword;
