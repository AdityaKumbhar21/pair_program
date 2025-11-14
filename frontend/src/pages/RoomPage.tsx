import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';

export default function RoomPage() {
  const { shortId } = useParams<{ shortId: string }>();
  const editorRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!shortId) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL);
    socketRef.current = socket;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.emit('join-room', {
      shortId: shortId,
      user: { name: 'Aditya', color: '#3b82f6' }
    });

    socket.on('room-joined', ({ shortId, user }) => {
      console.log('Joined room:', shortId, user);
    });

    // Receive updates from server
    socket.on('yjs-update', (update: number[]) => {
      const uint8Update = new Uint8Array(update);
      Y.applyUpdate(ydoc, uint8Update);
    });

    // Send updates to server
    ydoc.on('update', (update: Uint8Array) => {
      socket.emit('yjs-update', {
        shortId,
        update: Array.from(update)
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    return () => {
      ydoc.destroy();
      socket.disconnect();
    };
  }, [shortId]);

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    
    if (ydocRef.current) {
      const model = editor.getModel();
      if (model) {
        new MonacoBinding(
          ydocRef.current.getText('monaco'),
          model,
          new Set([editor])
        );
      }
    }
  };

  if (!shortId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Room: {shortId}</span>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            defaultValue="// Start coding together!"
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
        <div className="w-80 bg-gray-100 p-4 border-l border-gray-300">
          <h3 className="font-bold mb-4">Users</h3>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              A
            </div>
            <span>Aditya</span>
          </div>
        </div>
      </div>
    </div>
  );
}