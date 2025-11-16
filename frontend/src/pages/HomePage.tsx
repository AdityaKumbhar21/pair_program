import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Code2,
  LogOut,
  Sparkles,
  AlertTriangle,
  Plus,
  Calendar,
  Users,
  ArrowRight,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

interface Room {
  id: string;
  shortId: string;
  createdAt: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchRooms();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
      });
      setUser(response.data.user);
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms/user`, {
        withCredentials: true,
      });
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const handleCreateRoom = async () => {
    setCreating(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/rooms/create-room`,
        {},
        {
          withCredentials: true,
        }
      );
      navigate(`/room/${response.data.shortId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/sign-out`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-16 w-16 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-40 w-96 h-96 bg-white/6 blur-3xl rounded-full" />
        <div className="absolute top-32 right-0 w-xl h-144 bg-white/5 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-3xl h-192 bg-white/8 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen backdrop-blur-[2px]">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 bg-neutral-950/70 backdrop-blur-2xl">
          <div className="p-6 flex flex-col gap-8 h-full">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-white">
                <Code2 className="w-7 h-7" />
                <span className="text-xl font-semibold">Pair Program</span>
              </Link>
              <div className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70 border border-white/15">
                v1.0
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-3">
              <p className="text-sm text-gray-400">Welcome back,</p>
              <h2 className="text-2xl font-semibold text-white">
                {user?.name || 'Developer'}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="px-3 py-1 rounded-full bg-white/5 text-xs border border-white/15 text-gray-200 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  {rooms.length} rooms
                </div>
                <div className="px-3 py-1 rounded-full text-xs border border-white/15 text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {user?.isVerified ? 'Verified' : 'Awaiting verification'}
                </div>
              </div>
            </div>

            <nav className="space-y-2 text-sm text-gray-400">
              <button
                onClick={() => navigate('/home')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/10 text-white border border-white/15"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={creating}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white text-black hover:bg-neutral-200 border border-transparent transition-all disabled:opacity-60"
              >
                <span>Create room</span>
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 transition-all"
              >
                <span>Sign out</span>
                <LogOut className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-10 space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl"
          >
            <div className="absolute inset-0 bg-white/10 opacity-60" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Welcome</p>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {user?.name ? `${user.name},` : 'Developer,'}
                  <br />
                  spin up your next pairing session.
                </h1>
                <p className="text-gray-300 max-w-xl">
                  Launch collaborative rooms instantly, track your sessions, and keep your remote team in sync without breaking flow.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleCreateRoom}
                    disabled={creating}
                    className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-semibold transition-all hover:bg-neutral-200 disabled:opacity-60"
                  >
                    {creating ? 'Creating room...' : 'New Room'}
                    {!creating && <Plus className="w-4 h-4" />}
                  </button>
                  {!user?.isVerified && (
                    <button
                      onClick={() => navigate(`/verify-email?email=${encodeURIComponent(user?.email || '')}`)}
                      className="inline-flex items-center gap-2 rounded-full bg-transparent border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                    >
                      Finish verification
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2 min-w-[220px] text-sm">
                <div className="rounded-2xl bg-black/50 border border-white/15 p-4 space-y-2">
                  <p className="text-gray-400">Active rooms</p>
                  <p className="text-3xl font-semibold">{rooms.length}</p>
                  <p className="text-xs text-gray-500">Total rooms you can jump back into</p>
                </div>
                <div className="rounded-2xl bg-black/50 border border-white/15 p-4 space-y-2">
                  <p className="text-gray-400">Status</p>
                  <p className="text-lg font-semibold text-gray-200">
                    {user?.isVerified ? 'Ready to launch' : 'Pending verification'}
                  </p>
                  <p className="text-xs text-gray-500">You can create rooms even while waiting</p>
                </div>
              </div>
            </div>
          </motion.section>

          {!user?.isVerified && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-5 flex items-start gap-4 text-gray-200"
            >
              <AlertTriangle className="w-6 h-6 mt-1 text-gray-300" />
              <div className="space-y-1">
                <p className="font-semibold">Email verification still pending</p>
                <p className="text-sm opacity-80">
                  You can continue creating rooms while your verification email arrives. Complete verification anytime to unlock advanced analytics.
                </p>
              </div>
            </motion.div>
          )}

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Your rooms</h2>
                <p className="text-sm text-gray-400">Jump back into previous sessions or start a fresh room.</p>
              </div>
              <button
                onClick={handleCreateRoom}
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black hover:bg-neutral-200 border border-transparent px-4 py-2 text-sm transition-all disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                Quick launch
              </button>
            </div>

            {rooms.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center space-y-4"
              >
                <div className="mx-auto w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-gray-200" />
                </div>
                <h3 className="text-xl font-semibold">No rooms yet</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Tap the create button to launch your first pairing session. We&apos;ll save every new room here for quick access.
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {rooms.map((room, index) => (
                  <motion.button
                    key={room.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/room/${room.shortId}`)}
                    className="text-left rounded-2xl border border-white/12 bg-white/5 p-6 hover:border-white/25 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-lg font-semibold text-gray-200 group-hover:text-white">
                        {room.shortId}
                      </p>
                      <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-400 mt-4">
                      Created on {new Date(room.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm text-gray-200">
                      Rejoin session
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
