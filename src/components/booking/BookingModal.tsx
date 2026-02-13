"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import api from "@/lib/api/client";
import type { Service } from "@/lib/models/service";
import { toast } from "sonner";
import Link from "next/link";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackOptions) => { openIframe: () => void };
    };
  }
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata: Record<string, unknown>;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

// Load Paystack script dynamically
const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const existingScript = document.getElementById("paystack-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      return;
    }

    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.body.appendChild(script);
  });
};

interface BookingModalProps {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BookingStep = "datetime" | "details" | "confirm" | "verifying" | "success";

interface BookingFormData {
  date: Date | null;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function BookingModal({
  service,
  open,
  onOpenChange,
}: BookingModalProps) {
  const [step, setStep] = useState<BookingStep>("datetime");
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>(TIME_SLOTS);
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    reference: string;
  } | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const [formData, setFormData] = useState<BookingFormData>({
    date: null,
    time: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempHideModal, setTempHideModal] = useState(false);
  const [blockedWeekdays, setBlockedWeekdays] = useState<number[]>([0]);

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 90);

  // Fetch blocked weekdays when modal opens
  useEffect(() => {
    if (open) {
      api
        .get<{ value: number[] | null }>("/admin/settings?key=blocked_weekdays")
        .then(({ data }) => {
          if (data.value) setBlockedWeekdays(data.value);
        })
        .catch(() => {});
    }
  }, [open]);

  const handleDateSelect = async (date: Date) => {
    setFormData({ ...formData, date, time: "" });
    setLoading(true);

    try {
      const { data } = await api.get("/availability", {
        params: {
          date: format(date, "yyyy-MM-dd"),
          duration: 60,
        },
      });

      if (data.blocked) {
        setAvailableSlots([]);
      } else {
        setAvailableSlots(data.slots || TIME_SLOTS);
      }
    } catch {
      setAvailableSlots(TIME_SLOTS);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, time });
  };

  const handleNext = () => {
    if (step === "datetime" && formData.date && formData.time) {
      setStep("details");
    } else if (
      step === "details" &&
      formData.name &&
      formData.email &&
      formData.phone
    ) {
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "details") setStep("datetime");
    if (step === "confirm") setStep("details");
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.time) return;

    setLoading(true);

    try {
      // Create the booking with pending status
      const { data: result } = await api.post("/bookings", {
        serviceId: service.id,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        appointmentDate: format(formData.date, "yyyy-MM-dd"),
        appointmentTime: formData.time,
        notes: formData.notes,
      });

      setBookingResult({
        bookingId: result.booking.id,
        reference: "",
      });

      // Immediately trigger payment — don't go to success step yet
      setLoading(false);
      await handlePayment(result.booking.id);
    } catch (error) {
      console.error("Booking error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create booking";
      toast.error(message);
      setLoading(false);
    }
  };

  const handlePayment = useCallback(async (bookingIdParam?: string) => {
    const bookingIdToUse = bookingIdParam || bookingResult?.bookingId;
    if (!bookingIdToUse) return;

    setPaymentLoading(true);

    try {
      // Load Paystack script dynamically
      await loadPaystackScript();

      // Initialize payment (GHS 100 deposit)
      const { data: paymentData } = await api.post("/payments/initialize", {
        bookingId: bookingIdToUse,
      });

      // Hide booking modal to allow interaction with Paystack popup
      setTempHideModal(true);

      // Open Paystack inline popup
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email: formData.email,
        amount: paymentData.amount, // GHS 100 = 10000 pesewas from server
        currency: "GHS",
        ref: paymentData.reference,
        metadata: {
          booking_id: bookingIdToUse,
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: formData.name,
            },
            {
              display_name: "Service",
              variable_name: "service",
              value: service.name,
            },
            {
              display_name: "Payment Type",
              variable_name: "payment_type",
              value: "Deposit",
            },
          ],
        },
        callback: async (response) => {
          // Show modal immediately with verifying state
          setTempHideModal(false);
          setStep("verifying");

          // Verify payment and update booking status
          try {
            await api.post("/payments/verify", {
              reference: response.reference,
              bookingId: bookingIdToUse,
            });

            setPaymentComplete(true);
            setBookingResult((prev) =>
              prev ? { ...prev, reference: response.reference } : null
            );
            setStep("success");
            setPaymentLoading(false);
            toast.success("Payment successful! Your booking is confirmed.");
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            setPaymentLoading(false);
            setStep("confirm");
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        onClose: () => {
          setPaymentLoading(false);
          setTempHideModal(false);
          toast.warning("Payment cancelled. Please complete payment to confirm your booking.");
        },
      });

      handler.openIframe();
      setPaymentLoading(false);
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setPaymentLoading(false);
      setTempHideModal(false);
    }
  }, [bookingResult, formData.email, formData.name, service.name]);

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after animation
    setTimeout(() => {
      setStep("datetime");
      setFormData({
        date: null,
        time: "",
        name: "",
        email: "",
        phone: "",
        notes: "",
      });
      setBookingResult(null);
      setPaymentComplete(false);
      setTempHideModal(false);
    }, 300);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateDisabled = (date: Date) => {
    return (
      isBefore(date, today) || isBefore(maxDate, date) || blockedWeekdays.includes(date.getDay())
    );
  };

  return (
    <Dialog open={open && !tempHideModal} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {step === "success"
              ? "Booking Confirmed!"
              : step === "verifying"
                ? "Processing Payment..."
                : `Book: ${service.name}`}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        {step !== "success" && step !== "verifying" && (
          <div className="flex items-center justify-center gap-2 py-4">
            {["datetime", "details", "confirm"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step === s
                      ? "bg-pink-600 text-white"
                      : ["datetime", "details", "confirm"].indexOf(step) > i
                        ? "bg-pink-100 text-pink-600"
                        : "bg-gray-100 text-gray-400"
                  )}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={cn(
                      "w-12 h-1 mx-1",
                      ["datetime", "details", "confirm"].indexOf(step) > i
                        ? "bg-pink-200"
                        : "bg-gray-100"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Date & Time */}
        {step === "datetime" && (
          <div className="space-y-6">
            {/* Calendar */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4" /> Select Date
              </Label>
              <div className="border rounded-lg p-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1
                        )
                      )
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={
                      currentMonth.getMonth() === today.getMonth() &&
                      currentMonth.getFullYear() === today.getFullYear()
                    }
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-medium">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1
                        )
                      )
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500 py-1"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((day, idx) => (
                    <button
                      key={idx}
                      disabled={!day || isDateDisabled(day)}
                      onClick={() => day && handleDateSelect(day)}
                      className={cn(
                        "aspect-square flex items-center justify-center text-sm rounded-lg transition-colors",
                        !day && "invisible",
                        day &&
                          isDateDisabled(day) &&
                          "text-gray-300 cursor-not-allowed",
                        day &&
                          !isDateDisabled(day) &&
                          "hover:bg-pink-50 cursor-pointer",
                        day &&
                          formData.date &&
                          format(day, "yyyy-MM-dd") ===
                            format(formData.date, "yyyy-MM-dd") &&
                          "bg-pink-600 text-white hover:bg-pink-700"
                      )}
                    >
                      {day?.getDate()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Slots */}
            {formData.date && (
              <div>
                <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" /> Select Time
                </Label>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No available slots for this date. Please select another
                    date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={cn(
                          "py-2 px-3 text-sm rounded-lg border transition-colors",
                          formData.time === time
                            ? "bg-pink-600 text-white border-pink-600"
                            : "border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                        )}
                      >
                        {format(new Date(`2000-01-01T${time}`), "h:mm a")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleNext}
              disabled={!formData.date || !formData.time}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Customer Details */}
        {step === "details" && (
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>

            <div>
              <Label
                htmlFor="phone"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter your phone number"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Special Requests (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any special requests or notes..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!formData.name || !formData.email || !formData.phone}
                className="flex-1 bg-pink-600 hover:bg-pink-700"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Pay Deposit */}
        {step === "confirm" && (
          <div className="space-y-6">
            {/* Deposit Information */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Deposit Required</h3>
              <p className="text-sm text-yellow-800">
                A non-refundable deposit of <strong className="text-lg">GHS 100</strong> is required to confirm your appointment.
              </p>
              <p className="text-xs text-yellow-700 mt-2">
                Per our{" "}
                <Link
                  href="/booking-policy"
                  className="underline hover:text-yellow-900"
                  target="_blank"
                >
                  booking policy
                </Link>
                , appointments without deposits will not be scheduled.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-pink-900">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {formData.date &&
                      format(formData.date, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {formData.time &&
                      format(new Date(`2000-01-01T${formData.time}`), "h:mm a")}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Deposit:</span>
                  <span className="font-semibold text-pink-600">GHS 100.00</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <h3 className="font-semibold">Your Details</h3>
              <p>
                <span className="text-gray-600">Name:</span> {formData.name}
              </p>
              <p>
                <span className="text-gray-600">Email:</span> {formData.email}
              </p>
              <p>
                <span className="text-gray-600">Phone:</span> {formData.phone}
              </p>
              {formData.notes && (
                <p>
                  <span className="text-gray-600">Notes:</span> {formData.notes}
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our{" "}
              <Link
                href="/booking-policy"
                className="text-pink-600 underline hover:text-pink-700"
                target="_blank"
              >
                booking policy
              </Link>
              . A confirmation email will be sent after payment.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || paymentLoading}
                className="flex-1 bg-pink-600 hover:bg-pink-700"
              >
                {loading || paymentLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay GHS 100 Deposit
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Verifying Payment */}
        {step === "verifying" && (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-pink-100">
              <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Verifying Payment...
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Please wait while we confirm your payment and send your
                confirmation email. This will only take a moment.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Success (only after payment) */}
        {step === "success" && bookingResult && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-green-100">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Booking Confirmed!
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your booking reference:{" "}
                <span className="font-mono font-semibold text-pink-600">
                  {bookingResult.bookingId.slice(0, 8).toUpperCase()}
                </span>
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Payment successful! Your appointment is confirmed. A
                confirmation email has been sent to {formData.email}.
              </p>
            </div>

            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <p className="text-sm text-pink-800">
                <strong>Deposit Paid:</strong> GHS 100.00
              </p>
              <p className="text-xs text-pink-600 mt-1">
                This non-refundable deposit secures your appointment.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}