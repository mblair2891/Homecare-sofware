import nodemailer from 'nodemailer';

// ─── SMTP Configuration ─────────────────────────────────────────────────────
// Uses SMTP_* env vars when available. Falls back to console logging if not configured.

const SMTP_CONFIGURED =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = SMTP_CONFIGURED
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const FROM_ADDRESS = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@careaxis.io';

// ─── Send Email Helper ──────────────────────────────────────────────────────

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  if (!transporter) {
    console.log('──────────────────────────────────────────────────');
    console.log('EMAIL (SMTP not configured — logged to console)');
    console.log(`  To:      ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  Body:    ${options.text || '(HTML only)'}`);
    console.log('──────────────────────────────────────────────────');
    return { success: true, message: 'Email logged to console (SMTP not configured)' };
  }

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return { success: true, message: `Email sent to ${options.to}` };
  } catch (err: any) {
    console.error('Email send failed:', err.message);
    return { success: false, message: err.message };
  }
}

// ─── Pre-built Email Templates ──────────────────────────────────────────────

export function buildWelcomeEmail(params: {
  recipientName: string;
  email: string;
  tempPassword: string;
  role: string;
  agencyName: string;
  loginUrl?: string;
}): EmailOptions {
  const loginUrl = params.loginUrl || process.env.FRONTEND_URL || 'http://localhost:3000';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); border-radius: 12px; padding: 32px; color: white; text-align: center; margin-bottom: 32px;">
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700;">Welcome to CareAxis</h1>
        <p style="margin: 0; opacity: 0.9; font-size: 14px;">${params.agencyName}</p>
      </div>

      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${params.recipientName},</p>

      <p style="color: #334155; font-size: 16px; line-height: 1.6;">
        Your account has been created for <strong>${params.agencyName}</strong>.
        Below are your login credentials:
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Login URL</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
            <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">${params.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Temp Password</td>
            <td style="padding: 8px 0; font-family: monospace; font-size: 16px; font-weight: 700; color: #1e293b; letter-spacing: 1px;">${params.tempPassword}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Role</td>
            <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">${params.role}</td>
          </tr>
        </table>
      </div>

      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
          Important: Please change your password after your first login.
        </p>
      </div>

      <p style="color: #64748b; font-size: 13px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
        This is an automated message from CareAxis. If you did not expect this email, please contact your administrator.
      </p>
    </div>
  `;

  const text = `Welcome to CareAxis — ${params.agencyName}

Hi ${params.recipientName},

Your account has been created. Here are your login credentials:

  Login URL: ${loginUrl}
  Email: ${params.email}
  Temporary Password: ${params.tempPassword}
  Role: ${params.role}

IMPORTANT: Please change your password after your first login.

— CareAxis`;

  return {
    to: params.email,
    subject: `Your CareAxis Account — ${params.agencyName}`,
    html,
    text,
  };
}

export function buildAgencyWelcomeEmail(params: {
  adminName: string;
  email: string;
  tempPassword: string;
  agencyName: string;
  companyName: string;
  loginUrl?: string;
}): EmailOptions {
  const loginUrl = params.loginUrl || process.env.FRONTEND_URL || 'http://localhost:3000';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); border-radius: 12px; padding: 32px; color: white; text-align: center; margin-bottom: 32px;">
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700;">Welcome to CareAxis</h1>
        <p style="margin: 0; opacity: 0.9; font-size: 14px;">Your agency has been onboarded</p>
      </div>

      <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${params.adminName},</p>

      <p style="color: #334155; font-size: 16px; line-height: 1.6;">
        <strong>${params.companyName}</strong> — <strong>${params.agencyName}</strong> has been set up on the CareAxis platform.
        As the primary administrator, you can log in and begin configuring your agency.
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Login URL</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
            <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">${params.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Temp Password</td>
            <td style="padding: 8px 0; font-family: monospace; font-size: 16px; font-weight: 700; color: #1e293b; letter-spacing: 1px;">${params.tempPassword}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Role</td>
            <td style="padding: 8px 0; font-size: 14px; color: #1e293b;">Administrator (Owner)</td>
          </tr>
        </table>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #166534; font-size: 14px; font-weight: 600;">Getting Started:</p>
        <ol style="margin: 0; padding-left: 20px; color: #166534; font-size: 13px; line-height: 1.8;">
          <li>Log in and change your password</li>
          <li>Complete your agency profile in Settings</li>
          <li>Add staff users under Settings &rarr; Users & Roles</li>
          <li>Begin adding clients and caregivers</li>
        </ol>
      </div>

      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
          Important: Please change your password after your first login.
        </p>
      </div>

      <p style="color: #64748b; font-size: 13px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
        This is an automated message from CareAxis. If you did not expect this email, please contact support.
      </p>
    </div>
  `;

  const text = `Welcome to CareAxis

Hi ${params.adminName},

${params.companyName} — ${params.agencyName} has been set up on the CareAxis platform.

Your admin login credentials:

  Login URL: ${loginUrl}
  Email: ${params.email}
  Temporary Password: ${params.tempPassword}
  Role: Administrator (Owner)

Getting Started:
  1. Log in and change your password
  2. Complete your agency profile in Settings
  3. Add staff users under Settings > Users & Roles
  4. Begin adding clients and caregivers

IMPORTANT: Please change your password after your first login.

— CareAxis`;

  return {
    to: params.email,
    subject: `Your Agency is Live on CareAxis — ${params.agencyName}`,
    html,
    text,
  };
}
