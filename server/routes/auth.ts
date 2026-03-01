import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });
        if (existingUser) {
            res.status(400).json({ error: 'Username or email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const colors = ['#6C63FF', '#FF6584', '#43E97B', '#F7971E', '#00C9FF', '#FC5C7D', '#6A82FB'];
        const avatarColor = colors[Math.floor(Math.random() * colors.length)];

        const user = await prisma.user.create({
            data: { username, email, password: hashedPassword, avatarColor }
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id: user.id, username: user.username, email: user.email, avatarColor: user.avatarColor }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email, avatarColor: user.avatarColor }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    res.json({ user: req.user });
});

export default router;
