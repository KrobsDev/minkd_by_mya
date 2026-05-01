import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Baby,
  Calendar,
  Clock,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import Section from "@/components/layout/Section";

type Accent = "pink" | "amber" | "orange" | "rose";

type Policy = {
  title: string;
  icon: typeof Calendar;
  accent: Accent;
  points: string[];
};

const policies = [
  {
    title: "Deposits",
    icon: Calendar,
    accent: "pink",
    points: [
      "To book an appointment, a non-refundable deposit of GHS 100 is required.",
      "Appointments without deposits will not be scheduled.",
    ],
  },
  {
    title: "Lateness / No Shows",
    icon: Clock,
    accent: "amber",
    points: [
      "A grace period of 20 minutes is allowed for late arrivals.",
      "Late arrivals between 20 and 30 minutes attract a late fee of GHS 50.",
      "Lateness beyond 30 minutes warrants an automatic reschedule and loss of deposit paid.",
    ],
  },
  {
    title: "Cancellation",
    icon: XCircle,
    accent: "orange",
    points: [
      "Cancellations require at least 6 to 24 hours notice in order to maintain the deposit made.",
    ],
  },
  {
    title: "No Kids",
    icon: Baby,
    accent: "rose",
    points: [
      "Children, especially toddlers and babies, are not allowed in the studio.",
      "If a child must be brought along, please come with a guest who can watch them.",
    ],
  },
] satisfies Policy[];

const accentStyles = {
  pink: {
    border: "border-pink-200",
    iconWrap: "bg-pink-100 text-pink-700",
    badge: "bg-pink-100 text-pink-700 border-pink-200",
    bullet: "bg-pink-500",
  },
  amber: {
    border: "border-amber-200",
    iconWrap: "bg-amber-100 text-amber-700",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    bullet: "bg-amber-500",
  },
  orange: {
    border: "border-orange-200",
    iconWrap: "bg-orange-100 text-orange-700",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    bullet: "bg-orange-500",
  },
  rose: {
    border: "border-rose-200",
    iconWrap: "bg-rose-100 text-rose-700",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    bullet: "bg-rose-500",
  },
} as const;

export default function BookingPolicyPage() {
  return (
    <div>
      <div className="h-80 md:h-96 relative">
        <Image
          src="/images/genai4.png"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        <div
          className={`absolute top-0 px-8 md:px-0 flex items-center
            justify-center w-full h-full bg-radial from-[rgba(0,0,0,0.4)]
            to-[rgba(0,0,0,0.8)]`}
        >
          <div
            className="flex flex-col items-center justify-center gap-6
              text-center"
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <h1
                className="md:max-w-[80%] text-4xl md:text-7xl font-black
                  text-white md:leading-24
                  font-(family-name:--font-dancing-script)"
              >
                Booking <span className="text-pink-500">Policy</span>
              </h1>
              <p className="leading-7 md:max-w-[65%] text-white/90">
                Please read our appointment terms carefully before booking so
                expectations are clear from the start.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Section className="bg-linear-to-b from-[#fff7fb] via-white to-[#fffafc] py-12 md:py-18">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-pink-100 bg-white px-6 py-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-pink-600">
                Deposit
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                GHS 100
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Required to secure every appointment.
              </p>
            </div>
            <div className="rounded-3xl border border-pink-100 bg-white px-6 py-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-pink-600">
                Grace Period
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                20 Minutes
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                After that, late fees and rescheduling rules apply.
              </p>
            </div>
            <div className="rounded-3xl border border-pink-100 bg-white px-6 py-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-pink-600">
                Cancellation Notice
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                6 to 24 Hours
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Notice is required to preserve your deposit.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {policies.map((policy) => {
              const Icon = policy.icon;
              const styles = accentStyles[policy.accent];

              return (
                <article
                  key={policy.title}
                  className={`rounded-[28px] border ${styles.border}
                    bg-white p-7 shadow-[0_18px_60px_rgba(17,24,39,0.06)]`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center
                          rounded-2xl ${styles.iconWrap}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1
                            text-xs font-medium uppercase tracking-[0.18em]
                            ${styles.badge}`}
                        >
                          Policy
                        </span>
                        <h2 className="mt-3 text-2xl font-semibold text-gray-900">
                          {policy.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-4 text-[15px] leading-7 text-gray-600">
                    {policy.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span
                          className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full
                            ${styles.bullet}`}
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div
            className="rounded-[32px] border border-pink-200 bg-linear-to-r
              from-pink-50 to-white p-8 shadow-sm"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex max-w-3xl items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center
                    rounded-2xl bg-pink-100 text-pink-700"
                >
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Important Notice
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-gray-600">
                    By booking an appointment with Mink&apos;d by Mya, you
                    acknowledge that you have read, understood, and agreed to
                    abide by the policies above.
                  </p>
                </div>
              </div>

              <div
                className="rounded-2xl border border-pink-200 bg-white px-5 py-4
                  text-sm leading-6 text-gray-600 md:max-w-xs"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-pink-600" />
                  <p>
                    Availability is limited. Secure your appointment early to
                    avoid missing your preferred time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/services"
              className="inline-block rounded-full bg-pink-600 px-8 py-4
                font-semibold text-white transition-colors hover:bg-pink-700"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
