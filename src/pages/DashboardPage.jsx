
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Package, ShoppingCart } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import CircleStatCard from '@/components/CircleStatCard';
import axios from 'axios';

const salesData = [
    { name: 'জান', sales: 120000 },
    { name: 'ফেব্রু', sales: 150000 },
    { name: 'মার্চ', sales: 175000 },
    { name: 'এপ্রিল', sales: 210000 },
    { name: 'মে', sales: 190000 },
    { name: 'জুন', sales: 230000 },
];

const DashboardPage = () => {
    const { user, setLoading, loading } = useAuth();
    const { subscription } = user;
    const { plan, validUntil } = subscription;
    const [name, setName] = useState(' ');
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/users/${user?.email}`)
            .then((response) => {
                setName(response.data.name);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [user?.email])
    // load sell data
    const [sells, setSells] = useState([]);
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/orders`)
            .then(response => {
                if (response.data) {
                    setSells(response.data.filter(item => item.email === user?.email));
                    // console.log(response.data.filter(item => item.email === user?.email));
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching sell product data:', error);
                setLoading(false);
            });
    }, [user?.email])

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
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
                        <NavLink to="/dashboard/my-products">নতুন পণ্য ইম্পোর্ট করুন</NavLink>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>সাবস্ক্রিপশন ওভারভিউ</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-primary/5 rounded-lg">
                        <div>
                            <h3 className="text-xl font-bold text-primary">{plan}</h3>
                            <p className="text-muted-foreground">আপনার প্ল্যানটি {new Date(new Date(validUntil).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })} পর্যন্ত বৈধ।</p>
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

                {/* <div className="grid grid-cols-1 gap-6">
                    <Card className="">
                        <CardHeader>
                            <CardTitle>বিক্রয় সারসংক্ষেপ</CardTitle>
                            <CardDescription>গত ৬ মাসের বিক্রয় ডেটা দেখুন।</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={salesData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value / 1000}k`} />
                                    <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.1)' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', borderRadius: '0.5rem' }} />
                                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                </div> */}
            </div>
        </>
    );
};

export default DashboardPage;
