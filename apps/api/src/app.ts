import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import patientsRoutes from './routes/patients';
import appointmentsRoutes from './routes/appointments';
import consultationsRoutes from './routes/consultations';
import prescriptionsRoutes from './routes/prescriptions';
import labRoutes from './routes/lab';
import billingRoutes from './routes/billing';
import statsRoutes from './routes/stats';

dotenv.config();

export const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', hospital: 'The Great Physician Hospital' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientsRoutes);
app.use('/api/v1/appointments', appointmentsRoutes);
app.use('/api/v1/consultations', consultationsRoutes);
app.use('/api/v1/prescriptions', prescriptionsRoutes);
app.use('/api/v1/lab', labRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/stats', statsRoutes);

app.use(errorHandler);

export function start() {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`TGPH EMR API running on port ${PORT}`);
  });
}

if (require.main === module) {
  start();
}
