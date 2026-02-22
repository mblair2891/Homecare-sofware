import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/forms/save
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { formId, clientId, formData, completedBy } = req.body;
    if (!formId || !clientId) return res.status(400).json({ error: 'formId and clientId required' });
    // TODO: Save form to Prisma FormRecord table
    res.status(201).json({ message: `Form ${formId} saved for client ${clientId}`, completedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save form' });
  }
});

// GET /api/forms/client/:clientId
router.get('/client/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    // TODO: const forms = await prisma.formRecord.findMany({ where: { clientId } });
    res.json({ clientId, forms: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// GET /api/forms/:formId/template
router.get('/:formId/template', async (req: Request, res: Response) => {
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
