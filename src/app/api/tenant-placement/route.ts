import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function cleanMoney(value: unknown): number {
  const cleaned = String(value ?? 0).replace(/[^0-9.]/g, '');
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : 0;
}

function text(value: unknown): string {
  return String(value ?? '').trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Some versions of the Tenant Placement page send fields directly.
    // Other versions send them inside body.form. This supports both.
    const form = body.form || body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase server settings are missing.' },
        { status: 500 }
      );
    }

    const landlordName = text(
      form.landlordName ||
      form.fullLegalName ||
      form.name ||
      body.landlordName ||
      body.fullLegalName
    );

    const phone = text(form.phone || form.phoneNumber || body.phone || body.phoneNumber);
    const email = text(form.email || body.email);
    const mailingAddress = text(form.mailingAddress || form.mailing_address || body.mailingAddress);
    const propertyAddress = text(
      form.propertyAddress ||
      form.rentalPropertyAddress ||
      form.address ||
      body.propertyAddress ||
      body.rentalPropertyAddress
    );
    const city = text(form.city || body.city);
    const postalCode = text(form.postalCode || form.postal_code || body.postalCode);
    const propertyType = text(form.propertyType || form.property_type || body.propertyType);
    const showingReady = text(
      form.showingReady ||
      form.readyForShowing ||
      body.showingReady ||
      body.readyForShowing
    );

    const missing: string[] = [];
    if (!landlordName) missing.push('landlord name');
    if (!phone) missing.push('phone');
    if (!email) missing.push('email');
    if (!mailingAddress) missing.push('mailing address');
    if (!propertyAddress) missing.push('property address');
    if (!city) missing.push('city');
    if (!postalCode) missing.push('postal code');
    if (!propertyType) missing.push('property type');
    if (!showingReady) missing.push('property ready for showing');

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required field(s): ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const selectedServices = body.selectedServices || body.selected_services || [];
    const estimatedTotal = cleanMoney(body.estimatedTotal || body.estimated_total || form.estimatedTotal);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from('tenant_placement_orders')
      .insert({
        landlord_name: landlordName,
        company_name: text(form.companyName || form.company_name || body.companyName) || null,
        phone,
        email,
        mailing_address: mailingAddress,

        property_address: propertyAddress,
        city,
        postal_code: postalCode,
        property_type: propertyType,
        expected_rent: text(form.expectedRent || form.expected_rent || body.expectedRent) || null,
        bedrooms: text(form.bedrooms || body.bedrooms) || null,
        bathrooms: text(form.bathrooms || body.bathrooms) || null,
        move_in_date: text(form.moveInDate || form.move_in_date || body.moveInDate) || null,
        showing_ready: showingReady,

        selected_services: selectedServices,
        estimated_total: estimatedTotal,

        additional_notes: text(form.notes || form.additionalNotes || body.additionalNotes) || null,
        authorization_confirmed: Boolean(
          form.authorization ||
          form.authorizationConfirmed ||
          body.authorizationConfirmed ||
          body.authorization_confirmed
        ),
        status: 'new',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Tenant placement order insert error:', error);
      return NextResponse.json(
        { error: 'Order could not be saved.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      message:
        'Thank you for submitting the order, our A-Z Housing Solutions Team will contact you soon.',
    });
  } catch (error) {
    console.error('Tenant placement order API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
