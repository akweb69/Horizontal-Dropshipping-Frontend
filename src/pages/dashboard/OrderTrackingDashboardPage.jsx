import React, { useEffect, useState } from 'react';
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
    Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Custom Skeleton Component (Fallback)
const Skeleton = ({ className = "h-4 w-full bg-gray-200 rounded animate-pulse", ...props }) => {
    return <div className={className} {...props} />;
};

const OrderTrackingDashboardPage = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    // Process orders data to handle both single and multiple items
    const processOrdersData = (rawOrders) => {
        const processed = [];

        rawOrders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                // Multiple items order
                order.items.forEach((item) => {
                    processed.push({
                        orderId: order._id?.$oid || order._id || `LD-${Date.now()}`,
                        productId: item.productId,
                        productName: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        subtotal: item.subtotal,
                        total: order.total,
                        status: order.status || 'pending',
                        payment_method: order.payment_method || 'bkash',
                        payment_number: order.payment_number,
                        tnx_id: order.tnx_id,
                        amount: order.amount,
                        order_date: order.order_date,
                        email: order.email,
                        type: 'multiple',
                        trackingLink: order.trackingLink,
                        itemsCount: order.items.length
                    });
                });
            } else {
                // Single item order
                processed.push({
                    orderId: order._id?.$oid || order._id || `LD-${Date.now()}`,
                    productId: order.productId,
                    productName: order.name,
                    price: order.price,
                    quantity: order.quantity || 1,
                    total: order.total,
                    status: order.status || 'pending',
                    payment_method: order.payment_method || 'bkash',
                    payment_number: order.payment_number,
                    tnx_id: order.tnx_id,
                    amount: order.amount,
                    order_date: order.order_date,
                    email: order.email,
                    type: 'single',
                    trackingLink: order.trackingLink,
                    itemsCount: 1
                });
            }
        });

        return processed;
    };

    useEffect(() => {
        loadOrders();
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
                    title: "ত্রুটি!",
                    description: "অর্ডার লোড করতে সমস্যা হয়েছে।",
                    variant: "destructive"
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'তারিখ উপলব্ধ নেই';
        }
    };

    const getStatusInfo = (status) => {
        const normalizedStatus = status?.trim();
        let variant = 'default';
        let icon = <Clock className="h-4 w-4 mr-2" />;
        let label = normalizedStatus || 'অজানা';

        switch (normalizedStatus) {
            case 'Shipped':
                variant = 'warning';
                icon = <Truck className="h-4 w-4 mr-2" />;
                label = 'পাঠানো হয়েছে';
                break;
            case 'Delivered':
                variant = 'success';
                icon = <CheckCheck className="h-4 w-4 mr-2" />;
                label = 'ডেলিভারি হয়েছে';
                break;
            case 'Processing':
                variant = 'info';
                icon = <Package className="h-4 w-4 mr-2" />;
                label = 'প্রসেসিং চলছে';
                break;
            case 'Returned':
                variant = 'destructive';
                icon = <RefreshCcw className="h-4 w-4 mr-2" />;
                label = 'রিটার্ন';
                break;
            case 'pending':
            case 'Pending':
                variant = 'default';
                icon = <Clock className="h-4 w-4 mr-2" />;
                label = 'অপেক্ষমাণ';
                break;
            default:
                variant = 'default';
                icon = <Clock className="h-4 w-4 mr-2" />;
                label = normalizedStatus || 'অজানা';
        }

        return { variant, icon, label };
    };

    const filteredOrders = orders.filter(order => {
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

    const handleTrackOrder = async (order) => {
        const status = order.status?.trim();

        setTrackingLoading(true);
        setSelectedOrder(order);
        setModalOpen(true);

        // Simulate tracking API call
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            toast({
                title: `ট্র্যাকিং শুরু`,
                description: `অর্ডার #${order.orderId.substring(0, 8)}... ট্র্যাক করা হচ্ছে।`,
            });
        } catch (error) {
            toast({
                title: "ত্রুটি!",
                description: "ট্র্যাকিং তথ্য লোড করতে সমস্যা হয়েছে।",
                variant: "destructive"
            });
        } finally {
            setTrackingLoading(false);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedOrder(null);
    };

    // Loading Component
    const LoadingSkeleton = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Card>
                <CardHeader className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-80" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-64" />
                                </div>
                                <Skeleton className="h-10 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <>
            <Helmet>
                <title>অর্ডার ট্র্যাকিং - LetsDropship</title>
            </Helmet>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">অর্ডার ট্র্যাকিং প্যানেল</h1>
                    <p className="text-muted-foreground">আপনার সকল অর্ডারের বর্তমান অবস্থা দেখুন।</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>আপনার অর্ডারসমূহ</CardTitle>
                        <CardDescription>
                            মোট অর্ডার: {orders.length} | সক্রিয়: {filteredOrders.length}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="all">সকল ({orders.length})</TabsTrigger>
                                <TabsTrigger value="delivered">ডেলিভারি</TabsTrigger>
                                <TabsTrigger value="processing">প্রসেসিং</TabsTrigger>
                                <TabsTrigger value="returned">রিটার্ন</TabsTrigger>
                                <TabsTrigger value="shipped">শিপড</TabsTrigger>
                            </TabsList>
                            <TabsContent value={activeTab} className="mt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>অর্ডার আইডি</TableHead>
                                            <TableHead>পণ্য</TableHead>
                                            <TableHead>মোট</TableHead>
                                            <TableHead>স্ট্যাটাস</TableHead>
                                            <TableHead>তারিখ</TableHead>
                                            <TableHead className="text-right">ট্র্যাকিং</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.length > 0 ? (
                                            filteredOrders.map((order) => {
                                                const { variant, icon, label } = getStatusInfo(order.status);
                                                return (
                                                    <TableRow key={order.orderId}>
                                                        <TableCell className="font-mono">
                                                            <div>
                                                                <p className="font-medium">
                                                                    #{order.orderId.substring(0, 8)}...
                                                                </p>
                                                                {order.itemsCount > 1 && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {order.itemsCount} আইটেম
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium max-w-xs">
                                                            {order.productName}
                                                        </TableCell>
                                                        <TableCell className="font-semibold">
                                                            ৳{order.total || order.subtotal}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={variant} className="flex items-center w-fit">
                                                                {icon}
                                                                {label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {formatDate(order.order_date)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleTrackOrder(order)}

                                                            >
                                                                {trackingLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                                ট্র্যাক করুন
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12">
                                                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                                    <p className="text-muted-foreground text-lg">
                                                        কোনো অর্ডার পাওয়া যায়নি
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {activeTab === 'all' ? 'আপনার অর্ডার এখানে দেখাবে।' :
                                                            `${getStatusInfo(activeTab === 'processing' ? 'Processing' : activeTab)?.label || activeTab} অর্ডার নেই।`}
                                                    </p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Tracking Modal */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span>অর্ডার ট্র্যাকিং বিস্তারিত</span>
                                <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="h-4 w-4" />
                                </button>
                            </DialogTitle>
                            <DialogDescription>
                                অর্ডার #{selectedOrder?.orderId?.substring(0, 8)}... এর ট্র্যাকিং তথ্য
                            </DialogDescription>
                        </DialogHeader>

                        {selectedOrder && (
                            <div className="space-y-6 pt-4">
                                {/* Order Summary */}
                                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">অর্ডার সারাংশ</h3>
                                        <Badge variant={getStatusInfo(selectedOrder.status).variant}>
                                            {getStatusInfo(selectedOrder.status).label}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">অর্ডার আইডি:</span>
                                            <p className="font-mono">#{selectedOrder.orderId}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">তারিখ:</span>
                                            <p>{formatDate(selectedOrder.order_date)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">পণ্য:</span>
                                            <p className="font-medium">{selectedOrder.productName}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">মোট:</span>
                                            <p className="font-semibold">৳{selectedOrder.total}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Steps */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        ডেলিভারি স্ট্যাটাস
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { step: 'অর্ডার নেওয়া হয়েছে', status: 'pending', completed: true },
                                            { step: 'প্রসেসিং', status: 'Processing', completed: selectedOrder.status !== 'pending' && selectedOrder.status !== 'Pending' },
                                            { step: 'শিপিং', status: 'Shipped', completed: ['Shipped', 'Delivered'].includes(selectedOrder.status) },
                                            { step: 'ডেলিভারি সম্পন্ন', status: 'Delivered', completed: selectedOrder.status === 'Delivered' }
                                        ].map((step, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step.completed
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {step.completed ? '✓' : index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{step.step}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {step.completed ? 'সম্পন্ন' : 'অপেক্ষমাণ'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                                        <CreditCard className="h-4 w-4" />
                                        পেমেন্ট তথ্য
                                    </h4>
                                    <div className="text-sm space-y-2">
                                        <p><span className="font-medium">পদ্ধতি:</span> {selectedOrder.payment_method?.toUpperCase()}</p>
                                        <p><span className="font-medium">ট্রানজেকশন ID:</span> {selectedOrder.tnx_id}</p>
                                        <p><span className="font-medium">পেমেন্ট নম্বর:</span> {selectedOrder.payment_number}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <Button variant="outline" className="flex-1" onClick={closeModal}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        বন্ধ করুন
                                    </Button>
                                    {selectedOrder.trackingLink && (
                                        <Button asChild className="flex-1">
                                            <a
                                                href={selectedOrder.trackingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1"
                                            >
                                                বাহ্যিক ট্র্যাকিং
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default OrderTrackingDashboardPage;