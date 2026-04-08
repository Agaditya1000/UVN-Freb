import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../services/supabase';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    let settled = false;
    const retryTimers = [];

    const allowReset = (session) => {
      if (!mounted || !session || settled) return;
      settled = true;
      setCanReset(true);
      setCheckingSession(false);
    };

    const finishWithoutSession = () => {
      if (!mounted || settled) return;
      settled = true;
      setCheckingSession(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        allowReset(session);
      }
    });

    const checkSession = () =>
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) allowReset(session);
      });

    checkSession();
    [200, 600, 1500, 3500].forEach((ms) => {
      retryTimers.push(
        setTimeout(() => {
          if (!mounted || settled) return;
          checkSession();
        }, ms)
      );
    });

    const failSafe = setTimeout(() => {
      if (!mounted || settled) return;
      finishWithoutSession();
    }, 10000);

    return () => {
      mounted = false;
      retryTimers.forEach(clearTimeout);
      clearTimeout(failSafe);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    await supabase.auth.signOut();
    navigate('/login?reset=success', { replace: true });
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center px-4">
        <p className="text-lightWhite text-sm tracking-heading">Verifying reset link…</p>
      </div>
    );
  }

  if (!canReset) {
    return (
      <div className="flex min-h-screen bg-black">
        <div className="w-full flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-lg bg-naviBlue border-[1.75px] border-borderDark p-8 md:p-12 text-center">
            <h1 className="text-2xl font-medium text-white tracking-heading mb-4">Link invalid or expired</h1>
            <p className="text-lightWhite text-sm mb-8">
              Request a new reset link from the sign-in page. Links expire after a short time for security.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block p-4 font-medium tracking-heading text-white border-white border-[2px] rounded-[145px] hover:bg-white hover:text-black transition-none uppercase"
            >
              Request new link
            </Link>
            <div className="mt-6">
              <Link to="/login" className="text-grayText hover:text-white text-sm">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      <div className="w-full flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg bg-naviBlue border-[1.75px] border-borderDark p-8 md:p-12 shadow-none transition-none">
          <div className="mb-8 flex justify-center text-center">
            <h1 className="text-3xl md:text-4xl font-medium text-white tracking-heading">Choose a new password</h1>
          </div>

          <p className="mb-8 p-4 border-[1.75px] border-borderDark bg-black text-center text-sm text-lightWhite">
            Enter a strong password you have not used elsewhere.
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 border-[1.75px] border-error bg-black text-error text-sm text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white tracking-heading">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 pr-12 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent transition-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-grayText hover:text-white transition-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white tracking-heading">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full bg-black border-[1.75px] border-borderDark p-3 md:p-4 pr-12 text-lightWhite placeholder-grayText focus:outline-none focus:border-accent transition-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-grayText hover:text-white transition-none"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 p-4 font-medium tracking-heading text-white border-white border-[2px] bg-transparent rounded-[145px] hover:bg-white hover:text-black transition-none uppercase disabled:opacity-50"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <Link to="/login" className="text-grayText hover:text-white text-sm">
              Cancel and return to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
