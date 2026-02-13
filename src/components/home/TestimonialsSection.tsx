import { EyeClosed, Star } from "lucide-react";
import Section from "../layout/Section";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import AutoScroll from "embla-carousel-auto-scroll";
import TestimonialContent from "./TestimonialContent";

export default function TestimonialsSection() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    AutoScroll({ speed: 1, stopOnInteraction: false }),
    Autoplay({ delay: 3000 }),
  ]);

  return (
    <Section className="bg-[#FFF8FC] py-[10%] overflow-hidden">
      <div className="flex flex-col md:items-center gap-4 w-full min-w-0">
        <span className="flex gap-2">
          <EyeClosed /> What Our Clients Are Saying
        </span>
        <h2
          className="font-bold text-4xl md:text-6xl
            font-(family-name:--font-dancing-script)"
        >
          <span className="text-pink-500">Results </span>
          That Speak for Themselves
        </h2>

        <p className="leading-7 md:text-center md:w-[60%]">
          Every appointment is guided by a structured approach that prioritises
          lash health, comfort, and consistency. Nothing is rushed, nothing is
          generic. Each step is designed to deliver results that look refined,
          balanced, and made specifically for you.
        </p>

        {/* carousel */}
        <div className="embla w-full max-w-full overflow-hidden" ref={emblaRef}>
          <div className="embla__container testimonial">
            <div className="embla__slide">
              <TestimonialContent
                title={"Absolutely amazing service"}
                lashType={"Hybrid Full Set"}
                content={
                  "I wanted something full but still natural, and that is exactly what I got. The lashes suit my eyes perfectly and feel so lightweight. I have received compliments every single day since."
                }
                name={"Ama"}
              />
            </div>
            <div className="embla__slide">
              <TestimonialContent
                title={"Consistent Every Time"}
                lashType={"Volume Full Set"}
                content={
                  "I have tried different places before, but the consistency here is unmatched. My lashes always look neat, balanced, and last well between appointments. I trust the process completely."
                }
                name={"Stephanie"}
              />
            </div>
            <div className="embla__slide">
              <TestimonialContent
                title={"Professional and Thoughtful"}
                lashType={"Classic Full Set"}
                content={
                  "Everything was explained clearly before we started, and the result was better than I expected. The lashes enhance my eyes without looking overdone. Very comfortable and clean work."
                }
                name={"Esi"}
              />
            </div>
            <div className="embla__slide">
              <TestimonialContent
                title={"Worth Every Penny"}
                lashType={"Ombré Brows"}
                content={
                  "The attention to detail is impressive. My brows healed beautifully and still look defined and natural. I feel more confident without makeup now."
                }
                name={"Nana"}
              />
            </div>
            <div className="embla__slide">
              <TestimonialContent
                title={"Worth Every Penny"}
                lashType={"Ombré Brows"}
                content={
                  "The attention to detail is impressive. My brows healed beautifully and still look defined and natural. I feel more confident without makeup now."
                }
                name={"Nana"}
              />
            </div>
            <div className="embla__slide">
              <TestimonialContent
                title={"Worth Every Penny"}
                lashType={"Ombré Brows"}
                content={
                  "The attention to detail is impressive. My brows healed beautifully and still look defined and natural. I feel more confident without makeup now."
                }
                name={"Nana"}
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
