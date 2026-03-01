import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { callEventBus } from './callEventBus';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000') + '/api';

interface RoomUser {
    id: string;
    username: string;
    avatarColor: string;
}

interface Message {
    id: string;
    content: string;
    createdAt: string;
    sender: RoomUser;
    roomId: string;
    senderId: string;
}

interface Room {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    createdBy: RoomUser;
    _count: { members: number; messages: number };
}

interface TypingUser {
    userId: string;
    username: string;
}

export interface CallEvent {
    id: string;
    logType: 'started' | 'ended';
    callType: 'audio' | 'video';
    initiatorName: string;
    startedAt: string;
    endedAt?: string;
    durationSeconds?: number;
    timestamp: string;
    roomId: string;
}

interface ChatContextType {
    rooms: Room[];
    activeRoom: Room | null;
    messages: Message[];
    onlineUsers: RoomUser[];
    typingUsers: TypingUser[];
    callEvents: CallEvent[];
    loadRooms: () => Promise<void>;
    createRoom: (name: string, description: string) => Promise<void>;
    joinRoom: (room: Room) => void;
    leaveRoom: () => void;
    sendMessage: (content: string) => void;
    emitTyping: () => void;
    emitStopTyping: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = (): ChatContextType => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within ChatProvider');
    return ctx;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const { socket } = useSocket();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<RoomUser[]>([]);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [callEvents, setCallEvents] = useState<CallEvent[]>([]);

    const loadRooms = useCallback(async () => {
        if (!token) return;
        const res = await fetch(`${API_URL}/rooms`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setRooms(data);
        }
    }, [token]);

    const createRoom = useCallback(async (name: string, description: string) => {
        if (!token) return;
        const res = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name, description })
        });
        if (res.ok) {
            await loadRooms();
        } else {
            const data = await res.json();
            throw new Error(data.error || 'Failed to create room');
        }
    }, [token, loadRooms]);

    const joinRoom = useCallback(async (room: Room) => {
        if (!socket || !token) return;

        // Leave current room if any
        if (activeRoom) {
            socket.emit('leaveRoom', activeRoom.id);
        }

        // Join via API (ensures membership)
        await fetch(`${API_URL}/rooms/${room.id}/join`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch messages
        const res = await fetch(`${API_URL}/rooms/${room.id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const msgs = await res.json();
            setMessages(msgs);
        }

        // Join via socket
        socket.emit('joinRoom', room.id);
        setActiveRoom(room);
        setTypingUsers([]);
    }, [socket, token, activeRoom]);

    const leaveRoom = useCallback(() => {
        if (!socket || !activeRoom) return;
        socket.emit('leaveRoom', activeRoom.id);
        setActiveRoom(null);
        setMessages([]);
        setOnlineUsers([]);
        setTypingUsers([]);
        setCallEvents([]);
    }, [socket, activeRoom]);

    const sendMessage = useCallback((content: string) => {
        if (!socket || !activeRoom) return;
        socket.emit('sendMessage', { roomId: activeRoom.id, content });
    }, [socket, activeRoom]);

    const emitTyping = useCallback(() => {
        if (!socket || !activeRoom) return;
        socket.emit('typing', activeRoom.id);
    }, [socket, activeRoom]);

    const emitStopTyping = useCallback(() => {
        if (!socket || !activeRoom) return;
        socket.emit('stopTyping', activeRoom.id);
    }, [socket, activeRoom]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: Message) => {
            setMessages(prev => [...prev, msg]);
        };

        const handleRoomUsers = (users: RoomUser[]) => {
            setOnlineUsers(users);
        };

        const handleUserTyping = (data: TypingUser) => {
            setTypingUsers(prev => {
                if (prev.find(u => u.userId === data.userId)) return prev;
                return [...prev, data];
            });
        };

        const handleUserStopTyping = (data: { userId: string }) => {
            setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        };

        const handleCallLog = (event: CallEvent) => {
            setCallEvents(prev => {
                // Deduplicate by id
                if (prev.find(e => e.id === event.id)) return prev;
                return [...prev, event];
            });
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('roomUsers', handleRoomUsers);
        socket.on('userTyping', handleUserTyping);
        socket.on('userStopTyping', handleUserStopTyping);
        socket.on('callLog', handleCallLog);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('roomUsers', handleRoomUsers);
            socket.off('userTyping', handleUserTyping);
            socket.off('userStopTyping', handleUserStopTyping);
            socket.off('callLog', handleCallLog);
        };
    }, [socket]);

    // Local call events (from this tab's own calls) via event bus
    useEffect(() => {
        const unsub = callEventBus.subscribe(event => {
            setCallEvents(prev => {
                if (prev.find(e => e.id === event.id)) return prev;
                return [...prev, event];
            });
        });
        return unsub;
    }, []);

    return (
        <ChatContext.Provider value={{
            rooms, activeRoom, messages, onlineUsers, typingUsers, callEvents,
            loadRooms, createRoom, joinRoom, leaveRoom, sendMessage,
            emitTyping, emitStopTyping
        }}>
            {children}
        </ChatContext.Provider>
    );
};
