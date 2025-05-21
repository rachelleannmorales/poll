import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken, getStoredToken } from '@/lib/auth';

type TallyDelta = {
  option: string;
  increment: number;
};

export function usePollSocket(pollId: string) {
  const [tallyUpdates, setTallyUpdates] = useState<TallyDelta[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!pollId) return;

    const initializeSocket = async () => {
      try {
        const token = getStoredToken() || await getAuthToken();
        if (!token) {
          setError('Failed to get auth token');
          return;
        }

        const socket = io(`http://localhost:3001/poll/${pollId}`, {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        socketRef.current = socket;

        // Listen for connection status
        socket.on('connect', () => {
          console.log('Connected to poll:', pollId);
          setIsConnected(true);
          setError(null);
        });

        socket.on('disconnect', () => {
          console.log('Disconnected from poll:', pollId);
          setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
          console.error('Connection error:', err);
          setError(`Connection error: ${err.message}`);
          setIsConnected(false);
        });

        socket.on('tallyUpdate', (tally: TallyDelta) => {
          console.log('New tally:', tally);
          setTallyUpdates([tally]);
        });

      } catch (err) {
        console.error('Socket initialization error:', err);
        setError(`Failed to initialize socket: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setTallyUpdates([]);
      setIsConnected(false);
      setError(null);
    };
  }, [pollId]);

  return {
    tallyUpdates,
    socket: socketRef.current,
    isConnected,
    error
  };
}
