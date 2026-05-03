import nodemailer from 'nodemailer';

const SMTP_EMAIL = process.env.SMTP_EMAIL || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  // Always log the email in development so you can see the OTP in the terminal
  console.log('------------------------------------------');
  console.log(`📧 EMAIL INTERCEPTED (Local Development)`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log('CONTENT (PREVIEW):', html.replace(/<[^>]*>?/gm, '').substring(0, 200).trim() + '...');
  console.log('------------------------------------------');

  if (!SMTP_EMAIL || !SMTP_PASSWORD) {
    console.log('⚠️ No SMTP_EMAIL or SMTP_PASSWORD in .env. Skipping real email delivery.');
    return { success: true, id: 'simulated-id' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"YudiNex" <${SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });

    return { success: true, id: info.messageId };
  } catch (error) {
    console.error('Email failed with exception:', error);
    return { success: false, error };
  }
}

export async function sendOtpEmail(
  email: string,
  firstName: string,
  otp: string,
  role: 'FOUNDER' | 'EMPLOYEE'
) {
  const roleLabel = role === 'FOUNDER' ? 'Founder' : 'Team Member';
  return sendEmail({
    to: email,
    subject: `Your YudiNex Verification Code — ${otp}`,
    html: `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #4c9fe3 0%, #2d5282 100%); padding: 32px 40px;">
        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600;">Verify your ${roleLabel} account</h1>
      </div>

      <div style="padding: 40px;">
        <p style="color: #475569; font-size: 15px; margin: 0 0 24px;">Hi <strong>${firstName}</strong>, welcome to YudiNex! Use the code below to verify your email address.</p>

        <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
          <p style="color: #64748b; font-size: 12px; font-weight: 600; letter-spacing: 2px; margin: 0 0 8px; text-transform: uppercase;">Your verification code</p>
          <div style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #4c9fe3; font-family: monospace;">${otp}</div>
          <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0;">Expires in 10 minutes</p>
        </div>

        <p style="color: #94a3b8; font-size: 13px;">After verification, your account will be reviewed and activated by the YudiNex administrator. You'll receive another email once approved.</p>
      </div>
    </div>
    `
  });
}

export async function sendApprovalEmail(email: string, firstName: string, role: 'FOUNDER' | 'EMPLOYEE', loginUrl: string) {
  const roleLabel = role === 'FOUNDER' ? 'Founder' : 'Team Member';
  return sendEmail({
    to: email,
    subject: `🎉 Your YudiNex ${roleLabel} account is approved!`,
    html: `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #4c9fe3 0%, #2d5282 100%); padding: 32px 40px;">
        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600;">You're in! 🚀</h1>
      </div>
      <div style="padding: 40px;">
        <p style="color: #475569; font-size: 15px;">Hi <strong>${firstName}</strong>, your YudiNex ${roleLabel} account has been <strong style="color: #10b981;">approved</strong>.</p>
        <a href="${loginUrl}" style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #4c9fe3; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Login to YudiNex →</a>
      </div>
    </div>
    `
  });
}

export async function sendRejectionEmail(email: string, firstName: string, reason: string) {
  return sendEmail({
    to: email,
    subject: 'YudiNex — Registration Update',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #1e293b;">Hi ${firstName},</h2>
      <p style="color: #475569;">Thank you for your interest in YudiNex. Unfortunately, your registration could not be approved at this time.</p>
      ${reason ? `<p style="color: #475569;"><strong>Reason:</strong> ${reason}</p>` : ''}
      <p style="color: #94a3b8; font-size: 13px;">If you believe this is a mistake, please contact your administrator.</p>
    </div>
    `
  });
}
