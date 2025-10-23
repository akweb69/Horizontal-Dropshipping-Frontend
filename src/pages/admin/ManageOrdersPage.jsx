"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Search, Eye, Truck, Loader2, PackageSearch, X, FileText, Clock, Package, CheckCheck, RefreshCcw } from "lucide-react";
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
  const s = status?.trim();
  switch (s) {
    case "Shipped": return "warning";
    case "Delivered": return "success";
    case "Processing": return "info";
    case "Returned": return "destructive";
    case "pending": case "Pending": return "default";
    default: return "default";
  }
};

const getStatusIcon = (status) => {
  const s = status?.trim();
  switch (s) {
    case "Shipped": return <Truck className="h-4 w-4 mr-1" />;
    case "Delivered": return <CheckCheck className="h-4 w-4 mr-1" />;
    case "Processing": return <Package className="h-4 w-4 mr-1" />;
    case "Returned": return <RefreshCcw className="h-4 w-4 mr-1" />;
    default: return <Clock className="h-4 w-4 mr-1" />;
  }
};

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Date not available';
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
      setOrders(res.data || []);
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
      const res = await axios.patch(`${base_url}/orders/${orderId}`, { status: newStatus });
      if (res?.status === 200) {
        toast({ title: "সফল", description: `স্ট্যাটাস আপডেট হয়েছে।` });
        fetchOrders();
      }
    } catch (error) {
      toast({ title: "ত্রুটি", description: "স্ট্যাটাস আপডেট ব্যর্থ।", variant: "destructive" });
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await axios.get(`${base_url}/orders/${orderId}`);
      setSelectedOrder(res.data);
      setIsModalOpen(true);
    } catch (error) {
      toast({ title: "ত্রুটি", description: "বিস্তারিত দেখতে ব্যর্থ।", variant: "destructive" });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order =>
    order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // === INVOICE GENERATION (Same as OrderTrackingDashboardPage) ===
  const handleGenerateInvoice = async (order) => {
    try {
      const orderId = order._id?.$oid || order._id;
      const orderRes = await axios.get(`${base_url}/orders/${orderId}`);
      const orderData = orderRes.data;

      if (!orderData) {
        toast({ title: "Error!", description: "Order not found.", variant: "destructive" });
        return;
      }

      const { shopName = "LetsDropship", shopAddress = "N/A", shopContact = "N/A", shopImage } = orderData.store_info || {};
      const isCOD = orderData.payment_method?.toLowerCase().includes('cash') || orderData.payment_method?.toLowerCase() === 'cod';
      const productTotal = orderData.amar_bikri_mullo - (orderData.delivery_charge || 0);
      const grandTotal = orderData.amar_bikri_mullo || 0;

      const doc = new jsPDF("p", "mm", "a4");

      // Header
      doc.setFontSize(20);
      doc.setTextColor("#0D6EFD");
      doc.text("Order Invoice", 14, 20);

      if (shopImage) {
        try { doc.addImage(shopImage, "JPEG", 150, 10, 50, 30); } catch (e) { console.log("Image load failed"); }
      }

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Shop: ${shopName}`, 14, 30);
      doc.text(`Address: ${shopAddress}`, 14, 38);
      doc.text(`Contact: ${shopContact}`, 14, 46);
      doc.line(14, 50, 196, 50);

      // Order Info
      doc.setFontSize(12);
      doc.setTextColor("#555555");
      doc.text(`Invoice ID: ${orderId}`, 14, 58);
      doc.text(`Order Date: ${formatDate(orderData.order_date)}`, 14, 66);

      const delivery = orderData.delivery_details || {};
      doc.text(`Customer: ${delivery.name || "N/A"}`, 14, 74);
      doc.text(`Address: ${delivery.address || "N/A"}`, 14, 82);
      doc.text(`Phone: ${delivery.phone || "N/A"}`, 14, 90);
      doc.line(14, 95, 196, 95);

      // Items Table
      const tableColumn = ["Product Name", "Price", "Qty", "Size", "Subtotal"];
      const tableRows = [];

      const items = Array.isArray(orderData.items) ? orderData.items : [
        { name: orderData.name, price: orderData.price, quantity: orderData.quantity || 1, size: orderData.size, subtotal: orderData.subtotal }
      ];

      items.forEach(item => {
        const price = productTotal / items.reduce((a, b) => a + (b.quantity || 1), 0) || item.price;
        const subtotal = price * (item.quantity || 1);
        tableRows.push([
          item.name || 'N/A',
          `${price.toFixed(2)} Tk`,
          item.quantity || 1,
          `${item.size || 'N/A'}`,
          `${subtotal.toFixed(2)} Tk`
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

      let currentY = doc.lastAutoTable.finalY + 10;

      if (isCOD) {
        doc.setFontSize(11);
        doc.text(`Delivery Charge: ${(orderData.delivery_charge || 0).toFixed(2)} Tk , Paid`, 14, currentY);
        currentY += 10;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Payment Information", 14, currentY);
        currentY += 8;
        doc.setFontSize(11);
        doc.text(`Method: ${orderData.payment_method || "N/A"}`, 14, currentY);
        doc.setFontSize(13);
        doc.setTextColor("#000000");
        doc.text(`Grand Total: ${grandTotal.toFixed(2) - orderData.delivery_charge} Tk`, 120, currentY + 10);
      }



      if (!isCOD) {
        doc.setFontSize(13);
        doc.setTextColor("#000000");
        doc.text(`Grand Total with Delivery Charge: ${grandTotal.toFixed(2)} Tk`, 60, currentY + 10);
      }
      // Footer
      doc.setFontSize(10);
      doc.setTextColor("#888888");
      doc.text("Thank you for shopping with LetsDropship!", 14, 285);

      doc.save(`Invoice_${orderId}.pdf`);
      toast({ title: "সফল!", description: "ইনভয়েস তৈরি হয়েছে।", variant: "default" });
    } catch (error) {
      console.error("Invoice error:", error);
      toast({ title: "ত্রুটি!", description: "ইনভয়েস তৈরি করতে ব্যর্থ।", variant: "destructive" });
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
                placeholder="অর্ডার আইডি বা ইমেইল দিয়ে খুঁজুন..."
                className="pl-10 py-2 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mb-3" />
                <p className="text-lg">লোড হচ্ছে...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <PackageSearch className="h-12 w-12 mb-3" />
                <p className="text-lg">কোনো অর্ডার পাওয়া যায়নি।</p>
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
                      {filteredOrders.map((order) => {
                        const status = order.status?.trim();
                        const isFinal = status === "Delivered" || status === "Returned";
                        return (
                          <motion.tr
                            key={order._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="hover:bg-gray-50 transition-all text-sm"
                          >
                            <TableCell className="font-mono text-gray-800">
                              #{order._id?.slice(-6)}
                            </TableCell>
                            <TableCell className="text-gray-800">{order.email}</TableCell>
                            <TableCell className="text-gray-600">
                              {formatDate(order.order_date).split(',')[0]}
                            </TableCell>
                            <TableCell className="text-gray-800 font-semibold">
                              {Number(order.amar_bikri_mullo || 0).toLocaleString("bn-BD")} ৳
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(status)} className="flex items-center w-fit text-xs">
                                {getStatusIcon(status)}
                                {status?.charAt(0).toUpperCase() + status?.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrder(order._id)}
                                className="h-9 rounded-full"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateInvoice(order)}
                                className="h-9 rounded-full border-green-200 hover:bg-green-500 hover:text-white"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isFinal}
                                    className={`h-9 rounded-full ${isFinal ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'}`}
                                  >
                                    <Truck className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-lg shadow-lg">
                                  {["pending", "Processing", "Shipped", "Delivered", "Returned"].map((s) => (
                                    <DropdownMenuItem
                                      key={s}
                                      onClick={() => handleStatusChange(order._id, s)}
                                      className="text-sm hover:bg-indigo-50"
                                    >
                                      {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                অর্ডার বিস্তারিত #{selectedOrder._id?.slice(-6)}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div><strong>গ্রাহক:</strong> {selectedOrder.email}</div>
                <div><strong>তারিখ:</strong> {formatDate(selectedOrder.order_date)}</div>
                <div><strong>মোট:</strong> <span className="font-bold">৳{selectedOrder.amar_bikri_mullo}</span></div>
                <div><strong>পেমেন্ট:</strong> {selectedOrder.payment_method}</div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <h4 className="font-semibold">ডেলিভারি বিস্তারিত</h4>
                <p><strong>নাম:</strong> {selectedOrder.delivery_details?.name}</p>
                <p><strong>ঠিকানা:</strong> {selectedOrder.delivery_details?.address}</p>
                <p><strong>ফোন:</strong> {selectedOrder.delivery_details?.phone}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">আইটেম সমূহ</h4>
                {Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name} (Size: {item.size || 'N/A'})</span>
                    <span>x{item.quantity} = ৳{(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
                  </div>
                )) : <p>কোনো আইটেম নেই</p>}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button onClick={() => handleGenerateInvoice(selectedOrder)} className="bg-green-600 hover:bg-green-700">
                  <FileText className="h-4 w-4 mr-2" /> ইনভয়েস
                </Button>
                <Button onClick={closeModal} className="bg-indigo-600 hover:bg-indigo-700">
                  বন্ধ করুন
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ManageOrdersPage;