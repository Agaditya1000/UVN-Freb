import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../services/supabase';
import AuthModal from '../../components/AuthModal';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    if (resetSuccess) {
      const next = new URLSearchParams(searchParams);
      next.delete('reset');
      setSearchParams(next, { replace: true });
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider,
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <AuthModal>
      <div className="p-8 md:p-12 bg-surface">
        
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mb-6">
            <span className="text-xl font-bold tracking-tighter italic">UV</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Welcome Back</h1>
          <p className="text-sm text-text-secondary font-normal">Enter your credentials to access your utilities.</p>
        </div>

        {resetSuccess && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl text-center font-medium animate-in slide-in-from-top-2">
            Your password was updated. Sign in with your new password.
          </div>
        )}

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium animate-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@company.com" 
              required
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="input-label font-semibold">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••" 
                required
                className="input-field"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4.5 text-base shadow-sm mt-4"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="my-10 flex items-center justify-between">
          <span className="border-b border-border w-full"></span>
          <span className="px-4 text-[11px] text-text-secondary font-semibold tracking-widest uppercase bg-surface">OR</span>
          <span className="border-b border-border w-full"></span>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-10">
          <button onClick={() => handleOAuth('google')} type="button" className="btn-ghost w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-3">
             <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z"/></svg>
             Continue with Google
          </button>
        </div>

        <div className="text-center text-sm font-normal">
          <span className="text-text-secondary">New to UV Netware? </span>
          <Link to="/signup" className="text-primary font-semibold hover:underline">Create Account</Link>
        </div>
      </div>
    </AuthModal>
  );
};

export default Login;
