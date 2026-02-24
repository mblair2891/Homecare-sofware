import { Router, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AuthRequest, authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '@prisma/client';
import { sendEmail, buildWelcomeEmail, buildAgencyWelcomeEmail } from '../services/emailService';

const router = Router();

const ROLE_MAP: Record<string, UserRole> = {
  'Owner': 'Owner',
  'Administrator': 'Administrator',
  'Coordinator': 'Coordinator',
  'Nurse': 'Nurse',
  'Biller': 'Biller',
  'ReadOnly': 'ReadOnly',
};

function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$&';
  const all = upper + lower + digits + symbols;

  let pw = '';
  pw += upper[crypto.randomInt(upper.length)];
  pw += lower[crypto.randomInt(lower.length)];
  pw += digits[crypto.randomInt(digits.length)];
  pw += symbols[crypto.randomInt(symbols.length)];
  for (let i = 0; i < 8; i++) pw += all[crypto.randomInt(all.length)];
  return pw.split('').sort(() => crypto.randomInt(3) - 1).join('');
}

// ─── GET /api/users ───────────────────────────────────────────────────────────
// Owner and Administrator only — user management is a privileged operation
router.get('/', authenticate, authorize('Owner', 'Administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { agencyId: req.user!.agencyId },
      select: { id: true, name: true, email: true, role: true, locationId: true, isActive: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    res.json({ users });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ─── POST /api/users ──────────────────────────────────────────────────────────
// Owner and Administrator only
router.post('/', authenticate, authorize('Owner', 'Administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, role, locationId, agencyId, agencyName } = req.body;
    if (!name || !email || !role)
      return res.status(400).json({ error: 'Name, email, and role are required.' });

    const mappedRole = ROLE_MAP[role];
    if (!mappedRole) return res.status(400).json({ error: `Invalid role: ${role}` });

    // Non-Owner users cannot elevate to Owner
    if (mappedRole === 'Owner' && req.user!.role !== 'Owner') {
      return res.status(403).json({ error: 'Only an Owner can assign the Owner role.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'A user with this email already exists.' });

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Administrators can only create users in their own agency
    const targetAgencyId = req.user!.role === 'Owner' ? (agencyId || req.user!.agencyId) : req.user!.agencyId;
    const agency = await prisma.agency.findUnique({ where: { id: targetAgencyId }, select: { name: true } });

    const user = await prisma.user.create({
      data: {
        agencyId: targetAgencyId,
        email,
        passwordHash,
        name,
        role: mappedRole,
        locationId: locationId || undefined,
      },
    });

    const effectiveAgencyName = agencyName || agency?.name || 'CareAxis';
    const emailContent = buildWelcomeEmail({ recipientName: name, email, tempPassword, role: mappedRole, agencyName: effectiveAgencyName });
    const emailResult = await sendEmail(emailContent);

    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, locationId: user.locationId, isActive: user.isActive },
      tempPassword,
      emailStatus: emailResult,
    });
  } catch (err: any) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

// ─── POST /api/users/agency-admin ────────────────────────────────────────────
// Public — used during new-agency onboarding flow.
// NOTE: In production, protect this behind an internal API key or admin portal.
router.post('/agency-admin', async (req: AuthRequest, res: Response) => {
  try {
    const { adminName, adminEmail, agencyName, companyName, agencyId } = req.body;
    if (!adminName || !adminEmail || !agencyName)
      return res.status(400).json({ error: 'adminName, adminEmail, and agencyName are required.' });

    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) return res.status(409).json({ error: 'A user with this email already exists.' });

    let targetAgencyId = agencyId;
    if (!targetAgencyId) {
      const agency = await prisma.agency.create({
        data: {
          name: agencyName,
          classification: 'Basic',
          address: '',
          phone: '',
        },
      });
      targetAgencyId = agency.id;
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        agencyId: targetAgencyId,
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: 'Owner',
      },
    });

    const emailContent = buildAgencyWelcomeEmail({ adminName, email: adminEmail, tempPassword, agencyName, companyName: companyName || agencyName });
    const emailResult = await sendEmail(emailContent);

    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, agencyId: targetAgencyId },
      tempPassword,
      emailStatus: emailResult,
    });
  } catch (err: any) {
    console.error('Create agency admin error:', err);
    return res.status(500).json({ error: 'Failed to create agency admin.' });
  }
});

// ─── PATCH /api/users/:id ─────────────────────────────────────────────────────
// Owner and Administrator only
router.patch('/:id', authenticate, authorize('Owner', 'Administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.user.findFirst({ where: { id: req.params.id, agencyId: req.user!.agencyId } });
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const { name, role, locationId, isActive } = req.body;

    // Non-Owner cannot promote/demote to Owner
    if (role === 'Owner' && req.user!.role !== 'Owner') {
      return res.status(403).json({ error: 'Only an Owner can assign the Owner role.' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (role && ROLE_MAP[role]) updateData.role = ROLE_MAP[role];
    if (locationId !== undefined) updateData.locationId = locationId || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await prisma.user.update({ where: { id: req.params.id }, data: updateData });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, locationId: user.locationId, isActive: user.isActive });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
// Owner only — hard deactivation (soft-delete by setting isActive=false)
router.delete('/:id', authenticate, authorize('Owner'), async (req: AuthRequest, res: Response) => {
  try {
    if (req.params.id === req.user!.userId) {
      return res.status(400).json({ error: 'You cannot deactivate your own account.' });
    }
    const existing = await prisma.user.findFirst({ where: { id: req.params.id, agencyId: req.user!.agencyId } });
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'User deactivated', userId: user.id });
  } catch (err) {
    console.error('Deactivate user error:', err);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

export default router;
