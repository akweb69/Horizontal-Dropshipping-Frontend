
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/components/ui/use-toast';
import { Package, Truck, CheckCheck, RefreshCcw } from 'lucide-react';

const orders = [
    { orderId: "LD-1024", product: "Wireless Bluetooth Earbuds", status: "Shipped", trackingLink: "#" },
    { orderId: "LD-1023", product: "Men's Premium T-Shirt", status: "Delivered", trackingLink: "#" },
    { orderId: "LD-1022", product: "Smart Watch", status: "Processing", trackingLink: "#" },
    { orderId: "LD-1021", product: "Women's Summer Dress", status: "Returned", trackingLink: "#" },
];

const getStatusInfo = (status) => {
    switch (status) {
        case 'Shipped': return { variant: 'warning', icon: <Truck className="h-4 w-4 mr-2"/> };
        case 'Delivered': return { variant: 'success', icon: <CheckCheck className="h-4 w-4 mr-2"/> };
        case 'Processing': return { variant: 'info', icon: <Package className="h-4 w-4 mr-2"/> };
        case 'Returned': return { variant: 'destructive', icon: <RefreshCcw className="h-4 w-4 mr-2"/>};
        default: return { variant: 'default', icon: null };
    }
};

const OrderTrackingDashboardPage = () => {
    const { toast } = useToast();

    const handleTrackOrder = (orderId) => {
        toast({
            title: `অর্ডার ট্র্যাকিং`,
            description: `অর্ডার #${orderId} এর ট্র্যাকিং পেজ দেখানো হচ্ছে। (সিমুলেটেড)`,
        });
    };

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
                        <CardDescription>এখানে আপনার সাম্প্রতিক অর্ডারগুলো তালিকাভুক্ত করা হয়েছে।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>অর্ডার আইডি</TableHead>
                                    <TableHead>পণ্য</TableHead>
                                    <TableHead>স্ট্যাটাস</TableHead>
                                    <TableHead className="text-right">ট্র্যাকিং</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => {
                                    const { variant, icon } = getStatusInfo(order.status);
                                    return (
                                    <TableRow key={order.orderId}>
                                        <TableCell className="font-mono">{order.orderId}</TableCell>
                                        <TableCell className="font-medium">{order.product}</TableCell>
                                        <TableCell>
                                            <Badge variant={variant} className="flex items-center w-fit">
                                                {icon}
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleTrackOrder(order.orderId)}
                                                disabled={order.status === 'Processing'}
                                            >
                                                ট্র্যাক করুন
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default OrderTrackingDashboardPage;
