import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// ─── POST /api/forms/save ─────────────────────────────────────────────────────
// Owner, Administrator, Coordinator, Nurse — clinical staff complete forms
router.post('/save', authenticate, authorize('Owner', 'Administrator', 'Coordinator', 'Nurse'), async (req: AuthRequest, res: Response) => {
  try {
    const { formId, clientId, formData, completedBy, signatureData } = req.body;
    if (!formId || !clientId) return res.status(400).json({ error: 'formId and clientId required' });

    const client = await prisma.client.findFirst({ where: { id: clientId, agencyId: req.user!.agencyId } });
    if (!client) return res.status(400).json({ error: 'Client not found in your agency' });

    const record = await prisma.formRecord.create({
      data: {
        clientId,
        formId,
        formData: formData || {},
        completedBy: completedBy || req.user!.email,
        signatureData: signatureData || undefined,
      },
    });

    // Auto-update client Oregon compliance dates when a form is saved
    const dateUpdates: Record<string, string> = {
      'CF01': 'disclosureSignedDate',
      'CF02': 'rightsSignedDate',
      'CF03': 'initialAssessmentDate',
      'CF04': 'servicePlanDate',
      'CF05': 'serviceAgreementDate',
      'CF08': 'initialVisitDate',
      'CF09': 'lastMonitoringDate',
      'CF10': 'lastSelfDirectionEvalDate',
      'CF11': 'lastSelfDirectionEvalDate',
    };

    const dateField = dateUpdates[formId];
    if (dateField) {
      await prisma.client.update({
        where: { id: clientId },
        data: { [dateField]: new Date() },
      });
    }

    res.status(201).json(record);
  } catch (err) {
    console.error('Save form error:', err);
    res.status(500).json({ error: 'Failed to save form' });
  }
});

// ─── GET /api/forms/client/:clientId ─────────────────────────────────────────
// All authenticated roles can view form records (read-only roles need audit visibility)
router.get('/client/:clientId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { clientId } = req.params;
    const client = await prisma.client.findFirst({ where: { id: clientId, agencyId: req.user!.agencyId } });
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const forms = await prisma.formRecord.findMany({
      where: { clientId },
      orderBy: { completedAt: 'desc' },
    });

    res.json({ clientId, forms });
  } catch (err) {
    console.error('Fetch forms error:', err);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// ─── DELETE /api/forms/:recordId ─────────────────────────────────────────────
// Owner and Administrator only — form records should rarely be deleted
router.delete('/:recordId', authenticate, authorize('Owner', 'Administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const record = await prisma.formRecord.findFirst({
      where: { id: req.params.recordId },
      include: { client: { select: { agencyId: true } } },
    });
    if (!record || record.client.agencyId !== req.user!.agencyId) {
      return res.status(404).json({ error: 'Form record not found' });
    }
    await prisma.formRecord.delete({ where: { id: req.params.recordId } });
    res.json({ message: 'Form record deleted' });
  } catch (err) {
    console.error('Delete form error:', err);
    res.status(500).json({ error: 'Failed to delete form record' });
  }
});

// ─── GET /api/forms/:formId/template ─────────────────────────────────────────
// Public — template metadata contains no sensitive data
router.get('/:formId/template', async (req: AuthRequest, res: Response) => {
  const templates: Record<string, { title: string; oar: string; fields: string[] }> = {
    CF01: { title: 'Client Disclosure Statement', oar: 'OAR 333-536-0055(3)', fields: ['clientName', 'agencyName', 'classification', 'services', 'chargesPerHour', 'billingFrequency', 'terminationPolicy'] },
    CF02: { title: 'Client Rights Notice', oar: 'OAR 333-536-0060', fields: ['clientName', 'rights', 'grievanceProcedures', 'ohaContact', 'signature', 'date'] },
    CF03: { title: 'Initial Client Assessment', oar: 'OAR 333-536-0065', fields: ['clientName', 'adls', 'physicalStatus', 'cognitiveStatus', 'stableAndPredictable', 'evaluatorSignature'] },
    CF04: { title: 'Service Plan', oar: 'OAR 333-536-0065', fields: ['clientName', 'medicalConditions', 'servicesProvided', 'scheduledHours', 'caregiverSignoffs'] },
    CF05: { title: 'Service & Financial Agreement', oar: 'OAR 333-536-0085', fields: ['clientName', 'services', 'rates', 'billingTerms', 'signature'] },
    CF08: { title: 'Initial Visit Record (Day 7-30)', oar: 'OAR 333-536-0066', fields: ['clientName', 'visitDate', 'dayOfService', 'monitoringChecklist', 'signatures'] },
    CF09: { title: 'Quarterly Monitoring Visit', oar: 'OAR 333-536-0066', fields: ['clientName', 'visitDate', 'visitMethod', 'justification', 'monitoringItems', 'signatures'] },
    CF10: { title: 'Medication Self-Direction Assessment', oar: 'OAR 333-536-0045', fields: ['clientName', 'medications', 'selfDirectionAssessment', 'determination', 'signatures'] },
    CF11: { title: '90-Day Self-Direction Re-Evaluation', oar: 'OAR 333-536-0045(5)', fields: ['clientName', 'previousEvalDate', 'medicationChanges', 'currentAbility', 'determination'] },
  };
  const template = templates[req.params.formId];
  if (!template) return res.status(404).json({ error: 'Form template not found' });
  res.json(template);
});

export default router;
