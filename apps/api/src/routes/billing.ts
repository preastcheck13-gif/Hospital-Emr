import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/', authorize('ACCOUNTS', 'ADMIN', 'DOCTOR'), async (req: AuthenticatedRequest, res) => {
  try {
    const { patientId, consultationId, items, subtotal, discount, total } = req.body;

    const year = new Date().getFullYear();
    const count = await prisma.bill.count();
    const billNumber = `INV/${year}/${String(count + 1).padStart(6, '0')}`;

    const bill = await prisma.bill.create({
      data: {
        patientId,
        consultationId,
        billNumber,
        items,
        subtotal,
        discount,
        total,
        status: 'PENDING'
      }
    });

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ error: 'Billing failed' });
  }
});

router.put('/:id/payment', authorize('ACCOUNTS', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const { paymentMethod, paidBy } = req.body;

    const bill = await prisma.bill.update({
      where: { id: req.params.id },
      data: {
        paymentMethod,
        paidBy,
        paidAt: new Date(),
        status: 'PAID'
      }
    });

    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: 'Payment recording failed' });
  }
});

router.get('/patient/:patientId', async (req: AuthenticatedRequest, res) => {
  try {
    const bills = await prisma.bill.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

export default router;
