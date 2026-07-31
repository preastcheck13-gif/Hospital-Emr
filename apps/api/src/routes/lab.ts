import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { labOrderSchema } from '../middleware/validation';

const router = Router();
router.use(authenticate);

router.post('/orders', authorize('DOCTOR', 'ADMIN'), validate(labOrderSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { patientId, consultationId, testType, testCode } = req.body;

    const order = await prisma.labOrder.create({
      data: {
        patientId,
        consultationId,
        testType,
        testCode,
        status: 'PENDING'
      }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: 'Lab order failed' });
  }
});

router.get('/orders/pending', authorize('LAB_TECHNICIAN', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const orders = await prisma.labOrder.findMany({
      where: { status: 'PENDING' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, hospitalId: true } },
        consultation: { include: { doctor: { select: { firstName: true, lastName: true } } } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab orders' });
  }
});

router.put('/orders/:id/collect', authorize('LAB_TECHNICIAN', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const order = await prisma.labOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'COLLECTED',
        sampleCollectedAt: new Date()
      }
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Sample collection failed' });
  }
});

router.put('/orders/:id/progress', authorize('LAB_TECHNICIAN', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const order = await prisma.labOrder.update({
      where: { id: req.params.id },
      data: { status: 'IN_PROGRESS' }
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
});

router.put('/orders/:id/result', authorize('LAB_TECHNICIAN', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const { result, verifiedBy } = req.body;

    const order = await prisma.labOrder.update({
      where: { id: req.params.id },
      data: {
        result,
        status: 'COMPLETED',
        resultEnteredAt: new Date(),
        verifiedBy,
        verifiedAt: new Date()
      }
    });

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Failed to save result' });
  }
});

router.get('/orders/patient/:patientId', async (req: AuthenticatedRequest, res) => {
  try {
    const orders = await prisma.labOrder.findMany({
      where: { patientId: req.params.patientId },
      include: {
        consultation: { include: { doctor: { select: { firstName: true, lastName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab orders' });
  }
});

export default router;
