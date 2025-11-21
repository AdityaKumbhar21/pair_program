import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Code2, Share2, Zap, ArrowRight, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface User {
  id: string;
  name: string | null;
  email: string;
}

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    document.title = 'Pair Program — Welcome';
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          withCredentials: true,
        });
        if (isMounted) {
          setUser(response.data.user as User);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const isAuthenticated = Boolean(user);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute -top-48 -left-40 w-96 h-96 bg-white/5 blur-3xl rounded-full"
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-32 right-8 w-xl h-144 bg-white/4 blur-3xl rounded-full"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-3xl h-192 bg-white/10 blur-3xl rounded-full"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pair Program logo" className="h-9 w-9 rounded-xl border border-white/15 bg-white/5 p-1" />
            <span className="text-2xl font-semibold tracking-tight">Pair Program</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/home"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
            )}
            <Link
              to={isAuthenticated ? '/home' : '/signup'}
              className="bg-white text-black hover:bg-neutral-200 px-6 py-2 rounded-full font-medium transition-all"
            >
              {isAuthenticated ? 'Go to dashboard' : 'Get started'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Pair interviews.
              <br />
              Perfected.
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Pair Program gives interviewers a crisp workspace for collaborative coding challenges, instant room sharing, and candidate-friendly sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={isAuthenticated ? '/home' : '/signup'}
                  className="bg-white text-black hover:bg-neutral-200 px-8 py-4 rounded-full font-semibold text-lg transition-all inline-flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {isAuthenticated ? 'Open dashboard' : 'Host an interview'}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/home"
                  className="border border-white/20 hover:border-white/40 px-8 py-4 rounded-full font-semibold text-lg transition-all inline-flex items-center gap-2 text-white"
                >
                  <span>Explore a demo room</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Animated Code Editor Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-20 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto"
          >
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-gray-600" />
              <div className="w-3 h-3 rounded-full bg-gray-600" />
              <div className="w-3 h-3 rounded-full bg-gray-600" />
            </div>
            <div className="bg-black rounded-lg p-6 text-left font-mono text-sm">
              <div className="text-purple-400">
                <span className="text-blue-400">const</span>{' '}
                <span className="text-green-400">collaborate</span> ={' '}
                <span className="text-yellow-400">async</span> () {'=>'} {'{'}
              </div>
              <div className="ml-4 text-gray-400">
                <span className="text-blue-400">const</span> room ={' '}
                <span className="text-pink-400">await</span>{' '}
                createRoom();
              </div>
              <div className="ml-4 text-gray-400">
                <span className="text-pink-400">return</span>{' '}
                <span className="text-green-400">'Real-time magic ✨'</span>;
              </div>
              <div className="text-purple-400">{'};'}</div>
              <div className="mt-4 text-gray-500">// Live cursors, instant sync, zero lag</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Built around real pair programming interviews
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl border border-white/12 flex items-center justify-center mb-4 bg-black/40 group-hover:border-white/25 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to run your next technical interview?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Pair Program keeps candidates focused and interview panels aligned inside a single collaborative room.
          </p>
          <Link
            to={isAuthenticated ? '/home' : '/signup'}
            className="bg-white text-black hover:bg-neutral-200 px-8 py-4 rounded-full font-semibold text-lg transition-all inline-flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            {isAuthenticated ? 'Open dashboard' : 'Start interviewing quicker'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-500" />
            <span className="font-bold">Pair Program</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 Pair Program. Purpose-built for interviewers and their candidates.
          </p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Real-time pair coding',
    description: 'Share an editor and collaborate with candidates without switching tools or tabs.',
    icon: <Code2 className="w-6 h-6 text-white" />,
  },
  {
    title: 'Instant room links',
    description: 'Create a room and send a shareable short link in seconds—no downloads required.',
    icon: <Share2 className="w-6 h-6 text-white" />,
  },
  {
    title: 'Interviewer controls',
    description: 'Keep interviews organised with host controls and a streamlined workflow for panels.',
    icon: <ClipboardCheck className="w-6 h-6 text-white" />,
  },
];
