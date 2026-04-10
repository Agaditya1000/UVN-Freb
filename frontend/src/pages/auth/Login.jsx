import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../services/supabase';

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
    <div className="flex min-h-screen bg-black text-lightWhite font-roboto font-light">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg bg-naviBlue border-[1.75px] border-borderDark p-8 md:p-12">
          
          <div className="mb-8 flex justify-center text-center">
            <h1 className="text-3xl md:text-4xl font-medium text-white tracking-heading">UV Netware Accounting Utilities</h1>
          </div>

          <div className="mb-8 p-4 border-[1.75px] border-borderDark bg-black text-center text-sm md:text-base font-light">
            Access and manage your documents and databases securely.
          </div>

          {resetSuccess && (
            <div className="mb-6 p-4 border-[1.75px] border-success bg-black text-success text-sm text-center">
              Your password was updated. Sign in with your new password.
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 border-[1.75px] border-error bg-black text-error text-sm text-center font-light">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white tracking-heading">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required
                className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent font-light"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-white tracking-heading">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-grayText hover:text-white transition-none"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  required
                  className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 pr-12 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent font-light"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-grayText hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full mt-4 disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="my-8 flex items-center justify-between">
            <span className="border-b-[1.75px] border-borderDark w-1/5 lg:w-1/4"></span>
            <span className="text-xs text-center text-grayText uppercase tracking-heading font-medium">OR CONTINUE WITH</span>
            <span className="border-b-[1.75px] border-borderDark w-1/5 lg:w-1/4"></span>
          </div>

          <div className="flex flex-col space-y-4 mb-8">
            <button onClick={() => handleOAuth('google')} type="button" className="btn-ghost w-full">
               GOOGLE
            </button>
            <button onClick={() => handleOAuth('github')} type="button" className="btn-ghost w-full">
               GITHUB
            </button>
          </div>

          <div className="text-center text-sm md:text-base font-light">
            <span className="text-grayText">Don't have an account? </span>
            <Link to="/signup" className="text-white font-medium">Sign Up</Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-naviBlue border-l-[1.75px] border-borderDark items-center justify-center p-12 relative overflow-hidden">
         <div className="max-w-2xl z-10 text-center flex flex-col items-center">
            <div className="w-24 h-24 border-[1.75px] border-accent rounded-full mb-8 flex items-center justify-center bg-black">
              <span className="text-accent tracking-heading font-medium text-2xl">UVN</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-medium text-white tracking-heading mb-6 leading-normal">
              Enterprise Grade Financial Management
            </h2>
            <p className="text-lightWhite text-lg font-light leading-normal mb-4">
              Experience multi-region standard compliance including GAAP, IFRS, and IND-AS/GST in one comprehensive platform.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Login;
