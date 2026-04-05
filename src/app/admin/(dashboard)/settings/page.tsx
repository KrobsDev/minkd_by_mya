"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Plus, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/api/client";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

const CLOSING_TIME_OPTIONS = [
  { value: "17:00", label: "5:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "22:00", label: "10:00 PM" },
];

export default function SettingsPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedWeekdays, setBlockedWeekdays] = useState<number[]>([0]);
  const [closingTime, setClosingTime] = useState("18:00");
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState(2);
  const [maxBookingsInput, setMaxBookingsInput] = useState("2");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDays, setSavingDays] = useState(false);
  const [savingClosingTime, setSavingClosingTime] = useState(false);
  const [savingMaxBookings, setSavingMaxBookings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [blockReason, setBlockReason] = useState("");

  const fetchData = async () => {
    try {
      const [datesRes, settingsRes, closingTimeRes, maxBookingsRes] = await Promise.all([
        api.get<BlockedDate[]>("/admin/blocked-dates"),
        api.get<{ value: number[] | null }>("/admin/settings?key=blocked_weekdays"),
        api.get<{ value: string | null }>("/admin/settings?key=closing_time"),
        api.get<{ value: number | null }>("/admin/settings?key=max_bookings_per_slot"),
      ]);
      setBlockedDates(datesRes.data);
      if (settingsRes.data.value) {
        setBlockedWeekdays(settingsRes.data.value);
      }
      if (closingTimeRes.data.value) {
        setClosingTime(closingTimeRes.data.value);
      }
      if (maxBookingsRes.data.value != null) {
        setMaxBookingsPerSlot(maxBookingsRes.data.value);
        setMaxBookingsInput(String(maxBookingsRes.data.value));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleWeekday = async (day: number) => {
    const updated = blockedWeekdays.includes(day)
      ? blockedWeekdays.filter((d) => d !== day)
      : [...blockedWeekdays, day];

    setBlockedWeekdays(updated);
    setSavingDays(true);

    try {
      await api.post("/admin/settings", {
        key: "blocked_weekdays",
        value: updated,
      });
      toast.success(
        blockedWeekdays.includes(day)
          ? `${WEEKDAYS[day].label} is now open for bookings`
          : `${WEEKDAYS[day].label} is now blocked`
      );
    } catch {
      // Revert on failure
      setBlockedWeekdays(blockedWeekdays);
      toast.error("Failed to update working days");
    } finally {
      setSavingDays(false);
    }
  };

  const handleClosingTimeChange = async (time: string) => {
    setClosingTime(time);
    setSavingClosingTime(true);
    try {
      await api.post("/admin/settings", { key: "closing_time", value: time });
      toast.success(`Closing time updated to ${CLOSING_TIME_OPTIONS.find((o) => o.value === time)?.label}`);
    } catch {
      toast.error("Failed to update closing time");
    } finally {
      setSavingClosingTime(false);
    }
  };

  const handleMaxBookingsSave = async () => {
    const value = parseInt(maxBookingsInput, 10);
    if (isNaN(value) || value < 1) {
      toast.error("Please enter a valid number (minimum 1)");
      return;
    }
    setSavingMaxBookings(true);
    try {
      await api.post("/admin/settings", { key: "max_bookings_per_slot", value });
      setMaxBookingsPerSlot(value);
      toast.success(`Max bookings per slot updated to ${value}`);
    } catch {
      toast.error("Failed to update max bookings");
    } finally {
      setSavingMaxBookings(false);
    }
  };

  const handleBlockDate = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post<BlockedDate>("/admin/blocked-dates", {
        date: format(selectedDate, "yyyy-MM-dd"),
        reason: blockReason || null,
      });

      setBlockedDates([...blockedDates, data]);
      setSelectedDate(undefined);
      setBlockReason("");
      toast.success("Date blocked successfully");
    } catch (error) {
      console.error("Error blocking date:", error);
      toast.error("Failed to block date");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBlockedDate = async (date: string) => {
    try {
      await api.delete(`/admin/blocked-dates?date=${date}`);
      setBlockedDates(blockedDates.filter((d) => d.date !== date));
      toast.success("Date unblocked");
    } catch (error) {
      console.error("Error unblocking date:", error);
      toast.error("Failed to unblock date");
    }
  };

  const blockedDateStrings = blockedDates.map((d) => d.date);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your booking preferences</p>
      </div>

      <Tabs defaultValue="availability">
        <TabsList>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Working Days</CardTitle>
              <CardDescription>
                Toggle which days of the week you accept bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WEEKDAYS.map((day) => {
                  const isBlocked = blockedWeekdays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      onClick={() => toggleWeekday(day.value)}
                      disabled={savingDays}
                      className={cn(
                        "px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
                        isBlocked
                          ? "bg-gray-100 text-gray-400 border-gray-200"
                          : "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
                      )}
                    >
                      {day.label}
                      <span className="block text-xs mt-1 font-normal">
                        {isBlocked ? "Closed" : "Open"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Click a day to toggle it. Closed days cannot be booked by customers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Closing Time</CardTitle>
              <CardDescription>
                Set the hard cutoff time for bookings. Services must finish by this time. Default is 6:00 PM (5pm close + 1hr buffer).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {CLOSING_TIME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleClosingTimeChange(option.value)}
                    disabled={savingClosingTime}
                    className={cn(
                      "px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
                      closingTime === option.value
                        ? "bg-pink-600 text-white border-pink-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-pink-50 hover:border-pink-200"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="customClosingTime">Custom time</Label>
                  <Input
                    id="customClosingTime"
                    type="time"
                    defaultValue={CLOSING_TIME_OPTIONS.some((o) => o.value === closingTime) ? "" : closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-36"
                  />
                </div>
                <Button
                  onClick={() => handleClosingTimeChange(closingTime)}
                  disabled={savingClosingTime || !closingTime}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {savingClosingTime ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    "Set"
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Bookings that would run past this time will not be offered to customers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Concurrent Bookings Per Slot</CardTitle>
              <CardDescription>
                Number of appointments that can be booked at the same time. Set this to match the number of available staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="maxBookings">Max bookings per slot</Label>
                  <Input
                    id="maxBookings"
                    type="number"
                    min={1}
                    max={20}
                    value={maxBookingsInput}
                    onChange={(e) => setMaxBookingsInput(e.target.value)}
                    className="w-24"
                  />
                </div>
                <Button
                  onClick={handleMaxBookingsSave}
                  disabled={savingMaxBookings || maxBookingsInput === String(maxBookingsPerSlot)}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {savingMaxBookings ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Current setting: <span className="font-medium">{maxBookingsPerSlot} booking{maxBookingsPerSlot !== 1 ? "s" : ""} per slot</span>. Increase this when more staff are available.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Block Dates</CardTitle>
              <CardDescription>
                Select dates when you&apos;re unavailable for appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) =>
                        date < new Date() ||
                        blockedDateStrings.includes(
                          format(date, "yyyy-MM-dd")
                        )
                      }
                      className="rounded-md border"
                    />
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Input
                          id="reason"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          placeholder="e.g., Holiday, Personal day"
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={handleBlockDate}
                        disabled={!selectedDate || saving}
                        className="w-full bg-pink-600 hover:bg-pink-700"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Block Selected Date
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Blocked Dates</h3>
                    {blockedDates.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No dates are currently blocked
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {blockedDates.map((blockedDate) => (
                          <div
                            key={blockedDate.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <span className="font-medium">
                                {format(
                                  new Date(blockedDate.date),
                                  "EEEE, MMMM d, yyyy"
                                )}
                              </span>
                              {blockedDate.reason && (
                                <p className="text-sm text-gray-500">
                                  {blockedDate.reason}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveBlockedDate(blockedDate.date)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>
        <TabsContent value="account" className="space-y-6 mt-6">
          <PasswordChangeCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PasswordChangeCard() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await api.post("/auth/change-password", { newPassword });
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your admin account password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1"
            placeholder="Minimum 8 characters"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button
          onClick={handleChangePassword}
          disabled={saving}
          className="bg-pink-600 hover:bg-pink-700"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}