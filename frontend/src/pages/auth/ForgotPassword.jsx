import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, getAuthRedirectOrigin } from '../../services/supabase';

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
      'If an account exists for that email, you will receive a link to reset your password shortly. Check your inbox and spam folder.'
    );
  };

  return (
    <div className="flex min-h-screen bg-black">
      <div className="w-full flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg bg-naviBlue border-[1.75px] border-borderDark p-8 md:p-12 shadow-none transition-none">
          <div className="mb-8 flex justify-center text-center">
            <h1 className="text-3xl md:text-4xl font-medium text-white tracking-heading">Reset your password</h1>
          </div>

          <p className="mb-8 p-4 border-[1.75px] border-borderDark bg-black text-center text-sm md:text-base text-lightWhite">
            Enter the email you use to sign in. We will send you a link to choose a new password.
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 border-[1.75px] border-error bg-black text-error text-sm text-center">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="mb-6 p-4 border-[1.75px] border-success bg-black text-success text-sm text-center">
              {infoMsg}
            </div>
          )}

          {!infoMsg && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white tracking-heading">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent transition-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 p-4 font-medium tracking-heading text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none uppercase disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="mt-10 text-center text-sm md:text-base space-y-2">
            <div>
              <Link to="/login" className="text-white hover:underline transition-none font-medium">
                Back to sign in
              </Link>
            </div>
            <div>
              <span className="text-grayText">No account? </span>
              <Link to="/signup" className="text-white hover:underline transition-none font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
