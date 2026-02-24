import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail, buildWelcomeEmail, buildAgencyWelcomeEmail } from '../services/emailService';

const router = Router();

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

// POST /api/users — Create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, role, location, agencyId, agencyName } = req.body;
    if (!name || !email || !role || !agencyName)
      return res.status(400).json({ error: 'Name, email, role, and agencyName are required.' });

    const tempPassword = generateTempPassword();
    await bcrypt.hash(tempPassword, 10);
    const userId = `user-${Date.now()}-${crypto.randomInt(9999)}`;

    const emailContent = buildWelcomeEmail({ recipientName: name, email, tempPassword, role, agencyName });
    const emailResult = await sendEmail(emailContent);

    return res.status(201).json({
      user: { id: userId, name, email, role, location: location || 'All', agencyId, agencyName, status: 'Active', mustChangePassword: true },
      tempPassword,
      emailStatus: emailResult,
    });
  } catch (err: any) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

// POST /api/users/agency-admin — Create admin user for a new agency
router.post('/agency-admin', async (req: Request, res: Response) => {
  try {
    const { adminName, adminEmail, agencyName, companyName, agencyId } = req.body;
    if (!adminName || !adminEmail || !agencyName)
      return res.status(400).json({ error: 'adminName, adminEmail, and agencyName are required.' });

    const tempPassword = generateTempPassword();
    await bcrypt.hash(tempPassword, 10);
    const userId = `user-${Date.now()}-${crypto.randomInt(9999)}`;

    const emailContent = buildAgencyWelcomeEmail({ adminName, email: adminEmail, tempPassword, agencyName, companyName: companyName || agencyName });
    const emailResult = await sendEmail(emailContent);

    return res.status(201).json({
      user: { id: userId, name: adminName, email: adminEmail, role: 'Owner', location: 'All', agencyId, agencyName, status: 'Active', mustChangePassword: true },
      tempPassword,
      emailStatus: emailResult,
    });
  } catch (err: any) {
    console.error('Create agency admin error:', err);
    return res.status(500).json({ error: 'Failed to create agency admin.' });
  }
});

export default router;
