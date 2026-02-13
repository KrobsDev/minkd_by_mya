"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Loader2, RefreshCw } from "lucide-react";
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

interface ServiceFormData {
  name: string;
  description: string;
  features: string[];
  price: number;
  duration_minutes: number;
  category_id: string;
  paystack_link: string;
  popular: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<DbService[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState<DbService | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<DbService | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    features: [],
    price: 0,
    duration_minutes: 60,
    category_id: "",
    paystack_link: "",
    popular: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        api.get<DbCategory[]>("/services/categories"),
        api.get<DbService[]>("/services?includeInactive=true"),
      ]);

      setCategories(categoriesRes.data);
      setServices(servicesRes.data);

      if (categoriesRes.data.length > 0 && !activeCategory) {
        setActiveCategory(categoriesRes.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (service: DbService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      features: service.features,
      price: service.price,
      duration_minutes: service.duration_minutes,
      category_id: service.category_id,
      paystack_link: service.paystack_link,
      popular: service.popular,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.category_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingService) {
        // Update existing service
        await api.patch(`/services/${editingService.id}`, {
          name: formData.name,
          description: formData.description,
          features: formData.features,
          price: formData.price,
          duration_minutes: formData.duration_minutes,
          category_id: formData.category_id,
          paystack_link: formData.paystack_link,
          popular: formData.popular,
        });
        toast.success("Service updated successfully");
      } else {
        // Add new service
        await api.post("/services", {
          name: formData.name,
          description: formData.description,
          features: formData.features,
          price: formData.price,
          duration_minutes: formData.duration_minutes,
          category_id: formData.category_id,
          paystack_link: formData.paystack_link,
          popular: formData.popular,
        });
        toast.success("Service added successfully");
      }

      setIsDialogOpen(false);
      setEditingService(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      features: [],
      price: 0,
      duration_minutes: 60,
      category_id: "",
      paystack_link: "",
      popular: false,
    });
  };

  const handleNewService = () => {
    setEditingService(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingService) return;

    setDeleting(true);
    try {
      await api.delete(`/services/${deletingService.id}`);
      toast.success("Service deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    } finally {
      setDeleting(false);
      setDeletingService(null);
    }
  };

  const filteredServices = services.filter(
    (service) => service.category_id === activeCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleNewService}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Edit Service" : "Add New Service"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Classic Full Set"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the service..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (GHS)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration_minutes: parseInt(e.target.value) || 60,
                        })
                      }
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Features (one per line)</Label>
                  <Textarea
                    id="features"
                    value={formData.features.join("\n")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paystackLink">Paystack Payment Link</Label>
                  <Input
                    id="paystackLink"
                    value={formData.paystack_link}
                    onChange={(e) =>
                      setFormData({ ...formData, paystack_link: e.target.value })
                    }
                    placeholder="https://paystack.shop/pay/..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={formData.popular}
                    onChange={(e) =>
                      setFormData({ ...formData, popular: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <Label htmlFor="popular" className="text-sm font-normal">
                    Mark as Popular
                  </Label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingService(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : editingService ? (
                      "Save Changes"
                    ) : (
                      "Add Service"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Service Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 border"
                >
                  {cat.title}
                  <Badge variant="secondary" className="ml-2">
                    {services.filter((s) => s.category_id === cat.id).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="mt-6">
                {filteredServices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No services in this category
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Features</TableHead>
                        <TableHead>Popular</TableHead>
                        <TableHead>Payment Link</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">
                            {service.name}
                          </TableCell>
                          <TableCell>GHS {service.price}</TableCell>
                          <TableCell>{service.duration_minutes} min</TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {service.features.length} features
                            </span>
                          </TableCell>
                          <TableCell>
                            {service.popular && (
                              <Badge className="bg-pink-100 text-pink-700">
                                Popular
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {service.paystack_link && (
                              <a
                                href={service.paystack_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-pink-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(service)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingService(service)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deletingService}
        onOpenChange={(open) => !open && setDeletingService(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {deletingService?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}