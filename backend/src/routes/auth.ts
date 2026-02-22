import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // TODO: Replace with Prisma user lookup
    // const user = await prisma.user.findUnique({ where: { email } });
    // if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    //   return res.status(401).json({ error: 'Invalid credentials' });
    // }

    // Demo response
    const token = jwt.sign(
      { userId: 'demo-user', email, role: 'Administrator', agencyId: 'demo-agency' },
      process.env.JWT_SECRET || 'dev-secret-change-in-production',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { email, role: 'Administrator', name: 'Jennifer Adams' } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_, res) => res.json({ message: 'Logged out' }));

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-production');
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
