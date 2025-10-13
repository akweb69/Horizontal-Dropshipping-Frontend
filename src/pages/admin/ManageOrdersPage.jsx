"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Search, Eye, Truck, Loader2, PackageSearch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const getStatusVariant = (status) => {
  switch (status) {
    case "Shipped":
      return "warning";
    case "Delivered":
      return "success";
    case "Processing":
      return "info";
    case "Returned":
      return "destructive";
    case "pending":
      return "default";
    default:
      return "default";
  }
};

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const base_url = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base_url}/orders`);
      const formattedOrders = res?.data.map((order) => ({
        _id: order._id,
        id: order._id,
        customer: order.email || "Unknown Customer",
        date: order.order_date,
        total: order.total || order.amount,
        status: order.status,
        payment_method: order.payment_method,
        payment_number: order.payment_number,
        tnx_id: order.tnx_id,
        items: order.items || [
          {
            productId: order.productId,
            name: order.name,
            price: order.price,
            quantity: order.quantity,
            subtotal: order.total,
          },
        ],
      }));
      setOrders(formattedOrders);
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "অর্ডার লোড করতে ব্যর্থ হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.patch(`${base_url}/orders/${orderId}`, {
        status: newStatus,
      });
      if (res?.status === 200) {
        toast({
          title: "সফল",
          description: `অর্ডার #${orderId.slice(-6)} এর স্ট্যাটাস আপডেট করা হয়েছে।`,
        });
        fetchOrders();
      } else {
        throw new Error("Status update failed");
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await axios.get(`${base_url}/orders/${orderId}`);
      setSelectedOrder(res?.data);
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "অর্ডার বিস্তারিত দেখতে ব্যর্থ হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.customer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>অর্ডার ম্যানেজ করুন - অ্যাডমিন</title>
      </Helmet>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg border rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-50 to-slate-100 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-slate-800">
              অর্ডার ম্যানেজমেন্ট
            </CardTitle>
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="অর্ডার খুঁজুন..."
                className="pl-8 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p>অর্ডার লোড হচ্ছে...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <PackageSearch className="h-10 w-10 mb-2" />
                <p>কোন অর্ডার পাওয়া যায়নি।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">অর্ডার আইডি</TableHead>
                      <TableHead className="text-xs sm:text-sm">গ্রাহক</TableHead>
                      <TableHead className="text-xs sm:text-sm">তারিখ</TableHead>
                      <TableHead className="text-xs sm:text-sm">মোট (৳)</TableHead>
                      <TableHead className="text-xs sm:text-sm">স্ট্যাটাস</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredOrders.map((order) => (
                        <motion.tr
                          key={order?._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-slate-50 transition-all text-xs sm:text-sm"
                        >
                          <TableCell className="font-mono">{order?.id.slice(-6)}</TableCell>
                          <TableCell>{order?.customer}</TableCell>
                          <TableCell>
                            {new Date(order?.date).toLocaleDateString("bn-BD", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            {Number(order?.total).toLocaleString("bn-BD")} ৳
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusVariant(order?.status)}
                              className="transition-all duration-300 text-xs sm:text-sm"
                            >
                              {order?.status.charAt(0).toUpperCase() + order?.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right flex justify-end gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewOrder(order?._id)}
                              className="h-8 w-8 sm:h-10 sm:w-10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 sm:h-10 sm:w-10"
                                >
                                  <Truck className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {["pending", "Processing", "Shipped", "Delivered", "Returned"].map(
                                  (status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      onClick={() => handleStatusChange(order?._id, status)}
                                      className="text-xs sm:text-sm"
                                    >
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </DropdownMenuItem>
                                  )
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-md sm:max-w-lg mx-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                অর্ডার বিস্তারিত #{selectedOrder._id.slice(-6)}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm sm:text-base">
                  <strong>গ্রাহক:</strong> {selectedOrder.email || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base">
                  <strong>তারিখ:</strong>{" "}
                  {new Date(selectedOrder.order_date).toLocaleDateString("bn-BD", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base">
                  <strong>মোট:</strong> ${selectedOrder.total || selectedOrder.amount}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base">
                  <strong>পেমেন্ট মেথড:</strong>{" "}
                  {selectedOrder.payment_method.charAt(0).toUpperCase() +
                    selectedOrder.payment_method.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base">
                  <strong>পেমেন্ট নম্বর:</strong> {selectedOrder.payment_number}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base">
                  <strong>ট্রানজাকশন আইডি:</strong> {selectedOrder.tnx_id}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base">
                  <strong>আইটেম:</strong>{" "}
                  {selectedOrder.items
                    ? selectedOrder.items
                      .map(
                        (item) =>
                          `${item.name} (Qty: ${item.quantity}, Price: $${item.price}, Subtotal: $${item.subtotal})`
                      )
                      .join(", ")
                    : `${selectedOrder.name} (Qty: ${selectedOrder.quantity}, Price: $${selectedOrder.price}, Subtotal: $${selectedOrder.total})`}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base">
                  <strong>স্ট্যাটাস:</strong>{" "}
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={closeModal}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                বন্ধ করুন
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ManageOrdersPage;