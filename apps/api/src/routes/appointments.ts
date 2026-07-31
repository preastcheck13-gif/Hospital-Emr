import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { appointmentSchema } from '../middleware/validation';

const router = Router();
router.use(authenticate);

router.post('/', authorize('RECORDS', 'ADMIN', 'NURSE', 'DOCTOR'), validate(appointmentSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { patientId, doctorId, appointmentDate, department, type, notes } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        department,
        type,
        notes,
        status: 'SCHEDULED'
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: 'Booking failed' });
  }
});

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { page = '1', limit = '20', status, doctorId, from, to } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;

    if (from || to) {
      where.appointmentDate = {};
      if (from) where.appointmentDate.gte = new Date(from as string);
      if (to) where.appointmentDate.lte = new Date(to as string);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip: skip > 0 ? skip : undefined,
        take: Number(limit),
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, hospitalId: true, gender: true } },
          doctor: { select: { firstName: true, lastName: true, specialty: true } }
        },
        orderBy: { appointmentDate: 'asc' }
      }),
      prisma.appointment.count({ where })
    ]);

    res.json({ appointments, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/today', async (req: AuthenticatedRequest, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: today,
          lt: tomorrow
        },
        status: { not: 'CANCELLED' }
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, hospitalId: true, gender: true } },
        doctor: { select: { firstName: true, lastName: true, specialty: true } }
      },
      orderBy: { appointmentDate: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        doctor: { select: { firstName: true, lastName: true, specialty: true } }
      }
    });

    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

router.put('/:id/checkin', authorize('NURSE', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date()
      }
    });

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: 'Check-in failed' });
  }
});

router.put('/:id/complete', authorize('DOCTOR', 'NURSE', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: 'Completion failed' });
  }
});

router.put('/:id/cancel', authorize('RECORDS', 'ADMIN', 'NURSE', 'DOCTOR'), async (req: AuthenticatedRequest, res) => {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: 'Cancellation failed' });
  }
});

export default router;
