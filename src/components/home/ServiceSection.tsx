"use client";

import Section from "@/components/layout/Section";
import { serviceCategories } from "@/lib/fixtures/services";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EyeClosed } from "lucide-react";
import Link from "next/link";

export default function ServiceSection() {
  return (
    <Section className="bg-[#FFF8FC] py-[10%]">
      <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-16">
        <div className="flex flex-col gap-4 flex-1">
          <span className="flex gap-2">
            <EyeClosed /> Your Perfect Look
          </span>
          <h2
            className="font-bold text-4xl md:text-6xl
              font-(family-name:--font-dancing-script)"
          >
            Every lash look starts with the{" "}
            <span className="text-pink-500"> right </span> choice.
          </h2>
          <p className="leading-7">
            Every client's eyes, style, and routine are different. That's why
            our services are grouped by result, not trend. Whether you want
            something soft and natural or bold and defined, each category
            reflects a specific look, technique, and level of maintenance so you
            can choose confidently.
          </p>
          <Link href="/services">
            <Button variant="outline" className="border-pink-300 hover:bg-pink-50 hover:border-pink-400">
              Browse service categories
            </Button>
          </Link>
        </div>

        {/* tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-1">
          {serviceCategories.map((category) => (
            <Link
              href="/services"
              className={cn(
                `w-full flex items-center justify-center border border-pink-200 py-4 px-4
                rounded-lg bg-white hover:border-pink-400 hover:bg-pink-50 transition-all`,
              )}
              key={category.id}
            >
              <div className="text-center text-sm font-medium">{category.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}