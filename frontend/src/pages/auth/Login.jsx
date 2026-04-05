import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../contexts/ThemeContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setErrorMsg(error.message);
  };

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', transition: 'background 0.25s, color 0.25s' }}>
      {/* Floating theme toggle */}
      <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme"
        style={{ position: 'fixed', top: '1.2rem', right: '1.2rem', zIndex: 50 }}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg border-[1.75px] p-8 md:p-12"
          style={{ background: 'var(--form-bg)', borderColor: 'var(--border)' }}>
=======
    <div className="flex min-h-screen bg-black text-lightWhite font-roboto font-light">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg bg-naviBlue border-[1.75px] border-borderDark p-8 md:p-12">
>>>>>>> Anshu_Raj
          
          <div className="mb-8 flex justify-center text-center">
            <h1 className="text-3xl md:text-4xl font-medium tracking-heading" style={{ color: 'var(--heading)' }}>UV Netware Accounting Utilities</h1>
          </div>

<<<<<<< HEAD
          <div className="mb-8 p-4 text-center text-sm md:text-base" style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', borderRadius: 8 }}>
=======
          <div className="mb-8 p-4 border-[1.75px] border-borderDark bg-black text-center text-sm md:text-base font-light">
>>>>>>> Anshu_Raj
            Access and manage your documents and databases securely.
          </div>

          {errorMsg && (
<<<<<<< HEAD
            <div className="mb-6 p-4 text-sm text-center" style={{ border: '1px solid var(--error)', color: 'var(--error)', background: 'var(--surface)', borderRadius: 8 }}>
=======
            <div className="mb-6 p-4 border-[1.75px] border-error bg-black text-error text-sm text-center font-light">
>>>>>>> Anshu_Raj
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium tracking-heading" style={{ color: 'var(--heading)' }}>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required
<<<<<<< HEAD
                className="input-field"
=======
                className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent font-light"
>>>>>>> Anshu_Raj
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
<<<<<<< HEAD
                <label className="block text-sm font-medium tracking-heading" style={{ color: 'var(--heading)' }}>Password</label>
                <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Reset Password</a>
=======
                <label className="block text-sm font-medium text-white tracking-heading">Password</label>
                <a href="#" className="text-sm text-grayText hover:text-white font-light">Reset Password</a>
>>>>>>> Anshu_Raj
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  required
<<<<<<< HEAD
                  className="input-field"
                  style={{ paddingRight: '3rem' }}
=======
                  className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 pr-12 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent font-light"
>>>>>>> Anshu_Raj
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
<<<<<<< HEAD
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
=======
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-grayText hover:text-white"
>>>>>>> Anshu_Raj
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

<<<<<<< HEAD
            <button type="submit" disabled={loading} className="btn-primary w-full mt-4" style={{ padding: '0.9rem', fontSize: '0.95rem' }}>
              {loading ? 'Signing In...' : 'Sign In'}
=======
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full mt-4 disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
>>>>>>> Anshu_Raj
            </button>
          </form>

          <div className="my-8 flex items-center justify-between">
<<<<<<< HEAD
            <span style={{ borderBottom: '1px solid var(--border)', width: '25%' }}></span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>OR CONTINUE WITH</span>
            <span style={{ borderBottom: '1px solid var(--border)', width: '25%' }}></span>
          </div>

          <div className="flex flex-col space-y-4 mb-8">
            <button onClick={() => handleOAuth('google')} type="button" className="btn-ghost w-full">Google</button>
            <button onClick={() => handleOAuth('github')} type="button" className="btn-ghost w-full">GitHub</button>
          </div>

          <div className="text-center text-sm md:text-base">
            <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
            <Link to="/signup" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
=======
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
>>>>>>> Anshu_Raj
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'var(--bg-2)', borderLeft: '1px solid var(--border)' }}>
         <div className="max-w-2xl z-10 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full mb-8 flex items-center justify-center"
              style={{ border: '2px solid var(--teal)', background: 'var(--surface)' }}>
              <span style={{ color: 'var(--teal)', fontWeight: 700, fontSize: '1.3rem' }}>UVN</span>
            </div>
<<<<<<< HEAD
            <h2 className="text-4xl lg:text-5xl font-medium tracking-heading mb-6 leading-tight" style={{ color: 'var(--heading)' }}>
              Enterprise Grade Financial Management
            </h2>
            <p className="text-lg font-light leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
              Experience multi-region standard compliance including GAAP, IFRS, and IND-AS/GST in one comprehensive platform.
            </p>
         </div>
         <div className="absolute top-0 right-0 w-full" style={{ height: 2, background: 'var(--teal)' }}></div>
=======
            <h2 className="text-4xl lg:text-5xl font-medium text-white tracking-heading mb-6 leading-normal">
              Enterprise Grade Financial Management
            </h2>
            <p className="text-lightWhite text-lg font-light leading-normal mb-4">
              Experience multi-region standard compliance including GAAP, IFRS, and IND-AS/GST in one comprehensive platform.
            </p>
         </div>
>>>>>>> Anshu_Raj
      </div>
    </div>
  );
};

export default Login;
