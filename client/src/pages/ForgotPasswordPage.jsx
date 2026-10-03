import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService.js';
import { useToast } from '../context/ToastContext.jsx';
import { Button } from '../components/common/Button.jsx';

export const ForgotPasswordPage = () => {
  const { error: toastError, success: toastSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentToken, setSentToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      toastSuccess('Password reset link processed.');
      if (res.data?.resetToken) {
        setSentToken(res.data.resetToken);
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#070b16]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              Discipline<span className="text-brand-500">OS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reset Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter your account email to receive reset instructions.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          {sentToken ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Reset Token Generated
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                In production, an email is dispatched. For local testing, your token is:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs text-brand-600 dark:text-brand-400 break-all select-all">
                {sentToken}
              </div>
              <Link to={`/reset-password?token=${sentToken}`}>
                <Button variant="primary" size="md" className="w-full mt-3">
                  Proceed to Reset Password
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={loading}
                icon={ArrowRight}
                className="w-full py-2.5 text-sm font-semibold"
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Remember your credentials?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
