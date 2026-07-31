import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/orders', authorize('DOCTOR', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const { patientId, consultationId, testType, testCode } = req.body;

    const order = await prisma.labOrder.create({
      data: {
        patientId,
        consultationId,
        testType,
        testCode,
        createdAt: new Date()
      }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Lab order failed' });
  }
});

router.get('/orders/pending', authorize('LAB_TECHNICIAN', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const orders = await prisma.labOrder.findMany({
      where: { status: 'PENDING' },
      include: {
        patient: { select: { firstName: true, lastName: true, hospitalId: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab orders' });
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
    res.status(500).json({ error: 'Failed to save result' });
  }
});

export default router;
