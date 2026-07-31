import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/search', async (req: AuthenticatedRequest, res) => {
  try {
    const { q } = req.query;

    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { hospitalId: { contains: q as string } },
          { firstName: { contains: q as string, mode: 'insensitive' } },
          { lastName: { contains: q as string, mode: 'insensitive' } },
          { phone: { contains: q as string } }
        ]
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.post('/', authorize('RECORDS', 'ADMIN', 'NURSE'), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      firstName, lastName, middleName, dateOfBirth, gender,
      phone, email, address, state, lga, nhisNumber, bloodGroup, genotype
    } = req.body;

    const year = new Date().getFullYear();
    const count = await prisma.patient.count();
    const hospitalId = `TGPH/${year}/${String(count + 1).padStart(5, '0')}`;

    const patient = await prisma.patient.create({
      data: {
        hospitalId,
        firstName,
        lastName,
        middleName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        email,
        address,
        state,
        lga,
        nhisNumber,
        bloodGroup,
        genotype
      }
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        appointments: { orderBy: { appointmentDate: 'desc' }, take: 10 },
        consultations: { orderBy: { consultationDate: 'desc' }, take: 10 },
        bills: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

export default router;
