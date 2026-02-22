import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

const ShiftSchema = z.object({
  clientId: z.string(),
  caregiverId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  tasks: z.array(z.string()).optional(),
  notes: z.string().optional(),
  location: z.string(),
});

const EVVSchema = z.object({
  shiftId: z.string(),
  type: z.enum(['clockIn', 'clockOut']),
  timestamp: z.string(),
  method: z.enum(['GPS', 'Telephony', 'Manual']),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  notes: z.string().optional(),
});

router.get('/shifts', async (_req: Request, res: Response) => {
  res.json({ shifts: [] });
});

router.post('/shifts', async (req: Request, res: Response) => {
  try {
    const data = ShiftSchema.parse(req.body);
    res.status(201).json({ message: 'Shift created', data });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

router.post('/evv', async (req: Request, res: Response) => {
  try {
    const data = EVVSchema.parse(req.body);
    // TODO: Update shift EVV data in Prisma
    res.json({ message: `EVV ${data.type} recorded`, data });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Failed to record EVV' });
  }
});

router.get('/open-shifts', async (_req: Request, res: Response) => {
  res.json({ openShifts: [] });
});

router.post('/shifts/:id/broadcast', async (req: Request, res: Response) => {
  res.json({ message: 'Broadcast sent', shiftId: req.params.id });
});

export default router;
