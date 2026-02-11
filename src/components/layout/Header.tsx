"use client";
import { cn } from "@/lib/utils/cn";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    // <header className="w-full bg-white shadow absolute z-10 text-black top-0 left-0 right-0 py-2 max-w-[70%] mx-auto flex items-center justify-between mt-4 rounded-full px-8">
    <header
      className="w-full border-[rgba(255,255,255,0.1)] absolute z-10 text-black
        top-0 left-0 right-0 pt-8 md:max-w-[70%] mx-auto flex items-center
        justify-between px-8"
    >
      <Link href={"/"} className="flex items-center">
        <Image
          src="/images/logo.png"
          alt="Mink'd by Mya"
          width={180}
          height={90}
          className="w-36 h-auto brightness-0 invert"
          priority
        />
      </Link>

      <nav className="hidden md:block">
        <ul className="flex items-center gap-8 text-white">
          <li>
            <Link href={"/"}>Home</Link>
          </li>
          <li>
            <Link href={"/services"}>Services</Link>
          </li>
          <li>
            <Link href={"/booking-policy"}>Booking Policy</Link>
          </li>
        </ul>
      </nav>

      {/* mobile nav icon */}
      <Menu
        className="md:hidden"
        color="white"
        onClick={() => setOpen(!open)}
      />

      {/* mobile nav */}
      <div
        className={cn(
          `md:hidden w-full h-screen bg-white fixed top-0 transition-[left] pt-8
          px-8`,
          `${open ? "left-0" : " -left-full"}`,
        )}
      >
        <div className="flex items-center justify-between">
          <Link href={"/"} className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Mink'd by Mya"
              width={160}
              height={80}
              className="w-32 h-auto"
            />
          </Link>
          <X onClick={() => setOpen(!open)} />
        </div>

        <nav className="">
          <ul className="flex flex-col mt-8 gap-8 text-black">
            <li>
              <Link href={"/"} onClick={() => setOpen(false)}>Home</Link>
            </li>
            <li>
              <Link href={"/services"} onClick={() => setOpen(false)}>Services</Link>
            </li>
            <li>
              <Link href={"/booking-policy"} onClick={() => setOpen(false)}>Booking Policy</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* cta */}
      {/* <Link href={"#"} className="py-2 px-4 border shadow rounded-full">
        Book Appointment
      </Link> */}
    </header>
  );
}
