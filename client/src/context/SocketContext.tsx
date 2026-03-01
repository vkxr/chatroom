import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export const useSocket = (): SocketContextType => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
        const s = io(SOCKET_URL, {
            auth: { token }
        });

        s.on('connect', () => setConnected(true));
        s.on('disconnect', () => setConnected(false));

        setSocket(s);

        return () => {
            s.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
