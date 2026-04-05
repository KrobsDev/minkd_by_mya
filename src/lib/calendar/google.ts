import { google } from "googleapis";

interface CreateCalendarEventParams {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm:ss
  bookingReference: string;
  durationMinutes?: number; // defaults to 60
  notes?: string;
}

export async function createCalendarEvent(
  params: CreateCalendarEventParams
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!serviceAccountEmail || !privateKey || !calendarId) {
    return { success: false, error: "Google Calendar not configured" };
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Africa/Accra is always UTC+0 (no daylight saving).
    // Append "+00:00" so the Date constructor interprets the time as UTC
    // regardless of the server's local timezone.
    const isoString = `${params.appointmentDate}T${params.appointmentTime}+00:00`;
    const startDateTime = new Date(isoString);
    if (isNaN(startDateTime.getTime())) {
      return { success: false, error: `Invalid date/time: ${isoString}` };
    }
    const endDateTime = new Date(startDateTime.getTime() + (params.durationMinutes ?? 60) * 60 * 1000);

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${params.serviceName} — ${params.customerName}`,
        description: [
          `Booking Reference: ${params.bookingReference}`,
          `Service: ${params.serviceName}`,
          `Customer: ${params.customerName}`,
          `Email: ${params.customerEmail}`,
          `Phone: ${params.customerPhone}`,
          params.notes ? `Notes: ${params.notes}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: "Africa/Accra",
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: "Africa/Accra",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 1 day before
            { method: "popup", minutes: 60 },       // 1 hour before
          ],
        },
      },
    });

    return { success: true, eventId: event.data.id ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
