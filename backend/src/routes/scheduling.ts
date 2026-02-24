import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import {
  detectConflicts,
  weeklyHoursGuard,
  matchCaregiversToClient,
  generateRecurringShifts,
  calculateBillableHours,
} from '../services/schedulingEngine';

const router = Router();

const ShiftSchema = z.object({
  clientId: z.string(),
  caregiverId: z.string().optional(), // Optional — open shifts have no caregiver yet
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  tasks: z.array(z.string()).optional(),
  notes: z.string().optional(),
  location: z.string(),
  force: z.boolean().optional(), // Override conflict warnings
});

const EVVSchema = z.object({
  shiftId: z.string(),
  type: z.enum(['clockIn', 'clockOut']),
  timestamp: z.string(),
  method: z.enum(['GPS', 'Telephony', 'Manual']),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  notes: z.string().optional(),
});

const RecurringSchema = z.object({
  clientId: z.string(),
  caregiverId: z.string().optional(),
  frequency: z.enum(['weekly', 'biweekly']),
  daysOfWeek: z.array(z.number().min(0).max(6)).min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  startDate: z.string(),
  endDate: z.string().optional(),
  tasks: z.array(z.string()).optional(),
  location: z.string(),
});

const AvailabilitySchema = z.array(
  z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    isAvailable: z.boolean().optional(),
  }),
);

// ─── GET /api/scheduling/shifts ───────────────────────────────────────────────
router.get('/shifts', authenticate, authorize('Owner', 'Administrator', 'Coordinator', 'Nurse', 'ReadOnly'), async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, caregiverId, clientId, status } = req.query;
    const where: any = { client: { agencyId: req.user!.agencyId } };
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

// ─── GET /api/scheduling/shifts/:id ──────────────────────────────────────────
router.get('/shifts/:id', authenticate, authorize('Owner', 'Administrator', 'Coordinator', 'Nurse', 'ReadOnly'), async (req: AuthRequest, res: Response) => {
  try {
    const shift = await prisma.shift.findFirst({
      where: { id: req.params.id, client: { agencyId: req.user!.agencyId } },
      include: {
        client: { select: { id: true, name: true, address: true, phone: true } },
        caregiver: { select: { id: true, name: true, phone: true } },
        recurringSchedule: { select: { id: true, frequency: true, daysOfWeek: true } },
      },
    });
    if (!shift) return res.status(404).json({ error: 'Shift not found' });
    res.json(shift);
  } catch (err) {
    console.error('Fetch shift error:', err);
    res.status(500).json({ error: 'Failed to fetch shift' });
  }
});

// ─── POST /api/scheduling/shifts ─────────────────────────────────────────────
// Runs conflict detection before creating. Pass ?force=true to override warnings.
router.post('/shifts', authenticate, authorize('Owner', 'Administrator', 'Coordinator'), async (req: AuthRequest, res: Response) => {
  try {
    const data = ShiftSchema.parse(req.body);

    // Verify client
    const client = await prisma.client.findFirst({ where: { id: data.clientId, agencyId: req.user!.agencyId } });
    if (!client) return res.status(400).json({ error: 'Client not found in your agency' });

    let conflictWarning = null;
    let hoursWarning = null;

    if (data.caregiverId) {
      // Verify caregiver
      const caregiver = await prisma.caregiver.findFirst({ where: { id: data.caregiverId, agencyId: req.user!.agencyId } });
      if (!caregiver) return res.status(400).json({ error: 'Caregiver not found in your agency' });

      // Conflict detection
      const conflictResult = await detectConflicts(data.caregiverId, new Date(data.date), data.startTime, data.endTime);
      if (conflictResult.hasConflict && !data.force) {
        return res.status(409).json({
          error: 'Scheduling conflict detected',
          conflicts: conflictResult.conflicts,
          hint: 'Pass "force": true to create shift anyway',
        });
      }
      if (conflictResult.hasConflict) {
        conflictWarning = { overridden: true, conflicts: conflictResult.conflicts };
      }

      // Weekly hours check
      const shiftDate = new Date(data.date);
      const weekStart = new Date(shiftDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const hours = calculateBillableHours(data.startTime, data.endTime);
      const hoursResult = await weeklyHoursGuard(data.caregiverId, weekStart, weekEnd, hours);
      if (!hoursResult.withinLimit) {
        hoursWarning = {
          message: `Caregiver will exceed 40 hrs this week`,
          currentHours: hoursResult.currentHours,
          projectedHours: hoursResult.projectedHours,
          overtimeHours: hoursResult.overtimeHours,
        };
      }
    }

    const shift = await prisma.shift.create({
      data: {
        clientId: data.clientId,
        caregiverId: data.caregiverId || undefined,
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

    res.status(201).json({ shift, warnings: { conflict: conflictWarning, hours: hoursWarning } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Create shift error:', err);
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

// ─── PATCH /api/scheduling/shifts/:id ────────────────────────────────────────
router.patch('/shifts/:id', authenticate, authorize('Owner', 'Administrator', 'Coordinator'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.shift.findFirst({
      where: { id: req.params.id, client: { agencyId: req.user!.agencyId } },
    });
    if (!existing) return res.status(404).json({ error: 'Shift not found' });

    const { status, startTime, endTime, tasks, notes, caregiverId, force } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (tasks) updateData.tasks = tasks;
    if (notes !== undefined) updateData.visitNotes = notes;

    // When reassigning caregiver, run conflict check
    if (caregiverId) {
      const newStartTime = startTime || existing.startTime;
      const newEndTime = endTime || existing.endTime;
      const conflictResult = await detectConflicts(caregiverId, existing.date, newStartTime, newEndTime, req.params.id);
      if (conflictResult.hasConflict && !force) {
        return res.status(409).json({
          error: 'Scheduling conflict for caregiver',
          conflicts: conflictResult.conflicts,
          hint: 'Pass "force": true to assign anyway',
        });
      }
      updateData.caregiverId = caregiverId;
    }

    const shift = await prisma.shift.update({ where: { id: req.params.id }, data: updateData });
    res.json(shift);
  } catch (err) {
    console.error('Update shift error:', err);
    res.status(500).json({ error: 'Failed to update shift' });
  }
});

// ─── POST /api/scheduling/evv ─────────────────────────────────────────────────
// Nurses and above can record EVV
router.post('/evv', authenticate, authorize('Owner', 'Administrator', 'Coordinator', 'Nurse'), async (req: AuthRequest, res: Response) => {
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
      if (data.coordinates) { updateData.evvLatIn = data.coordinates.lat; updateData.evvLngIn = data.coordinates.lng; }
    } else {
      updateData.evvClockOut = new Date(data.timestamp);
      updateData.status = 'Completed';
      updateData.evvVerified = data.method === 'GPS';
      if (data.coordinates) { updateData.evvLatOut = data.coordinates.lat; updateData.evvLngOut = data.coordinates.lng; }
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

// ─── GET /api/scheduling/open-shifts ─────────────────────────────────────────
// Shifts with no caregiver assigned, or Scheduled future shifts
router.get('/open-shifts', authenticate, authorize('Owner', 'Administrator', 'Coordinator', 'Nurse', 'ReadOnly'), async (req: AuthRequest, res: Response) => {
  try {
    const openShifts = await prisma.shift.findMany({
      where: {
        client: { agencyId: req.user!.agencyId },
        status: 'Scheduled',
        caregiverId: null,
        date: { gte: new Date() },
      },
      include: {
        client: { select: { id: true, name: true, address: true, classification: true } },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ openShifts });
  } catch (err) {
    console.error('Fetch open shifts error:', err);
    res.status(500).json({ error: 'Failed to fetch open shifts' });
  }
});

// ─── POST /api/scheduling/shifts/:id/broadcast ───────────────────────────────
router.post('/shifts/:id/broadcast', authenticate, authorize('Owner', 'Administrator', 'Coordinator'), async (req: AuthRequest, res: Response) => {
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

// ─── GET /api/scheduling/match-caregivers ────────────────────────────────────
// Returns ranked caregivers for a proposed shift slot
router.get('/match-caregivers', authenticate, authorize('Owner', 'Administrator', 'Coordinator'), async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, date, startTime, endTime } = req.query;
    if (!clientId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: 'clientId, date, startTime, and endTime are required' });
    }

    const matches = await matchCaregiversToClient(
      clientId as string,
      req.user!.agencyId,
      new Date(date as string),
      startTime as string,
      endTime as string,
    );

    res.json({ matches });
  } catch (err) {
    console.error('Match caregivers error:', err);
    res.status(500).json({ error: 'Failed to match caregivers' });
  }
});

// ─── GET /api/scheduling/recurring ───────────────────────────────────────────
router.get('/recurring', authenticate, authorize('Owner', 'Administrator', 'Coordinator', 'ReadOnly'), async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, caregiverId, isActive } = req.query;
    const where: any = { agencyId: req.user!.agencyId };
    if (clientId) where.clientId = clientId as string;
    if (caregiverId) where.caregiverId = caregiverId as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const schedules = await prisma.recurringSchedule.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        caregiver: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    res.json({ schedules });
  } catch (err) {
    console.error('Fetch recurring schedules error:', err);
    res.status(500).json({ error: 'Failed to fetch recurring schedules' });
  }
});

// ─── POST /api/scheduling/recurring ──────────────────────────────────────────
router.post('/recurring', authenticate, authorize('Owner', 'Administrator', 'Coordinator'), async (req: AuthRequest, res: Response) => {
  try {
    const data = RecurringSchema.parse(req.body);

    const client = await prisma.client.findFirst({ where: { id: data.clientId, agencyId: req.user!.agencyId } });
    if (!client) return res.status(400).json({ error: 'Client not found in your agency' });

    if (data.caregiverId) {
      const caregiver = await prisma.caregiver.findFirst({ where: { id: data.caregiverId, agencyId: req.user!.agencyId } });
      if (!caregiver) return res.status(400).json({ error: 'Caregiver not found in your agency' });
    }

    const schedule = await prisma.recurringSchedule.create({
      data: {
        agencyId: req.user!.agencyId,
        clientId: data.clientId,
        caregiverId: data.caregiverId || undefined,
        frequency: data.frequency,
        daysOfWeek: data.daysOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        tasks: data.tasks || [],
        location: data.location,
      },
      include: {
        client: { select: { id: true, name: true } },
        caregiver: { select: { id: true, name: true } },
      },
    });

    // Auto-generate shifts for the next 4 weeks
    const { created, skipped, errors } = await generateRecurringShifts(schedule.id, 4);

    res.status(201).json({ schedule, generated: { created, skipped, errors } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Create recurring schedule error:', err);
    res.status(500).json({ error: 'Failed to create recurring schedule' });
  }
});

// ─── PATCH /api/scheduling/recurring/:id ─────────────────────────────────────
router.patch('/recurring/:id', authenticate, authorize('Owner', 'Administrator', 'Coordinator'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.recurringSchedule.findFirst({
      where: { id: req.params.id, agencyId: req.user!.agencyId },
    });
    if (!existing) return res.status(404).json({ error: 'Recurring schedule not found' });

    const { isActive, endDate, caregiverId, tasks } = req.body;
    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (endDate) updateData.endDate = new Date(endDate);
    if (caregiverId !== undefined) updateData.caregiverId = caregiverId || null;
    if (tasks) updateData.tasks = tasks;

    const schedule = await prisma.recurringSchedule.update({ where: { id: req.params.id }, data: updateData });
    res.json(schedule);
  } catch (err) {
    console.error('Update recurring schedule error:', err);
    res.status(500).json({ error: 'Failed to update recurring schedule' });
  }
});

// ─── POST /api/scheduling/recurring/:id/generate ─────────────────────────────
// Manually trigger shift generation for a recurring schedule
router.post('/recurring/:id/generate', authenticate, authorize('Owner', 'Administrator', 'Coordinator'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.recurringSchedule.findFirst({
      where: { id: req.params.id, agencyId: req.user!.agencyId },
    });
    if (!existing) return res.status(404).json({ error: 'Recurring schedule not found' });

    const weeksAhead = Math.min(Number(req.body.weeksAhead) || 4, 12);
    const result = await generateRecurringShifts(req.params.id, weeksAhead);
    res.json({ message: `Generated shifts for next ${weeksAhead} weeks`, ...result });
  } catch (err) {
    console.error('Generate shifts error:', err);
    res.status(500).json({ error: 'Failed to generate shifts' });
  }
});

// ─── GET /api/scheduling/availability/:caregiverId ────────────────────────────
router.get('/availability/:caregiverId', authenticate, authorize('Owner', 'Administrator', 'Coordinator', 'Nurse', 'ReadOnly'), async (req: AuthRequest, res: Response) => {
  try {
    const caregiver = await prisma.caregiver.findFirst({
      where: { id: req.params.caregiverId, agencyId: req.user!.agencyId },
    });
    if (!caregiver) return res.status(404).json({ error: 'Caregiver not found' });

    const availability = await prisma.caregiverAvailability.findMany({
      where: { caregiverId: req.params.caregiverId },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json({ caregiverId: req.params.caregiverId, availability });
  } catch (err) {
    console.error('Fetch availability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// ─── POST /api/scheduling/availability/:caregiverId ───────────────────────────
// Replace full weekly availability — upserts one record per day-of-week
router.post('/availability/:caregiverId', authenticate, authorize('Owner', 'Administrator', 'Coordinator'), async (req: AuthRequest, res: Response) => {
  try {
    const caregiver = await prisma.caregiver.findFirst({
      where: { id: req.params.caregiverId, agencyId: req.user!.agencyId },
    });
    if (!caregiver) return res.status(404).json({ error: 'Caregiver not found' });

    const slots = AvailabilitySchema.parse(req.body);

    const upserted = await Promise.all(
      slots.map(slot =>
        prisma.caregiverAvailability.upsert({
          where: { caregiverId_dayOfWeek: { caregiverId: req.params.caregiverId, dayOfWeek: slot.dayOfWeek } },
          update: { startTime: slot.startTime, endTime: slot.endTime, isAvailable: slot.isAvailable ?? true },
          create: { caregiverId: req.params.caregiverId, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, isAvailable: slot.isAvailable ?? true },
        }),
      ),
    );

    res.json({ caregiverId: req.params.caregiverId, availability: upserted });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Set availability error:', err);
    res.status(500).json({ error: 'Failed to set availability' });
  }
});

export default router;
