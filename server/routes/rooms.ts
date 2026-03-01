import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all rooms
router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                createdBy: { select: { id: true, username: true, avatarColor: true } },
                _count: { select: { members: true, messages: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rooms);
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a room
router.post('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;

        const existing = await prisma.room.findUnique({ where: { name } });
        if (existing) {
            res.status(400).json({ error: 'Room name already exists' });
            return;
        }

        const room = await prisma.room.create({
            data: {
                name,
                description: description || '',
                createdById: req.user!.id,
                members: {
                    create: { userId: req.user!.id }
                }
            },
            include: {
                createdBy: { select: { id: true, username: true, avatarColor: true } },
                _count: { select: { members: true, messages: true } }
            }
        });

        res.status(201).json(room);
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Join a room
router.post('/:id/join', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = String(req.params.id);

        const room = await prisma.room.findUnique({ where: { id } });
        if (!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }

        const existingMembership = await prisma.roomMember.findUnique({
            where: { userId_roomId: { userId: req.user!.id, roomId: id } }
        });

        if (!existingMembership) {
            await prisma.roomMember.create({
                data: { userId: req.user!.id, roomId: id }
            });
        }

        const updatedRoom = await prisma.room.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, username: true, avatarColor: true } },
                _count: { select: { members: true, messages: true } }
            }
        });

        res.json(updatedRoom);
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get messages for a room
router.get('/:id/messages', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = String(req.params.id);
        const messages = await prisma.message.findMany({
            where: { roomId: id },
            include: {
                sender: { select: { id: true, username: true, avatarColor: true } }
            },
            orderBy: { createdAt: 'asc' },
            take: 100
        });
        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
