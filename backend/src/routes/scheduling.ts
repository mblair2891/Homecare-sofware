import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';

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

// GET /api/scheduling/shifts
router.get('/shifts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, caregiverId, clientId, status } = req.query;

    const where: any = {
      client: { agencyId: req.user!.agencyId },
    };
    if (caregiverId) where.caregiverId = caregiverId as string;
    if (clientId) where.clientId = clientId as string;
    if (status) where.status = status as string;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, address: true } },
        caregiver: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ shifts });
  } catch (err) {
    console.error('Fetch shifts error:', err);
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

// GET /api/scheduling/shifts/:id
router.get('/shifts/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const shift = await prisma.shift.findFirst({
      where: { id: req.params.id, client: { agencyId: req.user!.agencyId } },
      include: {
        client: { select: { id: true, name: true, address: true, phone: true } },
        caregiver: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!shift) return res.status(404).json({ error: 'Shift not found' });
    res.json(shift);
  } catch (err) {
    console.error('Fetch shift error:', err);
    res.status(500).json({ error: 'Failed to fetch shift' });
  }
});

// POST /api/scheduling/shifts
router.post('/shifts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = ShiftSchema.parse(req.body);

    const client = await prisma.client.findFirst({ where: { id: data.clientId, agencyId: req.user!.agencyId } });
    if (!client) return res.status(400).json({ error: 'Client not found in your agency' });

    const caregiver = await prisma.caregiver.findFirst({ where: { id: data.caregiverId, agencyId: req.user!.agencyId } });
    if (!caregiver) return res.status(400).json({ error: 'Caregiver not found in your agency' });

    const shift = await prisma.shift.create({
      data: {
        clientId: data.clientId,
        caregiverId: data.caregiverId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        tasks: data.tasks || [],
        visitNotes: data.notes || '',
        location: data.location,
      },
      include: {
        client: { select: { id: true, name: true } },
        caregiver: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(shift);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Create shift error:', err);
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

// PATCH /api/scheduling/shifts/:id
router.patch('/shifts/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.shift.findFirst({
      where: { id: req.params.id, client: { agencyId: req.user!.agencyId } },
    });
    if (!existing) return res.status(404).json({ error: 'Shift not found' });

    const { status, startTime, endTime, tasks, notes, caregiverId } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (tasks) updateData.tasks = tasks;
    if (notes !== undefined) updateData.visitNotes = notes;
    if (caregiverId) updateData.caregiverId = caregiverId;

    const shift = await prisma.shift.update({ where: { id: req.params.id }, data: updateData });
    res.json(shift);
  } catch (err) {
    console.error('Update shift error:', err);
    res.status(500).json({ error: 'Failed to update shift' });
  }
});

// POST /api/scheduling/evv
router.post('/evv', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = EVVSchema.parse(req.body);

    const shift = await prisma.shift.findFirst({
      where: { id: data.shiftId, client: { agencyId: req.user!.agencyId } },
    });
    if (!shift) return res.status(404).json({ error: 'Shift not found' });

    const updateData: any = { evvMethod: data.method };

    if (data.type === 'clockIn') {
      updateData.evvClockIn = new Date(data.timestamp);
      updateData.status = 'InProgress';
      if (data.coordinates) {
        updateData.evvLatIn = data.coordinates.lat;
        updateData.evvLngIn = data.coordinates.lng;
      }
    } else {
      updateData.evvClockOut = new Date(data.timestamp);
      updateData.status = 'Completed';
      updateData.evvVerified = data.method === 'GPS';
      if (data.coordinates) {
        updateData.evvLatOut = data.coordinates.lat;
        updateData.evvLngOut = data.coordinates.lng;
      }
    }

    if (data.notes) updateData.visitNotes = data.notes;

    const updated = await prisma.shift.update({
      where: { id: data.shiftId },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
        caregiver: { select: { id: true, name: true } },
      },
    });

    res.json({ message: `EVV ${data.type} recorded`, shift: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('EVV error:', err);
    res.status(500).json({ error: 'Failed to record EVV' });
  }
});

// GET /api/scheduling/open-shifts
router.get('/open-shifts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const openShifts = await prisma.shift.findMany({
      where: {
        client: { agencyId: req.user!.agencyId },
        status: 'Scheduled',
        date: { gte: new Date() },
      },
      include: {
        client: { select: { id: true, name: true, address: true } },
        caregiver: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ openShifts });
  } catch (err) {
    console.error('Fetch open shifts error:', err);
    res.status(500).json({ error: 'Failed to fetch open shifts' });
  }
});

// POST /api/scheduling/shifts/:id/broadcast
router.post('/shifts/:id/broadcast', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const shift = await prisma.shift.findFirst({
      where: { id: req.params.id, client: { agencyId: req.user!.agencyId } },
      include: { client: { select: { name: true } } },
    });
    if (!shift) return res.status(404).json({ error: 'Shift not found' });

    res.json({ message: 'Broadcast sent', shiftId: req.params.id, clientName: shift.client.name });
  } catch (err) {
    console.error('Broadcast error:', err);
    res.status(500).json({ error: 'Failed to broadcast shift' });
  }
});

export default router;
