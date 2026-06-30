import nodemailer from 'nodemailer'

export const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || 'info@azhouse.ca'

export function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 465)
  const secure = process.env.SMTP_SECURE !== 'false'
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP settings are missing')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  })
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string
}) {
  const user = process.env.SMTP_USER
  const transporter = getTransporter()

  await transporter.sendMail({
    from: `"A-Z Housing Solutions" <${user}>`,
    to,
    replyTo,
    subject,
    text,
    html,
  })
}

export function emailShell(title: string, body: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#f7f4ef;padding:32px 24px;border-radius:12px;">
      <div style="background:#1e2a45;border-radius:10px;padding:22px 28px;margin-bottom:24px;">
        <h2 style="color:#f5a623;margin:0;font-size:22px;">${title}</h2>
      </div>
      <div style="background:#fff;border-radius:10px;padding:22px 24px;color:#444;font-size:14px;line-height:1.7;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
        ${body}
      </div>
      <p style="color:#999;font-size:11px;text-align:center;margin-top:16px;">
        A-Z Housing Solutions &middot; ${BUSINESS_EMAIL} &middot; azhouse.ca
      </p>
    </div>
  `
}
