import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    document.title = 'Pair Program — Verify Email';
  }, []);

  useEffect(() => {
    if (code && email) {
      verifyEmail();
    } else if (!code && email) {
      setStatus('error');
      setMessage('Please check your email for the verification link.');
    }
  }, [code, email]);

  const verifyEmail = async () => {
    try {
      await axios.get(`${API_URL}/api/auth/verify-email?email=${encodeURIComponent(email)}&code=${code}`, {
        withCredentials: true
      });
      setStatus('success');
      setMessage('Email verified! Redirecting to login...');
      setTimeout(() => {
        const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
        navigate(`/login${query}`);
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification?email=${encodeURIComponent(email)}`, {}, {
        withCredentials: true
      });
      alert('Verification email sent!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resend');
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
        <div className="w-full max-w-md space-y-8 text-center">
          <Link to="/" className="mx-auto flex w-fit items-center gap-3 text-white/90">
            <img src="/logo.png" alt="Pair Program logo" className="h-9 w-9 rounded-xl border border-white/15 bg-white/5 p-1" />
            <span className="text-2xl font-semibold tracking-tight">Pair Program</span>
          </Link>

          <div className="rounded-2xl border border-white/12 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            {status === 'verifying' && (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <h2 className="text-2xl font-semibold">Verifying email…</h2>
                <p className="text-sm text-gray-400">Hang tight while we confirm your address.</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl text-green-400">
                  ✓
                </div>
                <h2 className="text-2xl font-semibold">Email verified</h2>
                <p className="text-sm text-gray-400">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-3xl text-yellow-400">
                  ⚠
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Verification pending</h2>
                  <p className="text-sm text-gray-400">{message}</p>
                </div>

                {email && !code && (
                  <div className="rounded-xl border border-white/12 bg-white/5 p-4 text-left">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Email sent to</p>
                    <p className="mt-2 font-mono text-sm text-gray-200">{email}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {email && (
                    <button
                      onClick={handleResend}
                      disabled={loading}
                      className="w-full rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Sending…' : 'Resend verification email'}
                    </button>
                  )}

                  <Link
                    to={redirect || '/home'}
                    className="block w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
                  >
                    Skip for now → Go to {redirect ? 'Room' : 'Dashboard'}
                  </Link>

                  <p className="text-xs text-gray-500">You can verify later from your dashboard.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
