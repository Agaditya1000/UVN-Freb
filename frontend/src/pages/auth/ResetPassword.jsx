import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import AuthModal from '../../components/AuthModal';

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

  const renderContent = () => {
    if (checkingSession) {
      return (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <h2 className="text-xl font-bold text-text mb-2">Verifying reset link...</h2>
          <p className="text-sm text-text-secondary">Please wait while we secure your session.</p>
        </div>
      );
    }

    if (!canReset) {
      return (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-8">
            <XCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text mb-3">Link invalid or expired</h1>
          <p className="text-sm text-text-secondary mb-10 max-w-sm">
            Request a new reset link from the sign-in page. Links expire after a short time for security.
          </p>
          <Link
            to="/forgot-password"
            className="btn-primary w-full py-4 text-sm font-bold shadow-lg"
          >
            Request New Link
          </Link>
          <div className="mt-8">
            <Link to="/login" className="text-primary font-semibold text-sm hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8 md:p-12 bg-surface">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mb-6">
            <span className="text-xl font-bold tracking-tighter italic">UV</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Choose new password</h1>
          <p className="text-sm text-text-secondary font-normal">Enter a strong password you have not used elsewhere.</p>
        </div>

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="input-label">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••" 
                required
                minLength={6}
                autoComplete="new-password"
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

          <div className="space-y-2">
            <label className="input-label">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirm ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••" 
                required
                minLength={6}
                autoComplete="new-password"
                className="input-field"
              />
              <button 
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4.5 text-base shadow-sm mt-4"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link to="/login" className="text-primary font-semibold text-sm hover:underline">
            Cancel and return to sign in
          </Link>
        </div>
      </div>
    );
  };

  return (
    <AuthModal>
      {renderContent()}
    </AuthModal>
  );
};

export default ResetPassword;
