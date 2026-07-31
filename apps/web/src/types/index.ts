export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Patient {
  id: string;
  hospitalId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  nhisNumber?: string;
  address?: string;
  state?: string;
  bloodGroup?: string;
  genotype?: string;
}

export interface Appointment {
  id: string;
  appointmentDate: string;
  department: string;
  type: string;
  status: string;
  patient: Patient;
  doctor?: { firstName: string; lastName: string };
}

export interface Consultation {
  id: string;
  visitType: string;
  chiefComplaint: string;
  diagnosis: any[];
  vitals?: any;
  consultationDate: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  total: number;
  status: string;
  paymentMethod?: string;
}
