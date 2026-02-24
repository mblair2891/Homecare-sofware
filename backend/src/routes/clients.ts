import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';
import { PayerType, AgencyClassification } from '@prisma/client';

const router = Router();

const PAYER_MAP: Record<string, PayerType> = {
  'Medicaid': 'Medicaid',
  'Private Pay': 'PrivatePay',
  'PrivatePay': 'PrivatePay',
  'Veterans': 'Veterans',
  'Long-Term Care Insurance': 'LongTermCareInsurance',
  'LongTermCareInsurance': 'LongTermCareInsurance',
};

const CLASSIFICATION_MAP: Record<string, AgencyClassification> = {
  'Limited': 'Limited',
  'Basic': 'Basic',
  'Intermediate': 'Intermediate',
  'Comprehensive': 'Comprehensive',
};

const ClientSchema = z.object({
  name: z.string().min(1),
  dob: z.string(),
  address: z.string(),
  phone: z.string(),
  pcp: z.string(),
  pcpPhone: z.string().optional(),
  hospital: z.string().optional(),
  payer: z.string(),
  diagnoses: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  fallRisk: z.enum(['Low', 'Medium', 'High']).optional(),
  emergencyContact: z.string(),
  emergencyPhone: z.string(),
  locationId: z.string().optional(),
  classification: z.string(),
  canSelfDirect: z.boolean().optional(),
  stableAndPredictable: z.boolean().optional(),
  notes: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  disclosureSignedDate: z.string().optional(),
  rightsSignedDate: z.string().optional(),
  initialAssessmentDate: z.string().optional(),
  servicePlanDate: z.string().optional(),
  serviceAgreementDate: z.string().optional(),
  initialVisitDate: z.string().optional(),
  lastMonitoringDate: z.string().optional(),
  lastSelfDirectionEvalDate: z.string().optional(),
});

function parseOptionalDate(val?: string): Date | undefined {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

// GET /api/clients
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, locationId, search } = req.query;
    const where: any = { agencyId: req.user!.agencyId };
    if (status && status !== 'all') where.status = status;
    if (locationId) where.locationId = locationId as string;
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const clients = await prisma.client.findMany({
      where,
      include: {
        location: { select: { id: true, name: true } },
        clientCaregivers: { include: { caregiver: { select: { id: true, name: true } } } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ clients });
  } catch (err) {
    console.error('Fetch clients error:', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// GET /api/clients/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, agencyId: req.user!.agencyId },
      include: {
        location: { select: { id: true, name: true } },
        clientCaregivers: { include: { caregiver: { select: { id: true, name: true, phone: true } } } },
        shifts: { orderBy: { date: 'desc' }, take: 20 },
        formRecords: { orderBy: { completedAt: 'desc' } },
        monitoringVisits: { orderBy: { visitDate: 'desc' } },
      },
    });

    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    console.error('Fetch client error:', err);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// POST /api/clients
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = ClientSchema.parse(req.body);
    const payer = PAYER_MAP[data.payer];
    if (!payer) return res.status(400).json({ error: `Invalid payer type: ${data.payer}` });
    const classification = CLASSIFICATION_MAP[data.classification];
    if (!classification) return res.status(400).json({ error: `Invalid classification: ${data.classification}` });

    const client = await prisma.client.create({
      data: {
        agencyId: req.user!.agencyId,
        name: data.name,
        dob: new Date(data.dob),
        address: data.address,
        phone: data.phone,
        pcp: data.pcp,
        pcpPhone: data.pcpPhone || '',
        hospital: data.hospital || '',
        payer,
        diagnoses: data.diagnoses || [],
        allergies: data.allergies || [],
        medications: data.medications || [],
        fallRisk: data.fallRisk || 'Low',
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        locationId: data.locationId || undefined,
        classification,
        canSelfDirect: data.canSelfDirect ?? true,
        stableAndPredictable: data.stableAndPredictable ?? true,
        notes: data.notes || '',
        startDate: parseOptionalDate(data.startDate),
        endDate: parseOptionalDate(data.endDate),
        disclosureSignedDate: parseOptionalDate(data.disclosureSignedDate),
        rightsSignedDate: parseOptionalDate(data.rightsSignedDate),
        initialAssessmentDate: parseOptionalDate(data.initialAssessmentDate),
        servicePlanDate: parseOptionalDate(data.servicePlanDate),
        serviceAgreementDate: parseOptionalDate(data.serviceAgreementDate),
        initialVisitDate: parseOptionalDate(data.initialVisitDate),
        lastMonitoringDate: parseOptionalDate(data.lastMonitoringDate),
        lastSelfDirectionEvalDate: parseOptionalDate(data.lastSelfDirectionEvalDate),
      },
    });

    res.status(201).json(client);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// PATCH /api/clients/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = ClientSchema.partial().parse(req.body);

    const existing = await prisma.client.findFirst({ where: { id: req.params.id, agencyId: req.user!.agencyId } });
    if (!existing) return res.status(404).json({ error: 'Client not found' });

    const updateData: any = { ...data };
    if (data.payer) {
      const payer = PAYER_MAP[data.payer];
      if (!payer) return res.status(400).json({ error: `Invalid payer type: ${data.payer}` });
      updateData.payer = payer;
    }
    if (data.classification) {
      const classification = CLASSIFICATION_MAP[data.classification];
      if (!classification) return res.status(400).json({ error: `Invalid classification: ${data.classification}` });
      updateData.classification = classification;
    }
    if (data.dob) updateData.dob = new Date(data.dob);
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const dateFields = [
      'disclosureSignedDate', 'rightsSignedDate', 'initialAssessmentDate',
      'servicePlanDate', 'serviceAgreementDate', 'initialVisitDate',
      'lastMonitoringDate', 'lastSelfDirectionEvalDate',
    ] as const;
    for (const field of dateFields) {
      if (data[field]) updateData[field] = new Date(data[field]!);
    }

    const client = await prisma.client.update({ where: { id: req.params.id }, data: updateData });
    res.json(client);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Update client error:', err);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id (soft delete — sets status to Discharged)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.client.findFirst({ where: { id: req.params.id, agencyId: req.user!.agencyId } });
    if (!existing) return res.status(404).json({ error: 'Client not found' });

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: { status: 'Discharged', endDate: new Date() },
    });
    res.json({ message: 'Client discharged', client });
  } catch (err) {
    console.error('Discharge client error:', err);
    res.status(500).json({ error: 'Failed to discharge client' });
  }
});

// GET /api/clients/:id/compliance
router.get('/:id/compliance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, agencyId: req.user!.agencyId },
      include: { monitoringVisits: { orderBy: { visitDate: 'desc' }, take: 1 } },
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const now = new Date();
    const alerts: { field: string; message: string; severity: 'critical' | 'warning' | 'info' }[] = [];

    if (!client.disclosureSignedDate) alerts.push({ field: 'disclosureSignedDate', message: 'Client disclosure not signed', severity: 'critical' });
    if (!client.rightsSignedDate) alerts.push({ field: 'rightsSignedDate', message: 'Client rights notice not signed', severity: 'critical' });
    if (!client.initialAssessmentDate) alerts.push({ field: 'initialAssessmentDate', message: 'Initial assessment not completed', severity: 'critical' });
    if (!client.servicePlanDate) alerts.push({ field: 'servicePlanDate', message: 'Service plan not created', severity: 'critical' });
    if (!client.serviceAgreementDate) alerts.push({ field: 'serviceAgreementDate', message: 'Service agreement not signed', severity: 'critical' });

    if (client.startDate && !client.initialVisitDate) {
      const daysSinceStart = Math.floor((now.getTime() - client.startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceStart >= 7) alerts.push({ field: 'initialVisitDate', message: `Initial visit overdue (${daysSinceStart} days since start)`, severity: daysSinceStart > 30 ? 'critical' : 'warning' });
    }

    if (client.lastMonitoringDate) {
      const daysSinceMonitoring = Math.floor((now.getTime() - client.lastMonitoringDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceMonitoring > 90) alerts.push({ field: 'lastMonitoringDate', message: `Monitoring visit overdue (${daysSinceMonitoring} days since last)`, severity: 'critical' });
      else if (daysSinceMonitoring > 75) alerts.push({ field: 'lastMonitoringDate', message: `Monitoring visit due soon (${daysSinceMonitoring} days since last)`, severity: 'warning' });
    } else if (client.startDate) {
      alerts.push({ field: 'lastMonitoringDate', message: 'No monitoring visits recorded', severity: 'warning' });
    }

    if (client.canSelfDirect && client.lastSelfDirectionEvalDate) {
      const daysSinceEval = Math.floor((now.getTime() - client.lastSelfDirectionEvalDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceEval > 90) alerts.push({ field: 'lastSelfDirectionEvalDate', message: `Self-direction re-evaluation overdue (${daysSinceEval} days)`, severity: 'critical' });
    }

    const overallStatus = alerts.some(a => a.severity === 'critical') ? 'non-compliant'
      : alerts.some(a => a.severity === 'warning') ? 'at-risk' : 'compliant';

    res.json({ clientId: client.id, overallStatus, alerts });
  } catch (err) {
    console.error('Client compliance error:', err);
    res.status(500).json({ error: 'Failed to fetch compliance status' });
  }
});

export default router;
