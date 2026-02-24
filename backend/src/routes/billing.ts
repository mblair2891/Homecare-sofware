import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { calculateBillableHours } from '../services/schedulingEngine';
import { PayerType } from '@prisma/client';

const router = Router();

const PAYER_MAP: Record<string, PayerType> = {
  'Medicaid': 'Medicaid',
  'Private Pay': 'PrivatePay',
  'PrivatePay': 'PrivatePay',
  'Veterans': 'Veterans',
  'Long-Term Care Insurance': 'LongTermCareInsurance',
  'LongTermCareInsurance': 'LongTermCareInsurance',
};

const InvoiceSchema = z.object({
  clientId: z.string(),
  payer: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  hours: z.number(),
  rate: z.number(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

const PaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['check', 'ach', 'credit_card', 'medicaid_eft', 'manual']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  processedAt: z.string().optional(),
});

// ─── GET /api/billing/invoices ────────────────────────────────────────────────
router.get('/invoices', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, clientId, payer } = req.query;
    const where: any = { agencyId: req.user!.agencyId };
    if (status) where.status = status as string;
    if (clientId) where.clientId = clientId as string;
    if (payer) {
      const mapped = PAYER_MAP[payer as string];
      if (mapped) where.payer = mapped;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, payer: true } },
        payments: { orderBy: { processedAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ invoices });
  } catch (err) {
    console.error('Fetch invoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// ─── GET /api/billing/invoices/:id ───────────────────────────────────────────
router.get('/invoices/:id', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, agencyId: req.user!.agencyId },
      include: {
        client: { select: { id: true, name: true, payer: true, address: true } },
        payments: { orderBy: { processedAt: 'asc' } },
      },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    console.error('Fetch invoice error:', err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// ─── POST /api/billing/invoices ───────────────────────────────────────────────
router.post('/invoices', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const data = InvoiceSchema.parse(req.body);
    const payer = PAYER_MAP[data.payer];
    if (!payer) return res.status(400).json({ error: `Invalid payer type: ${data.payer}` });

    const client = await prisma.client.findFirst({ where: { id: data.clientId, agencyId: req.user!.agencyId } });
    if (!client) return res.status(400).json({ error: 'Client not found in your agency' });

    const amount = data.hours * data.rate;

    const invoice = await prisma.invoice.create({
      data: {
        agencyId: req.user!.agencyId,
        clientId: data.clientId,
        payer,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        hours: data.hours,
        rate: data.rate,
        amount,
        notes: data.notes || '',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });

    res.status(201).json(invoice);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// ─── POST /api/billing/invoices/generate-from-shifts ─────────────────────────
// Auto-builds an invoice from all EVV-verified completed shifts for a client/period
router.post('/invoices/generate-from-shifts', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, periodStart, periodEnd, rate, medicaidRounding } = req.body;
    if (!clientId || !periodStart || !periodEnd || !rate) {
      return res.status(400).json({ error: 'clientId, periodStart, periodEnd, and rate are required' });
    }

    const client = await prisma.client.findFirst({ where: { id: clientId, agencyId: req.user!.agencyId } });
    if (!client) return res.status(400).json({ error: 'Client not found in your agency' });

    const shifts = await prisma.shift.findMany({
      where: {
        clientId,
        status: 'Completed',
        date: {
          gte: new Date(periodStart),
          lte: new Date(periodEnd),
        },
      },
      orderBy: { date: 'asc' },
    });

    if (shifts.length === 0) {
      return res.status(400).json({ error: 'No completed shifts found for this period' });
    }

    const applyMedicaid = medicaidRounding || client.payer === 'Medicaid';
    let totalHours = 0;
    const shiftDetails = shifts.map(s => {
      const billable = calculateBillableHours(s.startTime, s.endTime, applyMedicaid);
      totalHours += billable;
      return { shiftId: s.id, date: s.date, startTime: s.startTime, endTime: s.endTime, billableHours: billable, evvVerified: s.evvVerified };
    });

    totalHours = Math.round(totalHours * 100) / 100;
    const amount = Math.round(totalHours * rate * 100) / 100;

    const invoice = await prisma.invoice.create({
      data: {
        agencyId: req.user!.agencyId,
        clientId,
        payer: client.payer,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        hours: totalHours,
        rate,
        amount,
        notes: `Auto-generated from ${shifts.length} completed shifts${applyMedicaid ? ' (Medicaid 15-min rounding applied)' : ''}`,
      },
    });

    res.status(201).json({ invoice, shiftCount: shifts.length, shiftDetails });
  } catch (err) {
    console.error('Generate invoice error:', err);
    res.status(500).json({ error: 'Failed to generate invoice from shifts' });
  }
});

// ─── PATCH /api/billing/invoices/:id ─────────────────────────────────────────
router.patch('/invoices/:id', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.invoice.findFirst({ where: { id: req.params.id, agencyId: req.user!.agencyId } });
    if (!existing) return res.status(404).json({ error: 'Invoice not found' });

    const { status, paidDate, notes, dueDate } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paidDate) updateData.paidDate = new Date(paidDate);
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (notes !== undefined) updateData.notes = notes;

    const invoice = await prisma.invoice.update({ where: { id: req.params.id }, data: updateData });
    res.json(invoice);
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// ─── POST /api/billing/invoices/:id/submit ────────────────────────────────────
// Marks invoice as Submitted and sets a default due date if not already set
router.post('/invoices/:id/submit', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.invoice.findFirst({ where: { id: req.params.id, agencyId: req.user!.agencyId } });
    if (!existing) return res.status(404).json({ error: 'Invoice not found' });
    if (existing.status !== 'Draft') return res.status(400).json({ error: 'Only Draft invoices can be submitted' });

    const dueDate = existing.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: 'Submitted', dueDate },
    });

    res.json({ message: 'Invoice submitted', invoice });
  } catch (err) {
    console.error('Submit invoice error:', err);
    res.status(500).json({ error: 'Failed to submit invoice' });
  }
});

// ─── POST /api/billing/invoices/:id/payment ───────────────────────────────────
// Record a payment against an invoice. Updates invoice status to Paid when fully covered.
router.post('/invoices/:id/payment', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const data = PaymentSchema.parse(req.body);
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, agencyId: req.user!.agencyId },
      include: { payments: true },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (['Paid', 'Voided'].includes(invoice.status)) {
      return res.status(400).json({ error: `Invoice is already ${invoice.status}` });
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId: req.params.id,
        amount: data.amount,
        method: data.method,
        referenceNumber: data.referenceNumber || undefined,
        notes: data.notes || '',
        processedAt: data.processedAt ? new Date(data.processedAt) : new Date(),
      },
    });

    // Check if invoice is now fully paid
    const previouslyPaid = invoice.payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0);
    const totalPaid = previouslyPaid + data.amount;

    const updatedFields: any = {};
    if (totalPaid >= invoice.amount) {
      updatedFields.status = 'Paid';
      updatedFields.paidDate = payment.processedAt;
    }

    const updatedInvoice = Object.keys(updatedFields).length > 0
      ? await prisma.invoice.update({ where: { id: req.params.id }, data: updatedFields })
      : invoice;

    res.status(201).json({ payment, invoice: updatedInvoice, totalPaid: Math.round(totalPaid * 100) / 100, balance: Math.round((invoice.amount - totalPaid) * 100) / 100 });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Record payment error:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// ─── GET /api/billing/invoices/:id/payments ───────────────────────────────────
router.get('/invoices/:id/payments', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, agencyId: req.user!.agencyId } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const payments = await prisma.payment.findMany({
      where: { invoiceId: req.params.id },
      orderBy: { processedAt: 'asc' },
    });

    const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    res.json({ payments, totalPaid: Math.round(totalPaid * 100) / 100, balance: Math.round((invoice.amount - totalPaid) * 100) / 100 });
  } catch (err) {
    console.error('Fetch payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// ─── GET /api/billing/payroll ─────────────────────────────────────────────────
router.get('/payroll', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = { client: { agencyId: req.user!.agencyId }, status: 'Completed' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        caregiver: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: [{ caregiverId: 'asc' }, { date: 'asc' }],
    });

    const byCaregiver: Record<string, { caregiver: any; shifts: any[]; totalHours: number }> = {};
    for (const shift of shifts) {
      if (!shift.caregiverId) continue; // skip unassigned shifts
      if (!byCaregiver[shift.caregiverId]) {
        byCaregiver[shift.caregiverId] = { caregiver: shift.caregiver, shifts: [], totalHours: 0 };
      }
      const hours = calculateBillableHours(shift.startTime, shift.endTime);
      byCaregiver[shift.caregiverId].shifts.push({ ...shift, hours });
      byCaregiver[shift.caregiverId].totalHours += hours;
    }

    const payrollSummary = Object.values(byCaregiver).map(entry => ({
      caregiver: entry.caregiver,
      totalHours: Math.round(entry.totalHours * 100) / 100,
      shiftCount: entry.shifts.length,
    }));

    res.json({ payrollSummary, totalShifts: shifts.length });
  } catch (err) {
    console.error('Fetch payroll error:', err);
    res.status(500).json({ error: 'Failed to fetch payroll data' });
  }
});

// ─── POST /api/billing/payroll/calculate — Oregon OT calculation ──────────────
router.post('/payroll/calculate', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const { caregiverId, hours, dailyHours, regularRate } = req.body;
    if (!regularRate) return res.status(400).json({ error: 'regularRate is required' });

    // Oregon OT rules: daily OT after 10hrs + weekly OT after 40hrs
    let regularHours = 0;
    let otHours = 0;

    if (dailyHours && Array.isArray(dailyHours)) {
      dailyHours.forEach((hrs: number) => {
        if (hrs > 10) { regularHours += 10; otHours += hrs - 10; }
        else regularHours += hrs;
      });
      // Weekly OT: if regular hours (capped at 10/day) would still push weekly total over 40
      if (regularHours > 40) { otHours += regularHours - 40; regularHours = 40; }
    } else {
      regularHours = Math.min(hours || 0, 40);
      otHours = Math.max(0, (hours || 0) - 40);
    }

    const gross = (regularHours * regularRate) + (otHours * regularRate * 1.5);

    res.json({
      caregiverId,
      regularHours: Math.round(regularHours * 100) / 100,
      otHours: Math.round(otHours * 100) / 100,
      regularRate,
      otRate: regularRate * 1.5,
      gross: gross.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: 'Payroll calculation failed' });
  }
});

// ─── GET /api/billing/revenue ─────────────────────────────────────────────────
router.get('/revenue', authenticate, authorize('Owner', 'Administrator', 'Biller'), async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = { agencyId: req.user!.agencyId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const invoices = await prisma.invoice.findMany({ where });

    const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const collected = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
    const outstanding = invoices.filter(i => ['Draft', 'Submitted'].includes(i.status)).reduce((sum, inv) => sum + inv.amount, 0);
    const overdue = invoices.filter(i => i.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0);

    const byPayer: Record<string, number> = {};
    for (const inv of invoices) {
      byPayer[inv.payer] = (byPayer[inv.payer] || 0) + inv.amount;
    }

    const byStatus: Record<string, number> = {};
    for (const inv of invoices) {
      byStatus[inv.status] = (byStatus[inv.status] || 0) + inv.amount;
    }

    res.json({
      revenue: {
        total: Math.round(total * 100) / 100,
        collected: Math.round(collected * 100) / 100,
        outstanding: Math.round(outstanding * 100) / 100,
        overdue: Math.round(overdue * 100) / 100,
        invoiceCount: invoices.length,
        byPayer: Object.entries(byPayer).map(([payer, amount]) => ({ payer, amount: Math.round(amount * 100) / 100 })),
        byStatus: Object.entries(byStatus).map(([status, amount]) => ({ status, amount: Math.round(amount * 100) / 100 })),
      },
    });
  } catch (err) {
    console.error('Revenue error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

export default router;
