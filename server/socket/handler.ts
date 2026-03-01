import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UserInfo {
    id: string;
    username: string;
    avatarColor: string;
}

interface AuthSocket extends Socket {
    userId?: string;
    currentRoom?: string;
}

// Track online users per room
const roomUsers: Record<string, Record<string, UserInfo>> = {};

export default (io: Server): void => {
    io.use(async (socket: AuthSocket, next) => {
        const token = socket.handshake.auth.token as string | undefined;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            socket.userId = decoded.userId;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket: AuthSocket) => {
        const user = await prisma.user.findUnique({
            where: { id: socket.userId! },
            select: { id: true, username: true, avatarColor: true }
        });

        if (!user) {
            socket.disconnect();
            return;
        }

        console.log(`User connected: ${user.username} (${socket.id})`);

        socket.on('joinRoom', (roomId: string) => {
            socket.join(roomId);

            if (!roomUsers[roomId]) {
                roomUsers[roomId] = {};
            }
            roomUsers[roomId][socket.id] = user;

            io.to(roomId).emit('roomUsers', Object.values(roomUsers[roomId]));
            socket.to(roomId).emit('userJoined', {
                user,
                message: `${user.username} joined the room`
            });

            socket.currentRoom = roomId;
        });

        socket.on('leaveRoom', (roomId: string) => {
            socket.leave(roomId);

            if (roomUsers[roomId]) {
                delete roomUsers[roomId][socket.id];
                io.to(roomId).emit('roomUsers', Object.values(roomUsers[roomId]));
                socket.to(roomId).emit('userLeft', {
                    user,
                    message: `${user.username} left the room`
                });
            }

            socket.currentRoom = undefined;
        });

        socket.on('sendMessage', async ({ roomId, content }: { roomId: string; content: string }) => {
            try {
                const message = await prisma.message.create({
                    data: {
                        content,
                        senderId: user.id,
                        roomId
                    },
                    include: {
                        sender: { select: { id: true, username: true, avatarColor: true } }
                    }
                });

                io.to(roomId).emit('newMessage', message);
            } catch (error) {
                console.error('Send message error:', error);
            }
        });

        socket.on('typing', (roomId: string) => {
            socket.to(roomId).emit('userTyping', { userId: user.id, username: user.username });
        });

        socket.on('stopTyping', (roomId: string) => {
            socket.to(roomId).emit('userStopTyping', { userId: user.id });
        });

        // ── WebRTC Call Signaling ─────────────────────────────────────────
        socket.on('callUser', ({ roomId, callType }: { roomId: string; callType: 'audio' | 'video' }) => {
            socket.to(roomId).emit('incomingCall', {
                callerSocketId: socket.id,
                callerName: user.username,
                roomId,
                callType,
            });
        });

        socket.on('acceptCall', ({ callerSocketId }: { callerSocketId: string }) => {
            io.to(callerSocketId).emit('callAccepted', {
                accepterSocketId: socket.id,
                accepterName: user.username,
            });
        });

        socket.on('declineCall', ({ callerSocketId }: { callerSocketId: string }) => {
            io.to(callerSocketId).emit('callDeclined', {
                declinerName: user.username,
            });
        });

        // Relay SDP offers/answers and ICE candidates between specific peers
        socket.on('callSignal', ({ targetSocketId, signal }: { targetSocketId: string; signal: unknown }) => {
            io.to(targetSocketId).emit('callSignal', {
                fromSocketId: socket.id,
                fromName: user.username,
                signal,
            });
        });

        socket.on('callEnded', ({ roomId }: { roomId: string }) => {
            socket.to(roomId).emit('callEnded', {
                endedBy: user.username,
                endedBySocketId: socket.id,
            });
        });

        // Relay call log events to ALL room members (including sender)
        socket.on('callLog', (data: {
            roomId: string;
            logType: 'started' | 'ended';
            callType: 'audio' | 'video';
            startedAt: string;
            endedAt?: string;
            durationSeconds?: number;
        }) => {
            io.to(data.roomId).emit('callLog', {
                ...data,
                id: `cl-${socket.id}-${Date.now()}`,
                initiatorName: user.username,
                timestamp: new Date().toISOString(),
            });
        });
        // ─────────────────────────────────────────────────────────────────

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${user.username} (${socket.id})`);

            for (const roomId of Object.keys(roomUsers)) {
                if (roomUsers[roomId][socket.id]) {
                    delete roomUsers[roomId][socket.id];
                    io.to(roomId).emit('roomUsers', Object.values(roomUsers[roomId]));
                    io.to(roomId).emit('userLeft', {
                        user,
                        message: `${user.username} left the room`
                    });
                }
            }
        });
    });
};
