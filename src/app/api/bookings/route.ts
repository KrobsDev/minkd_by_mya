import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  DEFAULT_MAX_BOOKINGS_PER_SLOT,
  DEFAULT_CLOSING_TIME_MINUTES,
  timeStringToMinutes,
} from "@/lib/booking-constants";
import { isTimeSlotAvailable } from "@/lib/booking-availability";

type ExistingBooking = {
  id: string;
  status: string;
  payment_status: string;
  service_id: string;
  booking_services: { service_id: string }[] | null;
};

function getBookingServiceIds(booking: ExistingBooking) {
  const serviceIds =
    booking.booking_services && booking.booking_services.length > 0
      ? booking.booking_services.map((bookingService) => bookingService.service_id)
      : [booking.service_id];

  return [...new Set(serviceIds)].sort();
}

function sameServiceSet(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((serviceId, index) => serviceId === right[index]);
}

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
    const requestedServiceIds = [...new Set(allServiceIds)].sort();
    const normalizedCustomerName = customerName.trim();
    const normalizedCustomerEmail = customerEmail.trim().toLowerCase();
    const normalizedCustomerPhone = customerPhone.trim();

    // Validate all services exist and get their durations
    const { data: services, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .in("id", allServiceIds);

    if (serviceError || !services || services.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const primaryService = services.find((service) => service.id === serviceId) ?? services[0];

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
    const startMinutes = timeStringToMinutes(appointmentTime);
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

    const { data: existingCustomerBookings } = await supabase
      .from("bookings")
      .select("id, status, payment_status, service_id, booking_services(service_id)")
      .eq("appointment_date", appointmentDate)
      .eq("appointment_time", appointmentTime)
      .ilike("customer_email", normalizedCustomerEmail)
      .eq("customer_phone", normalizedCustomerPhone)
      .neq("status", "cancelled");

    const duplicateBooking = (existingCustomerBookings || []).find((booking) =>
      sameServiceSet(getBookingServiceIds(booking as ExistingBooking), requestedServiceIds)
    ) as ExistingBooking | undefined;

    if (duplicateBooking) {
      const alreadyConfirmed =
        duplicateBooking.payment_status === "paid" ||
        duplicateBooking.status === "confirmed" ||
        duplicateBooking.status === "completed";

      if (alreadyConfirmed) {
        return NextResponse.json(
          {
            error:
              "You already have a confirmed booking for this date and time.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        booking: { id: duplicateBooking.id },
        paystackLink: primaryService.paystack_link,
        reusedExistingBooking: true,
      });
    }

    if ((existingCustomerBookings || []).length > 0) {
      return NextResponse.json(
        {
          error:
            "You already have a booking at this time. Please choose a different slot or update the existing booking.",
        },
        { status: 409 }
      );
    }

    const { data: availability } = await supabase
      .from("availability")
      .select("start_time, end_time")
      .eq("date", appointmentDate)
      .eq("is_available", true);

    const { data: existingBookings } = await supabase
      .from("bookings")
      .select(
        "appointment_time, booking_services(services:service_id(duration_minutes))"
      )
      .eq("appointment_date", appointmentDate)
      .neq("status", "cancelled");

    const slotIsAvailable = isTimeSlotAvailable({
      date: appointmentDate,
      availability,
      bookings: existingBookings,
      requestedDurationMinutes: totalDuration,
      closingTimeMinutes,
      maxBookingsPerSlot,
      requestedTime: appointmentTime,
    });

    if (!slotIsAvailable) {
      return NextResponse.json(
        {
          error:
            "This time slot is no longer available. Please choose a different time.",
        },
        { status: 409 }
      );
    }

    // Create one booking row
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        service_id: serviceId,
        customer_name: normalizedCustomerName,
        customer_email: normalizedCustomerEmail,
        customer_phone: normalizedCustomerPhone,
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

    return NextResponse.json({ booking, paystackLink: primaryService.paystack_link });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
