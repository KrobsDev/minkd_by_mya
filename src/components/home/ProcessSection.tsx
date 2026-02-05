import { EyeClosed } from "lucide-react";
import Section from "../layout/Section";
import Step from "./Step";

export default function ProcessSection() {
  return (
    <Section className="py-[10%]">
      <div className="flex flex-col md:items-center gap-4">
        <span className="flex gap-2">
          <EyeClosed /> Our Process
        </span>
        <h2
          className="font-bold text-4xl md:text-6xl
            font-(family-name:--font-dancing-script)"
        >
          A <span className="text-pink-500">Thoughtful,</span> Professional
          Process
        </h2>

        <p className="leading-7 md:text-center md:w-[60%]">
          Every appointment is guided by a structured approach that prioritises
          lash health, comfort, and consistency. Nothing is rushed, nothing is
          generic. Each step is designed to deliver results that look refined,
          balanced, and made specifically for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Step
            stepNumber="1"
            title="Consultation & Eye Assessment"
            content="We begin by understanding your eye shape, natural lashes, lifestyle, and
        the look you want to achieve. This ensures the final set complements
        your features rather than overpowering them."
          />

          <Step
            stepNumber="2"
            content="A customised lash map is created to define length, curl, and density. This plan guides the application so the result is intentional, symmetrical, and suited to you."
            title={"Style Selection & Lash Mapping"}
          />
          <Step
            stepNumber="3"
            content="Lightweight extensions are applied with care and accuracy, maintaining the integrity of your natural lashes while building fullness and definition."
            title={"Precision Application"}
          />
          <Step
            stepNumber="4"
            content="The set is reviewed for balance and finish, followed by clear aftercare advice to help you maintain your lashes between appointments."
            title={"Final Review & Aftercare Guidance"}
          />
        </div>
      </div>
    </Section>
  );
}
