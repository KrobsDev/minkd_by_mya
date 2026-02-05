import nodemailer from "nodemailer";
import {
  getCustomerConfirmationEmail,
  getAdminNotificationEmail,
} from "./templates";

interface SendBookingEmailsParams {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  bookingReference: string;
}

interface SendEmailResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
  customerEmailId?: string;
  adminEmailId?: string;
}

export async function sendBookingConfirmationEmails(
  params: SendBookingEmailsParams
): Promise<SendEmailResult> {
  const {
    customerName,
    customerEmail,
    customerPhone,
    serviceName,
    appointmentDate,
    appointmentTime,
    bookingReference,
  } = params;

  // Check if SMTP credentials are configured
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn("SMTP credentials not configured. Skipping email sending.");
    return {
      success: true, // Return success to not block booking
      skipped: true,
      error: "Email service not configured",
    };
  }

  // Create transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const fromEmail = process.env.BUSINESS_EMAIL || smtpUser;
  const adminEmail = process.env.ADMIN_EMAIL || smtpUser;

  try {
    // Send confirmation to customer
    const customerEmailResult = await transporter.sendMail({
      from: `"Mink'd by Mya" <${fromEmail}>`,
      to: customerEmail,
      subject: `Booking Confirmed - ${serviceName}`,
      html: getCustomerConfirmationEmail({
        customerName,
        serviceName,
        appointmentDate,
        appointmentTime,
        bookingReference,
      }),
    });

    console.log("✅ Customer email sent:", {
      messageId: customerEmailResult.messageId,
      to: customerEmail,
    });

    // Send notification to admin
    const adminEmailResult = await transporter.sendMail({
      from: `"Mink'd by Mya Bookings" <${fromEmail}>`,
      to: adminEmail,
      subject: `New Booking: ${serviceName} - ${customerName}`,
      html: getAdminNotificationEmail({
        customerName,
        customerEmail,
        customerPhone,
        serviceName,
        appointmentDate,
        appointmentTime,
        bookingReference,
      }),
    });

    console.log("✅ Admin email sent:", {
      messageId: adminEmailResult.messageId,
      to: adminEmail,
    });

    return {
      success: true,
      customerEmailId: customerEmailResult.messageId,
      adminEmailId: adminEmailResult.messageId,
    };
  } catch (error: any) {
    console.error("❌ Error sending booking emails:", error);

    return {
      success: true, // Don't block booking even if email fails
      skipped: true,
      error: error.message || "Failed to send emails",
    };
  }
}