import { Router, Response } from 'express';
import { differenceInDays } from 'date-fns';
import { prisma } from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// GET /api/compliance/dashboard
router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const agencyId = req.user!.agencyId;
    const now = new Date();

    const [clients, caregivers, agency] = await Promise.all([
      prisma.client.findMany({ where: { agencyId, status: 'Active' } }),
      prisma.caregiver.findMany({ where: { agencyId, status: 'Active' } }),
      prisma.agency.findFirst({ where: { id: agencyId }, include: { locations: true } }),
    ]);

    const alerts: { type: string; entity: string; entityId: string; message: string; severity: 'critical' | 'warning' | 'info' }[] = [];

    // Check agency/location license expiry
    if (agency?.licenseExpiry) {
      const daysUntil = differenceInDays(agency.licenseExpiry, now);
      if (daysUntil < 0) alerts.push({ type: 'license', entity: 'Agency', entityId: agency.id, message: `Agency license expired ${Math.abs(daysUntil)} days ago`, severity: 'critical' });
      else if (daysUntil < 60) alerts.push({ type: 'license', entity: 'Agency', entityId: agency.id, message: `Agency license expires in ${daysUntil} days`, severity: 'warning' });
    }
    for (const loc of agency?.locations || []) {
      if (loc.licenseExpiry) {
        const daysUntil = differenceInDays(loc.licenseExpiry, now);
        if (daysUntil < 0) alerts.push({ type: 'license', entity: `Location: ${loc.name}`, entityId: loc.id, message: `License expired ${Math.abs(daysUntil)} days ago`, severity: 'critical' });
        else if (daysUntil < 60) alerts.push({ type: 'license', entity: `Location: ${loc.name}`, entityId: loc.id, message: `License expires in ${daysUntil} days`, severity: 'warning' });
      }
    }

    // Client compliance checks
    let clientCompliant = 0;
    for (const c of clients) {
      let hasIssue = false;
      if (!c.disclosureSignedDate) { alerts.push({ type: 'client', entity: c.name, entityId: c.id, message: 'Disclosure not signed', severity: 'critical' }); hasIssue = true; }
      if (!c.rightsSignedDate) { alerts.push({ type: 'client', entity: c.name, entityId: c.id, message: 'Rights notice not signed', severity: 'critical' }); hasIssue = true; }
      if (!c.initialAssessmentDate) { alerts.push({ type: 'client', entity: c.name, entityId: c.id, message: 'Initial assessment missing', severity: 'critical' }); hasIssue = true; }
      if (!c.servicePlanDate) { alerts.push({ type: 'client', entity: c.name, entityId: c.id, message: 'Service plan missing', severity: 'critical' }); hasIssue = true; }
      if (c.lastMonitoringDate && differenceInDays(now, c.lastMonitoringDate) > 90) {
        alerts.push({ type: 'client', entity: c.name, entityId: c.id, message: `Monitoring visit overdue (${differenceInDays(now, c.lastMonitoringDate)} days)`, severity: 'critical' });
        hasIssue = true;
      }
      if (!hasIssue) clientCompliant++;
    }

    // Caregiver compliance checks
    let caregiverCompliant = 0;
    for (const cg of caregivers) {
      let hasIssue = false;
      if (!cg.backgroundCheckDate) { alerts.push({ type: 'caregiver', entity: cg.name, entityId: cg.id, message: 'Background check missing', severity: 'critical' }); hasIssue = true; }
      if (cg.backgroundCheckRenewalDue && differenceInDays(cg.backgroundCheckRenewalDue, now) < 0) {
        alerts.push({ type: 'caregiver', entity: cg.name, entityId: cg.id, message: 'Background check expired', severity: 'critical' });
        hasIssue = true;
      }
      if (!cg.orientationDate) { alerts.push({ type: 'caregiver', entity: cg.name, entityId: cg.id, message: 'Orientation not completed', severity: 'critical' }); hasIssue = true; }
      if (cg.lastAnnualTrainingDate && differenceInDays(now, cg.lastAnnualTrainingDate) > 365) {
        alerts.push({ type: 'caregiver', entity: cg.name, entityId: cg.id, message: 'Annual training overdue', severity: 'critical' });
        hasIssue = true;
      }
      if (cg.licenseExpiry && differenceInDays(cg.licenseExpiry, now) < 0) {
        alerts.push({ type: 'caregiver', entity: cg.name, entityId: cg.id, message: 'License expired', severity: 'critical' });
        hasIssue = true;
      }
      if (!hasIssue) caregiverCompliant++;
    }

    const totalEntities = clients.length + caregivers.length;
    const compliantEntities = clientCompliant + caregiverCompliant;
    const overallScore = totalEntities > 0 ? Math.round((compliantEntities / totalEntities) * 100) : 100;

    res.json({
      overallScore,
      alerts: alerts.slice(0, 50), // Cap at 50 for performance
      summary: {
        totalClients: clients.length,
        compliantClients: clientCompliant,
        totalCaregivers: caregivers.length,
        compliantCaregivers: caregiverCompliant,
      },
      licenseStatus: {
        agencyLicense: agency?.licenseExpiry ? { expiry: agency.licenseExpiry, daysRemaining: differenceInDays(agency.licenseExpiry, now) } : null,
      },
    });
  } catch (err) {
    console.error('Compliance dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch compliance dashboard' });
  }
});

// GET /api/compliance/clients/:id/alerts
router.get('/clients/:id/alerts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, agencyId: req.user!.agencyId },
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const now = new Date();
    const alerts: { field: string; message: string; severity: string }[] = [];

    if (!client.disclosureSignedDate) alerts.push({ field: 'disclosureSignedDate', message: 'Client disclosure not signed', severity: 'critical' });
    if (!client.rightsSignedDate) alerts.push({ field: 'rightsSignedDate', message: 'Client rights notice not signed', severity: 'critical' });
    if (!client.initialAssessmentDate) alerts.push({ field: 'initialAssessmentDate', message: 'Initial assessment not completed', severity: 'critical' });
    if (!client.servicePlanDate) alerts.push({ field: 'servicePlanDate', message: 'Service plan not created', severity: 'critical' });
    if (!client.serviceAgreementDate) alerts.push({ field: 'serviceAgreementDate', message: 'Service agreement not signed', severity: 'critical' });
    if (client.lastMonitoringDate && differenceInDays(now, client.lastMonitoringDate) > 90) {
      alerts.push({ field: 'lastMonitoringDate', message: `Monitoring visit overdue (${differenceInDays(now, client.lastMonitoringDate)} days)`, severity: 'critical' });
    }

    res.json({ clientId: client.id, alerts });
  } catch (err) {
    console.error('Client alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch client compliance alerts' });
  }
});

// GET /api/compliance/caregivers/:id/alerts
router.get('/caregivers/:id/alerts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const caregiver = await prisma.caregiver.findFirst({
      where: { id: req.params.id, agencyId: req.user!.agencyId },
    });
    if (!caregiver) return res.status(404).json({ error: 'Caregiver not found' });

    const now = new Date();
    const alerts: { field: string; message: string; severity: string }[] = [];

    if (!caregiver.backgroundCheckDate) alerts.push({ field: 'backgroundCheckDate', message: 'Background check not completed', severity: 'critical' });
    if (caregiver.backgroundCheckRenewalDue && differenceInDays(caregiver.backgroundCheckRenewalDue, now) < 0) {
      alerts.push({ field: 'backgroundCheckDate', message: 'Background check expired', severity: 'critical' });
    }
    if (!caregiver.orientationDate) alerts.push({ field: 'orientationDate', message: 'Orientation not completed', severity: 'critical' });
    if (!caregiver.initialTrainingDate) alerts.push({ field: 'initialTrainingDate', message: 'Initial training not completed', severity: 'warning' });
    if (caregiver.lastAnnualTrainingDate && differenceInDays(now, caregiver.lastAnnualTrainingDate) > 365) {
      alerts.push({ field: 'lastAnnualTrainingDate', message: 'Annual training overdue', severity: 'critical' });
    }
    if (!caregiver.leieCheckedDate) alerts.push({ field: 'leieCheckedDate', message: 'LEIE check not completed', severity: 'warning' });

    res.json({ caregiverId: caregiver.id, alerts });
  } catch (err) {
    console.error('Caregiver alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch caregiver compliance alerts' });
  }
});

// POST /api/compliance/qa-meeting
router.post('/qa-meeting', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { date, attendees, adverseEventsReviewed, qualityIndicators, preventiveStrategies, nextMeetingDate } = req.body;
    if (!date) return res.status(400).json({ error: 'Meeting date is required' });

    const record = await prisma.qARecord.create({
      data: {
        agencyId: req.user!.agencyId,
        meetingDate: new Date(date),
        attendees: attendees || [],
        adverseEvents: adverseEventsReviewed || '',
        qualityIndicators: qualityIndicators || '',
        preventiveStrategies: preventiveStrategies || '',
        nextMeetingDate: nextMeetingDate ? new Date(nextMeetingDate) : undefined,
      },
    });

    res.status(201).json(record);
  } catch (err) {
    console.error('QA meeting error:', err);
    res.status(500).json({ error: 'Failed to document QA meeting' });
  }
});

// POST /api/compliance/incident
router.post('/incident', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, caregiverId, incidentDate, type, severity, description, immediateAction, reportedToODHS, reportedToOHA, reportedToLE } = req.body;
    if (!clientId || !incidentDate || !type || !severity || !description) {
      return res.status(400).json({ error: 'clientId, incidentDate, type, severity, and description are required' });
    }

    const incident = await prisma.incidentReport.create({
      data: {
        agencyId: req.user!.agencyId,
        clientId,
        caregiverId: caregiverId || undefined,
        incidentDate: new Date(incidentDate),
        type,
        severity,
        description,
        immediateAction: immediateAction || '',
        reportedToODHS: reportedToODHS || false,
        reportedToOHA: reportedToOHA || false,
        reportedToLE: reportedToLE || false,
      },
    });

    res.status(201).json(incident);
  } catch (err) {
    console.error('Incident error:', err);
    res.status(500).json({ error: 'Failed to log incident' });
  }
});

export default router;
