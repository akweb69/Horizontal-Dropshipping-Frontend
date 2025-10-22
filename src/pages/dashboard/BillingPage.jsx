import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { NavLink } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Download,
    Package,
    ShoppingCart,
    CheckCircle,
    Clock,
    CreditCard
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

const BillingPage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [billingData, setBillingData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) {
            setLoading(false);
            return;
        }
        loadBillingData();
    }, [user?.email]);

    const loadBillingData = async () => {
        setLoading(true);
        try {
            // Fetch package orders
            const packageResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/buy-package`);
            const packageOrders = packageResponse.data || [];

            // Fetch regular orders
            const ordersResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders`);
            const orders = ordersResponse.data || [];

            // Filter approved package orders (packageStatus: "Approved")
            const approvedPackages = packageOrders.filter(pkg =>
                pkg.email === user.email && pkg.packageStatus === 'Approved'
            );

            // Filter approved regular orders (status: "Approved" or "Delivered")
            const approvedOrders = orders.filter(order => {
                // Handle both single item and multiple items orders
                const orderEmail = order.email;
                const orderStatus = order.status;

                return orderEmail === user.email &&
                    (orderStatus === 'Approved' || orderStatus === 'Delivered');
            });

            // Process package orders
            const processedPackages = approvedPackages.map(pkg => ({
                id: pkg._id?.$oid || pkg._id,
                type: 'package',
                invoice: `PKG-${pkg._id?.$oid?.substring(0, 8) || 'N/A'}`,
                planName: pkg.planName,
                amount: pkg.amount,
                paymentMethod: pkg.paymentMethod,
                transactionId: pkg.transactionId,
                paymentNumber: pkg.paymentNumber,
                date: pkg.timestamp,
                status: pkg.packageStatus
            }));

            // Process regular orders
            const processedOrders = approvedOrders.map(order => {
                let invoiceId, productName, totalAmount;

                if (order.items && Array.isArray(order.items)) {
                    // Multiple items order
                    invoiceId = `ORD-${order._id?.$oid?.substring(0, 8) || 'N/A'}`;
                    productName = `${order.items.length}টি পণ্য`;
                    totalAmount = order.total;
                } else {
                    // Single item order
                    invoiceId = `ORD-${order._id?.$oid?.substring(0, 8) || 'N/A'}`;
                    productName = order.name;
                    totalAmount = order.total || order.amount;
                }

                return {
                    id: order._id?.$oid || order._id,
                    type: 'order',
                    invoice: invoiceId,
                    productName,
                    amount: totalAmount,
                    paymentMethod: order.payment_method?.toUpperCase() || 'N/A',
                    transactionId: order.tnx_id,
                    paymentNumber: order.payment_number,
                    date: order.order_date || order.timestamp,
                    status: order.status
                };
            });

            // Combine and sort by date (newest first)
            const combinedData = [...processedPackages, ...processedOrders]
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setBillingData(combinedData);
        } catch (error) {
            console.error('Error loading billing data:', error);
            toast({
                title: "ত্রুটি!",
                description: "বিলিং ডেটা লোড করতে সমস্যা হয়েছে।",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
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

    const getStatusBadge = (status, type) => {
        const displayStatus = status === 'Approved' || status === 'Delivered' ? 'পেইড' : status;
        const variant = status === 'Approved' || status === 'Delivered' ? 'success' : 'secondary';

        return (
            <Badge variant={variant} className="flex items-center">
                {status === 'Approved' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                {displayStatus}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">বিলিং ডেটা লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    const { plan, validUntil } = user.subscription || {};

    return (
        <>
            <Helmet>
                <title>বিলিং ও সাবস্ক্রিপশন - LetsDropship</title>
            </Helmet>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">বিলিং ও সাবস্ক্রিপশন</h1>
                    <p className="text-muted-foreground">আপনার সাবস্ক্রিপশন প্ল্যান এবং অনুমোদিত লেনদেনের ইতিহাস দেখুন।</p>
                </div>

                {/* Current Plan Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>আপনার বর্তমান প্ল্যান</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border rounded-lg bg-primary/5">
                            <div>
                                <h3 className="text-xl font-bold text-primary">{plan || 'No Plan'}</h3>
                                {validUntil && (
                                    <p className="text-muted-foreground">আপনার প্ল্যানটি {new Date(new Date(validUntil).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })} পর্যন্ত বৈধ।</p>
                                )}
                            </div>
                            <Button asChild className="mt-4 sm:mt-0">
                                <NavLink to="/membership">প্ল্যান আপগ্রেড করুন</NavLink>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing History */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>অনুমোদিত লেনদেনের ইতিহাস</CardTitle>
                            <CardDescription>
                                আপনার অনুমোদিত প্যাকেজ ক্রয় এবং অর্ডারসমূহ।
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={loadBillingData} size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                রিফ্রেশ
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {billingData.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ইনভয়েস</TableHead>
                                        <TableHead>টাইপ</TableHead>
                                        <TableHead>বিবরণ</TableHead>
                                        <TableHead>পরিমাণ</TableHead>
                                        <TableHead>পেমেন্ট পদ্ধতি</TableHead>
                                        <TableHead>স্ট্যাটাস</TableHead>
                                        <TableHead>তারিখ</TableHead>
                                        {/* <TableHead className="text-right">অ্যাকশন</TableHead> */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {billingData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono font-medium">
                                                {item.invoice}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {item.type === 'package' ? (
                                                        <Package className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <ShoppingCart className="h-3 w-3 mr-1" />
                                                    )}
                                                    {item.type === 'package' ? 'প্যাকেজ' : 'অর্ডার'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                {item.type === 'package' ? (
                                                    <div className="font-medium">{item.planName}</div>
                                                ) : (
                                                    <div>{item.productName}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                ৳{item.amount}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    <CreditCard className="h-3 w-3 mr-1" />
                                                    {item.paymentMethod}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(item.status, item.type)}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(item.date)}
                                            </TableCell>
                                            {/* <TableCell className="text-right">
                                                <Button variant="outline" size="sm" disabled>
                                                    <Download className="h-4 w-4 mr-1" />
                                                    ডাউনলোড
                                                </Button>
                                            </TableCell> */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                                    কোনো অনুমোদিত লেনদেন পাওয়া যায়নি
                                </h3>
                                <p className="text-muted-foreground">
                                    আপনার অনুমোদিত প্যাকেজ ক্রয় বা অর্ডার এখানে দেখাবে।
                                </p>
                                <div className="mt-4">
                                    <NavLink to="/membership" className="text-primary hover:underline">
                                        প্ল্যান কিনুন
                                    </NavLink>
                                    {' | '}
                                    <NavLink to="/products" className="text-primary hover:underline">
                                        অর্ডার করুন
                                    </NavLink>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Summary */}
                {billingData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>সারাংশ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-primary">
                                        {billingData.filter(item => item.type === 'package').length}
                                    </div>
                                    <p className="text-sm text-muted-foreground">প্যাকেজ ক্রয়</p>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold text-primary">
                                        {billingData.filter(item => item.type === 'order').length}
                                    </div>
                                    <p className="text-sm text-muted-foreground">অর্ডার</p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
};

export default BillingPage;