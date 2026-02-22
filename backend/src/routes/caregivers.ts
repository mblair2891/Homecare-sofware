import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

const CaregiverSchema = z.object({
  name: z.string().min(1),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  location: z.string(),
  classification: z.enum(['Limited', 'Basic', 'Intermediate', 'Comprehensive']),
  certifications: z.array(z.string()).optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  driverLicense: z.boolean().optional(),
  autoInsurance: z.boolean().optional(),
});

router.get('/', async (_req: Request, res: Response) => {
  res.json({ caregivers: [], message: 'Connect Prisma to fetch real data' });
});

router.get('/:id', async (req: Request, res: Response) => {
  res.json({ id: req.params.id });
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = CaregiverSchema.parse(req.body);
    res.status(201).json({ message: 'Caregiver created', data });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Failed to create caregiver' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const data = CaregiverSchema.partial().parse(req.body);
    res.json({ message: 'Caregiver updated', id: req.params.id, data });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Failed to update caregiver' });
  }
});

router.get('/:id/compliance', async (req: Request, res: Response) => {
  res.json({ caregiverId: req.params.id, complianceAlerts: [] });
});

export default router;
