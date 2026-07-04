import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/**
 * Landing Arrangement order intake.
 *
 * Writes into the SAME `tenant_placement_orders` table the tenant-placement form uses,
 * so these orders flow through the existing CRM (Tenant Orders list, agent assignment,
 * commission records, client cases). The CRM classifies them as "Landing Arrangement"
 * because every selected-service string is prefixed with "Landing Arrangement".
 *
 * The client here is a TENANT in Vietnam, not a landlord, so the tenant-facing fields
 * are mapped onto the landlord/property-shaped columns as follows:
 *   fullName          -> landlord_name
 *   vietnamAddress    -> mailing_address
 *   gtaArea           -> property_address   (preferred area / destination in the GTA)
 *   gtaCity           -> city
 *   neighbourhood     -> postal_code        ('N/A' when blank — column is NOT NULL)
 *   accommodationType -> property_type
 *   budget            -> expected_rent
 *   arrivalDate       -> move_in_date
 *   showing_ready     -> fixed 'N/A (Landing Arrangement)'  (column is NOT NULL)
 */

function cleanMoney(value: unknown): number {
  const cleaned = String(value ?? 0).replace(/[^0-9.]/g, '');
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : 0;
}

function text(value: unknown): string {
  return String(value ?? '').trim();
}

function getTransporter() {
  const host   = process.env.SMTP_HOST;
  const port   = Number(process.env.SMTP_PORT ?? 465);
  const secure = process.env.SMTP_SECURE !== 'false';
  const user   = process.env.SMTP_USER;
  const pass   = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      `SMTP env vars not set — SMTP_HOST=${host ?? 'UNSET'} SMTP_USER=${user ?? 'UNSET'} SMTP_PASS=${pass ? '[set]' : 'UNSET'}`
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

async function sendNewOrderEmail(order: {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string;
  vietnamAddress: string;
  gtaArea: string;
  gtaCity: string;
  neighbourhood: string;
  accommodationType: string;
  budget: string;
  bedrooms: string;
  bathrooms: string;
  arrivalDate: string;
  selectedServices: string[];
  estimatedTotal: number;
  additionalNotes: string;
  language: string;
}) {
  const servicesList = order.selectedServices.length
    ? order.selectedServices.map(s => `<li style="padding:3px 0;">${s}</li>`).join('')
    : '<li><em>None selected</em></li>';

  const rows = [
    ['Client Type',        'Tenant'],
    ['Order Type',         'Landing Arrangement'],
    ['Client Name',        order.fullName],
    ['Phone',              order.phone],
    ['Email',              `<a href="mailto:${order.email}" style="color:#1e2a45;">${order.email}</a>`],
    ['Address in Vietnam', order.vietnamAddress],
    ['Preferred Area (GTA)', `${order.gtaArea}, ${order.gtaCity}`],
    ['Neighbourhood',      order.neighbourhood || '—'],
    ['Accommodation Type', order.accommodationType],
    ['Monthly Budget',     order.budget || '—'],
    ['Beds / Baths',       `${order.bedrooms || '—'} / ${order.bathrooms || '—'}`],
    ['Expected Arrival',   order.arrivalDate || '—'],
    ['Form Language',      order.language === 'vi' ? 'Tiếng Việt' : 'English'],
    ['Notes',              order.additionalNotes || '—'],
  ]
    .map(([lbl, val], i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9f7f4'};">
        <td style="padding:12px 18px;font-weight:700;color:#1e2a45;font-size:13px;white-space:nowrap;width:170px;">${lbl}</td>
        <td style="padding:12px 18px;color:#444;font-size:14px;">${val}</td>
      </tr>`)
    .join('');

  const transporter = getTransporter();
  await transporter.verify();

  await transporter.sendMail({
    from:    `"A-Z Housing Orders" <${process.env.SMTP_USER}>`,
    to:      'info@azhouse.ca',
    replyTo: order.email,
    subject: 'New A-Z Housing Order Received',
    text: [
      'New Landing Arrangement Order submitted via the A-Z Housing website.',
      '',
      'Client Type:   Tenant',
      'Order Type:    Landing Arrangement',
      `Client:        ${order.fullName}`,
      `Phone:         ${order.phone}`,
      `Email:         ${order.email}`,
      `In Vietnam:    ${order.vietnamAddress}`,
      `Destination:   ${order.gtaArea}, ${order.gtaCity}`,
      `Arrival:       ${order.arrivalDate || '—'}`,
      `Estimated Total: $${Number(order.estimatedTotal).toLocaleString('en-CA')} (before tax)`,
      '',
      'Services:',
      ...order.selectedServices.map(s => `  • ${s}`),
      '',
      `Notes: ${order.additionalNotes || '—'}`,
      '',
      `Order ID: ${order.id}`,
      `Created: ${new Date(order.createdAt).toLocaleString('en-CA', { timeZone: 'America/Toronto' })} ET`,
      `Admin: https://azhouse.ca/admin/orders`,
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;background:#f7f4ef;padding:32px 24px;border-radius:12px;">
        <div style="background:#1e2a45;border-radius:10px;padding:22px 28px;margin-bottom:24px;">
          <h2 style="color:#f5a623;margin:0 0 6px;font-size:22px;">🛬 New Landing Arrangement Order</h2>
          <p style="color:rgba(255,255,255,0.65);margin:0;font-size:13px;">
            Submitted via azhouse.ca — log in to assign an agent.
          </p>
        </div>

        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);margin-bottom:20px;">
          <tbody>${rows}</tbody>
        </table>

        <div style="background:#fff;border-radius:10px;padding:18px 22px;margin-bottom:20px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
          <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#f5a623;margin-bottom:10px;">Selected Services</div>
          <ul style="margin:0;padding-left:18px;color:#444;font-size:14px;line-height:1.8;">${servicesList}</ul>
        </div>

        <div style="background:#1e2a45;border-radius:10px;padding:16px 22px;text-align:center;margin-bottom:20px;">
          <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 8px;">Estimated Total (before tax)</p>
          <p style="color:#f5a623;font-size:28px;font-weight:800;font-family:Georgia,serif;margin:0;">
            $${Number(order.estimatedTotal).toLocaleString('en-CA')}
          </p>
        </div>

        <p style="color:#aaa;font-size:11px;text-align:center;margin-top:16px;">
          Order ID: <code>${order.id}</code><br/>
          Created: ${new Date(order.createdAt).toLocaleString('en-CA', { timeZone: 'America/Toronto' })} ET<br/>
          <a href="https://azhouse.ca/admin/orders" style="color:#1e2a45;">Open Admin Orders</a><br/>
          A-Z Housing Solutions &middot; info@azhouse.ca
        </p>
      </div>
    `,
  });

  console.log(`[landing-arrangement] Email sent to info@azhouse.ca for order ${order.id}`);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const form = body.form || body;

    const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase server settings are missing.' }, { status: 500 });
    }

    const fullName          = text(form.fullName || body.fullName);
    const phone             = text(form.phone || body.phone);
    const email             = text(form.email || body.email);
    const vietnamAddress    = text(form.vietnamAddress || body.vietnamAddress);
    const gtaArea           = text(form.gtaArea || body.gtaArea);
    const gtaCity           = text(form.gtaCity || body.gtaCity);
    const accommodationType = text(form.accommodationType || body.accommodationType);
    const budget            = text(form.budget || body.budget);
    const arrivalDate       = text(form.arrivalDate || body.arrivalDate);

    const missing: string[] = [];
    if (!fullName)          missing.push('full name');
    if (!phone)             missing.push('phone');
    if (!email)             missing.push('email');
    if (!vietnamAddress)    missing.push('address in Vietnam');
    if (!gtaArea)           missing.push('preferred area in the GTA');
    if (!gtaCity)           missing.push('preferred city');
    if (!accommodationType) missing.push('accommodation type');
    if (!budget)            missing.push('monthly budget');
    if (!arrivalDate)       missing.push('expected arrival date');
    if (missing.length > 0)
      return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });

    const neighbourhood   = text(form.neighbourhood || body.neighbourhood);
    const bedrooms        = text(form.bedrooms || body.bedrooms) || null;
    const bathrooms       = text(form.bathrooms || body.bathrooms) || null;
    const additionalNotes = text(form.notes || form.additionalNotes || body.additionalNotes) || null;
    const language        = text(form.language || body.language) || 'en';
    const selectedServices = body.selectedServices || body.selected_services || [];
    const estimatedTotal  = cleanMoney(body.estimatedTotal || body.estimated_total || form.estimatedTotal);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from('tenant_placement_orders')
      .insert({
        landlord_name:           fullName,                 // client (tenant) name
        company_name:            null,
        phone, email,
        mailing_address:         vietnamAddress,           // current address in Vietnam
        property_address:        gtaArea,                  // preferred area / destination in GTA
        city:                    gtaCity,
        postal_code:             neighbourhood || 'N/A',   // column is NOT NULL
        property_type:           accommodationType,
        expected_rent:           budget,
        bedrooms, bathrooms,
        move_in_date:            arrivalDate,
        showing_ready:           'N/A (Landing Arrangement)', // column is NOT NULL
        selected_services:       selectedServices,
        estimated_total:         estimatedTotal,
        additional_notes:        additionalNotes,
        authorization_confirmed: Boolean(form.consent || body.consent || form.authorizationConfirmed),
        status: 'new',
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('[landing-arrangement] DB insert error:', error);
      return NextResponse.json({ error: 'Order could not be saved.' }, { status: 500 });
    }

    console.log(`[landing-arrangement] Order created successfully: ${data.id}`);
    console.log(`[landing-arrangement] Attempting admin notification via SMTP for order ${data.id}`);
    let notificationWarning: string | undefined;
    try {
      await sendNewOrderEmail({
        id: data.id,
        createdAt: data.created_at,
        fullName, phone, email,
        vietnamAddress, gtaArea, gtaCity,
        neighbourhood:    neighbourhood || '',
        accommodationType,
        budget:           budget || '',
        bedrooms:         bedrooms  || '',
        bathrooms:        bathrooms || '',
        arrivalDate:      arrivalDate || '',
        selectedServices, estimatedTotal,
        additionalNotes:  additionalNotes || '',
        language,
      });
      console.log(`[landing-arrangement] Admin notification sent for order ${data.id}`);
    } catch (emailError) {
      notificationWarning = 'Order saved, but the admin notification email could not be sent.';
      console.error(`[landing-arrangement] Admin notification failed for order ${data.id}:`, emailError instanceof Error ? emailError.message : emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      ...(notificationWarning ? { warning: notificationWarning } : {}),
      message: 'Thank you for your order, our A-Z Housing Solutions Team will contact you soon.',
    });
  } catch (error) {
    console.error('[landing-arrangement] POST error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
