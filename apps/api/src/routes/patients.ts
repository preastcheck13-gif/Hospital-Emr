import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { patientSchema } from '../middleware/validation';

const router = Router();
router.use(authenticate);

router.get('/search', async (req: AuthenticatedRequest, res) => {
  try {
    const q = (req.query.q as string) || '';
    if (!q) return res.json([]);

    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { hospitalId: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } }
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

router.post('/', authorize('RECORDS', 'ADMIN', 'NURSE'), validate(patientSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      firstName, lastName, middleName, dateOfBirth, gender,
      phone, email, address, state, lga, nhisNumber, bloodGroup, genotype,
      occupation, religion, allergies, chronicConditions,
      nextOfKinName, nextOfKinPhone, nextOfKinRelation
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
        genotype,
        occupation,
        religion,
        allergies,
        chronicConditions,
        nextOfKinName,
        nextOfKinPhone,
        nextOfKinRelation
      }
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

router.get('/', authorize('RECORDS', 'ADMIN', 'NURSE', 'DOCTOR'), async (req: AuthenticatedRequest, res) => {
  const { page = '1', limit = '20', q } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const search = (q as string) || '';
  const where: any = {};

  if (search) {
    where.OR = [
      { hospitalId: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.patient.count({ where })
  ]);

  res.json({ patients, total, page: Number(page), limit: Number(limit) });
});

router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        appointments: { orderBy: { appointmentDate: 'desc' }, take: 10 },
        consultations: { orderBy: { consultationDate: 'desc' }, take: 10, include: { doctor: { select: { firstName: true, lastName: true, specialty: true } } } },
        bills: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });

    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

router.put('/:id', authorize('RECORDS', 'ADMIN', 'NURSE'), validate(patientSchema.partial()), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      firstName, lastName, middleName, dateOfBirth, gender,
      phone, email, address, state, lga, nhisNumber, bloodGroup, genotype,
      occupation, religion, allergies, chronicConditions,
      nextOfKinName, nextOfKinPhone, nextOfKinRelation, isDeceased
    } = req.body;

    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: {
        firstName,
        lastName,
        middleName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        phone,
        email,
        address,
        state,
        lga,
        nhisNumber,
        bloodGroup,
        genotype,
        occupation,
        religion,
        allergies,
        chronicConditions,
        nextOfKinName,
        nextOfKinPhone,
        nextOfKinRelation,
        isDeceased
      }
    });

    res.json(patient);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
});

router.get('/:id/bills', async (req: AuthenticatedRequest, res) => {
  try {
    const bills = await prisma.bill.findMany({
      where: { patientId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

router.get('/:id/consultations', async (req: AuthenticatedRequest, res) => {
  try {
    const consultations = await prisma.consultation.findMany({
      where: { patientId: req.params.id },
      include: {
        doctor: { select: { firstName: true, lastName: true, specialty: true } }
      },
      orderBy: { consultationDate: 'desc' }
    });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

export default router;
