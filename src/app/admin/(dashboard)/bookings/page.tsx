"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { CalendarDays, RefreshCw, Search, X } from "lucide-react";
import api from "@/lib/api/client";

interface BookingService {
  service_id: string;
  services: {
    name: string;
    price: number;
    duration_minutes: number;
  } | null;
}

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  notes: string | null;
  created_at: string;
  booking_services: BookingService[];
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Booking[]>("/bookings");
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBookingStatus = async (
    bookingId: string,
    newStatus: Booking["status"]
  ) => {
    try {
      const { status } = await api.patch(`/bookings/${bookingId}`, {
        status: newStatus,
      });

      if (status === 200) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: newStatus } : b
          )
        );
        toast.success("Booking status updated");
      } else {
        toast.error("Failed to update booking");
      }
    } catch {
      toast.error("Failed to update booking");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    const matchesService =
      serviceFilter === "all" ||
      booking.booking_services?.some(
        (bookingService) => bookingService.service_id === serviceFilter
      );

    let matchesDate = true;
    if (dateFilter?.from) {
      const bookingDate = booking.appointment_date;
      const fromDate = format(dateFilter.from, "yyyy-MM-dd");

      if (!dateFilter.to) {
        matchesDate = bookingDate === fromDate;
      } else {
        const toDate = format(dateFilter.to, "yyyy-MM-dd");
        matchesDate = bookingDate >= fromDate && bookingDate <= toDate;
      }
    }

    return matchesSearch && matchesStatus && matchesService && matchesDate;
  });

  const availableServices = bookings
    .flatMap((booking) => booking.booking_services || [])
    .filter(
      (bookingService, index, services) =>
        bookingService.services?.name &&
        services.findIndex(
          (service) => service.service_id === bookingService.service_id
        ) === index
    )
    .sort((left, right) =>
      (left.services?.name || "").localeCompare(right.services?.name || "")
    );

  const dateFilterLabel = dateFilter?.from
    ? dateFilter.to
      ? `${format(dateFilter.from, "MMM d, yyyy")} - ${format(dateFilter.to, "MMM d, yyyy")}`
      : format(dateFilter.from, "MMM d, yyyy")
    : "Any date";

  const hasActiveFilters =
    statusFilter !== "all" ||
    serviceFilter !== "all" ||
    Boolean(dateFilter?.from);

  const clearFilters = () => {
    setStatusFilter("all");
    setServiceFilter("all");
    setDateFilter(undefined);
  };

  const getStatusBadge = (status: Booking["status"]) => {
    const variants: Record<
      Booking["status"],
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      confirmed: "default",
      completed: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPaymentBadge = (status: Booking["payment_status"]) => {
    const colors: Record<Booking["payment_status"], string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage customer appointments</p>
        </div>
        <Button onClick={fetchBookings} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full lg:w-[220px]">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {availableServices.map((service) => (
                    <SelectItem
                      key={service.service_id}
                      value={service.service_id}
                    >
                      {service.services?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal lg:w-[260px]"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateFilterLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <div className="border-b px-4 py-3">
                    <p className="text-sm font-medium">Filter by date</p>
                    <p className="text-xs text-gray-500">
                      Pick a single day or a full date range.
                    </p>
                  </div>
                  <Calendar
                    mode="range"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    numberOfMonths={2}
                    className="rounded-md"
                  />
                  <div className="flex justify-end border-t px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateFilter(undefined)}
                    >
                      Clear dates
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {hasActiveFilters ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear filters
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customer_name}</p>
                          <p className="text-sm text-gray-500">
                            {booking.customer_email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.customer_phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {booking.booking_services?.length > 0 ? (
                            <>
                              {booking.booking_services.map((bs, i) => (
                                <p key={i} className="font-medium text-sm">
                                  {bs.services?.name ?? "—"}
                                </p>
                              ))}
                              <p className="text-sm text-gray-500">
                                GHS {booking.booking_services.reduce((sum, bs) => sum + (bs.services?.price ?? 0), 0)}{" "}
                                · {booking.booking_services.reduce((sum, bs) => sum + (bs.services?.duration_minutes ?? 0), 0)} min
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-400">No services</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {format(
                              new Date(booking.appointment_date),
                              "MMM d, yyyy"
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(
                              new Date(`2000-01-01T${booking.appointment_time}`),
                              "h:mm a"
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        {getPaymentBadge(booking.payment_status)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={booking.status}
                          onValueChange={(value) =>
                            updateBookingStatus(
                              booking.id,
                              value as Booking["status"]
                            )
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
