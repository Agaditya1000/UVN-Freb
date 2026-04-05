import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../services/supabase';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Successfully created account! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="flex min-h-screen bg-black">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg bg-naviBlue border-[1.75px] border-borderDark p-8 md:p-12 shadow-none transition-none">
          
          <div className="mb-8 flex justify-center text-center">
            <h1 className="text-3xl md:text-4xl font-medium text-white tracking-heading">UV Netware Accounting Utilities</h1>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 border-[1.75px] border-error bg-black text-error text-sm text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 border-[1.75px] border-success bg-black text-success text-sm text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white tracking-heading">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe" 
                required
                className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent transition-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white tracking-heading">Your Role</label>
              <div className="relative">
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 text-lightWhite focus:outline-none focus:border-accent transition-none appearance-none"
                >
                  <option value="Owner">Owner</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-grayText">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white tracking-heading">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required
                className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent transition-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white tracking-heading">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password" 
                  required
                  className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 pr-12 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent transition-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-grayText hover:text-white transition-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full p-4 font-medium tracking-wider text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none flex justify-center items-center"
            >
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
          </form>

          <div className="my-8 flex items-center justify-between">
            <span className="border-b-[1.75px] border-borderDark w-1/5 lg:w-1/4"></span>
            <span className="text-xs text-center text-grayText uppercase tracking-heading">OR CONTINUE WITH</span>
            <span className="border-b-[1.75px] border-borderDark w-1/5 lg:w-1/4"></span>
          </div>

          <div className="flex flex-col space-y-4 mb-8">
            <button onClick={() => handleOAuth('google')} type="button" className="w-full p-4 font-medium tracking-wider text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none flex justify-center items-center">
               Google
            </button>
            <button onClick={() => handleOAuth('github')} type="button" className="w-full p-4 font-medium tracking-wider text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none flex justify-center items-center">
               GitHub
            </button>
          </div>

          <div className="text-center text-sm md:text-base">
            <span className="text-grayText">Already have an account? </span>
            <Link to="/login" className="text-white hover:underline transition-none font-medium">Sign In</Link>
          </div>

        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-black border-l-[1.75px] border-borderDark items-center justify-center p-12 relative overflow-hidden">
         <div className="max-w-2xl z-10 text-center flex flex-col items-center">
            <div className="w-24 h-24 border-[1.75px] border-accent rounded-full mb-8 flex items-center justify-center bg-naviBlue">
              <span className="text-accent tracking-heading font-medium text-2xl">UVN</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-medium text-white tracking-heading mb-6 leading-tight">
              Create Your New Organization
            </h2>
            <p className="text-lightWhite text-lg font-light leading-relaxed mb-4">
              Step into the future of accounting. Define your business settings and invite stakeholders safely right after signing up.
            </p>
         </div>
         <div className="absolute top-0 right-0 w-full h-1 bg-accent"></div>
      </div>
    </div>
  );
};

export default Register;
