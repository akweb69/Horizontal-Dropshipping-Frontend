import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Package,
  Truck,
  CheckCheck,
  RefreshCcw,
  Clock,
  Eye,
  X,
  MapPin,
  CreditCard,
  ShoppingCart,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Loader11 from '../../components/layout/Loader11';
import { Input } from '@/components/ui/input';
import { debounce } from 'lodash'; // Optional: use lodash.debounce for better performance

const OrderTrackingDashboardPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Process only SINGLE ITEM orders
  const processOrdersData = (rawOrders) => {
    const processed = [];

    rawOrders.forEach(order => {
      const hasMultipleItems = order.items && Array.isArray(order.items) && order.items.length > 1;
      if (hasMultipleItems) return;

      const item = Array.isArray(order.items) && order.items.length === 1
        ? order.items[0]
        : {
          productId: order.productId,
          name: order.name,
          price: order.price,
          quantity: order.quantity || 1,
          subtotal: order.subtotal || order.price
        };

      if (!item.name) return;

      processed.push({
        orderId: order._id?.$oid || order._id || `LD-${Date.now()}`,
        productId: item.productId,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        total: order.total || item.subtotal,
        status: order.status || 'pending',
        payment_method: order.payment_method || 'bkash',
        payment_number: order.payment_number,
        tnx_id: order.tnx_id,
        amount: order.amount,
        order_date: order.order_date,
        email: order.email,
        type: 'single',
        trackingLink: order.trackingLink,
        itemsCount: 1,
        grand_total: order.amar_bikri_mullo,
        fullOrder: order,
        // Extra searchable fields
        phone: order.delivery_details?.phone || '',
        address: order.delivery_details?.address || ''
      });
    });

    return processed;
  };

  useEffect(() => {
    if (user?.email) {
      loadOrders();
    }
  }, [user?.email]);

  const loadOrders = () => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_BASE_URL}/orders`)
      .then(res => {
        const data = res.data || [];
        const userOrders = data.filter(item => item.email === user?.email);
        const processedData = processOrdersData(userOrders);
        setOrders(processedData);
      })
      .catch(err => {
        console.error('Error loading orders:', err);
        toast({
          title: "Error!",
          description: "Failed to load orders.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setLoading(false);
      });
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

  const getStatusInfo = (status) => {
    const normalizedStatus = status?.trim();
    let variant = 'default';
    let icon = <Clock className="h-4 w-4 mr-2" />;
    let label = normalizedStatus || 'Unknown';

    switch (normalizedStatus) {
      case 'Shipped':
        variant = 'warning';
        icon = <Truck className="h-4 w-4 mr-2" />;
        label = 'Shipped';
        break;
      case 'Delivered':
        variant = 'success';
        icon = <CheckCheck className="h-4 w-4 mr-2" />;
        label = 'Delivered';
        break;
      case 'Processing':
        variant = 'info';
        icon = <Package className="h-4 w-4 mr-2" />;
        label = 'Processing';
        break;
      case 'Returned':
        variant = 'destructive';
        icon = <RefreshCcw className="h-4 w-4 mr-2" />;
        label = 'Returned';
        break;
      case 'pending':
      case 'Pending':
        variant = 'default';
        icon = <Clock className="h-4 w-4 mr-2" />;
        label = 'Pending';
        break;
      default:
        variant = 'default';
        icon = <Clock className="h-4 w-4 mr-2" />;
        label = normalizedStatus || 'Unknown';
    }

    return { variant, icon, label };
  };

  // Debounced search
  const debouncedSetSearch = useMemo(
    () => debounce((value) => setSearchQuery(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSetSearch(e.target.value);
  };

  // Filter by Tab + Search
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply Tab Filter
    filtered = filtered.filter(order => {
      const status = order.status?.trim();
      switch (activeTab) {
        case 'delivered':
          return status === 'Delivered';
        case 'processing':
          return status === 'Processing' || status === 'pending' || status === 'Pending';
        case 'returned':
          return status === 'Returned';
        case 'shipped':
          return status === 'Shipped';
        default:
          return true;
      }
    });

    // Apply Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => {
        return (
          order.orderId.toLowerCase().includes(query) ||
          order.productName.toLowerCase().includes(query) ||
          order.status.toLowerCase().includes(query) ||
          order.phone.includes(query) ||
          order.payment_method.toLowerCase().includes(query) ||
          formatDate(order.order_date).toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [orders, activeTab, searchQuery]);

  const handleTrackOrder = async (order) => {
    setTrackingLoading(true);
    setModalOpen(true);

    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders`);
      const fullOrder = res.data.find(o => (o._id?.$oid || o._id) === order.orderId);

      if (!fullOrder) throw new Error('Order not found');

      setSelectedOrder(fullOrder);
      toast({
        title: "Tracking Started",
        description: `Tracking order #${order.orderId.substring(0, 8)}...`,
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to load tracking info.",
        variant: "destructive"
      });
      setModalOpen(false);
    } finally {
      setTrackingLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const handleGenerateInvoice = async (order) => {
    try {
      const orderId = order.orderId;
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders`);
      const orderData = res.data.find(i => (i._id?.$oid || i._id) === orderId);

      if (!orderData) {
        toast({ title: "Error!", description: "Order not found.", variant: "destructive" });
        return;
      }

      const { shopName, shopAddress, shopContact, shopImage } = orderData.store_info || {};
      const isCOD = orderData.payment_method?.toLowerCase().includes('cash') || orderData.payment_method?.toLowerCase() === 'cod';
      const grandTotal = isCOD ? (orderData.amar_bikri_mullo - orderData.delivery_charge || 0) : (orderData.amar_bikri_mullo || 0);

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
      doc.text(`Shop: ${shopName || "N/A"}`, 14, 30);
      doc.text(`Address: ${shopAddress || "N/A"}`, 14, 38);
      doc.text(`Contact: ${shopContact || "N/A"}`, 14, 46);
      doc.line(14, 50, 196, 50);

      // Order Info
      doc.setFontSize(12);
      doc.setTextColor("#555555");
      doc.text(`Invoice ID: ${orderData._id?.$oid || orderData._id}`, 14, 58);
      doc.text(`Order Date: ${formatDate(orderData.order_date)}`, 14, 66);

      const delivery = orderData.delivery_details || {};
      doc.text(`Customer: ${delivery.name || "N/A"}`, 14, 74);
      doc.text(`Address: ${delivery.address || "N/A"}`, 14, 82);
      doc.text(`Phone: ${delivery.phone || "N/A"}`, 14, 90);
      doc.line(14, 95, 196, 95);

      // Items Table
      const tableColumn = ["Product Name", "Price", "Qty", "Size", "Subtotal"];
      const tableRows = [];

      const item = Array.isArray(orderData.items) && orderData.items.length === 1
        ? orderData.items[0]
        : { name: orderData.name, price: orderData.price, quantity: orderData.quantity || 1, size: orderData.size, amar_bikri_mullo: orderData.amar_bikri_mullo };

      const price = parseFloat(orderData.amar_bikri_mullo - (orderData.delivery_charge || 0) || 0);
      const quantity = parseFloat(item.quantity || 1);
      const subtotal = price + (orderData.delivery_charge || 0);

      tableRows.push([
        item.name || 'N/A',
        `${price.toFixed(2)} Tk`,
        quantity,
        `${item.size || 'N/A'}`,
        `${subtotal.toFixed(2)} Tk`
      ]);

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
        doc.text(`Grand Total: ${grandTotal.toFixed(2)} Tk`, 120, currentY + 10);
      }

      if (!isCOD) {
        doc.setFontSize(13);
        doc.setTextColor("#000000");
        doc.text(`Grand Total with Delivery Charge: ${grandTotal.toFixed(2)} Tk`, 60, currentY + 10);
      }

      doc.setFontSize(10);
      doc.setTextColor("#888888");
      doc.text("Thank you for shopping with UnicDropex!", 14, 285);

      doc.save(`Invoice_${orderData._id?.$oid || orderData._id}.pdf`);

      toast({ title: "Success!", description: "Invoice generated.", variant: "default" });
    } catch (error) {
      console.error("Invoice error:", error);
      toast({ title: "Error!", description: "Failed to generate invoice.", variant: "destructive" });
    }
  };

  if (loading) {
    return <Loader11 />;
  }

  return (
    <>
      <Helmet>
        <title>Order Tracking - UnicDropex</title>
      </Helmet>
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order Tracking Panel</h1>
          <p className="text-muted-foreground">Search and track your orders in real-time.</p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by Order ID, Product, Phone, Status..."
                className="pl-10 pr-10"
                onChange={handleSearchChange}
                defaultValue={searchQuery}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => {
                    setSearchQuery('');
                    debouncedSetSearch('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Found {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>
                  Total: {orders.length} | Showing: {filteredOrders.length}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                {activeTab === 'all' ? 'All Orders' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="returned">Returned</TabsTrigger>
                <TabsTrigger value="shipped">Shipped</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead className="text-right">Track</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                          const { variant, icon, label } = getStatusInfo(order.status);
                          return (
                            <TableRow key={order.orderId}>
                              <TableCell className="font-mono text-xs sm:text-sm">
                                #{order.orderId.substring(0, 8)}...
                              </TableCell>
                              <TableCell className="font-medium max-w-[150px] truncate">
                                {order.productName}
                              </TableCell>
                              <TableCell className="font-semibold">
                                ৳{order.grand_total || order.total}
                              </TableCell>
                              <TableCell>
                                <Badge variant={variant} className="flex items-center w-fit text-xs">
                                  {icon}
                                  {label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {formatDate(order.order_date)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  className="text-emerald-600 h-8"
                                  variant="link"
                                  size="sm"
                                  onClick={() => handleGenerateInvoice(order)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  Invoice
                                </Button>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleTrackOrder(order)}
                                  disabled={trackingLoading}
                                >
                                  {trackingLoading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
                                  Track
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-16">
                            <div className="flex flex-col items-center">
                              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground text-lg font-medium">
                                {searchQuery ? 'No orders match your search.' : 'No orders found'}
                              </p>
                              {searchQuery && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => {
                                    setSearchQuery('');
                                    debouncedSetSearch('');
                                  }}
                                >
                                  Clear search
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tracking Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Tracking Details</DialogTitle>
              <DialogDescription>
                Order #{selectedOrder?._id?.$oid?.substring(0, 8) || selectedOrder?._id?.substring(0, 8) || ''}...
              </DialogDescription>
            </DialogHeader>

            {trackingLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : selectedOrder ? (
              <div className="space-y-6 pt-4">
                {/* Summary */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Order Summary</h3>
                    <Badge variant={getStatusInfo(selectedOrder.status).variant}>
                      {getStatusInfo(selectedOrder.status).label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Order ID:</span> <p className="font-mono">#{selectedOrder._id?.$oid || selectedOrder._id}</p></div>
                    <div><span className="text-muted-foreground">Date:</span> <p>{formatDate(selectedOrder.order_date)}</p></div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Product:</span>
                      <p className="font-medium">
                        {selectedOrder.name || (selectedOrder.items?.[0]?.name) || 'N/A'} x {selectedOrder.quantity || selectedOrder.items?.[0]?.quantity || 1}
                      </p>
                    </div>
                    <div><span className="text-muted-foreground">Total:</span> <p className="font-semibold">৳{selectedOrder.amar_bikri_mullo || selectedOrder.grand_total || 0}</p></div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> Delivery Info</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> <p>{selectedOrder.delivery_details?.name || 'N/A'}</p></div>
                    <div><span className="text-muted-foreground">Phone:</span> <p>{selectedOrder.delivery_details?.phone || 'N/A'}</p></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <p>{selectedOrder.delivery_details?.address || 'N/A'}</p></div>
                  </div>
                </div>

                {/* Tracking Steps */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2"><Truck className="h-4 w-4" /> Delivery Status</h4>
                  <div className="relative space-y-2">
                    {(() => {
                      const status = selectedOrder.status?.trim().toLowerCase();
                      const steps = [
                        { step: 'Order Placed', icon: Clock, completed: true },
                        { step: 'Processing', icon: Package, completed: status !== 'pending' },
                        { step: 'Shipped', icon: Truck, completed: ['shipped', 'delivered', 'returned'].includes(status) },
                        { step: 'Delivered', icon: CheckCheck, completed: status === 'delivered' },
                      ];
                      if (status === 'returned') steps.push({ step: 'Returned', icon: RefreshCcw, completed: true });
                      return steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            <s.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{s.step}</p>
                            <p className="text-xs text-muted-foreground">{s.completed ? 'Completed' : 'Pending'}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Payment */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3"><CreditCard className="h-4 w-4" /> Payment Info</h4>
                  <div className="text-sm space-y-2">
                    <p><span className="font-medium">Method:</span> {selectedOrder.payment_method?.toUpperCase() || 'N/A'}</p>
                    <p><span className="font-medium">Txn ID:</span> {selectedOrder.tnx_id || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>Close</Button>
                  {selectedOrder.trackingLink && (
                    <Button asChild className="flex-1">
                      <a href={selectedOrder.trackingLink} target="_blank" rel="noopener noreferrer">
                        External Tracking
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default OrderTrackingDashboardPage;