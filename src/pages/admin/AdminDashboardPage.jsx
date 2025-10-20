import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Truck, CheckCircle, RefreshCw } from 'lucide-react';
import { Bar, BarChart as ReBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const StatCard = ({ title, value, icon, description, isLoading }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
    >
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    <>
                        <motion.div
                            className="text-2xl font-bold"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            {value ?? '0'}
                        </motion.div>
                        <motion.p
                            className="text-xs text-muted-foreground"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
                            {description}
                        </motion.p>
                    </>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

const getStatusVariant = (status) => {
    switch (status) {
        case 'Shipped': return 'warning';
        case 'Delivered': return 'success';
        case 'Processing': return 'info';
        case 'Returned': return 'destructive';
        default: return 'default';
    }
};

const AdminDashboardPage = () => {
    const [stats, setStats] = useState({
        totalUsers: null,
        totalOrders: null,
        shippedOrders: null,
        deliveredOrders: null,
        returnedOrders: null,
        totalSales: null,
        returnOrderAmount: null,
        pendingOrderAmount: null,
        deliveredOrderAmount: null
    });
    const [salesData, setSalesData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState({
        stats: true,
        sales: true,
        orders: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`);
                const usersCount = usersResponse?.data?.length ?? 0;

                const ordersResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders`);
                const orders = ordersResponse?.data ?? [];

                const shippedOrders = orders?.filter(order => order?.status === 'Shipped')?.length ?? 0;
                const deliveredOrders = orders?.filter(order => order?.status === 'Delivered')?.length ?? 0;
                const returnedOrders = orders?.filter(order => order?.status === 'Returned')?.length ?? 0;
                const totalSales = orders?.reduce((acc, order) => acc + (order?.items_total ?? 0), 0) ?? 0;
                const returnOrderAmount = orders?.filter(order => order?.status === 'Returned')?.reduce((acc, order) => acc + (order?.items_total ?? 0), 0) ?? 0;
                const pendingOrderAmount = orders?.filter(order => order?.status === 'Processing' || order?.status === 'pending')?.reduce((acc, order) => acc + (order?.items_total ?? 0), 0) ?? 0;
                const deliveredOrderAmount = orders?.filter(order => order?.status === 'Delivered' || order?.status === 'Shipped')?.reduce((acc, order) => acc + (order?.items_total ?? 0), 0) ?? 0;

                setStats({
                    totalUsers: usersCount,
                    totalOrders: orders?.length ?? 0,
                    shippedOrders,
                    deliveredOrders,
                    returnedOrders,
                    totalSales,
                    returnOrderAmount,
                    pendingOrderAmount,
                    deliveredOrderAmount
                });

                const monthlySales = [
                    { name: 'জান', sales: 0 }, { name: 'ফেব্রু', sales: 0 }, { name: 'মার্চ', sales: 0 },
                    { name: 'এপ্রিল', sales: 0 }, { name: 'মে', sales: 0 }, { name: 'জুন', sales: 0 },
                    { name: 'জুলাই', sales: 0 }, { name: 'আগস্ট', sales: 0 }, { name: 'সেপ্ট', sales: 0 },
                    { name: 'অক্টো', sales: 0 }, { name: 'নভে', sales: 0 }, { name: 'ডিসে', sales: 0 }
                ];

                orders?.forEach(order => {
                    const date = new Date(order?.createdAt);
                    const monthIndex = date?.getMonth?.() ?? 0;
                    if (monthlySales[monthIndex]) {
                        monthlySales[monthIndex].sales += order?.total ?? 0;
                    }
                });

                setSalesData(monthlySales);

                const recent = orders
                    ?.slice?.(0, 5)
                    ?.map(order => ({
                        id: order?._id,
                        customer: order?.email ?? 'Unknown',
                        total: order?.total ?? 0,
                        status: order?.status ?? 'Unknown'
                    })) ?? [];

                setRecentOrders(recent);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading({
                    stats: false,
                    sales: false,
                    orders: false
                });
            }
        };

        fetchData();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Helmet>
                <title>অ্যাডমিন ড্যাশবোর্ড</title>
                <meta name="description" content="ওয়েবসাইটের সম্পূর্ণ ওভারভিউ এবং পরিসংখ্যান।" />
            </Helmet>
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">অ্যাডমিন ড্যাশবোর্ড</h1>
                    <p className="text-muted-foreground">আপনার ব্যবসার একটি সম্পূর্ণ চিত্র দেখুন।</p>
                </motion.div>

                <motion.div
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                >
                    <StatCard
                        title="মোট ব্যবহারকারী"
                        value={stats?.totalUsers}
                        icon={<Users className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.totalUsers > 0 ? `+${stats?.totalUsers} এই মাসে` : 'কোনো ব্যবহারকারী নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="মোট অর্ডার"
                        value={stats?.totalOrders}
                        icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.totalOrders > 0 ? `+${stats?.totalOrders} এই মাসে` : 'কোনো অর্ডার নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="শিপমেন্টে থাকা অর্ডার"
                        value={stats?.shippedOrders}
                        icon={<Truck className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.shippedOrders > 0 ? `+${stats?.shippedOrders} আজ শিপড হয়েছে` : 'কোনো শিপড অর্ডার নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="সফল ডেলিভারি"
                        value={stats?.deliveredOrders}
                        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.deliveredOrders > 0 ? `${(stats?.deliveredOrders / stats?.totalOrders * 100).toFixed(2)}% সফলতার হার` : 'কোনো ডেলিভারি নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="রিটার্ন অর্ডার"
                        value={stats?.returnedOrders}
                        icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.returnedOrders > 0 ? `${(stats?.returnedOrders / stats?.totalOrders * 100).toFixed(2)}% রিটার্ন হার` : 'কোনো রিটার্ন অর্ডার নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="মোট অর্ডার টাকার পরিমাণ"
                        value={`৳ ${stats?.totalSales}`}
                        icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.totalSales > 0 ? `৳${stats?.totalSales} এই মাসে` : 'কোনো অর্ডার নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="মোট রিটার্ন অর্ডার টাকার পরিমাণ"
                        value={`৳ ${stats?.returnOrderAmount}`}
                        icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.returnOrderAmount > 0 ? `৳${stats?.returnOrderAmount} এই মাসে রিটার্ন হয়েছে` : 'কোনো রিটার্ন অর্ডার নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="পেন্ডিং অর্ডার"
                        value={`৳ ${stats?.pendingOrderAmount}`}
                        icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.pendingOrderAmount > 0 ? `৳${stats?.pendingOrderAmount} এই মাসে পেন্ডিং হয়েছে` : 'কোনো পেন্ডিং অর্ডার নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="ডেলিভারি"
                        value={`৳ ${stats?.deliveredOrderAmount}`}
                        icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.deliveredOrderAmount > 0 ? `৳${stats?.deliveredOrderAmount} এই মাসে ডেলিভারি হয়েছে` : 'কোনো ডেলিভারি অর্ডার নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="মোট ব্যবহারকারী ব্যালান্স"
                        value={`৳ ${stats?.totalSales}`}
                        icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.totalSales > 0 ? `৳${stats?.totalSales} এই মাসে ব্যবহারকারীদের ব্যালান্স` : 'কোনো ব্যবহারকারী নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="মোট ব্যাংক রিকোয়েস্ট"
                        value={`৳ ${stats?.totalWithdrawRequest ?? 0}`}
                        icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.totalWithdrawRequest > 0 ? `৳${stats?.totalWithdrawRequest} এই মাসে ব্যাংক রিকোয়েস্ট হয়েছে` : 'কোনো ব্যাংক রিকোয়েস্ট নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="মোট ব্যাংক উত্তোলন"
                        value={`৳ ${stats?.totalWithdrawAmount ?? 0}`}
                        icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.totalWithdrawAmount > 0 ? `৳${stats?.totalWithdrawAmount} এই মাসে ব্যাংক উত্তোলন হয়েছে` : 'কোনো ব্যাংক উত্তোলন নেই'}
                        isLoading={isLoading.stats}
                    />
                    <StatCard
                        title="পেন্ডিং ব্যাংক উত্তোলন"
                        value={`৳ ${stats?.pendingWithdrawAmount ?? 0}`}
                        icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                        description={stats?.pendingWithdrawAmount > 0 ? `৳${stats?.pendingWithdrawAmount} এই মাসে পেন্ডিং হয়েছে` : 'কোনো পেন্ডিং ব্যাংক উত্তোলন নেই'}
                        isLoading={isLoading.stats}
                    />
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-5 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <motion.div
                        className="lg:col-span-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>মাসিক বিক্রয়</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading.sales ? (
                                    <div className="flex justify-center items-center h-[300px]">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ReBarChart data={salesData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip
                                                cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
                                                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                                            />
                                            <Legend />
                                            <motion.g>
                                                <Bar
                                                    dataKey="sales"
                                                    name="বিক্রয় (৳)"
                                                    fill="hsl(var(--primary))"
                                                    radius={[4, 4, 0, 0]}
                                                // Custom animation for bars
                                                // Note: Recharts doesn't directly support Framer Motion, so we animate the container
                                                />
                                            </motion.g>
                                        </ReBarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading.orders ? (
                                    <div className="flex justify-center items-center h-[200px]">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>গ্রাহক</TableHead>
                                                    <TableHead>স্ট্যাটাস</TableHead>
                                                    <TableHead className="text-right">মোট</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <AnimatePresence>
                                                    {recentOrders?.map?.((order, index) => (
                                                        <motion.tr
                                                            key={order?.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                                            whileHover={{ backgroundColor: 'hsl(var(--muted)/0.1)' }}
                                                        >
                                                            <TableCell>
                                                                <div className="font-medium">{order?.customer}</div>
                                                                <div className="text-sm text-muted-foreground">{order?.id}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={getStatusVariant(order?.status)}>{order?.status}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">৳{order?.total}</TableCell>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                        <motion.div
                                            className="mt-4 text-center"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: 0.5 }}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button asChild variant="outline" size="sm">
                                                    <Link to="/admin/orders">সব অর্ডার দেখুন</Link>
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboardPage;