/**
 * Scheduling Engine
 *
 * Core scheduling logic:
 *   • Conflict detection (overlapping shifts for the same caregiver)
 *   • Weekly hours guard (Oregon OT threshold)
 *   • Skill / classification matching (client needs vs caregiver capabilities)
 *   • Recurring schedule generation (weekly / biweekly patterns)
 *   • Medicaid 15-minute billing unit rounding
 */

import { prisma } from '../lib/prisma';

// ─────────────────────────────────────────────────────────────────────────────
// Time helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Parse "HH:MM" to minutes since midnight. */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** True when the two [start,end) intervals overlap. */
function timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && e1 > s2;
}

/** Hours between two HH:MM strings. */
function shiftHours(startTime: string, endTime: string): number {
  const diff = timeToMinutes(endTime) - timeToMinutes(startTime);
  return Math.max(0, diff) / 60;
}

// ─────────────────────────────────────────────────────────────────────────────
// Conflict detection
// ─────────────────────────────────────────────────────────────────────────────

export interface ConflictInfo {
  shiftId: string;
  date: Date;
  startTime: string;
  endTime: string;
  clientName: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: ConflictInfo[];
}

/**
 * Returns any Scheduled / InProgress shifts for `caregiverId` on `date`
 * that overlap with [startTime, endTime).
 * Pass `excludeShiftId` when checking against an existing shift being edited.
 */
export async function detectConflicts(
  caregiverId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeShiftId?: string,
): Promise<ConflictResult> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existingShifts = await prisma.shift.findMany({
    where: {
      caregiverId,
      date: { gte: dayStart, lte: dayEnd },
      status: { in: ['Scheduled', 'InProgress'] },
      ...(excludeShiftId ? { id: { not: excludeShiftId } } : {}),
    },
    include: { client: { select: { name: true } } },
  });

  const conflicting = existingShifts.filter(s =>
    timesOverlap(startTime, endTime, s.startTime, s.endTime),
  );

  return {
    hasConflict: conflicting.length > 0,
    conflicts: conflicting.map(s => ({
      shiftId: s.id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      clientName: s.client.name,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Weekly hours guard
// ─────────────────────────────────────────────────────────────────────────────

export interface HoursGuardResult {
  withinLimit: boolean;
  currentHours: number;
  projectedHours: number;
  overtimeHours: number;
}

/**
 * Checks whether adding `additionalHours` to a caregiver's scheduled/completed
 * hours for the week containing [weekStart, weekEnd] would exceed `maxHours`.
 */
export async function weeklyHoursGuard(
  caregiverId: string,
  weekStart: Date,
  weekEnd: Date,
  additionalHours: number,
  maxHours = 40,
): Promise<HoursGuardResult> {
  const shifts = await prisma.shift.findMany({
    where: {
      caregiverId,
      date: { gte: weekStart, lte: weekEnd },
      status: { in: ['Scheduled', 'InProgress', 'Completed'] },
    },
  });

  const currentHours = shifts.reduce((sum, s) => sum + shiftHours(s.startTime, s.endTime), 0);
  const projectedHours = currentHours + additionalHours;
  const overtimeHours = Math.max(0, projectedHours - maxHours);

  return {
    withinLimit: projectedHours <= maxHours,
    currentHours: round2(currentHours),
    projectedHours: round2(projectedHours),
    overtimeHours: round2(overtimeHours),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill / classification matching
// ─────────────────────────────────────────────────────────────────────────────

const CLASS_LEVELS: Record<string, number> = {
  Limited: 1,
  Basic: 2,
  Intermediate: 3,
  Comprehensive: 4,
};

export interface MatchResult {
  caregiverId: string;
  name: string;
  phone: string;
  classification: string;
  certifications: string[];
  matchScore: number;
  matchReasons: string[];
  hasConflict: boolean;
  conflictDetails: ConflictInfo[];
  isPrimaryCaregiver: boolean;
  weeklyHours: number;
}

/**
 * Returns active agency caregivers ranked by suitability for a given client
 * shift slot. Caregivers with scheduling conflicts are included but flagged.
 */
export async function matchCaregiversToClient(
  clientId: string,
  agencyId: string,
  date: Date,
  startTime: string,
  endTime: string,
): Promise<MatchResult[]> {
  const client = await prisma.client.findFirst({
    where: { id: clientId },
    include: { clientCaregivers: true },
  });
  if (!client) throw new Error('Client not found');

  const caregivers = await prisma.caregiver.findMany({
    where: { agencyId, status: 'Active' },
    include: { clientCaregivers: { where: { clientId } } },
  });

  // Get week boundaries for hours check
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const shiftDuration = shiftHours(startTime, endTime);

  const results: MatchResult[] = await Promise.all(
    caregivers.map(async cg => {
      const matchReasons: string[] = [];
      let matchScore = 0;

      const isPrimary = cg.clientCaregivers.some(cc => cc.isPrimary);
      if (isPrimary) { matchScore += 50; matchReasons.push('Primary caregiver'); }
      else if (cg.clientCaregivers.length > 0) { matchScore += 20; matchReasons.push('Previously assigned'); }

      // Classification compatibility
      const clientLevel = CLASS_LEVELS[client.classification] ?? 0;
      const caregiverLevel = CLASS_LEVELS[cg.classification] ?? 0;
      if (caregiverLevel >= clientLevel) {
        matchScore += 15;
        matchReasons.push(`Classification: ${cg.classification}`);
      } else {
        matchScore -= 10;
      }

      // Medication aide match
      if (client.canSelfDirect && cg.certifications.includes('Medication Aide')) {
        matchScore += 10;
        matchReasons.push('Medication aide certified');
      }

      // Driver's license
      if (cg.driverLicense) { matchScore += 5; matchReasons.push('Licensed driver'); }

      // Compliance OK (background check valid, orientation done)
      const now = new Date();
      if (cg.backgroundCheckDate && cg.orientationDate) {
        const bgExpired = cg.backgroundCheckRenewalDue && cg.backgroundCheckRenewalDue < now;
        if (!bgExpired) { matchScore += 5; matchReasons.push('Compliance current'); }
        else { matchScore -= 20; matchReasons.push('Background check EXPIRED'); }
      } else {
        matchScore -= 15;
        matchReasons.push('Missing compliance docs');
      }

      // Weekly hours check
      const hoursCheck = await weeklyHoursGuard(cg.id, weekStart, weekEnd, shiftDuration);

      // Conflict check
      const conflictResult = await detectConflicts(cg.id, date, startTime, endTime);

      return {
        caregiverId: cg.id,
        name: cg.name,
        phone: cg.phone,
        classification: cg.classification,
        certifications: cg.certifications,
        matchScore,
        matchReasons,
        hasConflict: conflictResult.hasConflict,
        conflictDetails: conflictResult.conflicts,
        isPrimaryCaregiver: isPrimary,
        weeklyHours: hoursCheck.currentHours,
      };
    }),
  );

  // Sort: no conflict first, then by score descending
  return results
    .filter(r => r.matchScore >= 0)
    .sort((a, b) => {
      if (a.hasConflict !== b.hasConflict) return a.hasConflict ? 1 : -1;
      return b.matchScore - a.matchScore;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Recurring schedule generation
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateResult {
  created: number;
  skipped: number;
  errors: number;
}

/**
 * Materialises shift rows for the next `weeksAhead` weeks from a recurring
 * schedule. Already-existing shifts (same client/caregiver/date/startTime)
 * are skipped to avoid duplicates.
 */
export async function generateRecurringShifts(
  scheduleId: string,
  weeksAhead = 4,
): Promise<GenerateResult> {
  const schedule = await prisma.recurringSchedule.findUnique({
    where: { id: scheduleId },
  });
  if (!schedule || !schedule.isActive) return { created: 0, skipped: 0, errors: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const generationEnd = new Date(today);
  generationEnd.setDate(generationEnd.getDate() + weeksAhead * 7);

  const ceiling = schedule.endDate
    ? (schedule.endDate < generationEnd ? schedule.endDate : generationEnd)
    : generationEnd;

  // For biweekly: track the week parity relative to schedule start
  const startWeekMonday = getWeekMonday(schedule.startDate);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  const cursor = new Date(Math.max(today.getTime(), schedule.startDate.getTime()));

  while (cursor <= ceiling) {
    const dow = cursor.getDay();

    if (schedule.daysOfWeek.includes(dow)) {
      // Biweekly check: only generate on odd or even weeks relative to start
      if (schedule.frequency === 'biweekly') {
        const curMonday = getWeekMonday(cursor);
        const weekDiff = Math.round(
          (curMonday.getTime() - startWeekMonday.getTime()) / (7 * 24 * 60 * 60 * 1000),
        );
        if (weekDiff % 2 !== 0) {
          cursor.setDate(cursor.getDate() + 1);
          continue;
        }
      }

      try {
        const exists = await prisma.shift.findFirst({
          where: {
            clientId: schedule.clientId,
            date: new Date(cursor),
            startTime: schedule.startTime,
            ...(schedule.caregiverId ? { caregiverId: schedule.caregiverId } : {}),
          },
        });

        if (exists) {
          skipped++;
        } else {
          await prisma.shift.create({
            data: {
              clientId: schedule.clientId,
              caregiverId: schedule.caregiverId ?? undefined,
              date: new Date(cursor),
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              tasks: schedule.tasks,
              location: schedule.location,
              visitNotes: '',
              recurringScheduleId: scheduleId,
            },
          });
          created++;
        }
      } catch {
        errors++;
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return { created, skipped, errors };
}

// ─────────────────────────────────────────────────────────────────────────────
// Medicaid billing helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Round minutes to the nearest 15-minute Medicaid billing unit. */
export function roundToMedicaidUnit(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

/**
 * Calculate billable hours from a shift's start/end times.
 * When `medicaid` is true, duration is rounded to the nearest 15 minutes
 * before converting to hours (per CMS EVV billing requirements).
 */
export function calculateBillableHours(
  startTime: string,
  endTime: string,
  medicaid = false,
): number {
  let minutes = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (minutes < 0) minutes = 0;
  if (medicaid) minutes = roundToMedicaidUnit(minutes);
  return round2(minutes / 60);
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal utilities
// ─────────────────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function getWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  d.setDate(d.getDate() + diff);
  return d;
}
