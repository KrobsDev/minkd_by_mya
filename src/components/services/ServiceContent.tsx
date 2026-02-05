"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingModal from "@/components/booking/BookingModal";
import type { Service } from "@/lib/models/service";
import api from "@/lib/api/client";

interface DbCategory {
  id: string;
  title: string;
  sort_order: number;
}

interface DbService {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  duration_minutes: number;
  category_id: string;
  paystack_link: string;
  popular: boolean;
  active: boolean;
}

function mapDbServiceToService(dbService: DbService): Service {
  return {
    id: dbService.id,
    name: dbService.name,
    description: dbService.description,
    features: dbService.features,
    categoryId: dbService.category_id,
    paystackLink: dbService.paystack_link,
    popular: dbService.popular,
  };
}

export default function ServiceContent() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [categoriesRes, servicesRes] = await Promise.all([
          api.get<DbCategory[]>("/services/categories"),
          api.get<DbService[]>("/services"),
        ]);

        setCategories(categoriesRes.data);
        setServices(servicesRes.data.map(mapDbServiceToService));

        if (categoriesRes.data.length > 0) {
          setActiveTab(categoriesRes.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setBookingOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 bg-pink-600 hover:bg-pink-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
        {categories.map((category) => (
          <Button
            variant="outline"
            onClick={() => setActiveTab(category.id)}
            key={category.id}
            className={cn(
              "text-sm md:text-base",
              activeTab === category.id
                ? "border-pink-500 bg-pink-50 text-pink-900"
                : "hover:border-pink-300",
            )}
          >
            {category.title}
          </Button>
        ))}
      </div>

      {/* tab content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {services
          .filter((service) => service.categoryId === activeTab)
          .map((service) => (
            <div
              key={service.id}
              className={cn(
                `shadow-lg p-6 rounded-xl bg-white relative flex flex-col gap-4
                justify-between hover:shadow-xl transition-all`,
                service.popular
                  ? "border-2 border-pink-500"
                  : "border border-gray-100",
              )}
            >
              {service.popular && (
                <div
                  className="px-4 py-1 absolute top-0 right-0 bg-pink-600
                    rounded-tr-xl rounded-bl-xl"
                >
                  <p className="text-xs font-semibold text-white">Popular</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <p className="text-sm leading-6 text-gray-600">
                    {service.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check
                        size={16}
                        className="text-pink-600 mt-0.5 shrink-0"
                      />
                      <p className="text-sm text-gray-600">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleBookService(service)}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
              >
                Book Now
              </Button>
            </div>
          ))}
      </div>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          open={bookingOpen}
          onOpenChange={setBookingOpen}
        />
      )}
    </>
  );
}