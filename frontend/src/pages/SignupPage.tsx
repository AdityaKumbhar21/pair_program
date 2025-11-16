import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Code2, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate(`/verify-email?email=${email}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Gradient Story */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-purple-600 via-blue-600 to-cyan-500 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-white">
            <Code2 className="w-8 h-8" />
            <span className="text-2xl font-bold">CodeSphere</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-bold text-white">
            Create your team&apos;s
            <br />collaboration hub
          </h2>
          <p className="text-blue-100 text-lg">
            Craft rooms, invite teammates, and ship faster than ever with real-time tools built for engineers.
          </p>
        </div>

        {/* Floating Highlights */}
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-24 right-16 bg-black/30 backdrop-blur-xl rounded-2xl px-6 py-4 text-white shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-500/30">
              <Sparkles className="w-5 h-5 text-purple-200" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-purple-100 font-medium">Live Sessions</p>
              <p className="text-purple-200/80">Spin up a room in seconds.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
          className="absolute bottom-24 right-48 bg-black/30 backdrop-blur-xl rounded-2xl px-6 py-4 text-white shadow-2xl font-mono text-sm"
        >
          <div className="text-cyan-200">// Empower your remote squad</div>
        </motion.div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-72 h-72 bg-blue-600/30 blur-3xl rounded-full -top-10 -left-10" />
          <div className="absolute w-96 h-96 bg-purple-600/20 blur-3xl rounded-full bottom-0 right-0" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          <div className="bg-gray-900/60 backdrop-blur-2xl border border-gray-800/80 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
              <p className="text-gray-400">Start collaborating with your team in under a minute.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-11 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ada Lovelace"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-11 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-11 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Use at least 1 number, 1 symbol and 6+ characters.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  'Creating account...'
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="text-gray-500 text-xs mt-6">
              By signing up you agree to our Terms of Service and acknowledge our Privacy Policy.
            </p>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already part of CodeSphere?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
