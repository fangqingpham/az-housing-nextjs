import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

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
  const secure = process.env.SMTP_SECURE !== 'false'; // default true
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
    tls: { rejectUnauthorized: false }, // allow self-signed on some SMTP servers
  });
}

async function sendNewOrderEmail(order: {
  id: string;
  createdAt: string;
  landlordName: string;
  companyName: string;
  phone: string;
  email: string;
  mailingAddress: string;
  propertyAddress: string;
  city: string;
  postalCode: string;
  propertyType: string;
  expectedRent: string;
  bedrooms: string;
  bathrooms: string;
  moveInDate: string;
  showingReady: string;
  selectedServices: string[];
  estimatedTotal: number;
  additionalNotes: string;
}) {
  const servicesList = order.selectedServices.length
    ? order.selectedServices.map(s => `<li style="padding:3px 0;">${s}</li>`).join('')
    : '<li><em>None selected</em></li>';

  const rows = [
    ['Client Type',      'Landlord'],
    ['Order Type',       'Tenant Placement'],
    ['Landlord Name',    order.landlordName],
    ['Company',          order.companyName || '—'],
    ['Phone',            order.phone],
    ['Email',            `<a href="mailto:${order.email}" style="color:#1e2a45;">${order.email}</a>`],
    ['Mailing Address',  order.mailingAddress],
    ['Property Address', `${order.propertyAddress}, ${order.city} ${order.postalCode}`],
    ['Property Type',    order.propertyType],
    ['Expected Rent',    order.expectedRent || '—'],
    ['Beds / Baths',     `${order.bedrooms || '—'} / ${order.bathrooms || '—'}`],
    ['Move-In Date',     order.moveInDate || '—'],
    ['Showing Ready',    order.showingReady],
    ['Notes',            order.additionalNotes || '—'],
  ]
    .map(([lbl, val], i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9f7f4'};">
        <td style="padding:12px 18px;font-weight:700;color:#1e2a45;font-size:13px;white-space:nowrap;width:160px;">${lbl}</td>
        <td style="padding:12px 18px;color:#444;font-size:14px;">${val}</td>
      </tr>`)
    .join('');

  const transporter = getTransporter();

  // Verify connection before sending
  await transporter.verify();

  await transporter.sendMail({
    from:    `"A-Z Housing Orders" <${process.env.SMTP_USER}>`,
    to:      'info@azhouse.ca',
    replyTo: order.email,
    subject: 'New A-Z Housing Order Received',
    text: [
      'New Tenant Placement Order submitted via the A-Z Housing website.',
      '',
      'Client Type:   Landlord',
      'Order Type:    Tenant Placement',
      `Landlord:      ${order.landlordName}`,
      `Phone:         ${order.phone}`,
      `Email:         ${order.email}`,
      `Property:      ${order.propertyAddress}, ${order.city} ${order.postalCode}`,
      `Estimated Total: $${Number(order.estimatedTotal).toLocaleString('en-CA')}`,
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
          <h2 style="color:#f5a623;margin:0 0 6px;font-size:22px;">📋 New Tenant Placement Order</h2>
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
          <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 8px;">Estimated Total</p>
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

  console.log(`[tenant-placement] Email sent to info@azhouse.ca for order ${order.id}`);
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

    const landlordName    = text(form.landlordName || form.fullLegalName || form.name || body.landlordName || body.fullLegalName);
    const phone           = text(form.phone || form.phoneNumber || body.phone || body.phoneNumber);
    const email           = text(form.email || body.email);
    const mailingAddress  = text(form.mailingAddress || form.mailing_address || body.mailingAddress);
    const propertyAddress = text(form.propertyAddress || form.rentalPropertyAddress || form.address || body.propertyAddress || body.rentalPropertyAddress);
    const city            = text(form.city || body.city);
    const postalCode      = text(form.postalCode || form.postal_code || body.postalCode);
    const propertyType    = text(form.propertyType || form.property_type || body.propertyType);
    const showingReady    = text(form.showingReady || form.readyForShowing || body.showingReady || body.readyForShowing);

    const missing: string[] = [];
    if (!landlordName)    missing.push('landlord name');
    if (!phone)           missing.push('phone');
    if (!email)           missing.push('email');
    if (!mailingAddress)  missing.push('mailing address');
    if (!propertyAddress) missing.push('property address');
    if (!city)            missing.push('city');
    if (!postalCode)      missing.push('postal code');
    if (!propertyType)    missing.push('property type');
    if (!showingReady)    missing.push('property ready for showing');
    if (missing.length > 0)
      return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 });

    const companyName     = text(form.companyName || form.company_name || body.companyName) || null;
    const expectedRent    = text(form.expectedRent || form.expected_rent || body.expectedRent) || null;
    const bedrooms        = text(form.bedrooms || body.bedrooms) || null;
    const bathrooms       = text(form.bathrooms || body.bathrooms) || null;
    const moveInDate      = text(form.moveInDate || form.move_in_date || body.moveInDate) || null;
    const additionalNotes = text(form.notes || form.additionalNotes || body.additionalNotes) || null;
    const selectedServices = body.selectedServices || body.selected_services || [];
    const estimatedTotal  = cleanMoney(body.estimatedTotal || body.estimated_total || form.estimatedTotal);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from('tenant_placement_orders')
      .insert({
        landlord_name:           landlordName,
        company_name:            companyName,
        phone, email,
        mailing_address:         mailingAddress,
        property_address:        propertyAddress,
        city, postal_code:       postalCode,
        property_type:           propertyType,
        expected_rent:           expectedRent,
        bedrooms, bathrooms,
        move_in_date:            moveInDate,
        showing_ready:           showingReady,
        selected_services:       selectedServices,
        estimated_total:         estimatedTotal,
        additional_notes:        additionalNotes,
        authorization_confirmed: Boolean(
          form.authorization || form.authorizationConfirmed ||
          body.authorizationConfirmed || body.authorization_confirmed
        ),
        status: 'new',
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('[tenant-placement] DB insert error:', error);
      return NextResponse.json({ error: 'Order could not be saved.' }, { status: 500 });
    }

    console.log(`[tenant-placement] Order created successfully: ${data.id}`);
    console.log(`[tenant-placement] Attempting admin notification via SMTP for order ${data.id}`);
    let notificationWarning: string | undefined;
    try {
      await sendNewOrderEmail({
        id: data.id,
        createdAt: data.created_at,
        landlordName,
        companyName:     companyName || '',
        phone, email,
        mailingAddress, propertyAddress, city, postalCode, propertyType,
        expectedRent:    expectedRent  || '',
        bedrooms:        bedrooms      || '',
        bathrooms:       bathrooms     || '',
        moveInDate:      moveInDate    || '',
        showingReady, selectedServices, estimatedTotal,
        additionalNotes: additionalNotes || '',
      });
      console.log(`[tenant-placement] Admin notification sent for order ${data.id}`);
    } catch (emailError) {
      notificationWarning = 'Order saved, but the admin notification email could not be sent.';
      console.error(`[tenant-placement] Admin notification failed for order ${data.id}:`, emailError instanceof Error ? emailError.message : emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      ...(notificationWarning ? { warning: notificationWarning } : {}),
      message: 'Thank you for submitting the order, our A-Z Housing Solutions Team will contact you soon.',
    });
  } catch (error) {
    console.error('[tenant-placement] POST error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
