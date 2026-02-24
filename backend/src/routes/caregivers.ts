import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';
import { AgencyClassification } from '@prisma/client';

const router = Router();

const CLASSIFICATION_MAP: Record<string, AgencyClassification> = {
  'Limited': 'Limited',
  'Basic': 'Basic',
  'Intermediate': 'Intermediate',
  'Comprehensive': 'Comprehensive',
};

const CaregiverSchema = z.object({
  name: z.string().min(1),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  locationId: z.string().optional(),
  classification: z.string(),
  certifications: z.array(z.string()).optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  hireDate: z.string().optional(),
  driverLicense: z.boolean().optional(),
  autoInsurance: z.boolean().optional(),
  backgroundCheckDate: z.string().optional(),
  backgroundCheckRenewalDue: z.string().optional(),
  orientationDate: z.string().optional(),
  initialTrainingDate: z.string().optional(),
  lastAnnualTrainingDate: z.string().optional(),
  medicationTrainedDate: z.string().optional(),
  leieCheckedDate: z.string().optional(),
});

function parseOptionalDate(val?: string): Date | undefined {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

// GET /api/caregivers
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, locationId, search } = req.query;
    const where: any = { agencyId: req.user!.agencyId };
    if (status && status !== 'all') where.status = status;
    if (locationId) where.locationId = locationId as string;
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const caregivers = await prisma.caregiver.findMany({
      where,
      include: {
        location: { select: { id: true, name: true } },
        clientCaregivers: { include: { client: { select: { id: true, name: true } } } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ caregivers });
  } catch (err) {
    console.error('Fetch caregivers error:', err);
    res.status(500).json({ error: 'Failed to fetch caregivers' });
  }
});

// GET /api/caregivers/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const caregiver = await prisma.caregiver.findFirst({
      where: { id: req.params.id, agencyId: req.user!.agencyId },
      include: {
        location: { select: { id: true, name: true } },
        clientCaregivers: { include: { client: { select: { id: true, name: true, address: true } } } },
        shifts: { orderBy: { date: 'desc' }, take: 20 },
      },
    });

    if (!caregiver) return res.status(404).json({ error: 'Caregiver not found' });
    res.json(caregiver);
  } catch (err) {
    console.error('Fetch caregiver error:', err);
    res.status(500).json({ error: 'Failed to fetch caregiver' });
  }
});

// POST /api/caregivers
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = CaregiverSchema.parse(req.body);
    const classification = CLASSIFICATION_MAP[data.classification];
    if (!classification) return res.status(400).json({ error: `Invalid classification: ${data.classification}` });

    const caregiver = await prisma.caregiver.create({
      data: {
        agencyId: req.user!.agencyId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        locationId: data.locationId || undefined,
        classification,
        certifications: data.certifications || [],
        licenseNumber: data.licenseNumber || undefined,
        licenseExpiry: parseOptionalDate(data.licenseExpiry),
        hireDate: parseOptionalDate(data.hireDate),
        driverLicense: data.driverLicense ?? false,
        autoInsurance: data.autoInsurance ?? false,
        backgroundCheckDate: parseOptionalDate(data.backgroundCheckDate),
        backgroundCheckRenewalDue: parseOptionalDate(data.backgroundCheckRenewalDue),
        orientationDate: parseOptionalDate(data.orientationDate),
        initialTrainingDate: parseOptionalDate(data.initialTrainingDate),
        lastAnnualTrainingDate: parseOptionalDate(data.lastAnnualTrainingDate),
        medicationTrainedDate: parseOptionalDate(data.medicationTrainedDate),
        leieCheckedDate: parseOptionalDate(data.leieCheckedDate),
      },
    });

    res.status(201).json(caregiver);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Create caregiver error:', err);
    res.status(500).json({ error: 'Failed to create caregiver' });
  }
});

// PATCH /api/caregivers/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = CaregiverSchema.partial().parse(req.body);

    const existing = await prisma.caregiver.findFirst({ where: { id: req.params.id, agencyId: req.user!.agencyId } });
    if (!existing) return res.status(404).json({ error: 'Caregiver not found' });

    const updateData: any = { ...data };
    if (data.classification) {
      const classification = CLASSIFICATION_MAP[data.classification];
      if (!classification) return res.status(400).json({ error: `Invalid classification: ${data.classification}` });
      updateData.classification = classification;
    }

    const dateFields = [
      'licenseExpiry', 'hireDate', 'backgroundCheckDate', 'backgroundCheckRenewalDue',
      'orientationDate', 'initialTrainingDate', 'lastAnnualTrainingDate',
      'medicationTrainedDate', 'leieCheckedDate',
    ] as const;
    for (const field of dateFields) {
      if (data[field]) updateData[field] = new Date(data[field]!);
    }

    const caregiver = await prisma.caregiver.update({ where: { id: req.params.id }, data: updateData });
    res.json(caregiver);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Update caregiver error:', err);
    res.status(500).json({ error: 'Failed to update caregiver' });
  }
});

// GET /api/caregivers/:id/compliance
router.get('/:id/compliance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const caregiver = await prisma.caregiver.findFirst({
      where: { id: req.params.id, agencyId: req.user!.agencyId },
    });
    if (!caregiver) return res.status(404).json({ error: 'Caregiver not found' });

    const now = new Date();
    const alerts: { field: string; message: string; severity: 'critical' | 'warning' | 'info' }[] = [];

    if (!caregiver.backgroundCheckDate) {
      alerts.push({ field: 'backgroundCheckDate', message: 'Background check not completed', severity: 'critical' });
    } else if (caregiver.backgroundCheckRenewalDue) {
      const daysUntilRenewal = Math.floor((caregiver.backgroundCheckRenewalDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilRenewal < 0) alerts.push({ field: 'backgroundCheckDate', message: `Background check expired ${Math.abs(daysUntilRenewal)} days ago`, severity: 'critical' });
      else if (daysUntilRenewal < 60) alerts.push({ field: 'backgroundCheckDate', message: `Background check renewal due in ${daysUntilRenewal} days`, severity: 'warning' });
    }

    if (!caregiver.orientationDate) {
      alerts.push({ field: 'orientationDate', message: 'Orientation not completed (4hr requirement)', severity: 'critical' });
    }

    if (!caregiver.initialTrainingDate) {
      if (caregiver.hireDate) {
        const daysSinceHire = Math.floor((now.getTime() - caregiver.hireDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceHire > 90) alerts.push({ field: 'initialTrainingDate', message: `Initial training overdue (${daysSinceHire} days since hire)`, severity: 'critical' });
        else if (daysSinceHire > 60) alerts.push({ field: 'initialTrainingDate', message: `Initial training due soon (${90 - daysSinceHire} days remaining)`, severity: 'warning' });
      } else {
        alerts.push({ field: 'initialTrainingDate', message: 'Initial training not completed (8hr requirement)', severity: 'warning' });
      }
    }

    if (caregiver.lastAnnualTrainingDate) {
      const daysSinceTraining = Math.floor((now.getTime() - caregiver.lastAnnualTrainingDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceTraining > 365) alerts.push({ field: 'lastAnnualTrainingDate', message: `Annual training overdue (${daysSinceTraining} days since last)`, severity: 'critical' });
      else if (daysSinceTraining > 300) alerts.push({ field: 'lastAnnualTrainingDate', message: `Annual training due soon (${365 - daysSinceTraining} days remaining)`, severity: 'warning' });
    }

    if (!caregiver.leieCheckedDate) {
      alerts.push({ field: 'leieCheckedDate', message: 'LEIE exclusion check not completed', severity: 'warning' });
    }

    if (caregiver.licenseExpiry) {
      const daysUntilExpiry = Math.floor((caregiver.licenseExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) alerts.push({ field: 'licenseExpiry', message: `License expired ${Math.abs(daysUntilExpiry)} days ago`, severity: 'critical' });
      else if (daysUntilExpiry < 30) alerts.push({ field: 'licenseExpiry', message: `License expires in ${daysUntilExpiry} days`, severity: 'warning' });
    }

    const overallStatus = alerts.some(a => a.severity === 'critical') ? 'non-compliant'
      : alerts.some(a => a.severity === 'warning') ? 'at-risk' : 'compliant';

    res.json({ caregiverId: caregiver.id, overallStatus, alerts });
  } catch (err) {
    console.error('Caregiver compliance error:', err);
    res.status(500).json({ error: 'Failed to fetch caregiver compliance' });
  }
});

export default router;
