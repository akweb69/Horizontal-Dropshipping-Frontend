"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Search, Eye, Truck, Loader2, PackageSearch, X, FileText } from "lucide-react";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
        total: order.grand_total || order.amount,
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
        delivery_details: order.delivery_details,
        amar_bikri_mullo: order.amar_bikri_mullo,
        delivery_charge: order.delivery_charge,
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

  // === Invoice Generation Function ===
  const handleGenerateInvoice = async (order) => {
    try {
      const orderId = order._id;
      console.log("Generating invoice for order ID:", order);

      // Fetch full order data
      const orderRes = await axios.get(`${base_url}/orders/${orderId}`);
      const orderData = orderRes.data;

      if (!orderData) {
        toast({ title: "Error!", description: "Order not found.", variant: "destructive" });
        return;
      }

      // Fetch admin/shop info (from users or store)
      let shopName = "LetsDropship", shopAddress = "N/A", shopContact = "N/A", shopImage = null;
      try {
        const usersRes = await axios.get(`${base_url}/users`);
        const admin = usersRes.data.find(u => u.email === order?.customer);
        if (admin?.storeInfo) {
          shopName = admin.storeInfo.shopName || shopName;
          shopAddress = admin.storeInfo.shopAddress || shopAddress;
          shopContact = admin.storeInfo.shopContact || shopContact;
          shopImage = admin.storeInfo.shopImage;
        }
      } catch (e) { /* ignore */ }

      const doc = new jsPDF("p", "mm", "a4");

      // Header
      doc.setFontSize(20);
      doc.setTextColor("#0D6EFD");
      doc.text("Order Invoice", 14, 20);

      if (shopImage) {
        doc.addImage(shopImage, "JPEG", 150, 10, 50, 30);
      }

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Shop: ${shopName}`, 14, 30);
      doc.text(`Address: ${shopAddress}`, 14, 38);
      doc.text(`Contact: ${shopContact}`, 14, 46);

      doc.setDrawColor(200);
      doc.line(14, 50, 196, 50);

      // Order Info
      doc.setFontSize(12);
      doc.setTextColor("#555555");
      doc.text(`Invoice ID: ${orderData._id}`, 14, 58);
      doc.text(`Order Date: ${new Date(orderData.order_date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })}`, 14, 66);

      const delivery = orderData.delivery_details || {};
      doc.text(`Customer: ${delivery.name || "N/A"}`, 14, 74);
      doc.text(`Address: ${delivery.address || "N/A"}`, 14, 82);
      doc.text(`Phone: ${delivery.phone || "N/A"}`, 14, 90);

      doc.line(14, 95, 196, 95);

      // Items Table
      const tableColumn = ["Product Name", "Price", "Qty", "Delivery", "Subtotal"];
      const tableRows = [];

      (orderData.items || []).forEach(item => {
        const price = parseFloat(orderData.amar_bikri_mullo - orderData.delivery_charge);
        const subtotal = parseFloat(price * item.quantity + orderData.delivery_charge);
        tableRows.push([
          item.name,
          `${price.toFixed(2)}`,
          item.quantity,
          `${orderData.delivery_charge?.toFixed(2) || 0}`,
          `${subtotal.toFixed(2)}`
        ]);
      });

      autoTable(doc, {
        startY: 100,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [13, 110, 253], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 11, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      const finalY = doc.lastAutoTable.finalY + 10;

      // Payment Info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Payment Information", 14, finalY);
      doc.setFontSize(11);
      doc.text(`Method: ${orderData.payment_method || "N/A"}`, 14, finalY + 8);
      doc.text(`Transaction ID: ${orderData.tnx_id || "N/A"}`, 14, finalY + 16);
      doc.text(`Payment Number: ${orderData.payment_number || "N/A"}`, 14, finalY + 24);

      // Grand Total
      const grandTotal = parseFloat(orderData.amar_bikri_mullo) || 0;
      doc.setFontSize(13);
      doc.setTextColor("#000000");
      doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 14, finalY + 40);

      // Footer
      doc.setFontSize(10);
      doc.setTextColor("#888888");
      doc.text("Thank you for shopping with LetsDropship!", 14, 285);

      // Save
      doc.save(`Invoice_${orderData._id}.pdf`);

      toast({ title: "সফল!", description: "ইনভয়েস তৈরি হয়েছে।", variant: "default" });
    } catch (error) {
      console.error("Invoice error:", error);
      toast({ title: "ত্রুটি!", description: "ইনভয়েস তৈরি করতে ব্যর্থ।", variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet>
        <title>অর্ডার ম্যানেজ করুন - অ্যাডমিন</title>
      </Helmet>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-xl border border-gray-100 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              অর্ডার ম্যানেজমেন্ট
            </CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="অর্ডার আইডি বা গ্রাহকের নাম দিয়ে খুঁজুন..."
                className="pl-10 py-2 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mb-3" />
                <p className="text-lg">অর্ডার লোড হচ্ছে...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <PackageSearch className="h-12 w-12 mb-3" />
                <p className="text-lg">কোন অর্ড়ার পাওয়া যায়নি।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-sm font-semibold text-gray-700">অর্ডার আইডি</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">গ্রাহক</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">তারিখ</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">মোট (৳)</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700">স্ট্যাটাস</TableHead>
                      <TableHead className="text-right text-sm font-semibold text-gray-700">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredOrders.map((order) => (
                        <motion.tr
                          key={order?._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-gray-50 transition-all text-sm"
                        >
                          <TableCell className="font-mono text-gray-800">{order?.id.slice(-6)}</TableCell>
                          <TableCell className="text-gray-800">{order?.customer}</TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(order?.date).toLocaleDateString("bn-BD", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-gray-800">
                            {Number(order?.total).toLocaleString("bn-BD")} ৳
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusVariant(order?.status)}
                              className="px-3 py-1 text-xs font-medium rounded-full transition-all duration-300"
                            >
                              {order?.status.charAt(0).toUpperCase() + order?.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrder(order?._id)}
                              className="h-9 rounded-full border-gray-200 hover:bg-indigo-500"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateInvoice(order)}
                              className="h-9 rounded-full border-gray-200 hover:bg-green-500 hover:text-white"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 rounded-full border-gray-200 hover:bg-indigo-500"
                                  disabled={order?.status === "Delivered" || order?.status === "Returned" || order?.status === "Shipped"}
                                >
                                  <Truck className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-lg shadow-lg">
                                {["pending", "Processing", "Shipped", "Delivered", "Returned"].map(
                                  (status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      onClick={() => handleStatusChange(order?._id, status)}
                                      className="text-sm text-gray-700 hover:bg-indigo-50"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                অর্ডার বিস্তারিত #{selectedOrder._id.slice(-6)}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="border-b pb-3">
                <p><strong className="font-semibold">গ্রাহক:</strong> {selectedOrder.email || "Unknown"}</p>
              </div>
              <div className="border-b pb-3">
                <p><strong className="font-semibold">তারিখ:</strong>{" "}
                  {new Date(selectedOrder.order_date).toLocaleDateString("bn-BD", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>
              </div>
              <div className="border-b pb-3">
                <p><strong className="font-semibold">মোট:</strong> {Number(selectedOrder.grand_total).toLocaleString("bn-BD")} ৳</p>
              </div>
              <div className="border-b pb-3">
                <p><strong className="font-semibold">পেমেন্ট মেথড:</strong>{" "}
                  {selectedOrder.payment_method.charAt(0).toUpperCase() + selectedOrder.payment_method.slice(1)}
                </p>
              </div>
              <div className="border-b pb-3">
                <p><strong className="font-semibold">পেমেন্ট নম্বর:</strong> {selectedOrder.payment_number}</p>
              </div>
              <div className="border-b pb-3">
                <p><strong className="font-semibold">ট্রানজাকশন আইডি:</strong> {selectedOrder.tnx_id}</p>
              </div>
              <div className="border-b pb-3">
                <p><strong className="font-semibold">ডেলিভারি বিস্তারিত:</strong>{" "}
                  {selectedOrder.delivery_details
                    ? `${selectedOrder.delivery_details.name}, ${selectedOrder.delivery_details.address}, ${selectedOrder.delivery_details.location}, ${selectedOrder.delivery_details.phone}`
                    : "N/A"}
                </p>
              </div>
              <div className="border-b pb-3">
                <p><strong className="font-semibold">আইটেম:</strong>{" "}
                  {selectedOrder.items
                    ? selectedOrder.items
                      .map((item) => `${item.name} (Qty: ${item.quantity})`)
                      .join(", ")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p><strong className="font-semibold">স্ট্যাটাস:</strong>{" "}
                  <Badge variant={getStatusVariant(selectedOrder.status)} className="ml-2">
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button
                onClick={() => handleGenerateInvoice(selectedOrder)}
                className="bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                ইনভয়েস ডাউনলোড
              </Button>
              <Button
                onClick={closeModal}
                className="bg-indigo-600 hover:bg-indigo-700"
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