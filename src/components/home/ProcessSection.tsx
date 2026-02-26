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
          lash health, skin integrity, comfort, and consistency. Nothing is
          rushed, nothing is generic. Each step is designed to deliver results
          that look refined, balanced, and made specifically for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Step
            stepNumber="1"
            title="Consultation & Assessment"
            content="We begin by understanding your facial features, skin type, lifestyle, and the look you want to achieve. This ensures the final outcome complements your features rather than overpowering them."
          />

          <Step
            stepNumber="2"
            content="A customised lash or brow map is created to define the details of your service. This plan guides the process so the result is intentional, symmetrical, and suited to you."
            title={"Style Selection & Mapping"}
          />
          <Step
            stepNumber="3"
            content="Lash and brow services are delivered with care and accuracy, maintaining the integrity of your natural lashes and skin while building fullness and definition."
            title={"Precise Service Delivery"}
          />
          <Step
            stepNumber="4"
            content="The final service is reviewed for balance and finish, followed by clear aftercare advice to help you maintain your results between appointments."
            title={"Final Review & Aftercare Guidance"}
          />
        </div>
      </div>
    </Section>
  );
}
