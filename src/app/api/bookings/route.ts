import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { parse } from "date-fns";
import {
  DEFAULT_MAX_BOOKINGS_PER_SLOT,
  DEFAULT_CLOSING_TIME_MINUTES,
} from "@/lib/booking-constants";

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
    `
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

    // Validate all services exist and get their durations
    const { data: services, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .in("id", allServiceIds);

    if (serviceError || !services || services.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Fetch admin-configurable settings in parallel
    const [{ data: closingTimeSetting }, { data: maxBookingsSetting }] =
      await Promise.all([
        supabase.from("settings").select("value").eq("key", "closing_time").single(),
        supabase.from("settings").select("value").eq("key", "max_bookings_per_slot").single(),
      ]);

    let closingTimeMinutes = DEFAULT_CLOSING_TIME_MINUTES;
    if (closingTimeSetting?.value) {
      const [h, m] = (closingTimeSetting.value as string).split(":").map(Number);
      closingTimeMinutes = h * 60 + (m || 0);
    }

    const maxBookingsPerSlot =
      typeof maxBookingsSetting?.value === "number"
        ? maxBookingsSetting.value
        : DEFAULT_MAX_BOOKINGS_PER_SLOT;

    // Validate that the booking finishes by closing time
    const startTime = parse(appointmentTime, "HH:mm", new Date());
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const totalDuration = services.reduce(
      (sum, s) => sum + (s.duration_minutes ?? 60),
      0
    );

    if (startMinutes + totalDuration > closingTimeMinutes) {
      return NextResponse.json(
        {
          error:
            "Your selected services would finish after our closing time. Please choose an earlier start time.",
        },
        { status: 400 }
      );
    }

    // Check if date is blocked
    const { data: blockedDate } = await supabase
      .from("blocked_dates")
      .select("id")
      .eq("date", appointmentDate)
      .single();

    if (blockedDate) {
      return NextResponse.json(
        { error: "This date is not available for bookings" },
        { status: 409 }
      );
    }

    // Count existing bookings for this slot — reject if at capacity
    const { count: slotCount } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("appointment_date", appointmentDate)
      .eq("appointment_time", appointmentTime)
      .neq("status", "cancelled");

    if ((slotCount ?? 0) >= maxBookingsPerSlot) {
      return NextResponse.json(
        { error: "This time slot is fully booked. Please choose a different time." },
        { status: 409 }
      );
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: servicesError } = await (supabase as any)
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
