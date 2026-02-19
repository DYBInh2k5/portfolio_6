import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Base from '@layouts/Baseof';
import { loginWithGoogle, loginWithEmail, logout, onAuthChange } from '@lib/auth';
import { isAdminUser } from '@lib/utils/adminAccess';
import Link from 'next/link';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user && isAdminUser(user)) {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginWithEmail(email, password);
      if (result.user && isAdminUser(result.user)) {
        router.push('/admin');
      } else if (result.user) {
        await logout();
        setError('This account is not allowed to access admin.');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await loginWithGoogle();
      if (result.user && isAdminUser(result.user)) {
        router.push('/admin');
      } else if (result.user) {
        await logout();
        setError('This account is not allowed to access admin.');
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (err) {
      setError('Google login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Base>
      <section className="section">
        <div className="container">
          <div className="mx-auto max-w-md">
            <div className="rounded border border-border p-8 dark:border-darkmode-border">
              <h1 className="h3 mb-6 text-center">Admin Login</h1>

              {error && (
                <div className="mb-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900 dark:text-red-100">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded border border-border bg-white p-3 font-medium hover:bg-gray-50 dark:border-darkmode-border dark:bg-darkmode-theme-light dark:hover:bg-darkmode-theme-dark"
              >
                Login with Google
              </button>

              <div className="mb-6 flex items-center">
                <div className="flex-1 border-t border-border dark:border-darkmode-border" />
                <span className="mx-4 text-gray-500">or</span>
                <div className="flex-1 border-t border-border dark:border-darkmode-border" />
              </div>

              <form onSubmit={handleEmailLogin}>
                <div className="mb-4">
                  <label className="mb-2 block font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2 block font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
                    placeholder="********"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Only allowed admin accounts can continue.</p>
                <Link href="/" className="mt-2 inline-block text-primary hover:underline">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Base>
  );
};

export default Login;
