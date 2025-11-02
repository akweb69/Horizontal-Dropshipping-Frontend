import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, PlusCircle, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Loader11 from '../../components/layout/Loader11';

const MyProductsPage = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [importedProducts, setImportedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Process orders data to handle both single and multiple items
    const processOrdersData = (orders) => {
        const processed = [];

        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                // Multiple items order
                order.items.forEach(item => {
                    processed.push({
                        _id: order._id,
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        subtotal: item.subtotal,
                        total: order.total,
                        status: order.status,
                        payment_method: order.payment_method,
                        payment_number: order.payment_number,
                        tnx_id: order.tnx_id,
                        amount: order.amount,
                        order_date: order.order_date,
                        email: order.email,
                        mySellPrice: order.amar_bikri_mullo,
                        deliveryCharge: order.delivery_charge,
                        type: 'multiple'
                    });
                });
            } else {
                // Single item order
                processed.push({
                    _id: order._id,
                    productId: order.productId,
                    name: order.name,
                    price: order.price,
                    quantity: order.quantity,
                    total: order.total,
                    status: order.status,
                    payment_method: order.payment_method,
                    payment_number: order.payment_number,
                    tnx_id: order.tnx_id,
                    amount: order.amount,
                    order_date: order.order_date,
                    email: order.email,
                    type: 'single',
                    mySellPrice: order.amar_bikri_mullo,
                    deliveryCharge: order.delivery_charge
                });
            }
        });

        return processed;
    };

    useEffect(() => {
        setLoading(true);
        axios.get(`${import.meta.env.VITE_BASE_URL}/orders`)
            .then(res => {
                const data = res.data;
                const userOrders = data.filter(item => item.email === user?.email);
                const processedData = processOrdersData(userOrders);
                setImportedProducts(processedData);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                toast({
                    title: "ত্রুটি!",
                    description: "ডেটা লোড করতে সমস্যা হয়েছে।",
                    variant: "destructive"
                });
                setLoading(false);
            });
    }, [user?.email, toast]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'success';
            case 'returned':
                return 'destructive';
            case 'pending':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const handleViewOrder = (order) => {
        toast({
            title: "অর্ডার দেখা হচ্ছে",
            description: `${order.name} এর বিস্তারিত তথ্য দেখা হচ্ছে।`,
        });
        // Here you can navigate to order details or open modal
        console.log('Order details:', order);
    };

    if (loading) {
        return (
            <Loader11></Loader11>
        );
    }

    return (
        <>
            <Helmet>
                <title>আমার পণ্য - UnicDropex</title>
            </Helmet>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">আমার পণ্য</h1>
                    <p className="text-muted-foreground">আপনার ইম্পোর্ট করা পণ্য এবং অর্ডার দেখুন।</p>
                </div>

                <Tabs defaultValue="imported">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="imported">আমার ইম্পোর্ট করা পণ্য</TabsTrigger>

                    </TabsList>

                    <TabsContent value="imported">
                        <Card>
                            <CardHeader>
                                <CardTitle>আমার ইম্পোর্ট করা পণ্য</CardTitle>
                                <CardDescription>
                                    আপনার দোকানে যে পণ্যগুলো ইম্পোর্ট করেছেন তা পরিচালনা করুন।
                                    মোট পণ্য: {importedProducts.length}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>পণ্যের নাম</TableHead>
                                            <TableHead>ক্রয় মূল্য</TableHead>
                                            <TableHead>পরিমাণ</TableHead>
                                            <TableHead>সাবটোটাল</TableHead>
                                            <TableHead>বিক্রয় মূল্য</TableHead>
                                            <TableHead>লাভ</TableHead>
                                            <TableHead>স্ট্যাটাস</TableHead>
                                            <TableHead>অর্ডার তারিখ</TableHead>
                                            <TableHead>পেমেন্ট</TableHead>

                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {importedProducts.length > 0 ? (
                                            importedProducts.map((product, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell className="font-semibold">৳{product.price}</TableCell>
                                                    <TableCell>{product.quantity}</TableCell>
                                                    <TableCell className="font-semibold">৳{product.subtotal || product.total}</TableCell>
                                                    {/* bikroy mullo  */}
                                                    <TableCell className="font-medium">{product.mySellPrice - product.deliveryCharge}</TableCell>

                                                    <TableCell className="font-medium">{product.mySellPrice - (product.subtotal + product.deliveryCharge)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusVariant(product.status)}>
                                                            {product.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {formatDate(product.order_date)}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <div>
                                                            <p className="font-medium">{product.payment_method}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {product.payment_number}
                                                            </p>
                                                        </div>
                                                    </TableCell>

                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8">
                                                    কোনো ইম্পোর্ট করা পণ্য পাওয়া যায়নি।
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* <TabsContent value="browse">
                        <Card>
                            <CardHeader>
                                <CardTitle>পণ্য ব্রাউজ করুন</CardTitle>
                                <CardDescription>আপনার দোকানে যুক্ত করার জন্য নতুন পণ্য খুঁজুন।</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between gap-4 mb-6">
                                    <div className="relative w-full max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="পণ্য খুঁজুন..." className="pl-10" />
                                    </div>
                                    <Button>ফিল্টার</Button>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-muted-foreground">ব্রাউজ সেকশন এখনো ইমপ্লিমেন্ট করা হয়নি।</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent> */}
                </Tabs>
            </div>
        </>
    );
};

export default MyProductsPage;