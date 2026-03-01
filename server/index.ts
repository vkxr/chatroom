import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import socketHandler from './socket/handler';

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || '*';

const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
