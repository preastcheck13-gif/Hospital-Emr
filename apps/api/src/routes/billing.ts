import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { billSchema } from '../middleware/validation';

const router = Router();
router.use(authenticate);

router.post('/', authorize('ACCOUNTS', 'ADMIN', 'DOCTOR'), validate(billSchema), async (req: AuthenticatedRequest, res) => {
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
        discount: discount || 0,
        total,
        status: 'PENDING'
      }
    });

    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ error: 'Billing failed' });
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
    res.status(400).json({ error: 'Payment recording failed' });
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

router.get('/', authorize('ACCOUNTS', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const { page = '1', limit = '20', status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        skip: skip > 0 ? skip : undefined,
        take: Number(limit),
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, hospitalId: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.bill.count({ where })
    ]);

    res.json({ bills, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

router.put('/:id/void', authorize('ACCOUNTS', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const bill = await prisma.bill.update({
      where: { id: req.params.id },
      data: { status: 'VOIDED' }
    });

    res.json(bill);
  } catch (error) {
    res.status(400).json({ error: 'Void failed' });
  }
});

export default router;
