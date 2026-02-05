import { Service } from "@/lib/models/service";
import { Check, ExternalLink } from "lucide-react";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      <div
        key={service.name}
        className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl
          transition-all duration-300 overflow-hidden ${
            service.popular ? "ring-2 ring-rose-600" : ""
          }`}
      >
        {service.popular && (
          <div
            className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1
              text-sm font-medium rounded-bl-lg"
          >
            Popular
          </div>
        )}

        <div className="p-8">
          <h4 className="text-2xl font-serif font-semibold text-gray-900 mb-3">
            {service.name}
          </h4>

          <p className="text-gray-600 mb-6">{service.description}</p>

          <ul className="space-y-3 mb-8">
            {service.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <a
            href={service.paystackLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-rose-600 text-white px-6 py-3 rounded-full
              hover:bg-rose-700 transition-all duration-300 inline-flex
              items-center justify-center gap-2 font-medium"
          >
            Book & Pay
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
