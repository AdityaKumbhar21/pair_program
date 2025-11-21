import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    document.title = 'Pair Program — Signup';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/auth/sign-up`,
        {
          name,
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      const redirectQuery = redirect ? `&redirect=${encodeURIComponent(redirect)}` : '';
      navigate(`/verify-email?email=${encodeURIComponent(email)}${redirectQuery}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
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
            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-semibold text-white">Create your account</h1>
              <p className="text-sm text-gray-400">Spin up collaborative rooms with your team in seconds.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-black/50 px-11 py-3 text-white placeholder-gray-500 transition focus:border-white/40 focus:outline-none"
                    placeholder="Ada Lovelace"
                  />
                </div>
              </div>

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
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-black/50 px-11 py-3 text-white placeholder-gray-500 transition focus:border-white/40 focus:outline-none"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <p className="text-xs text-gray-500">Use at least 6 characters, including a number and symbol.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create account'}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>

            <p className="mt-6 text-xs text-gray-500">
              By signing up you agree to our Terms of Service and acknowledge our Privacy Policy.
            </p>

            <div className="mt-6 text-center text-sm text-gray-400">
              <span>Already have an account? </span>
              <Link
                to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
                className="text-white hover:text-gray-200"
              >
                Sign in instead
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
