import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import clientsRouter from './routes/clients';
import caregiversRouter from './routes/caregivers';
import schedulingRouter from './routes/scheduling';
import billingRouter from './routes/billing';
import complianceRouter from './routes/compliance';
import policiesRouter from './routes/policies';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import formsRouter from './routes/forms';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: 'Too many requests' });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: 'AI rate limit exceeded' });
app.use('/api', limiter);
app.use('/api/policies', aiLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/caregivers', caregiversRouter);
app.use('/api/scheduling', schedulingRouter);
app.use('/api/billing', billingRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);
app.use('/api/forms', formsRouter);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', version: '1.0.0' }));

// 404 handler
app.use((_, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

app.listen(PORT, () => console.log(`CareAxis API running on port ${PORT}`));

export default app;
