import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prescriptionSchema } from '../middleware/validation';

const router = Router();
router.use(authenticate);

router.post('/', authorize('DOCTOR', 'ADMIN'), validate(prescriptionSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { patientId, consultationId, items } = req.body;

    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        consultationId,
        items,
        status: 'PENDING'
      }
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ error: 'Prescription failed' });
  }
});

router.get('/pending', authorize('PHARMACIST', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { status: 'PENDING' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, hospitalId: true } },
        consultation: { include: { doctor: { select: { firstName: true, lastName: true } } } }
      },
      orderBy: { prescribedAt: 'asc' }
    });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

router.get('/patient/:patientId', async (req: AuthenticatedRequest, res) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: req.params.patientId },
      include: {
        consultation: { include: { doctor: { select: { firstName: true, lastName: true, specialty: true } } } }
      },
      orderBy: { prescribedAt: 'desc' }
    });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: req.params.id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, hospitalId: true } },
        consultation: { include: { doctor: { select: { firstName: true, lastName: true, specialty: true } } } }
      }
    });

    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

router.put('/:id/ready', authorize('PHARMACIST', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const prescription = await prisma.prescription.update({
      where: { id: req.params.id },
      data: { status: 'READY' }
    });

    res.json(prescription);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
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
    res.status(400).json({ error: 'Dispense failed' });
  }
});

router.put('/:id/cancel', authorize('DOCTOR', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const prescription = await prisma.prescription.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json(prescription);
  } catch (error) {
    res.status(400).json({ error: 'Cancellation failed' });
  }
});

export default router;
