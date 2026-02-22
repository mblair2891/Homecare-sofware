import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

const InvoiceSchema = z.object({
  clientId: z.string(),
  payer: z.enum(['Medicaid', 'Private Pay', 'Veterans', 'Long-Term Care Insurance']),
  periodStart: z.string(),
  periodEnd: z.string(),
  hours: z.number(),
  rate: z.number(),
  notes: z.string().optional(),
});

router.get('/invoices', async (_req: Request, res: Response) => {
  res.json({ invoices: [] });
});

router.post('/invoices', async (req: Request, res: Response) => {
  try {
    const data = InvoiceSchema.parse(req.body);
    const amount = data.hours * data.rate;
    res.status(201).json({ message: 'Invoice created', amount, data });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

router.get('/payroll', async (_req: Request, res: Response) => {
  res.json({ payrollRuns: [] });
});

// Calculate Oregon overtime (daily 10hr + weekly 40hr)
router.post('/payroll/calculate', async (req: Request, res: Response) => {
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

router.get('/revenue', async (_req: Request, res: Response) => {
  res.json({ revenue: { total: 0, byLocation: [], byPayer: [] } });
});

export default router;
