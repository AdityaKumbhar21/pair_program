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
      setTimeout(() => navigate('/login'), 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
            <p className="text-gray-400">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-6">✓</div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-yellow-500 text-6xl mb-6">⚠</div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Pending</h2>
            <p className="text-gray-400 mb-6">{message}</p>

            {email && !code && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-300 mb-2">Verification link sent to:</p>
                <p className="font-mono text-blue-400">{email}</p>
              </div>
            )}

            <div className="space-y-3">
              {email && (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
              
              <Link
                to="/home"
                className="block w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-medium transition-all"
              >
                Skip for Now → Go to Dashboard
              </Link>
              
              <p className="text-xs text-gray-500 mt-4">
                You can verify your email later from your dashboard
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
