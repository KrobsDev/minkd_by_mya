"use client";
import AppointmentCta from "@/components/home/AppointmentCta";
import Hero from "@/components/home/Hero";
import ProcessSection from "@/components/home/ProcessSection";
import ServiceSection from "@/components/home/ServiceSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ValueSection from "@/components/home/ValueSection";

export default function Home() {
  return (
    <div className="">
      {/* hero section */}
      <Hero />

      {/* why minkd */}
      <ValueSection />

      {/* services */}
      <ServiceSection />

      {/* process */}
      <ProcessSection />

      {/* testimonials */}
      <TestimonialsSection />

      {/* call to action */}
      <AppointmentCta />
    </div>
  );
}
