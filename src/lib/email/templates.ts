interface BookingEmailData {
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  bookingReference: string;
}

export function getCustomerConfirmationEmail(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - Mink'd by Mya</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF8FC;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #FCE7F3;">
              <h1 style="margin: 0; font-size: 28px; color: #BE185D; font-family: 'Georgia', serif;">Mink'd by Mya</h1>
              <p style="margin: 8px 0 0; color: #9D174D; font-size: 14px;">Lash & Beauty Studio</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1F2937; font-size: 24px;">Booking Confirmed!</h2>
              <p style="margin: 0 0 20px; color: #4B5563; font-size: 16px; line-height: 1.6;">
                Hi ${data.customerName},
              </p>
              <p style="margin: 0 0 30px; color: #4B5563; font-size: 16px; line-height: 1.6;">
                Thank you for booking with Mink'd by Mya! Your appointment has been confirmed.
              </p>

              <!-- Booking Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FDF2F8; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px; color: #BE185D; font-size: 18px;">Appointment Details</h3>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Service:</td>
                        <td style="padding: 8px 0; color: #1F2937; font-size: 14px; font-weight: 600; text-align: right;">${data.serviceName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Date:</td>
                        <td style="padding: 8px 0; color: #1F2937; font-size: 14px; font-weight: 600; text-align: right;">${data.appointmentDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Time:</td>
                        <td style="padding: 8px 0; color: #1F2937; font-size: 14px; font-weight: 600; text-align: right;">${data.appointmentTime}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Reference:</td>
                        <td style="padding: 8px 0; color: #BE185D; font-size: 14px; font-weight: 600; text-align: right;">${data.bookingReference}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important Info -->
              <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
                <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.5;">
                  <strong>Please note:</strong> Kindly arrive 5-10 minutes before your appointment. If you need to reschedule or cancel, please contact us at least 6-24 hours in advance.
                </p>
              </div>

              <!-- Location -->
              <p style="margin: 0 0 10px; color: #4B5563; font-size: 14px;">
                <strong>Location:</strong> Accra, Ghana
              </p>
              <p style="margin: 0; color: #4B5563; font-size: 14px;">
                <strong>Contact:</strong> minkdbymya1@gmail.com
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #FDF2F8; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 10px; color: #BE185D; font-size: 14px;">
                Follow us on Instagram @minkedbymya
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Mink'd by Mya. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getAdminNotificationEmail(data: BookingEmailData & { customerEmail: string; customerPhone: string }): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking - Mink'd by Mya</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background-color: #BE185D; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-size: 24px; color: white;">New Booking Received!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 30px; color: #4B5563; font-size: 16px; line-height: 1.6;">
                A new booking has been made. Here are the details:
              </p>

              <!-- Customer Details -->
              <h3 style="margin: 0 0 16px; color: #1F2937; font-size: 18px; border-bottom: 2px solid #FCE7F3; padding-bottom: 8px;">Customer Information</h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-size: 14px; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #1F2937; font-size: 14px; font-weight: 600;">${data.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: #1F2937; font-size: 14px;">${data.customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Phone:</td>
                  <td style="padding: 8px 0; color: #1F2937; font-size: 14px;">${data.customerPhone}</td>
                </tr>
              </table>

              <!-- Booking Details -->
              <h3 style="margin: 0 0 16px; color: #1F2937; font-size: 18px; border-bottom: 2px solid #FCE7F3; padding-bottom: 8px;">Booking Details</h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-size: 14px; width: 120px;">Service:</td>
                  <td style="padding: 8px 0; color: #1F2937; font-size: 14px; font-weight: 600;">${data.serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Date:</td>
                  <td style="padding: 8px 0; color: #1F2937; font-size: 14px;">${data.appointmentDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Time:</td>
                  <td style="padding: 8px 0; color: #1F2937; font-size: 14px;">${data.appointmentTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Reference:</td>
                  <td style="padding: 8px 0; color: #BE185D; font-size: 14px; font-weight: 600;">${data.bookingReference}</td>
                </tr>
              </table>

              <a href="#" style="display: inline-block; background-color: #BE185D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">View in Admin Panel</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                This is an automated notification from Mink'd by Mya booking system.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}