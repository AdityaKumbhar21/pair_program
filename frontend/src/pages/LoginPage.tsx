import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/home';

  useEffect(() => {
    document.title = 'Pair Program — Login';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/sign-in`, {
        email,
        password
      }, {
        withCredentials: true
      });
      navigate(redirect || '/home', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-40 w-96 h-96 bg-white/6 blur-3xl rounded-full" />
        <div className="absolute top-32 right-0 w-xl h-144 bg-white/5 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-3xl h-192 bg-white/8 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-10">
          <Link to="/" className="flex items-center gap-3 text-white/90">
            <img src="/logo.png" alt="Pair Program logo" className="h-9 w-9 rounded-xl border border-white/15 bg-white/5 p-1" />
            <span className="text-2xl font-semibold tracking-tight">Pair Program</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-white/12 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
              <p className="text-sm text-gray-400">Sign in to rejoin your collaborative rooms.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-black/50 px-11 py-3 text-white placeholder-gray-500 transition focus:border-white/40 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-black/50 px-11 py-3 text-white placeholder-gray-500 transition focus:border-white/40 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              <span>Need an account? </span>
              <Link
                to={redirect && redirect !== '/home' ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'}
                className="text-white hover:text-gray-200"
              >
                Create one
              </Link>
            </div>
          </motion.div>

          <p className="text-center text-xs text-gray-500">
            By continuing you agree to our Terms of Service and acknowledge our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
