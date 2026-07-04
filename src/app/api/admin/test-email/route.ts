import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { requireStaff } from '@/lib/server/staff-auth';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = await requireStaff(request, ['admin']);
  if ('error' in auth) return auth.error;
  const host   = process.env.SMTP_HOST;
  const port   = Number(process.env.SMTP_PORT ?? 465);
  const secure = process.env.SMTP_SECURE !== 'false';
  const user   = process.env.SMTP_USER;
  const pass   = process.env.SMTP_PASS;

  // Step 1: Check env vars exist
  const envCheck = {
    SMTP_HOST:   host   ? '✅ set' : '❌ MISSING',
    SMTP_PORT:   port,
    SMTP_SECURE: secure,
    SMTP_USER:   user   ? '✅ set' : '❌ MISSING',
    SMTP_PASS:   pass   ? '✅ set' : '❌ MISSING',
  };

  if (!host || !user || !pass) {
    return NextResponse.json({
      status: 'FAILED',
      reason: 'Missing SMTP environment variables — add them in Vercel dashboard under Settings → Environment Variables',
      envCheck,
    }, { status: 500 });
  }

  // Step 2: Test connection
  const transporter = nodemailer.createTransport({
    host, port, secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.verify();
  } catch (err: any) {
    return NextResponse.json({
      status: 'FAILED',
      reason: 'SMTP connection/auth failed',
      error: err?.message ?? String(err),
      envCheck,
      fix: 'Check SMTP_HOST, SMTP_PORT, SMTP_SECURE, and that the password is correct in Vercel env vars',
    }, { status: 500 });
  }

  // Step 3: Send test email
  try {
    const info = await transporter.sendMail({
      from:    `"A-Z Housing Test" <${user}>`,
      to:      'info@azhouse.ca',
      subject: '✅ A-Z Housing SMTP Test — Working',
      text:    'This confirms SMTP is configured correctly. New order emails will now be delivered.',
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;max-width:500px;background:#f7f4ef;border-radius:12px;">
          <div style="background:#1e2a45;border-radius:8px;padding:18px 22px;margin-bottom:16px;">
            <h2 style="color:#f5a623;margin:0;font-size:20px;">✅ SMTP Test Successful</h2>
          </div>
          <p style="color:#444;">Email notifications are working. New orders will be sent to this inbox automatically.</p>
          <p style="color:#aaa;font-size:11px;">Sent: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    return NextResponse.json({
      status: 'SUCCESS ✅',
      message: 'Test email sent to info@azhouse.ca — check your inbox now',
      messageId: info.messageId,
      envCheck,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'FAILED',
      reason: 'Connected but sending failed',
      error: err?.message ?? String(err),
      envCheck,
    }, { status: 500 });
  }
}
