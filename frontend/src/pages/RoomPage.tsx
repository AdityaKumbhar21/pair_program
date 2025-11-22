import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import axios from 'axios';
import { Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
] as const;

type LanguageValue = (typeof languageOptions)[number]['value'];

interface Participant {
  id?: string;
  name: string;
  email?: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface FeedbackResult {
  timeComplexity: string;
  spaceComplexity: string;
}

type IncomingUpdate =
  | ArrayBuffer
  | number[]
  | Uint8Array
  | { type: string; data: number[] };

const toUint8Array = (data: IncomingUpdate): Uint8Array => {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (Array.isArray(data)) return Uint8Array.from(data);
  if (data?.type === 'Buffer' && Array.isArray(data.data)) {
    return Uint8Array.from(data.data);
  }
  return new Uint8Array();
};

export default function RoomPage() {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const updateHandlerRef = useRef<((update: Uint8Array) => void) | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [language, setLanguage] = useState<LanguageValue>('javascript');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    document.title = shortId ? `Pair Program — Room ${shortId}` : 'Pair Program — Room';
  }, [shortId]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          withCredentials: true,
        });
        const userData = response.data.user;
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
        });
      } catch (error) {
        const redirectPath = `${location.pathname}${location.search}`;
        const query = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
        navigate(`/login${query}`);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [navigate, location.pathname, location.search]);

  const setupBinding = useCallback(() => {
    const socket = socketRef.current;
    const editor = editorRef.current;
    const ydoc = ydocRef.current;

    if (!socket || !editor || !ydoc) {
      return;
    }

    if (!bindingRef.current) {
      const ytext = ydoc.getText('monaco');
      const binding = new MonacoBinding(ytext, editor.getModel(), new Set([editor]));
      bindingRef.current = binding;
    }

    if (!updateHandlerRef.current) {
      const updateHandler = (update: Uint8Array) => {
        if (socket.connected) {
          socket.emit('yjs-update', {
            shortId: shortId || 'demo-room',
            update: Array.from(update),
          });
        }
      };

      ydoc.on('update', updateHandler);
      updateHandlerRef.current = updateHandler;
    }
  }, [shortId]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const socketConnection = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current = socketConnection;

    const handleConnect = () => {
      setIsConnected(true);
      socketConnection.emit('join-room', {
        user: {
          id: user.id,
          name: user.name || user.email.split('@')[0],
          email: user.email,
        },
        shortId: shortId || 'demo-room',
      });
      setupBinding();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleUsersUpdate = (users: Participant[]) => {
      setParticipants(users);
    };

    const handleYjsUpdate = (update: IncomingUpdate) => {
      if (ydocRef.current) {
        const incoming = toUint8Array(update);
        if (incoming.length) {
          Y.applyUpdate(ydocRef.current, incoming);
        }
      }
    };

    socketConnection.on('connect', handleConnect);
    socketConnection.on('disconnect', handleDisconnect);
    socketConnection.on('room-users', handleUsersUpdate);
    socketConnection.on('yjs-update', handleYjsUpdate);

    setupBinding();

    return () => {
      if (updateHandlerRef.current && ydocRef.current) {
        ydocRef.current.off('update', updateHandlerRef.current);
        updateHandlerRef.current = null;
      }

      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      socketConnection.emit('leave-room', {
        shortId: shortId || 'demo-room',
      });

      socketConnection.off('connect', handleConnect);
      socketConnection.off('disconnect', handleDisconnect);
      socketConnection.off('room-users', handleUsersUpdate);
      socketConnection.off('yjs-update', handleYjsUpdate);
      socketConnection.disconnect();
      socketRef.current = null;

      ydoc.destroy();
      ydocRef.current = null;
      setParticipants([]);
    };
  }, [shortId, user, setupBinding]);

  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleEditorDidMount = useCallback(
    (editor: any, monaco: Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      setupBinding();
    },
    [setupBinding]
  );

  const handleCopyLink = useCallback(() => {
    if (!shortId) {
      return;
    }

    const shareLink = `${window.location.origin}/room/${shortId}`;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(shareLink)
        .then(() => setCopied(true))
        .catch(() => {
          window.prompt('Copy this room link', shareLink);
        });
    } else {
      window.prompt('Copy this room link', shareLink);
    }
  }, [shortId]);

  const handleGenerateFeedback = useCallback(async () => {
    if (!editorRef.current) {
      return;
    }

    const code: string = editorRef.current.getValue?.() || '';

    if (!code.trim()) {
      setFeedback(null);
      setFeedbackError('Add some code in the editor before requesting feedback.');
      return;
    }

    setFeedbackError(null);
    setFeedback(null);
    setFeedbackLoading(true);

    const parsePayload = (payload: any): FeedbackResult | null => {
      if (!payload) {
        return null;
      }

      if (typeof payload === 'string') {
        try {
          const parsed = JSON.parse(payload);
          return {
            timeComplexity: parsed.time_complexity ?? parsed.timeComplexity ?? 'Unable to determine',
            spaceComplexity: parsed.space_complexity ?? parsed.spaceComplexity ?? 'Unable to determine',
          };
        } catch (_error) {
          return null;
        }
      }

      if (payload.timeComplexity || payload.time_complexity) {
        return {
          timeComplexity: payload.timeComplexity ?? payload.time_complexity ?? 'Unable to determine',
          spaceComplexity: payload.spaceComplexity ?? payload.space_complexity ?? 'Unable to determine',
        };
      }

      if (payload.response?.text) {
        try {
          const rawText = payload.response.text();
          return parsePayload(rawText);
        } catch (_error) {
          return null;
        }
      }

      return null;
    };

    try {
      const response = await axios.post(
        `${API_URL}/api/feedback`,
        { code },
        { withCredentials: true }
      );

      const payload = response.data?.feedback ?? response.data?.analysis ?? response.data?.result ?? response.data;
      const parsed = parsePayload(payload);

      if (parsed) {
        setFeedback(parsed);
      } else {
        setFeedback(null);
        setFeedbackError('Could not parse complexity feedback. Please try again.');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to generate feedback. Please try again.';
      setFeedback(null);
      setFeedbackError(message);
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  const handleClearFeedback = useCallback(() => {
    setFeedback(null);
    setFeedbackError(null);
  }, []);

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="h-12 w-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentUserId = user.id;

  return (
    <div className="h-screen flex bg-black text-white overflow-hidden">
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Pair Program</p>
          <h2 className="mt-4 text-2xl font-semibold">Room {shortId}</h2>
          <p className="mt-2 text-sm text-gray-500">Collaborate in real-time with your panel.</p>
        </div>
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Participants</span>
            <span>{participants.length}</span>
          </div>
          <div className="mt-4 space-y-4">
            {participants.length === 0 && (
              <p className="text-sm text-gray-500">Waiting for collaborators...</p>
            )}
            {participants.map((participant, index) => {
              const key = participant.id || participant.email || `${participant.name}-${index}`;
              const isCurrent = participant.id === currentUserId;
              const initials = participant.name?.charAt(0)?.toUpperCase() || 'P';
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all ${
                    isCurrent ? 'border-white/40 bg-white/10' : 'border-white/10 bg-black/30'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {participant.name}
                      {isCurrent && <span className="ml-2 text-xs text-gray-400">(You)</span>}
                    </p>
                    {participant.email && (
                      <p className="text-xs text-gray-500">{participant.email}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-black/60 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to dashboard
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span
                className={`inline-flex h-2.5 w-2.5 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-500'
                }`}
              />
              <span>{isConnected ? 'Live collaboration' : 'Offline'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <span>{participants.length} active</span>
            </div>
            <button
              type="button"
              onClick={handleGenerateFeedback}
              disabled={feedbackLoading}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {feedbackLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Complexity feedback
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:border-white/40"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <div className="flex items-center gap-2">
              <label htmlFor="language" className="text-sm text-gray-400">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value as LanguageValue)}
                className="bg-black border border-white/20 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-white/60"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-black">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {(feedbackLoading || feedback || feedbackError) && (
          <div className="border-b border-white/10 bg-black/60 px-6 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gray-400">
                    <Sparkles className="h-3.5 w-3.5 text-white/80" />
                    <span>Complexity feedback</span>
                  </div>

                  {feedbackLoading && (
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing your code...</span>
                    </div>
                  )}

                  {feedbackError && !feedbackLoading && (
                    <p className="text-sm text-red-400">{feedbackError}</p>
                  )}

                  {feedback && !feedbackLoading && (
                    <div className="grid gap-3 sm:grid-cols-2 text-sm text-gray-300">
                      <div className="rounded-2xl border border-white/15 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Time complexity</p>
                        <p className="mt-2 text-base font-medium text-white">{feedback.timeComplexity}</p>
                      </div>
                      <div className="rounded-2xl border border-white/15 bg-black/40 p-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Space complexity</p>
                        <p className="mt-2 text-base font-medium text-white">{feedback.spaceComplexity}</p>
                      </div>
                    </div>
                  )}
                </div>

                {(feedback || feedbackError) && !feedbackLoading && (
                  <button
                    type="button"
                    onClick={handleClearFeedback}
                    className="text-xs uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        <div className="lg:hidden border-b border-white/10 bg-black/60 px-6 py-3 flex gap-3 overflow-x-auto">
          {participants.length === 0 && (
            <span className="text-sm text-gray-500">Waiting for collaborators...</span>
          )}
          {participants.map((participant, index) => {
            const key = participant.id || participant.email || `${participant.name}-mobile-${index}`;
            const isCurrent = participant.id === currentUserId;
            const initials = participant.name?.charAt(0)?.toUpperCase() || 'P';
            return (
              <div
                key={key}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                  isCurrent ? 'border-white/40 bg-white/10' : 'border-white/10'
                }`}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white text-xs font-semibold">
                  {initials}
                </span>
                <span className="text-gray-200">
                  {participant.name}
                  {isCurrent && <span className="ml-1 text-xs text-gray-400">(You)</span>}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// Start coding together..."
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              smoothScrolling: true,
              padding: { top: 12 },
            }}
          />
        </div>
      </div>
    </div>
  );
}
