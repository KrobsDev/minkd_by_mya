"use client";

import ValueCard from "@/components/home/ValueCard";
import { Button } from "@/components/ui/button";
import { ClockCheck, EyeClosed, ShieldCheck, Stars } from "lucide-react";
import Image from "next/image";
import Section from "@/components/layout/Section";
import Link from "next/link";

export default function ValueSection() {
  return (
    <Section>
      {/* content */}
      <div className="flex flex-1 flex-col gap-4 items-start order-2 md:order-1">
        <span className="flex gap-2">
          <EyeClosed /> Why Mink'd by Mya
        </span>
        <h2
          className="font-bold text-4xl md:text-6xl
            font-(family-name:--font-dancing-script)"
        >
          Lash services tailored to{" "}
          <span className="text-pink-500"> Your </span> natural look <br />
        </h2>
        <p className="leading-7">
          Every set is customised to your eye shape, lifestyle, and desired
          result. From subtle enhancements that feel effortless day to day to
          fuller, more defined styles for a polished finish, each service is
          planned to suit your features, comfort, and longevity.
        </p>

        {/* cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
          <ValueCard
            icon={<Stars />}
            title="Precision Mapping"
            subtitle="Custom lash maps designed for your unique eye shape."
            iconBgColor="bg-red-50"
          />
          <ValueCard
            icon={<EyeClosed />}
            title="Clean & Safe"
            subtitle="Strict hygiene standards using premium, lash-safe products."
            iconBgColor="bg-green-50"
          />
          <ValueCard
            icon={<ClockCheck />}
            title="Long Retention"
            subtitle="Lashes applied for durability and long-lasting wear."
            iconBgColor="bg-purple-50"
          />
          <ValueCard
            icon={<ShieldCheck />}
            title="Certified Expertise"
            subtitle="Professionally trained technician focused on lash health."
            iconBgColor="bg-blue-50"
          />
        </div>
        <Link href="/services">
          <Button variant="outline" className="border-pink-300 hover:bg-pink-50 hover:border-pink-400">
            View Our Lash Styles
          </Button>
        </Link>
      </div>

      {/* image */}
      <div className="relative flex-1 order-1 md:order-2">
        <Image
          src={"/images/slide6.png"}
          alt=""
          width={600}
          height={600}
          className="object-cover"
        />
      </div>
    </Section>
  );
}