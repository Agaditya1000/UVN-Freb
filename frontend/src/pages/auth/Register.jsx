import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg bg-naviBlue border-[1.75px] border-borderDark p-8 md:p-12 shadow-none transition-none">
          
          {/* Logo / Brand Placeholder */}
          <div className="mb-8 flex justify-center text-center">
            <h1 className="text-3xl md:text-4xl font-medium text-white tracking-heading">UV Netware Accounting Utilities</h1>
          </div>

          <form className="space-y-6">
            
            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white tracking-heading">
                Your Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. John Doe" 
                className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent transition-none"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white tracking-heading">
                Email
              </label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent transition-none"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white tracking-heading">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a strong password" 
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

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full mt-4 p-4 font-medium tracking-heading text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none uppercase"
            >
              Sign Up
            </button>
          </form>

          <div className="my-8 flex items-center justify-between">
            <span className="border-b-[1.75px] border-borderDark w-1/5 lg:w-1/4"></span>
            <span className="text-xs text-center text-grayText uppercase tracking-heading">OR CONTINUE WITH</span>
            <span className="border-b-[1.75px] border-borderDark w-1/5 lg:w-1/4"></span>
          </div>

          <div className="flex flex-col space-y-4 mb-8">
            <button type="button" className="w-full p-4 font-medium tracking-heading text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none uppercase flex justify-center items-center">
               Google
            </button>
            <button type="button" className="w-full p-4 font-medium tracking-heading text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none uppercase flex justify-center items-center">
               GitHub
            </button>
          </div>

          <div className="text-center text-sm md:text-base">
            <span className="text-grayText">Already have an account? </span>
            <Link to="/login" className="text-white hover:underline transition-none font-medium">
              Sign In
            </Link>
          </div>

        </div>
      </div>

      {/* Right Promotional Area - Desktop Only */}
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
         {/* Minimal decorative element strictly adhering to rules */}
         <div className="absolute top-0 right-0 w-full h-1 bg-accent"></div>
      </div>
    </div>
  );
};

export default Register;
