import { Star } from "lucide-react";

interface TestimonialContentProps {
  title: string;
  lashType: string;
  content: string;
  name: string;
}

export default function TestimonialContent({
  title,
  lashType,
  content,
  name,
}: TestimonialContentProps) {
  return (
    <>
      <h3 className="font-semibold">{title}</h3>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star fill="true" size={16} />
          <Star fill="true" size={16} />
          <Star fill="true" size={16} />
          <Star fill="true" size={16} />
          <Star fill="true" size={16} />
        </div>
        •<p>{lashType}</p>
      </div>
      <p className="leading-7">{content}</p>
      <p className="italic">{name}</p>
    </>
  );
}
