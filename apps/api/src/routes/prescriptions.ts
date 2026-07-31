import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/', authorize('DOCTOR', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const { patientId, consultationId, items } = req.body;

    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        consultationId,
        items,
        prescribedAt: new Date()
      }
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ error: 'Prescription failed' });
  }
});

router.get('/pending', authorize('PHARMACIST', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { status: 'PENDING' },
      include: {
        patient: { select: { firstName: true, lastName: true, hospitalId: true } }
      },
      orderBy: { prescribedAt: 'asc' }
    });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

router.put('/:id/dispense', authorize('PHARMACIST', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const { dispensedBy } = req.body;

    const prescription = await prisma.prescription.update({
      where: { id: req.params.id },
      data: {
        status: 'DISPENSED',
        dispensedAt: new Date(),
        dispensedBy
      }
    });

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: 'Dispense failed' });
  }
});

export default router;
