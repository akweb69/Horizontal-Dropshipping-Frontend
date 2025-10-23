import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Package, ShoppingCart } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import CircleStatCard from '@/components/CircleStatCard';
import axios from 'axios';

const DashboardPage = () => {
    const { user, setLoading, loading } = useAuth();
    const { subscription } = user;
    const { plan, validUntil } = subscription;
    const [name, setName] = useState('');
    const [countdown, setCountdown] = useState('');

    // Fetch user name
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/users/${user?.email}`)
            .then((response) => setName(response.data.name))
            .catch(console.error);
    }, [user?.email]);

    // Load sell data
    const [sells, setSells] = useState([]);
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/orders`)
            .then(response => {
                if (response.data) {
                    setSells(response.data.filter(item => item.email === user?.email));
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching sell product data:', error);
                setLoading(false);
            });
    }, [user?.email]);

    // Calculate plan validity date
    const expiryDate = new Date(new Date(validUntil).getTime() + 90 * 24 * 60 * 60 * 1000);

    // Countdown Timer
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = expiryDate - now;

            if (distance <= 0) {
                clearInterval(interval);
                setCountdown('প্ল্যানের মেয়াদ শেষ!');
                handlePlanExpired(); // Function call when expired
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

    // Function triggered when plan expires
    const handlePlanExpired = () => {
        const data = {
            email: user.email,
        }
        alert('⚠️ আপনার সাবস্ক্রিপশন মেয়াদ শেষ হয়েছে! দয়া করে প্ল্যান আপগ্রেড করুন।');
        axios.patch(`${import.meta.env.VITE_BASE_URL}/users_mayead_sesh`, data)
            .then(response => {
                console.log('User plan status updated due to expiry:', response.data);
            })
            .catch(error => {
                console.error('Error updating user plan status:', error);
            });


    }


    return (
        <>
            <Helmet>
                <title>ড্যাশবোর্ড - LetsDropship</title>
                <meta name="description" content="আপনার LetsDropship ড্যাশবোর্ড পরিচালনা করুন।" />
            </Helmet>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">স্বাগতম, {name}!</h1>
                        <p className="text-muted-foreground">আপনার ড্যাশবোর্ডে স্বাগতম। এখানে আপনার ব্যবসার একটি সংক্ষিপ্ত চিত্র দেখুন।</p>
                    </div>
                    <Button asChild>
                        <NavLink to="/">নতুন পণ্য দেখুন</NavLink>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>সাবস্ক্রিপশন ওভারভিউ</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-primary/5 rounded-lg">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-primary">{plan}</h3>
                            <p className="text-muted-foreground">
                                বৈধ থাকবে:{" "}
                                {expiryDate.toLocaleDateString('bn-BD', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <p className="text-sm mt-2 md:text-xl text-red-700 font-medium">
                                ⏳ বাকি সময়: {countdown}
                            </p>
                        </div>
                        <Button asChild className="mt-4 sm:mt-0">
                            <NavLink to="/membership">প্ল্যান আপগ্রেড করুন</NavLink>
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <CircleStatCard
                        title="মোট রেভিনিউ"
                        value={`৳${sells.reduce((acc, item) => acc + (parseInt(item.amar_bikri_mullo) - parseInt(item.items_total)), 0).toLocaleString('bn-BD')}`}
                        percentage={75}
                        description={`${sells.length} অর্ডার`}
                        primaryColor="hsl(142.1 76.2% 41.2%)"
                        secondaryColor="hsl(142.1 76.2% 41.2% / 0.1)"
                        icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
                    />
                    <CircleStatCard
                        title="মোট সেলস"
                        value={`৳${sells.reduce((acc, item) => acc + parseInt(item.amar_bikri_mullo), 0).toLocaleString('bn-BD')}`}
                        percentage={85}
                        description={`${sells.length} অর্ডার`}
                        primaryColor="hsl(34.9 91.6% 58.4%)"
                        secondaryColor="hsl(34.9 91.6% 58.4% / 0.1)"
                        icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
                    />
                    <CircleStatCard
                        title="ইম্পোর্ট করা পণ্য"
                        value={`${sells.reduce((acc, item) => acc + parseInt(item.items_total), 0).toLocaleString('bn-BD')}`}
                        percentage={70}
                        description={`গত মাস থেকে ${sells.length} পণ্য ইম্পোর্ট করা হয়েছে।`}
                        primaryColor="hsl(217.2 91.2% 59.8%)"
                        secondaryColor="hsl(217.2 91.2% 59.8% / 0.1)"
                        icon={<Package className="h-5 w-5 text-muted-foreground" />}
                    />
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
