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

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// swiper js-->
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { BadgeCheck, CircleDollarSign, Hourglass, Import } from 'lucide-react';


// chartjs
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// Chart.js রেজিস্ট্রেশন
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

    const [todaysData, setTodaysData] = useState([]);
    const [last3daysData, setlast3daysData] = useState([]);
    const [last7daysData, setlast7daysData] = useState([]);
    const [last15daysData, setlast15daysData] = useState([]);
    const [lastMonthData, setLastMonthData] = useState([]);
    const [lifetimeData, setLifeTimeData] = useState([]);

    // State for animated balances for each card
    const [displayedTodayBalance, setDisplayedTodayBalance] = useState(0);
    const [displayed3DaysBalance, setDisplayed3DaysBalance] = useState(0);
    const [displayed7DaysBalance, setDisplayed7DaysBalance] = useState(0);
    const [displayed15DaysBalance, setDisplayed15DaysBalance] = useState(0);
    const [displayedMonthBalance, setDisplayedMonthBalance] = useState(0);
    const [displayedLifetimeBalance, setDisplayedLifetimeBalance] = useState(0);
    const [rejectedBalance, setRejectedBalance] = useState(0)
    const [rejectedProductPrice, setRejectedProductPrice] = useState(0)

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
                    // Filter out bad data: ensure required fields exist and are valid
                    const validSells = response.data.filter((item) => {
                        return (
                            item.email === user?.email &&
                            item.order_date &&
                            !isNaN(new Date(item.order_date).getTime()) && // Valid date
                            item.amar_bikri_mullo !== undefined &&
                            item.delivery_charge !== undefined &&
                            item.grand_total !== undefined &&
                            !isNaN(parseInt(item.amar_bikri_mullo)) &&
                            !isNaN(parseInt(item.delivery_charge)) &&
                            !isNaN(parseInt(item.grand_total))
                        );
                    });

                    setAllSells(validSells);
                    setLoading(false);

                    // Calculate time-based data for state variables
                    const now = new Date();
                    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const threeDaysAgo = new Date(now);
                    threeDaysAgo.setDate(now.getDate() - 3);
                    const sevenDaysAgo = new Date(now);
                    sevenDaysAgo.setDate(now.getDate() - 7);
                    const fifteenDaysAgo = new Date(now);
                    fifteenDaysAgo.setDate(now.getDate() - 15);
                    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

                    // Populate state variables with filtered data
                    setTodaysData(
                        validSells.filter((item) => {
                            const itemDate = new Date(item.order_date);
                            return itemDate >= todayStart && itemDate <= now;
                        })
                    );

                    setlast3daysData(
                        validSells.filter((item) => {
                            const itemDate = new Date(item.order_date);
                            return itemDate >= threeDaysAgo && itemDate <= now;
                        })
                    );

                    setlast7daysData(
                        validSells.filter((item) => {
                            const itemDate = new Date(item.order_date);
                            return itemDate >= sevenDaysAgo && itemDate <= now;
                        })
                    );

                    setlast15daysData(
                        validSells.filter((item) => {
                            const itemDate = new Date(item.order_date);
                            return itemDate >= fifteenDaysAgo && itemDate <= now;
                        })
                    );

                    setLastMonthData(
                        validSells.filter((item) => {
                            const itemDate = new Date(item.order_date);
                            return itemDate >= oneMonthAgo && itemDate <= now;
                        })
                    );

                    setLifeTimeData(validSells);
                }
            })
            .catch((error) => {
                console.error('Error fetching sell product data:', error);
                setLoading(false);
            });
    }, [user?.email, setLoading]);

    const timeRemaining = user?.validityDays * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(new Date(validUntil).getTime() + timeRemaining);
    const [bakiAche, setBakiAche] = useState(0)

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

            setBakiAche(days)

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

    // Calculate balances for each time period
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
            filteredSells.reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0) - rejectedProductPrice
        );
        setMyLove(
            filteredSells
                .filter((item) => item.status === 'Delivered')
                .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0)
        );

        setRejectedBalance(filteredSells.filter((item) => item.status === "Returned").reduce(((acc, item) => acc + (item?.amar_bikri_mullo - item.delivery_charge)), 0))

        setRejectedProductPrice(filteredSells.filter((item) => item.status === "Returned").reduce(((acc, item) => acc + item?.items_total), 0))



        // Calculate balances for each time period
        const todayBalance = todaysData
            .filter((item) => item.status === 'Delivered')
            .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0);
        const threeDaysBalance = last3daysData
            .filter((item) => item.status === 'Delivered')
            .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0);
        const sevenDaysBalance = last7daysData
            .filter((item) => item.status === 'Delivered')
            .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0);
        const fifteenDaysBalance = last15daysData
            .filter((item) => item.status === 'Delivered')
            .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0);
        const monthBalance = lastMonthData
            .filter((item) => item.status === 'Delivered')
            .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0);
        const lifetimeBalance = lifetimeData
            .filter((item) => item.status === 'Delivered')
            .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo - item.grand_total) || 0), 0);

        // Animate balances
        const animateBalance = (start, end, setter, duration = 1500) => {
            let current = start;
            const increment = end / (duration / 10);
            const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                    current = end;
                    clearInterval(timer);
                }
                setter(Math.floor(current));
            }, 10);
            return () => clearInterval(timer);
        };

        // Start animations for each balance
        animateBalance(0, todayBalance, setDisplayedTodayBalance);
        animateBalance(0, threeDaysBalance, setDisplayed3DaysBalance);
        animateBalance(0, sevenDaysBalance, setDisplayed7DaysBalance);
        animateBalance(0, fifteenDaysBalance, setDisplayed15DaysBalance);
        animateBalance(0, monthBalance, setDisplayedMonthBalance);
        animateBalance(0, lifetimeBalance, setDisplayedLifetimeBalance);
    }, [filteredSells, todaysData, last3daysData, last7daysData, last15daysData, lastMonthData, lifetimeData]);

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



    // Add this inside the DashboardPage component before the return statement
    const analyticsData = useMemo(() => {
        const totalSales = filteredSells.reduce(
            (acc, item) => acc + (parseInt(item.amar_bikri_mullo) - parseInt(item.delivery_charge)),
            0
        );

        const successfulDeliveries = filteredSells
            .filter((item) => item.status === 'Delivered')
            .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo) - parseInt(item.grand_total)), 0);

        const pendingPayments = filteredSells
            .filter((item) => item.status === 'pending')
            .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo) - parseInt(item.delivery_charge)), 0);

        const rejectedOrders = filteredSells
            .filter((item) => item.status === 'Returned')
            .reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo) - parseInt(item.delivery_charge)), 0);

        const importedProducts = filteredSells.reduce((acc, item) => acc + parseInt(item.items_total), 0);

        // Calculate percentages relative to total sales (or 100 if totalSales is 0 to avoid division by zero)
        const maxValue = totalSales || 100;
        return [
            {
                title: 'সফল ডেলিভারি (৳)',
                value: successfulDeliveries,
                percent: Math.round((successfulDeliveries / maxValue) * 100),
                color: 'bg-green-500',
            },
            {
                title: 'পেন্ডিং পেমেন্ট (৳)',
                value: pendingPayments,
                percent: Math.round((pendingPayments / maxValue) * 100),
                color: 'bg-yellow-500',
            },
            {
                title: 'রিজেক্ট অর্ডার (৳)',
                value: rejectedOrders,
                percent: Math.round((rejectedOrders / maxValue) * 100),
                color: 'bg-red-500',
            },
            {
                title: 'নতুন ইমপোর্ট (পণ্য)',
                value: importedProducts,
                percent: Math.round((importedProducts / maxValue) * 100),
                color: 'bg-blue-500',
            },
        ];
    }, [filteredSells]);
    // ✅ Chart.js Data
    const chartData = {
        labels: [
            "সফল ডেলিভারি",
            "পেন্ডিং পেমেন্ট",
            "রিজেক্ট অর্ডার",
            "ইম্পোর্ট পণ্য",
        ],
        datasets: [
            {
                label: "মাসিক বিক্রয়",
                data: analyticsData.map((d) => d.value),
                backgroundColor: ["#22c55e", "#eab308", "#ef4444", "#3b82f6"],
                borderColor: ["#16a34a", "#ca8a04", "#dc2626", "#2563eb"],
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "মূল্য (৳) / পণ্য সংখ্যা",
                    font: { size: 14 },
                },
                ticks: {
                    callback: (value) => value.toLocaleString("bn-BD"),
                },
                grid: { color: "#e5e7eb" },
            },
            x: {
                title: {
                    display: true,
                    text: "ক্যাটাগরি",
                    font: { size: 14 },
                },
                grid: { display: false },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#1f2937",
                titleColor: "#fff",
                bodyColor: "#fff",
                callbacks: {
                    label: (context) =>
                        context.parsed.y.toLocaleString("bn-BD") +
                        (context.dataIndex === 3 ? " টি" : " ৳"),
                },
            },
        },
        animation: {
            duration: 1500,
            easing: "easeOutQuart",
        },
        maintainAspectRatio: false,
    };

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
    // for gretings
    const [sokal, setSokal] = useState(false);
    const [dupur, setDupur] = useState(false);
    const [bikal, setBikal] = useState(false);
    const [sondha, setShondha] = useState(false);
    const [rat, setRat] = useState(false);

    useEffect(() => {
        const date = new Date();
        const hour = date.getHours();

        // সময় অনুযায়ী state সেট করা
        if (hour >= 5 && hour < 12) {
            setSokal(true);
        } else if (hour >= 12 && hour < 15) {
            setDupur(true);
        } else if (hour >= 15 && hour < 18) {
            setBikal(true);
        } else if (hour >= 18 && hour < 19) {
            setBikal(true);
        } else {
            setRat(true);
        }
    }, []);



    return (
        <>
            <Helmet>
                <title>ড্যাশবোর্ড - LetsDropship</title>
                <meta name="description" content="আপনার LetsDropship ড্যাশবোর্ড পরিচালনা করুন।" />
            </Helmet>

            <div className="p-0 md:p-6 min-h-screen bg-gradient-to-br space-y-6 bangla">
                {/* grettings */}
                <div className="">
                    <div className="md:text-3xl text-2xl font-bold  text-orange-500">
                        {sokal && <p> শুভ সকাল! 🌅 </p>}
                        {dupur && <p> শুভ দুপুর! ☀️</p>}
                        {bikal && <p>শুভ বিকাল! 🌇 </p>}
                        {sondha && <p>শুভ সন্ধ্যা! 🌇 </p>}
                        {rat && <p> শুভ রাত্রি! 🌙</p>}
                    </div>
                    <div className="">
                        {user?.name} , ড্যাশবোর্ডে আপনাকে স্বাগতম।
                    </div>
                </div>


                {/* Swiper */}
                <div className="max-w-[550px] w-full mx-auto ">
                    <Swiper
                        spaceBetween={30}
                        centeredSlides={true}
                        autoplay={{
                            delay: 6500,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                        }}
                        modules={[Autoplay, Pagination]}
                        className="mySwiper pb-10"
                    >
                        <SwiperSlide className="p-4">
                            <div className="">
                                <div className="premium-card overflow-hidden">
                                    <div className="relative z-10 bg-transparent   rounded-2xl px-3 md:p-6 overflow-hidden">
                                        {/* তোমার কার্ডের content */}
                                        <p className="inline-block bg-gradient-to-r from-orange-400 to-amber-500 text-white text-[8px] md:text-sm font-semibold px-4 py-2 md:py-3 rounded-md shadow-md shadow-orange-200/60">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>

                                        <div className="mt-3 md:mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>

                                        <div className="flex justify-between items-center mt-3 md:mt-6">
                                            <div>
                                                <p className="text-gray-500  text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-3 md:mt-8">
                                            <p className="text-gray-600 font-medium text-base md:text-xl">বর্তমান ব্যালেন্স</p>
                                            <p className="text-orange-400 text-lg md:text-4xl font-extrabold">৳ {displayedLifetimeBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>

                        {/* card 0 bortoman balance */}
                        {/* <SwiperSlide className='p-4'>
                            <div className="w-full hover:translate-y-[-2px] hover:shadow-[6px_6px_12px_#a3b1c6,_-6px_-6px_12px_#ffffff] mx-auto p-[2px] rounded-2xl bg-[##e0e5ec] border-none outline-none transition-all duration-500  shadow-[5px_5px_10px_#a3b1c6,_-5px_-5px_10px_#ffffff]">
                                <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                        <div
                                            className="absolute inset-0 opacity-30"
                                            style={{
                                                backgroundImage: `repeating-linear-gradient(
            -45deg,
            #f2f2f2 0px,
            #dbe6f9 6px,
            transparent 10px,
            transparent 10px,
            #f2f2f2 10px,
            #f2f2f2 13px,
            transparent 8px,
            transparent 14px
          )`,
                                                backgroundSize: '20px 20px',
                                            }}
                                        ></div>
                                    </div>

                                    <div className="relative z-10">
                                        <p className="inline-block bg-orange-400 text-white text-sm font-semibold px-4 py-1 rounded-md shadow-md">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>

                                        <div className="mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>

                                        <div className="flex justify-between items-center mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-8">
                                            <p className="text-gray-600 font-medium text-xl">বর্তমান ব্যালান্স</p>
                                            <p className="text-orange-400 text-4xl font-extrabold">৳ {displayedLifetimeBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </SwiperSlide> */}
                        {/* Card 1: Today's Balance */}
                        {/* <SwiperSlide className='p-4'>
                            <div className="w-full hover:translate-y-[-2px] hover:shadow-[6px_6px_12px_#a3b1c6,_-6px_-6px_12px_#ffffff] mx-auto p-[2px] rounded-2xl bg-[##e0e5ec]  border-none outline-none shadow-[5px_5px_10px_#a3b1c6,_-5px_-5px_10px_#ffffff]">
                                <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                        <div
                                            className="absolute inset-0 opacity-30"
                                            style={{
                                                backgroundImage: `repeating-linear-gradient(
                                                    -45deg,
                                                    #f2f2f2 0px,
                                                    #dbe6f9 6px,
                                                    transparent 10px,
                                                    transparent 10px,
                                                    #f2f2f2 10px,
                                                    #f2f2f2 13px,
                                                    transparent 8px,
                                                    transparent 14px
                                                )`,
                                                backgroundSize: '20px 20px'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="inline-block bg-orange-400 text-white text-sm font-semibold px-4 py-1 rounded-md">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-8">
                                            <p className="text-gray-600 font-medium text-xl">আজকের ইনকাম</p>
                                            <p className="text-orange-400 text-4xl font-extrabold">৳ {displayedTodayBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide> */}
                        <SwiperSlide className="p-4">
                            <div className="">
                                <div className="premium-card overflow-hidden">
                                    <div className="relative z-10 bg-transparent rounded-2xl px-3 md:p-6 overflow-hidden">
                                        <p className="inline-block bg-gradient-to-r from-orange-400 to-amber-500 text-white text-[8px] md:text-sm font-semibold px-4 py-2 md:py-3 rounded-md shadow-md shadow-orange-200/60">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-3 md:mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-8">
                                            <p className="text-gray-600 font-medium text-base md:text-xl">আজকের ইনকাম</p>
                                            <p className="text-orange-400 text-lg md:text-4xl font-extrabold">৳ {displayedTodayBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>


                        {/* Card 2: Last 3 Days Balance */}
                        {/* <SwiperSlide className='p-4'>
                            <div className="w-full hover:translate-y-[-2px] hover:shadow-[6px_6px_12px_#a3b1c6,_-6px_-6px_12px_#ffffff] mx-auto p-[2px] rounded-2xl bg-[##e0e5ec] shadow-[5px_5px_10px_#a3b1c6,_-5px_-5px_10px_#ffffff] border-none outline-none">
                                <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                        <div
                                            className="absolute inset-0 opacity-30"
                                            style={{
                                                backgroundImage: `repeating-linear-gradient(
                                                    -45deg,
                                                    #f2f2f2 0px,
                                                    #dbe6f9 6px,
                                                    transparent 10px,
                                                    transparent 10px,
                                                    #f2f2f2 10px,
                                                    #f2f2f2 13px,
                                                    transparent 8px,
                                                    transparent 14px
                                                )`,
                                                backgroundSize: '20px 20px'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="inline-block bg-orange-400 text-white text-sm font-semibold px-4 py-1 rounded-md">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-8">
                                            <p className="text-gray-600 font-medium text-xl">গত ৩ দিনের ইনকাম</p>
                                            <p className="text-orange-400 text-4xl font-extrabold">৳ {displayed3DaysBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide> */}
                        <SwiperSlide className="p-4">
                            <div className="">
                                <div className="premium-card overflow-hidden">
                                    <div className="relative z-10 bg-transparent rounded-2xl px-3 md:p-6 overflow-hidden">
                                        <p className="inline-block bg-gradient-to-r from-orange-400 to-amber-500 text-white text-[8px] md:text-sm font-semibold px-4 py-2 md:py-3 rounded-md shadow-md shadow-orange-200/60">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-3 md:mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-8">
                                            <p className="text-gray-600 font-medium text-base md:text-xl">গত ৩ দিনের ইনকাম</p>
                                            <p className="text-orange-400 text-lg md:text-4xl font-extrabold">৳ {displayed3DaysBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>

                        {/* Card 3: Last 7 Days Balance */}
                        {/* <SwiperSlide className='p-4'>
                            <div className="w-full hover:translate-y-[-2px] hover:shadow-[6px_6px_12px_#a3b1c6,_-6px_-6px_12px_#ffffff] mx-auto p-[2px] rounded-2xl bg-[##e0e5ec] shadow-[5px_5px_10px_#a3b1c6,_-5px_-5px_10px_#ffffff] border-none outline-none">
                                <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                        <div
                                            className="absolute inset-0 opacity-30"
                                            style={{
                                                backgroundImage: `repeating-linear-gradient(
                                                    -45deg,
                                                    #f2f2f2 0px,
                                                    #dbe6f9 6px,
                                                    transparent 10px,
                                                    transparent 10px,
                                                    #f2f2f2 10px,
                                                    #f2f2f2 13px,
                                                    transparent 8px,
                                                    transparent 14px
                                                )`,
                                                backgroundSize: '20px 20px'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="inline-block bg-orange-400 text-white text-sm font-semibold px-4 py-1 rounded-md">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-8">
                                            <p className="text-gray-600 font-medium text-xl">গত ৭ দিনের ইনকাম</p>
                                            <p className="text-orange-400 text-4xl font-extrabold">৳ {displayed7DaysBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide> */}
                        <SwiperSlide className="p-4">
                            <div className="">
                                <div className="premium-card overflow-hidden">
                                    <div className="relative z-10 bg-transparent rounded-2xl px-3 md:p-6 overflow-hidden">
                                        <p className="inline-block bg-gradient-to-r from-orange-400 to-amber-500 text-white text-[8px] md:text-sm font-semibold px-4 py-2 md:py-3 rounded-md shadow-md shadow-orange-200/60">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-3 md:mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-8">
                                            <p className="text-gray-600 font-medium text-base md:text-xl">গত ৭ দিনের ইনকাম</p>
                                            <p className="text-orange-400 text-lg md:text-4xl font-extrabold">৳ {displayed7DaysBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>

                        {/* Card 4: Last 15 Days Balance */}
                        {/* <SwiperSlide className='p-4'>
                            <div className="w-full hover:translate-y-[-2px] hover:shadow-[6px_6px_12px_#a3b1c6,_-6px_-6px_12px_#ffffff] mx-auto p-[2px] rounded-2xl bg-[##e0e5ec] shadow-[5px_5px_10px_#a3b1c6,_-5px_-5px_10px_#ffffff] border-none outline-none">
                                <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                        <div
                                            className="absolute inset-0 opacity-30"
                                            style={{
                                                backgroundImage: `repeating-linear-gradient(
                                                    -45deg,
                                                    #f2f2f2 0px,
                                                    #dbe6f9 6px,
                                                    transparent 10px,
                                                    transparent 10px,
                                                    #f2f2f2 10px,
                                                    #f2f2f2 13px,
                                                    transparent 8px,
                                                    transparent 14px
                                                )`,
                                                backgroundSize: '20px 20px'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="inline-block bg-orange-400 text-white text-sm font-semibold px-4 py-1 rounded-md">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-8">
                                            <p className="text-gray-600 font-medium text-xl">গত ১৫ দিনের ইনকাম</p>
                                            <p className="text-orange-400 text-4xl font-extrabold">৳ {displayed15DaysBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide> */}
                        <SwiperSlide className="p-4">
                            <div className="">
                                <div className="premium-card overflow-hidden">
                                    <div className="relative z-10 bg-transparent rounded-2xl px-3 md:p-6 overflow-hidden">
                                        <p className="inline-block bg-gradient-to-r from-orange-400 to-amber-500 text-white text-[8px] md:text-sm font-semibold px-4 py-2 md:py-3 rounded-md shadow-md shadow-orange-200/60">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-3 md:mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-8">
                                            <p className="text-gray-600 font-medium text-base md:text-xl">গত ১৫ দিনের ইনকাম</p>
                                            <p className="text-orange-400 text-lg md:text-4xl font-extrabold">৳ {displayed15DaysBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>

                        {/* Card 5: Last Month Balance */}
                        {/* <SwiperSlide className='p-4'>
                            <div className="w-full hover:translate-y-[-2px] hover:shadow-[6px_6px_12px_#a3b1c6,_-6px_-6px_12px_#ffffff] mx-auto p-[2px] rounded-2xl bg-[##e0e5ec] shadow-[5px_5px_10px_#a3b1c6,_-5px_-5px_10px_#ffffff] border-none outline-none">
                                <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                        <div
                                            className="absolute inset-0 opacity-30"
                                            style={{
                                                backgroundImage: `repeating-linear-gradient(
                                                    -45deg,
                                                    #f2f2f2 0px,
                                                    #dbe6f9 6px,
                                                    transparent 10px,
                                                    transparent 10px,
                                                    #f2f2f2 10px,
                                                    #f2f2f2 13px,
                                                    transparent 8px,
                                                    transparent 14px
                                                )`,
                                                backgroundSize: '20px 20px'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="inline-block bg-orange-400 text-white text-sm font-semibold px-4 py-1 rounded-md">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-8">
                                            <p className="text-gray-600 font-medium text-xl">গত মাসের ইনকাম</p>
                                            <p className="text-orange-400 text-4xl font-extrabold">৳ {displayedMonthBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide> */}
                        <SwiperSlide className="p-4">
                            <div className="">
                                <div className="premium-card overflow-hidden">
                                    <div className="relative z-10 bg-transparent rounded-2xl px-3 md:p-6 overflow-hidden">
                                        <p className="inline-block bg-gradient-to-r from-orange-400 to-amber-500 text-white text-[8px] md:text-sm font-semibold px-4 py-2 md:py-3 rounded-md shadow-md shadow-orange-200/60">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-3 md:mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-8">
                                            <p className="text-gray-600 font-medium text-base md:text-xl">গত মাসের ইনকাম</p>
                                            <p className="text-orange-400 text-lg md:text-4xl font-extrabold">৳ {displayedMonthBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>

                        {/* Card 6: Lifetime Balance */}
                        {/* <SwiperSlide className='p-4'>
                            <div className="w-full hover:translate-y-[-2px] hover:shadow-[6px_6px_12px_#a3b1c6,_-6px_-6px_12px_#ffffff] mx-auto p-[2px] rounded-2xl bg-[##e0e5ec] shadow-[5px_5px_10px_#a3b1c6,_-5px_-5px_10px_#ffffff] border-none outline-none">
                                <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                        <div
                                            className="absolute inset-0 opacity-30"
                                            style={{
                                                backgroundImage: `repeating-linear-gradient(
                                                    -45deg,
                                                    #f2f2f2 0px,
                                                    #dbe6f9 6px,
                                                    transparent 10px,
                                                    transparent 10px,
                                                    #f2f2f2 10px,
                                                    #f2f2f2 13px,
                                                    transparent 8px,
                                                    transparent 14px
                                                )`,
                                                backgroundSize: '20px 20px'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="inline-block bg-orange-400 text-white text-sm font-semibold px-4 py-1 rounded-md">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-8">
                                            <p className="text-gray-600 font-medium text-xl">লাইফটাইম ইনকাম</p>
                                            <p className="text-orange-400 text-4xl font-extrabold">৳ {displayedLifetimeBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide> */}
                        <SwiperSlide className="p-4">
                            <div className="">
                                <div className="premium-card overflow-hidden">
                                    <div className="relative z-10 bg-transparent rounded-2xl px-3 md:p-6 overflow-hidden">
                                        <p className="inline-block bg-gradient-to-r from-orange-400 to-amber-500 text-white text-[8px] md:text-sm font-semibold px-4 py-2 md:py-3 rounded-md shadow-md shadow-orange-200/60">
                                            LetsDropShip · <span>{user?.subscription?.plan}</span>
                                        </p>
                                        <div className="mt-3 md:mt-6 text-gray-600 tracking-widest text-lg font-semibold">
                                            ****** {user?.phone.slice(5, 11)}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">{user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">EXPIRES</p>
                                                <p className="text-gray-800 font-semibold md:text-lg">
                                                    {expiryDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 md:mt-8">
                                            <p className="text-gray-600 font-medium text-base md:text-xl">লাইফটাইম ইনকাম</p>
                                            <p className="text-orange-400 text-lg md:text-4xl font-extrabold">৳ {displayedLifetimeBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                    {/* Swiper pagination dot styling */}
                    <style>{`
                        .swiper-pagination {
                            bottom: 0 !important;
                            position: relative !important;
                            margin-top: 10px;
                        }
                        .swiper-pagination-bullet {
                            background-color: #fb923c;
                            opacity: 0.5;
                        }
                        .swiper-pagination-bullet-active {
                            background-color: #f97316;
                            opacity: 1;
                            transform: scale(1.2);
                        }
                    `}</style>
                </div>
                {/* Swiper */}
                {/* ড্যাশবোর্ড মেট্রিক্স */}
                <div className="">
                    <h1 className="text-xl font-bold border-b pb-3">ড্যাশবোর্ড মেট্রিক্স</h1>

                    <div className="flex justify-between items-center gap-4 w-full hover:bg-gray-100 p-4 border-b">
                        <div className="flex w-full items-center gap-3">
                            <div className="text-white p-2 bg-orange-500 rounded-full"> <Hourglass></Hourglass> </div>
                            <div className="flex justify-between gap-4 items-center w-full">
                                <div className="">
                                    <div className="font-semibold">
                                        পেন্ডিং সেলস ব্যালান্স
                                    </div>
                                    <div className="text-xs text-gray-500">বিস্তারিত তথ্য</div>
                                </div>
                                <div className="">
                                    <div className="font-bold ">৳ {myPendingBalance}</div>
                                    <div className="text-xs text-green-500 font-semibold">+ 20.31%</div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-between items-center gap-4 w-full hover:bg-gray-100 p-4 border-b">
                        <div className="flex w-full items-center gap-3">
                            <div className="text-white p-2 bg-green-500 rounded-full"> <CircleDollarSign></CircleDollarSign> </div>
                            <div className="flex justify-between gap-4 items-center w-full">
                                <div className="">
                                    <div className="font-semibold">
                                        মোট রেভিনিউ
                                    </div>
                                    <div className="text-xs text-gray-500">বিস্তারিত তথ্য</div>
                                </div>
                                <div className="">
                                    <div className="font-bold ">৳ {totalRevenue}</div>
                                    <div className="text-xs text-red-500 font-semibold">- 10.31%</div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-between items-center gap-4 w-full hover:bg-gray-100 p-4 border-b">
                        <div className="flex w-full items-center gap-3">
                            <div className="text-white p-2 bg-indigo-500 rounded-full">
                                <BadgeCheck />
                            </div>
                            <div className="flex justify-between gap-4 items-center w-full">
                                <div className="">
                                    <div className="font-semibold">
                                        মোট সেলস
                                    </div>
                                    <div className="text-xs text-gray-500">বিস্তারিত তথ্য</div>
                                </div>
                                <div className="">
                                    <div className="font-bold ">৳ {filteredSells.reduce(
                                        (acc, item) => acc + (parseInt(item.amar_bikri_mullo) - parseInt(item.delivery_charge)),
                                        0
                                    ) - rejectedBalance}</div>
                                    <div className="text-xs text-green-500 font-semibold">+53.87%</div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-between items-center gap-4 w-full hover:bg-gray-100 p-4 border-b">
                        <div className="flex w-full items-center gap-3">
                            <div className="text-white p-2 bg-purple-500 rounded-full"> <Import /> </div>
                            <div className="flex justify-between gap-4 items-center w-full">
                                <div className="">
                                    <div className="font-semibold">
                                        ইম্পোর্ট করা পণ্য
                                    </div>
                                    <div className="text-xs text-gray-500">বিস্তারিত তথ্য</div>
                                </div>
                                <div className="">
                                    <div className="font-bold ">৳ {filteredSells.reduce((acc, item) => acc + parseInt(item.items_total), 0) - rejectedProductPrice} </div>
                                    <div className="text-xs text-green-500 font-semibold">+33.47%</div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-between items-center gap-4 w-full hover:bg-gray-100 p-4 border-b">
                        <div className="flex w-full items-center gap-3">
                            <div className="text-white p-2 bg-red-500 rounded-full"> <CircleDollarSign></CircleDollarSign> </div>
                            <div className="flex justify-between gap-4 items-center w-full">
                                <div className="">
                                    <div className="font-semibold">
                                        মোট রিজেক্ট অর্ডার
                                    </div>
                                    <div className="text-xs text-gray-500">বিস্তারিত তথ্য</div>
                                </div>
                                <div className="">
                                    <div className="font-bold ">৳ {rejectedBalance}</div>
                                    <div className="text-xs text-green-500 font-semibold">+63.04%</div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-between items-center gap-4 w-full hover:bg-gray-100 p-4 border-b">
                        <div className="flex w-full items-center gap-3">
                            <div className="text-white p-2 bg-teal-500 rounded-full"> <CircleDollarSign></CircleDollarSign> </div>
                            <div className="flex justify-between gap-4 items-center w-full">
                                <div className="">
                                    <div className="font-semibold">
                                        মোট সাকসেস সেলস
                                    </div>
                                    <div className="text-xs text-gray-500">বিস্তারিত তথ্য</div>
                                </div>
                                <div className="">
                                    <div className="font-bold ">৳ {myRecievedBalance}</div>
                                    <div className="text-xs text-green-500 font-semibold">+63.04%</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>




                {/* <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg my-6">
                    <h1 className="text-xl font-bold text-gray-800 mb-4">
                        বিক্রয় অ্যানালিটিক্স (মাসিক)
                    </h1>


                    <div className="space-y-6">
                        {analyticsData.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                        <p className="text-gray-700 text-sm font-medium">{item.title}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-800 text-sm font-semibold">
                                            {item.value.toLocaleString('bn-BD')} {item.title.includes('পণ্য') ? '৳' : '৳'}
                                        </span>
                                        <span className="text-gray-600 text-xs">({item.percent}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-2.5 rounded-full ${item.color}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    ></motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div> */}

                {/* chart */}
                <div className="relative bg-white/10 v p-6 rounded-2xl shadow-lg my-6 overflow-hidden backdrop-blur-lg border border-white/30">
                    {/* Decorative gradient ring */}
                    <div className="absolute inset-0 bg-blue-100/20  rounded-2xl pointer-events-none"></div>

                    <h1 className="relative text-xl font-semibold mb-6 text-gray-900 text-center ">
                        বিক্রয় অ্যানালিটিক্স (মাসিক)
                    </h1>

                    {/* Progress Section */}
                    <div className=" relative z-10">
                        {analyticsData.map((item, i) => (
                            <div
                                key={i}
                                className="p-3   hover:scale-[1.01] transition-all duration-300 border border-white/30 bg-white/10 backdrop-blur-sm"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-black font-semibold">{item.title}</p>
                                    <span className="text-black  font-semibold ">
                                        {item.percent}%
                                    </span>
                                </div>

                                <div className="w-full h-3 bg-white hihihi rounded-full overflow-hidden">
                                    <div
                                        className={`h-3 rounded-full ${item.color} relative`}
                                        style={{ width: `${item.percent}%` }}
                                    >
                                        {/* Subtle glow effect */}
                                        <div
                                            className={`absolute inset-4 shadow-sm blur-sm opacity-40 ${item.color}`}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* newesd */}
                <div className="bg-blue-50/60 shadow-lg p-4 rounded-lg">
                    <div className="flex justify-between items-center gap-4 py-4 text-xl font-semibold">
                        <h1 className="">{user?.subscription?.plan}</h1>
                        <h1 className="">{bakiAche.toLocaleString("bn-BD")} দিন বাকি </h1>
                    </div>
                    <div className="flex justify-between items-center gap-4 text-gray-600 pb-4">
                        <h1 className=""> মেয়াদ: {user?.validityDays?.toLocaleString("bn-BD")}
                            দিন</h1>
                        <h1 className=""> মেয়াদ শেষ হবে: {expiryDate.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</h1>
                    </div>

                    <div className="relative w-full">
                        {/* Background bar */}
                        <div className="h-3 w-full rounded-full bg-white"></div>

                        {/* Progress bar */}
                        <div
                            className="absolute left-0 top-0 h-3 bg-orange-500 rounded-full transition-all duration-500"
                            style={{
                                width: `${(bakiAche / user?.validityDays) * 100}%`,
                            }}
                        ></div>
                    </div>

                    <p className="text-center text-gray-500 py-4">
                        সময় ফুরিয়ে যাচ্ছে দ্রুত রিনিউ করুন
                    </p>
                </div>



                {/* Subscription Section */}
                {/* <motion.div
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
                </motion.div> */}
            </div>
        </>
    );
};

export default DashboardPage;