This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Appointment Reminders

The app sends day-before appointment reminder emails from `/api/cron/appointment-reminders`.

Setup:

1. Run `scripts/migration-booking-reminders.sql` in the Supabase SQL Editor.
2. Add `CRON_SECRET` to `.env.local` and to the Vercel project environment variables.
3. Make sure `SMTP_USER`, `SMTP_PASS`, and `BUSINESS_EMAIL` are configured.
4. Deploy to Vercel. `vercel.json` schedules the reminder job daily at `09:00` UTC, which is `09:00` in Accra.

The job emails confirmed, paid bookings for the next calendar day and marks `bookings.reminder_24h_sent_at` after a successful send.


lkjsuyhrjdywbnwudfbsh2ubdyabdjjriwydbbahduhwbufbasydbwtygdjaskywgmcnGHjfyuTGnsnf