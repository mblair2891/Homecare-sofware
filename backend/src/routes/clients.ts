import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

const ClientSchema = z.object({
  name: z.string().min(1),
  dob: z.string(),
  address: z.string(),
  phone: z.string(),
  pcp: z.string(),
  pcpPhone: z.string().optional(),
  hospital: z.string().optional(),
  payer: z.enum(['Medicaid', 'Private Pay', 'Veterans', 'Long-Term Care Insurance']),
  diagnoses: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  fallRisk: z.enum(['Low', 'Medium', 'High']),
  emergencyContact: z.string(),
  emergencyPhone: z.string(),
  location: z.string(),
  classification: z.enum(['Limited', 'Basic', 'Intermediate', 'Comprehensive']),
  canSelfDirect: z.boolean().optional(),
  stableAndPredictable: z.boolean().optional(),
  notes: z.string().optional(),
});

// GET /api/clients
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Replace with Prisma query when database is connected
    // const clients = await prisma.client.findMany({ where: { agencyId: req.user.agencyId } });
    res.json({ clients: [], message: 'Connect Prisma to fetch real data' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: const client = await prisma.client.findUnique({ where: { id } });
    res.json({ id, message: 'Connect Prisma to fetch client' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// POST /api/clients
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = ClientSchema.parse(req.body);
    // TODO: const client = await prisma.client.create({ data: { ...data, agencyId: req.user.agencyId } });
    res.status(201).json({ message: 'Client created', data });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// PATCH /api/clients/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = ClientSchema.partial().parse(req.body);
    // TODO: const client = await prisma.client.update({ where: { id }, data });
    res.json({ message: 'Client updated', id, data });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: await prisma.client.update({ where: { id }, data: { status: 'Discharged' } });
    res.json({ message: 'Client discharged', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// GET /api/clients/:id/compliance
router.get('/:id/compliance', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Calculate compliance status from Prisma data
    res.json({ clientId: id, complianceAlerts: [], overallStatus: 'compliant' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch compliance status' });
  }
});

export default router;
