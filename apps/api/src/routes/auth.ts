import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../middleware/validation';

const router = Router();

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        specialty: user.specialty
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', authorize('SUPER_ADMIN', 'ADMIN'), validate(registerSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashed,
        firstName,
        lastName,
        phone,
        role: role || 'DOCTOR'
      }
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone
    });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    specialty: user.specialty,
    phone: user.phone
  });
});

router.post('/logout', authenticate, async (_req, res) => {
  res.json({ message: 'Logged out' });
});

export default router;
