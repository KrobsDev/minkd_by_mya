import Section from "@/components/layout/Section";
import ServiceContent from "@/components/services/ServiceContent";
import Image from "next/image";

export default function Services() {
  return (
    <div className="">
      {/* Hero */}
      <div className="h-80 md:h-96 relative">
        <Image
          src={"/images/genai4.png"}
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        {/* overlay */}
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
                Our <span className="text-pink-500">Services</span>
              </h1>
              <p className="leading-7 md:max-w-[70%] text-white/90">
                A curated range of lash and beauty services designed to suit
                different styles, maintenance needs, and preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* services */}
      <Section className="py-12 md:py-16">
        <div className="flex flex-col gap-4">
          <ServiceContent />
        </div>
      </Section>
    </div>
  );
}