import { title } from "process";

interface StepProps {
  stepNumber: string;
  title: string;
  content: string;
}

export default function Step({ stepNumber, content, title }: StepProps) {
  return (
    <div
      className="rounded-lg border border-gray-100 p-4 flex flex-col gap-2
        items-start"
    >
      <div
        className="rounded-full w-12 h-12 bg-pink-50 flex items-center
          justify-center"
      >
        <h6 className="text-pink-700 font-semibold">{stepNumber}</h6>
      </div>
      <div className="flex flex-col gap-1">
        <h6 className="font-semibold">{title}</h6>
        <p className="">{content}</p>
      </div>
    </div>
  );
}
