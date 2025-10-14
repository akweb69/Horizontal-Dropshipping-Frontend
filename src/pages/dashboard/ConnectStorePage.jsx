import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Store } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ConnectStorePage = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        productName: '',
        buyPrice: '',
        sellPrice: '',
    });
    const [loading, setLoading] = useState(false);

    // handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // handle form submit
    const handleConnectClick = async (e) => {
        e.preventDefault();

        if (!formData.productName || !formData.buyPrice || !formData.sellPrice) {
            toast({
                title: "⚠️ সব ফিল্ড পূরণ করুন!",
                description: "অনুগ্রহ করে সব ইনপুট ফিল্ড পূরণ করুন।",
            });
            return;
        }

        setLoading(true);
        try {
            const finalData = {
                productName: formData.productName,
                buyPrice: Number(formData.buyPrice),
                sellPrice: Number(formData.sellPrice),
                date: new Date().toISOString(),
                sellarEmail: user?.email,
            }
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/sell-product`, finalData);

            toast({
                title: "✅ সেল সংযুক্ত হয়েছে!",
                description: "আপনার পণ্য সফলভাবে সেল লিস্টে যুক্ত হয়েছে।",
            });

            console.log('Response:', response.data);
            // clear form after success
            setFormData({ productName: '', buyPrice: '', sellPrice: '' });
        } catch (error) {
            console.error(error);
            toast({
                title: "🚧 সংযুক্ত করা ব্যর্থ হয়েছে!",
                description: "দয়া করে আবার চেষ্টা করুন।",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>নতুন সেল সংযুক্ত করুন - LetsDropship</title>
            </Helmet>

            <div className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md">
                {/* Header Section */}
                <div className="flex items-center gap-3">
                    <Store className="text-primary w-8 h-8" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                            নতুন সেল সংযুক্ত করুন
                        </h1>
                        <p className="text-muted-foreground">
                            আপনার ই-কমার্স প্ল্যাটফর্মের সাথে সংযোগ স্থাপন করে পণ্য সিঙ্ক করুন।
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleConnectClick}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Product Name
                            </label>
                            <input
                                type="text"
                                id="productName"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-gray-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="buyPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Buy Price
                            </label>
                            <input
                                type="number"
                                id="buyPrice"
                                name="buyPrice"
                                value={formData.buyPrice}
                                onChange={handleChange}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-gray-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sell Price
                            </label>
                            <input
                                type="number"
                                id="sellPrice"
                                name="sellPrice"
                                value={formData.sellPrice}
                                onChange={handleChange}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-gray-200"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center mt-6">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 px-6 py-2 rounded-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    সংযুক্ত হচ্ছে...
                                </>
                            ) : (
                                "সংযুক্ত করুন"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ConnectStorePage;
