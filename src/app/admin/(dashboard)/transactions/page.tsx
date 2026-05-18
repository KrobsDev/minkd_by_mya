"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import api from "@/lib/api/client";

interface Transaction {
  id: string;
  paystack_reference: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  customer_email: string;
  service_name: string;
  created_at: string;
}

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Transaction[]>("/transactions");
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Reset to first page whenever a filter or search changes.
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, serviceFilter, dateFilter]);

  const availableServices = useMemo(() => {
    const names = new Set<string>();
    transactions.forEach((t) => {
      if (t.service_name) names.add(t.service_name);
    });
    return Array.from(names).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return transactions.filter((t) => {
      if (search) {
        const haystack = [
          t.customer_email,
          t.service_name,
          t.paystack_reference,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      if (statusFilter !== "all" && t.status !== statusFilter) return false;

      if (serviceFilter !== "all" && t.service_name !== serviceFilter) {
        return false;
      }

      if (dateFilter?.from) {
        const created = t.created_at.slice(0, 10);
        const from = format(dateFilter.from, "yyyy-MM-dd");
        if (!dateFilter.to) {
          if (created !== from) return false;
        } else {
          const to = format(dateFilter.to, "yyyy-MM-dd");
          if (created < from || created > to) return false;
        }
      }

      return true;
    });
  }, [transactions, searchTerm, statusFilter, serviceFilter, dateFilter]);

  // Stats reflect the current filter so totals make sense as you slice.
  const stats = useMemo(
    () => ({
      total: filteredTransactions.length,
      successful: filteredTransactions.filter((t) => t.status === "success")
        .length,
      totalAmount: filteredTransactions
        .filter((t) => t.status === "success")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    }),
    [filteredTransactions]
  );

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredTransactions.slice(pageStart, pageStart + PAGE_SIZE);

  const dateFilterLabel = dateFilter?.from
    ? dateFilter.to
      ? `${format(dateFilter.from, "MMM d, yyyy")} - ${format(dateFilter.to, "MMM d, yyyy")}`
      : format(dateFilter.from, "MMM d, yyyy")
    : "Any date";

  const hasActiveFilters =
    statusFilter !== "all" ||
    serviceFilter !== "all" ||
    Boolean(dateFilter?.from) ||
    searchTerm.length > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setServiceFilter("all");
    setDateFilter(undefined);
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants: Record<
      Transaction["status"],
      "default" | "secondary" | "destructive"
    > = {
      success: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View payment records from Paystack</p>
        </div>
        <Button onClick={fetchTransactions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards — reflect current filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {hasActiveFilters ? "Filtered Transactions" : "Total Transactions"}
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.successful}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {hasActiveFilters ? "Filtered Revenue" : "Total Revenue"}
                </p>
                <p className="text-2xl font-bold text-pink-600">
                  GHS {stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-pink-50 rounded-full">
                <DollarSign className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Transaction History</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email, reference, or service..."
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
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full lg:w-[220px]">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {availableServices.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
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
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {transactions.length === 0
                  ? "No transactions yet"
                  : "No transactions match your filters"}
              </p>
              {transactions.length === 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  Transactions will appear here once customers make payments via
                  Paystack
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell
                          className="font-mono text-sm"
                          title={transaction.paystack_reference}
                        >
                          {transaction.paystack_reference.slice(0, 16)}...
                        </TableCell>
                        <TableCell>{transaction.customer_email}</TableCell>
                        <TableCell>{transaction.service_name}</TableCell>
                        <TableCell className="font-medium">
                          {transaction.currency}{" "}
                          {Number(transaction.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          {format(
                            new Date(transaction.created_at),
                            "MMM d, yyyy h:mm a"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Showing {pageStart + 1}–
                  {Math.min(pageStart + PAGE_SIZE, filteredTransactions.length)}{" "}
                  of {filteredTransactions.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
