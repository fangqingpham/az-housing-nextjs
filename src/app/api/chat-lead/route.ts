import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

    await transporter.sendMail({
      from: `"A-Z Housing Chat Bot" <${process.env.SMTP_USER}>`,
      to: 'info@azhouse.ca',
      replyTo: email,
      subject: `💬 New Chat Lead — ${name}`,
      text: [
        'A visitor has requested a callback via the website chat widget.',
        '',
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Phone:   ${phone || 'Not provided'}`,
        `Message: ${message}`,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f7f4ef;padding:32px 24px;border-radius:12px;">
          <div style="background:#1e2a45;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
            <h2 style="color:#f5a623;margin:0;font-size:20px;">💬 New Chat Lead</h2>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">
              Submitted via the A-Z Housing website chat widget
            </p>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
            <tbody>
              ${[
                ['Name',    name],
                ['Email',   `<a href="mailto:${email}" style="color:#1e2a45;">${email}</a>`],
                ['Phone',   phone || '<em style="color:#999;">Not provided</em>'],
                ['Message', message.replace(/\n/g, '<br>')],
              ].map(([label, value], i) => `
                <tr style="background:${i % 2 === 0 ? '#fff' : '#f9f7f4'};">
                  <td style="padding:14px 18px;font-weight:700;color:#1e2a45;font-size:13px;white-space:nowrap;width:90px;">${label}</td>
                  <td style="padding:14px 18px;color:#444;font-size:14px;">${value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="color:#999;font-size:12px;margin-top:20px;text-align:center;">
            A-Z Housing Solutions &middot; info@azhouse.ca &middot; +1 (647) 948-4428
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[chat-lead] Failed to send email:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
