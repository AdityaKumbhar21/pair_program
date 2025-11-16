import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function RoomPage() {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  useEffect(() => {
    // Initialize Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Initialize socket connection
    const socketConnection = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketConnection.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Join room
      socketConnection.emit('join-room', {
        user: { name: 'Guest' },
        shortId: shortId || 'demo-room'
      });
    });

    socketConnection.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Handle Yjs updates from server
    socketConnection.on('yjs-update', (update: ArrayBuffer) => {
      if (ydocRef.current) {
        Y.applyUpdate(ydocRef.current, new Uint8Array(update));
      }
    });

    setSocket(socketConnection);

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
      socketConnection.disconnect();
      ydoc.destroy();
    };
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    if (ydocRef.current && socket) {
      const ytext = ydocRef.current.getText('monaco');
      
      // Create Monaco binding
      const binding = new MonacoBinding(
        ytext,
        editorRef.current.getModel(),
        new Set([editorRef.current])
      );
      bindingRef.current = binding;

      // Send updates to server
      ydocRef.current.on('update', (update: Uint8Array) => {
        if (socket.connected) {
          socket.emit('yjs-update', {
            shortId: shortId || 'demo-room',
            update: Array.from(update)
          });
        }
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="text-sm hover:text-gray-300"
          >
            ← Back to Home
          </button>
          <h1 className="text-xl font-bold">Room: {shortId}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </header>
      
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
          }}
        />
      </div>
    </div>
  );
}
