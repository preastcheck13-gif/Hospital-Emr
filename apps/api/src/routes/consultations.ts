import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/', authorize('DOCTOR', 'ADMIN'), async (req: AuthenticatedRequest, res) => {
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
        diagnosis,
        treatmentPlan,
        vitals,
        consultationDate: new Date()
      }
    });

    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ error: 'Consultation failed' });
  }
});

router.get('/patient/:patientId', async (req: AuthenticatedRequest, res) => {
  try {
    const consultations = await prisma.consultation.findMany({
      where: { patientId: req.params.patientId },
      include: {
        doctor: { select: { firstName: true, lastName: true, specialty: true } }
      },
      orderBy: { consultationDate: 'desc' }
    });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

export default router;
