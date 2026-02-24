import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// ─── Provider selection ────────────────────────────────────────────────────────
// Priority: Resend (RESEND_API_KEY) → SMTP (SMTP_HOST + SMTP_USER + SMTP_PASS)
//           → console-log fallback (dev/demo mode)

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const smtpConfigured =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const smtpTransporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

// The FROM address must be a domain you have verified in Resend (or your SMTP
// account). Set SMTP_FROM / RESEND_FROM to override, e.g. "CareAxis <noreply@yourdomain.com>"
const FROM_ADDRESS =
  process.env.RESEND_FROM ||
  process.env.SMTP_FROM ||
  process.env.SMTP_USER ||
  'CareAxis <onboarding@resend.dev>';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ─── Core send function ────────────────────────────────────────────────────────

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  // 1. Resend
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      if (error) {
        console.error('Resend send error:', error);
        return { success: false, message: error.message };
      }
      console.log(`Email sent via Resend → ${options.to}: ${options.subject}`);
      return { success: true, message: `Email sent to ${options.to}` };
    } catch (err: any) {
      console.error('Resend exception:', err.message);
      return { success: false, message: err.message };
    }
  }

  // 2. SMTP / Nodemailer
  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({ from: FROM_ADDRESS, ...options });
      console.log(`Email sent via SMTP → ${options.to}: ${options.subject}`);
      return { success: true, message: `Email sent to ${options.to}` };
    } catch (err: any) {
      console.error('SMTP send error:', err.message);
      return { success: false, message: err.message };
    }
  }

  // 3. No provider configured — log to console (dev / demo mode)
  console.log('────────────────────────────────────────────────────');
  console.log('EMAIL (no provider configured — logged to console)');
  console.log(`  To:      ${options.to}`);
  console.log(`  Subject: ${options.subject}`);
  if (options.text) console.log(`  Body:\n${options.text}`);
  console.log('────────────────────────────────────────────────────');
  console.log('Set RESEND_API_KEY to send real emails.');
  return { success: true, message: 'Email logged to console (no provider configured)' };
}

// ─── Email templates ──────────────────────────────────────────────────────────

export function buildWelcomeEmail(p: {
  recipientName: string;
  email: string;
  tempPassword: string;
  role: string;
  agencyName: string;
  loginUrl?: string;
}): EmailOptions {
  const url = p.loginUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
  return {
    to: p.email,
    subject: `Your CareAxis Account — ${p.agencyName}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
      <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:12px;padding:32px;color:#fff;text-align:center;margin-bottom:32px">
        <h1 style="margin:0 0 8px;font-size:24px">Welcome to CareAxis</h1>
        <p style="margin:0;opacity:.9;font-size:14px">${p.agencyName}</p>
      </div>
      <p style="color:#334155;font-size:16px;line-height:1.6">Hi ${p.recipientName},</p>
      <p style="color:#334155;font-size:16px;line-height:1.6">Your account has been created for <strong>${p.agencyName}</strong>.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:24px 0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:120px">Login URL</td><td style="padding:8px 0;font-size:14px"><a href="${url}" style="color:#2563eb">${url}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1e293b">${p.email}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Temp Password</td><td style="padding:8px 0;font-family:monospace;font-size:16px;font-weight:700;color:#1e293b;letter-spacing:1px">${p.tempPassword}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Role</td><td style="padding:8px 0;font-size:14px;color:#1e293b">${p.role}</td></tr>
        </table>
      </div>
      <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin:24px 0">
        <p style="margin:0;color:#92400e;font-size:14px;font-weight:600">⚠ Please change your password after your first login.</p>
      </div>
      <p style="color:#64748b;font-size:12px;text-align:center;margin-top:32px">CareAxis — Homecare Management Platform</p>
    </div>`,
    text: `Welcome to CareAxis — ${p.agencyName}\n\nHi ${p.recipientName},\n\nYour account:\n  URL: ${url}\n  Email: ${p.email}\n  Password: ${p.tempPassword}\n  Role: ${p.role}\n\nPlease change your password after first login.`,
  };
}

export function buildAgencyWelcomeEmail(p: {
  adminName: string;
  email: string;
  tempPassword: string;
  agencyName: string;
  companyName: string;
  loginUrl?: string;
}): EmailOptions {
  const url = p.loginUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
  return {
    to: p.email,
    subject: `Your Agency is Live on CareAxis — ${p.agencyName}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
      <div style="background:linear-gradient(135deg,#059669,#10b981);border-radius:12px;padding:32px;color:#fff;text-align:center;margin-bottom:32px">
        <h1 style="margin:0 0 8px;font-size:24px">Welcome to CareAxis</h1>
        <p style="margin:0;opacity:.9;font-size:14px">Your agency has been onboarded</p>
      </div>
      <p style="color:#334155;font-size:16px;line-height:1.6">Hi ${p.adminName},</p>
      <p style="color:#334155;font-size:16px;line-height:1.6"><strong>${p.companyName}</strong> — <strong>${p.agencyName}</strong> has been set up on CareAxis.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:24px 0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:120px">Login URL</td><td style="padding:8px 0;font-size:14px"><a href="${url}" style="color:#2563eb">${url}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Email</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1e293b">${p.email}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Temp Password</td><td style="padding:8px 0;font-family:monospace;font-size:16px;font-weight:700;color:#1e293b;letter-spacing:1px">${p.tempPassword}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Role</td><td style="padding:8px 0;font-size:14px;color:#1e293b">Administrator (Owner)</td></tr>
        </table>
      </div>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:24px 0">
        <p style="margin:0 0 8px;color:#166534;font-size:14px;font-weight:600">Getting Started:</p>
        <ol style="margin:0;padding-left:20px;color:#166534;font-size:13px;line-height:1.8">
          <li>Log in and change your password</li>
          <li>Complete your agency profile in Settings</li>
          <li>Add staff users under Settings → Users &amp; Roles</li>
          <li>Begin adding clients and caregivers</li>
        </ol>
      </div>
      <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin:24px 0">
        <p style="margin:0;color:#92400e;font-size:14px;font-weight:600">⚠ Please change your password after your first login.</p>
      </div>
      <p style="color:#64748b;font-size:12px;text-align:center;margin-top:32px">CareAxis — Homecare Management Platform</p>
    </div>`,
    text: `Welcome to CareAxis\n\nHi ${p.adminName},\n\n${p.companyName} — ${p.agencyName} is live.\n\n  URL: ${url}\n  Email: ${p.email}\n  Password: ${p.tempPassword}\n  Role: Administrator (Owner)\n\nPlease change your password after first login.`,
  };
}
