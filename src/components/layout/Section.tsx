import { cn } from "@/lib/utils/cn";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export default function Section({ children, className }: SectionProps) {
  return (
    <section
      className={cn(
        `flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24
        py-16 mx-auto px-8 md:px-[15%]`,
        className,
      )}
    >
      {children}
    </section>
  );
}
