import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/', authorize('RECORDS', 'ADMIN', 'NURSE', 'DOCTOR'), async (req: AuthenticatedRequest, res) => {
  try {
    const { patientId, doctorId, appointmentDate, department, type, notes } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        department,
        type,
        notes
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Booking failed' });
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
        }
      },
      include: {
        patient: true,
        doctor: { select: { firstName: true, lastName: true, specialty: true } }
      },
      orderBy: { appointmentDate: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
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
    res.status(500).json({ error: 'Check-in failed' });
  }
});

export default router;
