import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';
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

// GET /api/billing/invoices
router.get('/invoices', authenticate, async (req: AuthRequest, res: Response) => {
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
      orderBy: { createdAt: 'desc' },
    });

    res.json({ invoices });
  } catch (err) {
    console.error('Fetch invoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// POST /api/billing/invoices
router.post('/invoices', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = InvoiceSchema.parse(req.body);
    const payer = PAYER_MAP[data.payer];
    if (!payer) return res.status(400).json({ error: `Invalid payer type: ${data.payer}` });

    // Verify client belongs to agency
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

// PATCH /api/billing/invoices/:id
router.patch('/invoices/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.invoice.findFirst({ where: { id: req.params.id, agencyId: req.user!.agencyId } });
    if (!existing) return res.status(404).json({ error: 'Invoice not found' });

    const { status, paidDate, notes } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paidDate) updateData.paidDate = new Date(paidDate);
    if (notes !== undefined) updateData.notes = notes;

    const invoice = await prisma.invoice.update({ where: { id: req.params.id }, data: updateData });
    res.json(invoice);
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// GET /api/billing/payroll
router.get('/payroll', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      client: { agencyId: req.user!.agencyId },
      status: 'Completed',
    };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    // Aggregate completed shifts by caregiver for payroll
    const shifts = await prisma.shift.findMany({
      where,
      include: {
        caregiver: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: [{ caregiverId: 'asc' }, { date: 'asc' }],
    });

    // Group shifts by caregiver
    const byCaregiver: Record<string, { caregiver: any; shifts: any[]; totalHours: number }> = {};
    for (const shift of shifts) {
      if (!byCaregiver[shift.caregiverId]) {
        byCaregiver[shift.caregiverId] = { caregiver: shift.caregiver, shifts: [], totalHours: 0 };
      }
      // Calculate hours from startTime/endTime strings (HH:MM format)
      const [sh, sm] = shift.startTime.split(':').map(Number);
      const [eh, em] = shift.endTime.split(':').map(Number);
      const hours = (eh + em / 60) - (sh + sm / 60);
      byCaregiver[shift.caregiverId].shifts.push({ ...shift, hours: Math.max(0, hours) });
      byCaregiver[shift.caregiverId].totalHours += Math.max(0, hours);
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

// POST /api/billing/payroll/calculate — Oregon overtime calculation
router.post('/payroll/calculate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { caregiverId, hours, dailyHours, regularRate } = req.body;

    // Oregon OT rules: daily OT after 10hrs + weekly OT after 40hrs
    let regularHours = 0;
    let otHours = 0;

    if (dailyHours && Array.isArray(dailyHours)) {
      dailyHours.forEach((hrs: number) => {
        if (hrs > 10) { regularHours += 10; otHours += hrs - 10; }
        else regularHours += hrs;
      });
    } else {
      regularHours = Math.min(hours, 40);
      otHours = Math.max(0, hours - 40);
    }

    const gross = (regularHours * regularRate) + (otHours * regularRate * 1.5);

    res.json({ caregiverId, regularHours, otHours, regularRate, otRate: regularRate * 1.5, gross: gross.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: 'Payroll calculation failed' });
  }
});

// GET /api/billing/revenue
router.get('/revenue', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { agencyId: req.user!.agencyId },
    });

    const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const collected = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
    const outstanding = invoices.filter(i => ['Draft', 'Submitted'].includes(i.status)).reduce((sum, inv) => sum + inv.amount, 0);
    const overdue = invoices.filter(i => i.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0);

    // Group by payer type
    const byPayer: Record<string, number> = {};
    for (const inv of invoices) {
      byPayer[inv.payer] = (byPayer[inv.payer] || 0) + inv.amount;
    }

    res.json({
      revenue: {
        total: Math.round(total * 100) / 100,
        collected: Math.round(collected * 100) / 100,
        outstanding: Math.round(outstanding * 100) / 100,
        overdue: Math.round(overdue * 100) / 100,
        byPayer: Object.entries(byPayer).map(([payer, amount]) => ({ payer, amount: Math.round(amount * 100) / 100 })),
      },
    });
  } catch (err) {
    console.error('Revenue error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

export default router;
