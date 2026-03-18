import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServiceClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      booking_services (
        service_id,
        services:service_id (
          name,
          price,
          duration_minutes
        )
      )
    `,
    )
    .order("appointment_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      serviceId,
      additionalServiceIds = [],
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      appointmentTime,
      notes,
    } = body;

    if (!serviceId || !customerName || !customerEmail || !customerPhone || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const allServiceIds: string[] = [serviceId, ...additionalServiceIds];

    // Validate all services exist
    const { data: services, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .in("id", allServiceIds);

    if (serviceError || !services || services.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // One appointment per slot
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("appointment_date", appointmentDate)
      .eq("appointment_time", appointmentTime)
      .neq("status", "cancelled")
      .single();

    if (existingBooking) {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
    }

    // Check if date is blocked
    const { data: blockedDate } = await supabase
      .from("blocked_dates")
      .select("id")
      .eq("date", appointmentDate)
      .single();

    if (blockedDate) {
      return NextResponse.json({ error: "This date is not available for bookings" }, { status: 409 });
    }

    // Create one booking row
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        service_id: serviceId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes: notes || null,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Booking error:", bookingError);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // Link all services in the junction table
    const { error: servicesError } = await supabase
      .from("booking_services")
      .insert(allServiceIds.map((sid) => ({ booking_id: booking.id, service_id: sid })));

    if (servicesError) {
      console.error("Failed to insert booking_services:", servicesError);
    }

    const primaryService = services.find((s) => s.id === serviceId) ?? services[0];

    return NextResponse.json({ booking, paystackLink: primaryService.paystack_link });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
