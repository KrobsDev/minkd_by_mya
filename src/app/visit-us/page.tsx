"use client";

import Image from "next/image";
import Section from "@/components/layout/Section";
import { Clock, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api/client";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DEFAULT_OPENING = "09:00";
const DEFAULT_CLOSING = "18:00";

function formatTime(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12}:00 ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

type ScheduleRow = {
  day: string;
  time: string;
  closed: boolean;
};

function buildSchedule(
  blockedWeekdays: number[],
  closingTime: string,
): ScheduleRow[] {
  return DAY_NAMES.map((day, index) => {
    const closed = blockedWeekdays.includes(index);
    return {
      day,
      time: closed
        ? "Closed"
        : `${formatTime(DEFAULT_OPENING)} – ${formatTime(closingTime)}`,
      closed,
    };
  });
}

export default function VisitUsPage() {
  const [schedule, setSchedule] = useState<ScheduleRow[] | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const [weekdayRes, closingRes] = await Promise.all([
          api.get<{ value: number[] | null }>("/admin/settings?key=blocked_weekdays"),
          api.get<{ value: string | null }>("/admin/settings?key=closing_time"),
        ]);

        const blockedWeekdays = weekdayRes.data.value ?? [0]; // default: Sunday blocked
        const closingTime = closingRes.data.value ?? DEFAULT_CLOSING;

        setSchedule(buildSchedule(blockedWeekdays, closingTime));
      } catch {
        // Fallback to defaults if API fails
        setSchedule(buildSchedule([0], DEFAULT_CLOSING));
      }
    }

    fetchSchedule();
  }, []);

  return (
    <div>
      {/* Hero */}
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
                Visit <span className="text-pink-500">Us</span>
              </h1>
              <p className="leading-7 md:max-w-[70%] text-white/90">
                Find our studio and plan your visit. We&apos;d love to see you!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Section className="py-12 md:py-20">
        <div className="flex flex-col gap-16 w-full max-w-5xl mx-auto">

          {/* Location Card — Map with overlay details */}
          <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100">
            {/* Map */}
            <div className="relative h-72 md:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.6!2d-0.187!3d5.614!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzYnNTAuNCJOIDDCsDExJzEzLjIiVw!5e0!3m2!1sen!2sgh!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
                title="Mink'd by Mya Studio Location"
              />
            </div>

            {/* Details bar */}
            <div className="bg-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Our Studio</h3>
                  <p className="text-gray-500 text-sm">Accra, Ghana</p>
                </div>
              </div>
              <Link
                href="https://maps.app.goo.gl/VDUEQLmeEMQq5aGP8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
              >
                Get Directions
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Working Hours */}
          <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 to-pink-500 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Working Hours</h2>
                  <p className="text-pink-100 text-sm mt-0.5">
                    Plan your visit around our schedule
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule rows */}
            <div className="divide-y divide-gray-100">
              {schedule
                ? schedule.map((item) => (
                    <div
                      key={item.day}
                      className="flex items-center justify-between px-6 md:px-8 py-4 hover:bg-pink-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.closed ? "bg-gray-300" : "bg-green-400"
                          }`}
                        />
                        <span className="font-medium text-gray-800">
                          {item.day}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          item.closed ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {item.time}
                      </span>
                    </div>
                  ))
                : Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-6 md:px-8 py-4"
                    >
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
            </div>

            {/* Footer note */}
            <div className="bg-pink-50 px-6 md:px-8 py-4">
              <p className="text-sm text-pink-700 text-center">
                <Link href="/services" className="underline font-semibold hover:text-pink-900">
                  Book ahead
                </Link>{" "}
                to secure your spot.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/services"
              className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
