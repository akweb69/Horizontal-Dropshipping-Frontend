
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const salesData = [
    { name: 'জান', revenue: 4000, profit: 2400 },
    { name: 'ফেব্রু', revenue: 3000, profit: 1398 },
    { name: 'মার্চ', revenue: 2000, profit: 9800 },
    { name: 'এপ্রিল', revenue: 2780, profit: 3908 },
    { name: 'মে', revenue: 1890, profit: 4800 },
    { name: 'জুন', revenue: 2390, profit: 3800 },
    { name: 'জুলাই', revenue: 3490, profit: 4300 },
];

const topProductsData = [
    { name: 'টি-শার্ট', sold: 450 },
    { name: 'স্মার্ট ওয়াচ', sold: 320 },
    { name: 'ইয়ারবাড', sold: 280 },
    { name: 'সামার ড্রেস', sold: 190 },
];

const AnalyticsPage = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/sell-product`)
            .then(response => {
                if (response.data) {
                    setData(response.data.filter(item => item.sellarEmail === user?.email));
                    // console.log(response.data.filter(item => item.sellarEmail === user?.email));
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching sell product data:', error);
                setLoading(false);
            });
    }, [user?.email]);
    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
    }
    return (
        <>
            <Helmet>
                <title>অ্যানালিটিক্স - LetsDropship</title>
            </Helmet>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">অ্যানালিটিক্স ও সেলস</h1>
                    <p className="text-muted-foreground">আপনার বিক্রয় এবং কর্মক্ষমতা নিরীক্ষণ করুন।</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">মোট ইম্পোর্ট করা পণ্য</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.reduce((acc, item) => acc + item.buyPrice, 0)}</div>
                            <p className="text-xs text-muted-foreground">+1800 গত মাসে</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">মোট বিক্রি</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.reduce((acc, item) => acc + item.sellPrice, 0)}</div>
                            <p className="text-xs text-muted-foreground">+ {data.reduce((acc, item) => acc + (item.sellPrice - 1000), 0)}  গত মাসে</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">মোট রেভিনিউ</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">৳{data.reduce((acc, item) => acc + (item.sellPrice - item.buyPrice), 0)}</div>
                            <p className="text-xs text-muted-foreground">+{data.reduce((acc, item) => acc + (item.sellPrice - item.buyPrice - 1000), 0)}  গত মাসে</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">মোট লাভ</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">৳{data.reduce((acc, item) => acc + (item.sellPrice - item.buyPrice), 0)}</div>
                            <p className="text-xs text-muted-foreground">+{data.reduce((acc, item) => acc + (item.sellPrice - item.buyPrice - 1000), 0)}  গত মাসে</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>রেভিনিউ এবং লাভ</CardTitle>
                        <CardDescription>গত ৭ মাসের রেভিনিউ এবং লাভের রিপোর্ট।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '0.5rem' }} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" name="রেভিনিউ" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="profit" name="লাভ" stroke="hsl(var(--secondary))" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>সর্বাধিক বিক্রিত পণ্য</CardTitle>
                        <CardDescription>এই মাসে আপনার সর্বাধিক বিক্রিত পণ্যসমূহ।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={topProductsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '0.5rem' }} />
                                <Legend />
                                <Bar dataKey="sold" name="বিক্রিত সংখ্যা" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AnalyticsPage;
