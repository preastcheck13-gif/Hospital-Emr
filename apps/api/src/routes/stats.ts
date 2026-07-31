import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [patientsToday, appointmentsToday, consultationsToday, pendingBills] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.consultation.count({
        where: {
          consultationDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.bill.count({
        where: {
          status: 'PENDING'
        }
      })
    ]);

    res.json({
      patientsToday,
      appointmentsToday,
      consultationsToday,
      pendingBills
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
