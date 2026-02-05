"use client";

import { EyeClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AppointmentCta() {
  return (
    <div className="flex flex-col items-center gap-8 py-[10%] px-4">
      <span className="flex gap-2">
        <EyeClosed /> Step into Glamour
      </span>
      <h2
        className="font-bold text-4xl md:text-6xl text-center
          font-(family-name:--font-dancing-script)"
      >
        Ready to <span className="text-pink-500">Book </span>
        Your Appointment?
      </h2>

      <p className="leading-7 md:text-center md:w-[60%]">
        Book with confidence knowing your service will be tailored to you from
        consultation to finish. Secure your slot in advance and arrive knowing
        exactly what to expect.
      </p>
      <div className="flex flex-col items-center gap-4">
        <Link href="/services">
          <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg">
            Schedule Appointment
          </Button>
        </Link>
        <p className="text-sm italic text-gray-500">
          Availability is limited. Appointments are secured once payment is
          completed.
        </p>
      </div>
    </div>
  );
}