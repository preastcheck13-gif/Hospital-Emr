import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { consultationSchema } from '../middleware/validation';

const router = Router();
router.use(authenticate);

router.post('/', authorize('DOCTOR', 'ADMIN'), validate(consultationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      patientId,
      visitType,
      chiefComplaint,
      historyOfPresentIllness,
      physicalExamination,
      diagnosis,
      treatmentPlan,
      vitals
    } = req.body;

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        doctorId: req.user!.id,
        visitType,
        chiefComplaint,
        historyOfPresentIllness,
        physicalExamination,
        diagnosis: diagnosis || {},
        treatmentPlan,
        vitals: vitals || {},
        consultationDate: new Date()
      }
    });

    res.status(201).json(consultation);
  } catch (error) {
    res.status(400).json({ error: 'Consultation failed' });
  }
});

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { page = '1', limit = '20', patientId, doctorId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip: skip > 0 ? skip : undefined,
        take: Number(limit),
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, hospitalId: true } },
          doctor: { select: { id: true, firstName: true, lastName: true, specialty: true } }
        },
        orderBy: { consultationDate: 'desc' }
      }),
      prisma.consultation.count({ where })
    ]);

    res.json({ consultations, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const consultation = await prisma.consultation.findUnique({
      where: { id: req.params.id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, hospitalId: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, specialty: true } },
        prescriptions: true,
        labOrders: true
      }
    });

    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consultation' });
  }
});

router.get('/patient/:patientId', async (req: AuthenticatedRequest, res) => {
  try {
    const consultations = await prisma.consultation.findMany({
      where: { patientId: req.params.patientId },
      include: {
        doctor: { select: { id: true, firstName: true, lastName: true, specialty: true } }
      },
      orderBy: { consultationDate: 'desc' }
    });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

router.put('/:id', authorize('DOCTOR', 'ADMIN'), validate(consultationSchema.partial()), async (req: AuthenticatedRequest, res) => {
  try {
    const { diagnosis, treatmentPlan, vitals, physicalExamination, historyOfPresentIllness } = req.body;

    const consultation = await prisma.consultation.update({
      where: { id: req.params.id },
      data: {
        diagnosis,
        treatmentPlan,
        vitals,
        physicalExamination,
        historyOfPresentIllness
      }
    });

    res.json(consultation);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
});

export default router;
