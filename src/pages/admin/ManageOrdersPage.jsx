"use client";
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Search, Eye, Truck, Loader2, PackageSearch } from "lucide-react";
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
    default:
      return "default";
  }
};

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base_url}/orders`);
      setOrders(res?.data || []);
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
          description: `অর্ডার #${orderId} এর স্ট্যাটাস আপডেট করা হয়েছে।`,
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
      toast({
        title: "অর্ডার বিস্তারিত",
        description: `অর্ডার #${orderId} এর তথ্য: ${JSON.stringify(
          res?.data
        )}`,
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "অর্ডার বিস্তারিত দেখতে ব্যর্থ হয়েছে।",
        variant: "destructive",
      });
    }
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

      <Card className="shadow-lg border rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gradient-to-r from-slate-50 to-slate-100">
          <CardTitle className="text-xl font-semibold text-slate-800">
            অর্ডার ম্যানেজমেন্ট
          </CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="অর্ডার খুঁজুন..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
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
            <AnimatePresence>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>অর্ডার আইডি</TableHead>
                    <TableHead>গ্রাহক</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>মোট (৳)</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order?._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-slate-50 transition-all"
                    >
                      <TableCell className="font-mono">{order?.id}</TableCell>
                      <TableCell>{order?.customer}</TableCell>
                      <TableCell>
                        {new Date(order?.date).toLocaleDateString("bn-BD")}
                      </TableCell>
                      <TableCell>
                        {Number(order?.total).toLocaleString("bn-BD")} ৳
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(order?.status)}
                          className="transition-all duration-300"
                        >
                          {order?.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewOrder(order?._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Truck className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {["Processing", "Shipped", "Delivered", "Returned"].map(
                              (status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() =>
                                    handleStatusChange(order?._id, status)
                                  }
                                >
                                  {status}
                                </DropdownMenuItem>
                              )
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ManageOrdersPage;
