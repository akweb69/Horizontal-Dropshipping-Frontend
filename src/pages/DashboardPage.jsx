import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Package, ShoppingCart, Clock } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import CircleStatCard from '@/components/CircleStatCard';
import axios from 'axios';
import { motion } from 'framer-motion';

const DashboardPage = () => {
    const { user, setLoading, loading } = useAuth();
    const { subscription } = user;
    const { plan, validUntil } = subscription;
    const [name, setName] = useState('');
    const [countdown, setCountdown] = useState('');
    const [sells, setSells] = useState([]);
    const [myPendingBalance, setMyPendingBalance] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [myRecievedBalance, setMyRecievedBalance] = useState(0);
    const [myLove, setMyLove] = useState(0);

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/users/${user?.email}`)
            .then((response) => setName(response.data.name))
            .catch(console.error);
    }, [user?.email]);

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/orders`)
            .then((response) => {
                if (response.data) {
                    setSells(response.data.filter((item) => item.email === user?.email));
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching sell product data:', error);
                setLoading(false);
            });
    }, [user?.email]);

    const timeRemaining = user?.validityDays * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(new Date(validUntil).getTime() + timeRemaining);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = expiryDate - now;

            if (distance <= 0) {
                clearInterval(interval);
                setCountdown('প্ল্যানের মেয়াদ শেষ!');
                handlePlanExpired();
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setCountdown(`${days} দিন ${hours} ঘন্টা ${minutes} মিনিট ${seconds} সেকেন্ড`);
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryDate]);

    const handlePlanExpired = () => {
        const data = { email: user.email };
        alert('⚠️ আপনার সাবস্ক্রিপশন মেয়াদ শেষ হয়েছে! দয়া করে প্ল্যান আপগ্রেড করুন।');
        axios
            .patch(`${import.meta.env.VITE_BASE_URL}/users_mayead_sesh`, data)
            .then((response) => console.log('User plan status updated:', response.data))
            .catch((error) => console.error('Error updating user plan status:', error));
    };

    useEffect(() => {
        const data = sells;
        setMyPendingBalance(
            data
                .filter((item) => item.status === 'pending')
                .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.delivery_charge) || 0), 0)
        );
        setMyRecievedBalance(
            data
                .filter((item) => item.status === 'Delivered')
                .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.delivery_charge) || 0), 0)
        );
        setTotalRevenue(
            data.reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0)
        );
        setMyLove(
            data
                .filter((item) => item.status === 'Delivered')
                .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0)
        );
    }, [sells]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg font-semibold text-primary">
                🔄 ডেটা লোড হচ্ছে...
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>ড্যাশবোর্ড - LetsDropship</title>
                <meta name="description" content="আপনার LetsDropship ড্যাশবোর্ড পরিচালনা করুন।" />
            </Helmet>

            <div className="space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-2xl shadow-lg text-white"
                >
                    <div>
                        <h1 className="text-3xl font-bold mb-1">👋 স্বাগতম, {name}!</h1>
                        <p className="opacity-90">আপনার ব্যবসার সামগ্রিক চিত্র নিচে দেখুন।</p>
                    </div>
                    <Button
                        asChild
                        className="bg-white text-indigo-600 hover:bg-indigo-100 transition-all font-semibold shadow-md"
                    >
                        <NavLink to="/">নতুন পণ্য দেখুন</NavLink>
                    </Button>
                </motion.div>

                {/* Subscription Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Card className="border border-indigo-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="bg-indigo-50 rounded-t-lg">
                            <CardTitle className="flex items-center gap-2 text-indigo-700 font-semibold text-xl">
                                <Clock className="w-5 h-5" /> সাবস্ক্রিপশন ওভারভিউ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6">
                            <div>
                                <h3 className="text-2xl font-bold text-indigo-700 mb-1">{plan}</h3>
                                <p className="text-gray-700">
                                    বৈধ থাকবে:{" "}
                                    {expiryDate.toLocaleDateString('bn-BD', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p className="text-sm mt-3 text-red-600 font-medium bg-red-50 px-3 py-1 rounded-lg inline-block">
                                    ⏳ {countdown}
                                </p>
                            </div>
                            <Button
                                asChild
                                className="mt-6 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md"
                            >
                                <NavLink to="/membership">প্ল্যান আপগ্রেড করুন</NavLink>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    <CircleStatCard
                        title="💰 মোট রেভিনিউ"
                        value={`৳${totalRevenue.toLocaleString('bn-BD')}`}
                        percentage={75}
                        description={`${sells.length} অর্ডার`}
                        primaryColor="hsl(142.1 76.2% 41.2%)"
                        secondaryColor="hsl(142.1 76.2% 41.2% / 0.1)"
                        icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
                    />
                    <CircleStatCard
                        title="📦 প্রাপ্ত রেভিনিউ"
                        value={`৳${myLove.toLocaleString('bn-BD')}`}
                        percentage={55}
                        description={`${sells.length} অর্ডার`}
                        primaryColor="hsl(142.1 76.2% 41.2%)"
                        secondaryColor="hsl(142.1 76.2% 41.2% / 0.1)"
                        icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
                    />
                    <CircleStatCard
                        title="🛒 মোট সেলস"
                        value={`৳${sells
                            .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo) - parseInt(item.delivery_charge)), 0)
                            .toLocaleString('bn-BD')}`}
                        percentage={85}
                        description={`${sells.length} অর্ডার`}
                        primaryColor="hsl(34.9 91.6% 58.4%)"
                        secondaryColor="hsl(34.9 91.6% 58.4% / 0.1)"
                        icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
                    />
                    <CircleStatCard
                        title="📦 ইম্পোর্ট করা পণ্য"
                        value={`${sells.reduce((acc, item) => acc + parseInt(item.items_total), 0).toLocaleString('bn-BD')}`}
                        percentage={70}
                        description={`গত মাস থেকে ${sells.length} পণ্য ইম্পোর্ট হয়েছে।`}
                        primaryColor="hsl(217.2 91.2% 59.8%)"
                        secondaryColor="hsl(217.2 91.2% 59.8% / 0.1)"
                        icon={<Package className="h-5 w-5 text-muted-foreground" />}
                    />
                    <CircleStatCard
                        title="🕒 পেন্ডিং ব্যালেন্স"
                        value={`৳${myPendingBalance.toLocaleString('bn-BD')}`}
                        percentage={70}
                        description={`পেন্ডিং অর্ডার সংখ্যা: ${sells.filter((i) => i.status === 'pending').length}`}
                        primaryColor="hsl(50 90% 55%)"
                        secondaryColor="hsl(50 90% 55% / 0.1)"
                        icon={<Package className="h-5 w-5 text-muted-foreground" />}
                    />
                    <CircleStatCard
                        title="✅ রিসিভ ব্যালেন্স"
                        value={`৳${myRecievedBalance.toLocaleString('bn-BD')}`}
                        percentage={80}
                        description={`রিসিভড অর্ডার সংখ্যা: ${sells.filter((i) => i.status === 'Delivered').length}`}
                        primaryColor="hsl(210 90% 60%)"
                        secondaryColor="hsl(210 90% 60% / 0.1)"
                        icon={<Package className="h-5 w-5 text-muted-foreground" />}
                    />
                </motion.div>
            </div>
        </>
    );
};

export default DashboardPage;
