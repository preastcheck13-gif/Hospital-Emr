import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN', 'RECORDS', 'ACCOUNTS']).default('DOCTOR')
});

export const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleName: z.string().optional(),
  dateOfBirth: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  state: z.string().optional(),
  lga: z.string().optional(),
  nhisNumber: z.string().optional(),
  bloodGroup: z.string().optional(),
  genotype: z.string().optional(),
  occupation: z.string().optional(),
  religion: z.string().optional(),
  allergies: z.any().optional(),
  chronicConditions: z.any().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  nextOfKinRelation: z.string().optional()
});

export const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid().optional(),
  appointmentDate: z.string(),
  department: z.string().min(1),
  type: z.string().min(1),
  notes: z.string().optional()
});

export const consultationSchema = z.object({
  patientId: z.string().uuid(),
  visitType: z.string().min(1),
  chiefComplaint: z.string().min(1),
  historyOfPresentIllness: z.string().optional(),
  physicalExamination: z.string().optional(),
  diagnosis: z.any(),
  treatmentPlan: z.string().optional(),
  vitals: z.any().optional()
});

export const prescriptionSchema = z.object({
  patientId: z.string().uuid(),
  consultationId: z.string().uuid().optional(),
  items: z.any()
});

export const labOrderSchema = z.object({
  patientId: z.string().uuid(),
  consultationId: z.string().uuid().optional(),
  testType: z.string().min(1),
  testCode: z.string().optional()
});

export const billSchema = z.object({
  patientId: z.string().uuid(),
  consultationId: z.string().uuid().optional(),
  items: z.any(),
  subtotal: z.number(),
  discount: z.number().default(0),
  total: z.number()
});
