"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { siInstagram, siSnapchat, siX } from "simple-icons";

export default function Hero() {
  return (
    <div className="relative">
      {/* hero section */}
      <div className="h-150 md:h-200 relative">
        <Image
          src={"/images/genai4.png"}
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* overlay */}
      <div
        className={`absolute top-0 px-8 md:px-0 flex items-center justify-center
          w-full h-full bg-radial from-[rgba(0,0,0,0.4)] to-[rgba(0,0,0,0.8)]`}
      >
        <div
          className="flex flex-col items-center justify-center gap-8
            text-center"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <h1
              className="md:max-w-[80%] text-4xl md:text-8xl font-black
                text-white md:leading-28
                font-(family-name:--font-dancing-script)"
            >
              Flawless, <span className="text-pink-500">Long-Lasting</span> Lash
              Extensions in Accra
            </h1>
            <p className="leading-7 md:max-w-[40%] text-white">
              Wake up every day with perfectly styled lashes — customized,
              comfortable, and applied by a certified lash artist.
            </p>
          </div>
          <div
            className="flex items-center gap-4 md:gap-6 flex-col md:flex-row
              w-full md:w-auto"
          >
            <Link href="/services">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg">
                Book Appointment
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                View Services
              </Button>
            </Link>
          </div>
        </div>

        {/* socials */}
        <div
          className="flex md:flex-col gap-8 absolute md:left-10 mx-auto
            bottom-10 md:bottom-auto"
        >
          <Link className="w-4 h-4 hover:opacity-80 transition-opacity" href="https://instagram.com/minkedbymya" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="white">
              <path d={`${siInstagram.path}`} />
            </svg>
          </Link>
          <Link className="w-4 h-4 hover:opacity-80 transition-opacity" href="https://x.com" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="white">
              <path d={`${siX.path}`} />
            </svg>
          </Link>
          <Link className="w-4 h-4 hover:opacity-80 transition-opacity" href="https://snapchat.com" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="white">
              <path d={`${siSnapchat.path}`} />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}