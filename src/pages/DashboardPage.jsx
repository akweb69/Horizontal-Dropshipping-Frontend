import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoneyBillWave, FaClock, FaChartLine, FaShoppingCart, FaBoxOpen, FaCheckCircle } from 'react-icons/fa';
import GlassMasterCard from '../components/ui/GlassMasterCard';
import MiniGlassCard from '../components/ui/MiniGlassCard';
import DropshipDashboard from '../components/ui/DropshipDashboard';

const DashboardPage = () => {
    const { user, setLoading, loading } = useAuth();
    const { subscription } = user;
    const { plan, validUntil } = subscription;
    const [name, setName] = useState('');
    const [countdown, setCountdown] = useState('');
    const [allSells, setAllSells] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [myPendingBalance, setMyPendingBalance] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [myRecievedBalance, setMyRecievedBalance] = useState(0);
    const [myLove, setMyLove] = useState(0);
    const [displayedMyLove, setDisplayedMyLove] = useState(0);
    const [showWelcomeModal, setShowWelcomeModal] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcomeModal(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

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
                    setAllSells(response.data.filter((item) => item.email === user?.email));
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching sell product data:', error);
                setLoading(false);
            });
    }, [user?.email, setLoading]);

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

    const filteredSells = useMemo(() => {
        const now = new Date();
        let startDate;

        switch (selectedFilter) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case '7days':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case '3months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'all':
            default:
                return allSells;
        }

        return allSells.filter((item) => {
            const itemDate = new Date(item.order_date);
            return itemDate >= startDate && itemDate <= now;
        });
    }, [allSells, selectedFilter]);

    useEffect(() => {
        setMyPendingBalance(
            filteredSells
                .filter((item) => item.status === 'pending')
                .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.delivery_charge) || 0), 0)
        );
        setMyRecievedBalance(
            filteredSells
                .filter((item) => item.status === 'Delivered')
                .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.delivery_charge) || 0), 0)
        );
        setTotalRevenue(
            filteredSells.reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0)
        );
        setMyLove(
            filteredSells
                .filter((item) => item.status === 'Delivered')
                .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0)
        );
    }, [filteredSells]);

    useEffect(() => {
        let start = 0;
        const end = myLove;
        const duration = 2000;
        const increment = end / (duration / 10);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                start = end;
                clearInterval(timer);
            }
            setDisplayedMyLove(Math.floor(start));
        }, 10);
        return () => clearInterval(timer);
    }, [myLove]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg font-semibold text-gray-600">
                🔄 ডেটা লোড হচ্ছে...
            </div>
        );
    }

    const filters = [
        { label: 'আজ', value: 'today' },
        { label: 'গত ৭ দিন', value: '7days' },
        { label: 'গত মাস', value: 'month' },
        { label: 'গত ৩ মাস', value: '3months' },
        { label: 'সব সময়', value: 'all' },
    ];

    const renderCircleProgress = (percentage, primaryColor, secondaryColor) => {
        const circumference = 2 * Math.PI * 16;
        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
        return (
            <div className="relative w-12 h-12">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" strokeWidth="3" stroke={secondaryColor} fill="none" />
                    <motion.circle
                        cx="18"
                        cy="18"
                        r="16"
                        strokeWidth="3"
                        stroke={primaryColor}
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        transform="rotate(-90 18 18)"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>
                <motion.div
                    className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    {percentage}%
                </motion.div>
            </div>
        );
    };

    const textVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
    };

    return (
        <>
            <Helmet>
                <title>ড্যাশবোর্ড - LetsDropship</title>
                <meta name="description" content="আপনার LetsDropship ড্যাশবোর্ড পরিচালনা করুন।" />
            </Helmet>

            <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br space-y-6">



                {/* gfhdg */}
                <DropshipDashboard></DropshipDashboard>
                {/* gfhdg */}
                {/* Header Section */}
                <div className="text-center mb-4">
                    <motion.h1
                        variants={textVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-3xl font-bold text-orange-700 drop-shadow-sm"
                    >
                        আপনার ইনকাম ড্যাশবোর্ড
                    </motion.h1>
                    <motion.p
                        variants={textVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                        className="text-orange-800/80 text-sm mt-1"
                    >
                        আপনার ব্যবসার পারফরম্যান্স এক নজরে দেখুন
                    </motion.p>
                </div>

                {/* Filter Section */}
                <div className="flex flex-wrap gap-2 justify-center p-3">
                    {filters.map((f) => (
                        <motion.button
                            key={f.value}
                            onClick={() => setSelectedFilter(f.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 shadow-md ${selectedFilter === f.value
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200'
                                : 'bg-white/70 backdrop-blur-md text-orange-700 hover:bg-orange-100 border border-orange-300/30'
                                }`}
                        >
                            {f.label}
                        </motion.button>
                    ))}
                </div>

                {/* Glass Card */}
                <GlassMasterCard
                    cardHolder={user?.name || 'ABU KALAM'}
                    cardNumber={user?.phone || '**** 3456'}
                    expiry="11/29"
                    cvv="123"
                    balance={displayedMyLove}
                />

                {/* Stats Section */}
                <motion.div
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 w-full mx-auto"
                >
                    <MiniGlassCard cardHolder={user?.name || 'User'} title="পেন্ডিং সেলস ব্যালেন্স" balance={myPendingBalance} />
                    <MiniGlassCard cardHolder={user?.name || 'User'} title="মোট রেভিনিউ" balance={totalRevenue} />
                    <MiniGlassCard
                        cardHolder={user?.name || 'User'}
                        title="মোট সেলস"
                        balance={filteredSells.reduce(
                            (acc, item) => acc + (parseInt(item.amar_bikri_mullo) - parseInt(item.delivery_charge)),
                            0
                        )}
                    />
                    <MiniGlassCard
                        cardHolder={user?.name || 'User'}
                        title="ইম্পোর্ট করা পণ্য"
                        balance={filteredSells.reduce((acc, item) => acc + parseInt(item.items_total), 0)}
                    />
                    <MiniGlassCard
                        cardHolder={user?.name || 'User'}
                        title="মোট সাকসেস সেলস"
                        balance={myRecievedBalance}
                    />
                </motion.div>

                {/* Subscription Section */}
                <motion.div
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="backdrop-blur-xl bg-white/70 border border-orange-300/40 rounded-xl shadow-lg p-5 w-full mx-auto relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-orange-300/10 to-white/5"></div>

                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        <FaClock className="text-lg text-orange-500" />
                        <h2 className="text-base font-semibold text-orange-800">সাবস্ক্রিপশন ওভারভিউ</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                        <div>
                            <h3 className="text-xl font-semibold text-orange-700">{plan}</h3>
                            <p className="text-sm text-orange-600/80">
                                বৈধ থাকবে: {expiryDate.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded-md inline-block mt-2">
                                ⏳ {countdown}
                            </p>
                        </div>
                        <NavLink to="/membership">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255,140,0,0.4)' }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
                            >
                                প্ল্যান আপগ্রেড করুন
                            </motion.button>
                        </NavLink>
                    </div>
                </motion.div>
            </div>

        </>
    );
};

export default DashboardPage;