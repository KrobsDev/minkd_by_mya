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

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

export default function SettingsPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [blockReason, setBlockReason] = useState("");

  const fetchBlockedDates = async () => {
    try {
      const { data } = await api.get<BlockedDate[]>("/admin/blocked-dates");
      setBlockedDates(data);
    } catch (error) {
      console.error("Error fetching blocked dates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedDates();
  }, []);

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
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="space-y-6 mt-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set your default working hours for each day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
                  <div
                    key={day}
                    className="flex items-center gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="w-24 font-medium">{day}</div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        defaultValue="09:00"
                        className="w-32"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        defaultValue="18:00"
                        className="w-32"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <div className="w-24 font-medium text-gray-400">Sunday</div>
                  <span className="text-gray-400">Closed</span>
                </div>
              </div>
              <Button className="mt-6 bg-pink-600 hover:bg-pink-700">
                Save Working Hours
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure where booking notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  defaultValue="admin@minkedbymya.com"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Receive notifications for new bookings
                </p>
              </div>
              <div>
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  defaultValue="hello@minkedbymya.com"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Used as the &quot;from&quot; address for customer emails
                </p>
              </div>
              <Button className="bg-pink-600 hover:bg-pink-700">
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  defaultValue="Mink'd by Mya"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  defaultValue="Accra, Ghana"
                  className="mt-1"
                />
              </div>
              <Button className="bg-pink-600 hover:bg-pink-700">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Manage external service connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Supabase</p>
                  <p className="text-sm text-gray-500">
                    Database & Authentication
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Paystack</p>
                  <p className="text-sm text-gray-500">Payment Processing</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Connected via Links
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Resend</p>
                  <p className="text-sm text-gray-500">Email Service</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  Configure in .env.local
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}