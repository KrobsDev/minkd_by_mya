import { cn } from "@/lib/utils/cn";
import { Stars } from "lucide-react";
import { ReactNode } from "react";

interface ValueCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  iconBgColor: string;
}

export default function ValueCard({
  icon,
  title,
  subtitle,
  iconBgColor,
}: ValueCardProps) {
  return (
    <div className="flex items-center gap-2 p-4 rounded-lg border border-gray-100">
      <div
        className={cn(
          "w-12 h-12 shrink-0 flex items-center justify-center rounded-full",
          iconBgColor,
        )}
      >
        {icon}
      </div>
      <div>
        <h6 className="font-light mb-1">{title}</h6>
        {/* <p className="leading">{subtitle}</p> */}
      </div>
    </div>
  );
}
