import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Truck, CheckCircle, RefreshCw, DollarSign, TrendingUp } from 'lucide-react';
import { Bar, BarChart as ReBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// StatCard (অপরিবর্তিত)
const StatCard = ({ title, value, icon, description, isLoading, gradient }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.04 }}
    >
        <Card
            className={`bg-gradient-to-br ${gradient} text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 border-0`}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">{title}</CardTitle>
                <div className="bg-white/40 backdrop-blur-sm p-2 rounded-xl shadow-sm">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-700" />
                ) : (
                    <>
                        <motion.div
                            className="text-2xl font-bold text-gray-900"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            {value ?? '0'}
                        </motion.div>
                        <motion.p
                            className="text-xs text-gray-600 mt-1"
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
        deliveredOrderAmount: null,
        totalUserBalance: null
    });
    const [salesData, setSalesData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState({
        stats: true,
        sales: true,
        orders: true
    });
    const [withdrawStats, setWithdrawStats] = useState({
        totalWithdrawRequest: null,
        totalWithdrawAmount: null,
        pendingWithdrawAmount: null,
        completedWithdrawAmount: null
    });

    // all new data----> {(totalUB +  totalUB ) -(totalNW + totalNRW)}
    const [totalNW, setTotalNw] = useState(0)
    const [totalNRW, setTotalNRW] = useState(0)
    const [totalUB, setTotalUB] = useState(0)
    const [totalRB, setTotalRB] = useState(0)
    const [uiLoading, setUiLoading] = useState(true)
    // profit
    const [rejectedProfit, setRejectedProfit] = useState(0)
    const [pendingProfit, setPendingProfit] = useState(0)
    const [completedProfit, setCompletedProfit] = useState(0)
    const [totalAdminWithdraw, setTotalAdminWithdraw] = useState(0)
    const [subscriptionIncome, setSubscriptionIncome] = useState(0);
    // const [refferWithdraw, setRefferWithdraw] = useState(0);


    // const [netProfit, setNetProfit] = useState(0)
    // load all data---<
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/users`)
            .then(res => {
                const data = res.data
                const balance = data.reduce((acc, u) => acc + u?.referIncome, 0)
                setTotalRB(balance)
                console.log("balance", balance)
                setUiLoading(false)

            })
        axios.get(`${import.meta.env.VITE_BASE_URL}/orders`)
            .then(res => {
                const data = res.data
                const balance1 = data.filter(i => i.status === "Delivered").reduce((acc, i) => acc + i.amar_bikri_mullo, 0)
                const balance2 = data.filter(i => i.status === "Delivered").reduce((acc, i) => acc + i.grand_total, 0)

                // calculate profit
                const profit1 = data.filter(i => i.status === "Delivered").reduce((acc, i) => acc + i.profit, 0)

                const profit2 = data.filter(i => i.status === "pending").reduce((acc, i) => acc + i.profit, 0)

                const profit3 = data.filter(i => i.status === "Returned").reduce((acc, i) => acc + i.profit, 0)
                // set profit
                setCompletedProfit(profit1)
                setPendingProfit(profit2)
                setRejectedProfit(profit3)
                setNetProfit(profit1)






                const balance = balance1 - balance2
                setTotalUB(balance)

                console.log("balance", balance)
                setUiLoading(false)

            })
        // load admin withdraw data--->
        axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw_admin`)
            .then(res => {
                const data = res.data
                const balanceAdminWithdraw = data.reduce((acc, i) => acc + i?.amount, 0)
                setTotalAdminWithdraw(balanceAdminWithdraw)
            })
        axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw`)
            .then(res => {
                const data = res.data
                const balance = data.filter(i => i.status === "Approved").reduce((acc, i) => acc + i?.amount, 0)
                console.log("balance", balance)
                setTotalNw(balance)
                setUiLoading(false)

            })
        axios.get(`${import.meta.env.VITE_BASE_URL}/buy-package`)
            .then(res => {

                const data = res.data;
                setSubscriptionIncome(data.reduce((acc, order) => acc + order.amount, 0));
                console.log("--------->", data.reduce((acc, order) => acc + order.amount, 0));
            })
            .catch(err => {
                setError("Something went wrong!");
            });
        axios.get(`${import.meta.env.VITE_BASE_URL}/refer-withdraw`)
            .then(res => {
                const data = res.data
                const balance = data.filter(i => i.status === "Approved").reduce((acc, i) => acc + i.amount, 0)
                console.log("balance", balance)
                setTotalNRW(balance)
                setUiLoading(false)

            })
    }, [])




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

                const totalUserBalance = orders?.reduce((acc, user) => acc + (user?.amar_bikri_mullo ?? 0), 0) ?? 0;
                setStats({
                    totalUsers: usersCount,
                    totalOrders: orders?.length ?? 0,
                    shippedOrders,
                    deliveredOrders,
                    returnedOrders,
                    totalSales,
                    returnOrderAmount,
                    pendingOrderAmount,
                    deliveredOrderAmount,
                    totalUserBalance
                });

                const withdraws = await axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw`);
                const withdrawData = withdraws?.data ?? [];
                const totalWithdrawRequest = withdrawData?.length ?? 0;
                const totalWithdrawAmount = withdrawData?.reduce((acc, req) => acc + (req?.amount ?? 0), 0) ?? 0;
                const pendingWithdrawAmount = withdrawData?.filter(req => req?.status === 'Pending')?.reduce((acc, req) => acc + (req?.amount ?? 0), 0) ?? 0;
                const completedWithdrawAmount = withdrawData?.filter(req => req?.status === 'Approved')?.reduce((acc, req) => acc + (req?.amount ?? 0), 0) ?? 0;

                setWithdrawStats({
                    totalWithdrawRequest,
                    totalWithdrawAmount,
                    pendingWithdrawAmount,
                    completedWithdrawAmount
                });

                // ========== আপডেটেড: grand_total দিয়ে মাসিক বিক্রয় ==========
                const monthlySales = [
                    { name: 'জান', sales: 0 }, { name: 'ফেব্রু', sales: 0 }, { name: 'মার্চ', sales: 0 },
                    { name: 'এপ্রিল', sales: 0 }, { name: 'মে', sales: 0 }, { name: 'জুন', sales: 0 },
                    { name: 'জুলাই', sales: 0 }, { name: 'আগস্ট', sales: 0 }, { name: 'সেপ্ট', sales: 0 },
                    { name: 'অক্টো', sales: 0 }, { name: 'নভে', sales: 0 }, { name: 'ডিসে', sales: 0 }
                ];

                orders?.forEach(order => {
                    const date = new Date(order?.order_date || order?.createdAt);
                    const monthIndex = date?.getMonth?.() ?? 0;
                    if (monthlySales[monthIndex]) {
                        monthlySales[monthIndex].sales += order?.items_total ?? 0;
                    }
                });

                setSalesData(monthlySales);
                // =========================================================

                const recent = orders
                    ?.slice?.(0, 5)
                    ?.map(order => ({
                        id: order?._id,
                        customer: order?.email ?? 'Unknown',
                        total: order?.amar_bikri_mullo ?? 0,
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

    // Gradient, icons, statItems — সব অপরিবর্তিত
    const gradients = [
        "from-blue-100 via-blue-50 to-white",
        "from-purple-100 via-indigo-50 to-white",
        "from-cyan-100 via-teal-50 to-white",
        "from-green-100 via-emerald-50 to-white",
        "from-red-100 via-rose-50 to-white",
        "from-yellow-100 via-amber-50 to-white",
        "from-pink-100 via-rose-50 to-white",
        "from-orange-100 via-amber-50 to-white",
        "from-lime-100 via-green-50 to-white",
        "from-violet-100 via-purple-50 to-white",
        "from-rose-100 via-pink-50 to-white",
        "from-emerald-100 via-teal-50 to-white",
        "from-indigo-100 via-blue-50 to-white"
    ];

    const icons = [
        <Users className="h-5 w-5 text-blue-700" />,
        <ShoppingCart className="h-5 w-5 text-purple-700" />,
        <Truck className="h-5 w-5 text-cyan-700" />,
        <CheckCircle className="h-5 w-5 text-green-700" />,
        <RefreshCw className="h-5 w-5 text-red-700" />,
        <DollarSign className="h-5 w-5 text-yellow-700" />,
        <RefreshCw className="h-5 w-5 text-pink-700" />,
        <RefreshCw className="h-5 w-5 text-orange-700" />,
        <CheckCircle className="h-5 w-5 text-lime-700" />,
        <Users className="h-5 w-5 text-violet-700" />,
        <DollarSign className="h-5 w-5 text-rose-700" />,
        <DollarSign className="h-5 w-5 text-emerald-700" />,
        <RefreshCw className="h-5 w-5 text-indigo-700" />
    ];

    const statItems = [
        { title: "মোট ব্যবহারকারী", value: stats.totalUsers, desc: stats.totalUsers > 0 ? `+${stats.totalUsers} এই মাসে` : 'কোনো ব্যবহারকারী নেই' },
        { title: "মোট অর্ডার", value: stats.totalOrders, desc: stats.totalOrders > 0 ? `+${stats.totalOrders} এই মাসে` : 'কোনো অর্ডার নেই' },
        { title: "শিপমেন্টে থাকা অর্ডার", value: stats.shippedOrders, desc: stats.shippedOrders > 0 ? `+${stats.shippedOrders} আজ শিপড` : 'কোনো শিপড অর্ডার নেই' },
        { title: "সফল ডেলিভারি", value: stats.deliveredOrders, desc: stats.deliveredOrders > 0 ? `${(stats.deliveredOrders / stats.totalOrders * 100).toFixed(1)}% সফল` : 'কোনো ডেলিভারি নেই' },
        { title: "রিটার্ন অর্ডার", value: stats.returnedOrders, desc: stats.returnedOrders > 0 ? `${(stats.returnedOrders / stats.totalOrders * 100).toFixed(1)}% রিটার্ন` : 'কোনো রিটার্ন নেই' },
        { title: "মোট অর্ডার টাকা", value: `৳ ${stats.totalSales}`, desc: stats.totalSales > 0 ? `৳${stats.totalSales} এই মাসে` : 'কোনো বিক্রয় নেই' },
        { title: "রিটার্ন টাকা", value: `৳ ${stats.returnOrderAmount}`, desc: stats.returnOrderAmount > 0 ? `৳${stats.returnOrderAmount} রিফান্ড` : 'কোনো রিটার্ন নেই' },
        { title: "পেন্ডিং অর্ডার", value: `৳ ${stats.pendingOrderAmount}`, desc: stats.pendingOrderAmount > 0 ? `৳${stats.pendingOrderAmount} পেন্ডিং` : 'কোনো পেন্ডিং নেই' },
        { title: "ডেলিভার্ড টাকা", value: `৳ ${stats.deliveredOrderAmount}`, desc: stats.deliveredOrderAmount > 0 ? `৳${stats.deliveredOrderAmount} সফল` : 'কোনো ডেলিভারি নেই' },
        { title: "ব্যবহারকারী ব্যালান্স", value: `৳ ${(totalUB + totalRB) - (totalNW + totalNRW)}`, },
        { title: "উত্তোলন রিকোয়েস্ট", value: withdrawStats.totalWithdrawRequest, desc: withdrawStats.totalWithdrawRequest > 0 ? `${withdrawStats.totalWithdrawRequest} টি রিকোয়েস্ট` : 'কোনো রিকোয়েস্ট নেই' },
        { title: "উত্তোলিত টাকা", value: `৳ ${withdrawStats.completedWithdrawAmount}`, desc: withdrawStats.completedWithdrawAmount > 0 ? `৳${withdrawStats.completedWithdrawAmount} অনুমোদিত` : 'কোনো উত্তোলন নেই' },
        { title: "পেন্ডিং উত্তোলন", value: `৳ ${withdrawStats.pendingWithdrawAmount}`, desc: withdrawStats.pendingWithdrawAmount > 0 ? `৳${withdrawStats.pendingWithdrawAmount} অপেক্ষায়` : 'কোনো পেন্ডিং নেই' },
        { title: "মোট অ্যাডমিন লাভ", value: `৳ ${completedProfit + subscriptionIncome - totalAdminWithdraw - totalNRW} ` },
        { title: "মোট লাভ উত্তোলন ", value: `৳ ${totalAdminWithdraw}` },
    ];

    // check loading
    if (uiLoading) {
        return <div className="flex w-full min-h-screen justify-center items-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen"
        >
            <Helmet>
                <title>অ্যাডমিন ড্যাশবোর্ড</title>
                <meta name="description" content="ওয়েবসাইটের সম্পূর্ণ ওভারভিউ এবং পরিসংখ্যান।" />
            </Helmet>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-1"
            >
                <h1 className="text-3xl font-bold text-gray-800">অ্যাডমিন ড্যাশবোর্ড</h1>
                <p className="text-muted-foreground">আপনার ব্যবসার একটি সম্পূর্ণ চিত্র দেখুন।</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.08 }}
            >
                {statItems.map((item, index) => (
                    <StatCard
                        key={index}
                        title={item.title}
                        value={item.value}
                        icon={icons[index % icons.length]}
                        description={item.desc}
                        isLoading={isLoading.stats}
                        gradient={gradients[index % gradients.length]}
                    />
                ))}
            </motion.div>

            {/* Chart & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="shadow-md border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-800">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                মাসিক বিক্রয় বিশ্লেষণ
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading.sales ? (
                                <div className="flex justify-center items-center h-[300px]">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <ReBarChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fill: '#666' }} />
                                        <YAxis tick={{ fill: '#666' }} />
                                        <Tooltip
                                            cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #ddd',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Bar dataKey="sales" fill="#FF5F1F" radius={[4, 4, 0, 0]} />
                                    </ReBarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card className="shadow-md border-0 h-full">
                        <CardHeader>
                            <CardTitle className="text-gray-800">সাম্প্রতিক অর্ডার</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading.orders ? (
                                <div className="flex justify-center items-center h-[200px]">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-gray-700">গ্রাহক</TableHead>
                                                <TableHead className="text-gray-700">স্ট্যাটাস</TableHead>
                                                <TableHead className="text-right text-gray-700">মোট</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {recentOrders?.map((order, i) => (
                                                    <motion.tr
                                                        className='border hover:bg-teal-100'
                                                        key={order.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                                        whileHover={{ backgroundColor: 'hsl(var(--muted)/0.1)' }}
                                                    >
                                                        <TableCell>
                                                            <div className="font-medium text-gray-800">{order.customer}</div>
                                                            <div className="text-sm text-muted-foreground">#{order.id.slice(-6)}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={getStatusVariant(order.status)}>
                                                                {order.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-gray-900">
                                                            {order?.total} TK
                                                        </TableCell>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                    <div className="text-center mt-4">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button asChild variant="outline" size="sm">
                                                <Link to="/admin/orders">সব অর্ডার দেখুন</Link>
                                            </Button>
                                        </motion.div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboardPage;