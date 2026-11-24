import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, KeyRound, ArrowLeft, Lightbulb, LightbulbOff } from 'lucide-react';

function Mark() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-[var(--sumi)] font-sans">Spendly</h1>
      <p className="text-sm text-[var(--sumi-soft)] font-sans">Personal Expense Tracker</p>
    </div>
  );
}

function Field({ icon: Icon, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm text-[var(--sumi-soft)] font-sans font-medium">
        <Icon className="size-3.5" strokeWidth={1.5} />
        {label}
      </span>
      <Input className="wabi-input font-sans" aria-label={label} {...props} />
    </label>
  );
}

function Quiet({ children, ...props }) {
  return (
    <button
      type="button"
      className="text-sm font-sans text-[var(--sumi-soft)] underline-offset-4 transition-colors hover:text-[var(--sumi)] cursor-pointer"
      {...props}
    >
      {children}
    </button>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="absolute right-5 top-5 z-20 rounded-full border border-[var(--sumi-soft)]/25 p-2.5 text-[var(--sumi-soft)] transition-colors hover:border-[var(--shu)] hover:text-[var(--shu)] cursor-pointer"
    >
      {isDark ? (
        <Lightbulb className="size-4" strokeWidth={1.5} />
      ) : (
        <LightbulbOff className="size-4" strokeWidth={1.5} />
      )}
    </button>
  );
}

function Shell({ children }) {
  return (
    <div className="wabi relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <ThemeToggle />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">
        <Mark />
        {children}
      </div>
    </div>
  );
}

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [view, setView] = useState('auth'); // 'auth' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  // reset password state
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!tokenExpiresAt) return;
    let id;
    const tick = () => {
      const remaining = Math.max(0, Math.round((tokenExpiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) clearInterval(id);
    };
    tick();
    id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tokenExpiresAt]);

  const tokenExpired = tokenExpiresAt !== null && secondsLeft <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to request reset token');
        return;
      }
      setResetToken(data.resetToken);
      setTokenExpiresAt(Date.now() + 15 * 60 * 1000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resetToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }
      setResetSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setView('auth');
    setError('');
    setForgotEmail('');
    setResetToken('');
    setTokenExpiresAt(null);
    setCopied(false);
    setTokenInput('');
    setNewPassword('');
    setResetSuccess(false);
  };

  const Err = () => error && <p className="text-sm font-sans text-[var(--shu)] text-center">{error}</p>;

  // --- Forgot password view ---
  if (view === 'forgot') {
    return (
      <Shell>
        {!resetToken ? (
          <form onSubmit={handleForgot} className="flex w-full flex-col gap-6">
            <div className="text-center font-sans">
              <h2 className="text-xl font-semibold text-[var(--sumi)]">Forgot Password</h2>
              <p className="mt-1 text-xs text-[var(--sumi-soft)]">
                Enter your email address to receive a password reset token.
              </p>
            </div>
            <Field
              icon={Mail}
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Err />
            <Button type="submit" className="wabi-btn w-full py-5 text-base font-sans" disabled={loading}>
              {loading ? 'Please wait...' : 'Get Reset Token'}
            </Button>
            <div className="flex justify-center">
              <Quiet onClick={goBack}>
                <ArrowLeft className="mr-1 inline size-3.5" strokeWidth={1.5} /> Back to Sign In
              </Quiet>
            </div>
          </form>
        ) : (
          <div className="flex w-full flex-col gap-5 font-sans">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[var(--sumi)]">Reset Token Generated</h2>
              <p className="mt-1 text-xs text-[var(--sumi-soft)]">
                Copy this token to proceed with resetting your password.
              </p>
            </div>
            {tokenExpired ? (
              <p className="text-center text-sm text-[var(--shu)]">
                Token expired — please request a new one
              </p>
            ) : (
              <p className="text-center text-sm text-[var(--sumi-soft)]">
                Expires in{' '}
                <span className={secondsLeft <= 60 ? 'text-[var(--shu)] font-medium' : 'font-medium'}>
                  {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
                  {String(secondsLeft % 60).padStart(2, '0')}
                </span>
              </p>
            )}
            <div className="flex items-center gap-2">
              <Input value={resetToken} readOnly className="wabi-input font-mono text-xs" />
              <Button
                type="button"
                onClick={handleCopy}
                className="wabi-btn h-11 w-auto shrink-0 px-4 tracking-normal"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <Button
              type="button"
              className="wabi-btn w-full py-5 text-base"
              disabled={tokenExpired}
              onClick={() => {
                setView('reset');
                setTokenInput(resetToken);
                setError('');
              }}
            >
              Continue to Reset
            </Button>
            <div className="flex justify-center">
              <Quiet onClick={goBack}>
                <ArrowLeft className="mr-1 inline size-3.5" strokeWidth={1.5} /> Back to Sign In
              </Quiet>
            </div>
          </div>
        )}
      </Shell>
    );
  }

  // --- Reset password view ---
  if (view === 'reset') {
    return (
      <Shell>
        {resetSuccess ? (
          <div className="flex w-full flex-col gap-6 text-center font-sans">
            <h2 className="text-xl font-semibold text-[var(--sumi)]">Password Reset Complete</h2>
            <p className="text-sm text-[var(--sumi-soft)]">
              Your password has been updated. You can now sign in.
            </p>
            <Button className="wabi-btn w-full py-5 text-base" onClick={goBack}>
              Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex w-full flex-col gap-6">
            <div className="text-center font-sans">
              <h2 className="text-xl font-semibold text-[var(--sumi)]">Set New Password</h2>
              <p className="mt-1 text-xs text-[var(--sumi-soft)]">
                Enter your reset token and your new password.
              </p>
            </div>
            <Field
              icon={KeyRound}
              label="Reset Token"
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="wabi-input font-mono text-xs"
              disabled={loading}
              required
            />
            <Field
              icon={Lock}
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
            />
            <Err />
            <Button type="submit" className="wabi-btn w-full py-5 text-base font-sans" disabled={loading}>
              {loading ? 'Please wait...' : 'Update Password'}
            </Button>
            <div className="flex justify-center">
              <Quiet onClick={goBack}>
                <ArrowLeft className="mr-1 inline size-3.5" strokeWidth={1.5} /> Back to Sign In
              </Quiet>
            </div>
          </form>
        )}
      </Shell>
    );
  }

  // --- Login / Register view ---
  return (
    <Shell>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
        <Field
          icon={Mail}
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <Field
          icon={Lock}
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <Err />
        <Button type="submit" className="wabi-btn w-full py-5 text-base font-sans font-medium" disabled={loading}>
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
        </Button>

        <div className="flex flex-col items-center gap-3 pt-1">
          {isLogin && (
            <Quiet onClick={() => { setView('forgot'); setError(''); }}>
              Forgot password?
            </Quiet>
          )}
          <div className="flex items-center gap-2 text-sm text-[var(--sumi-soft)]">
            <span className="h-px w-6 bg-[var(--sumi-line)]" />
            <Quiet onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Quiet>
            <span className="h-px w-6 bg-[var(--sumi-line)]" />
          </div>
        </div>
      </form>
    </Shell>
  );
}

export default AuthPage;
