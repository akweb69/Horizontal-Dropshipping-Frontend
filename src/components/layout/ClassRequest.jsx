import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
    User,
    Phone,
    Mail,
    MessageSquare,
    Send,
    Loader2,
    Facebook,
    MessageCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ClassRequest = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = {
            name: user?.name,
            email: user?.email,
            whatsapp: e.target.whatsapp.value.trim(),
            facebook: e.target.facebook.value.trim() || null,
            classTopic: e.target.classTopic.value,
            message: e.target.message.value.trim() || null,
            submittedAt: new Date().toISOString()
        };

        // Validation
        if (!formData.name || !formData.email || !formData.whatsapp || !formData.classTopic) {
            toast({
                title: 'সব প্রয়োজনীয় তথ্য পূরণ করুন',
                description: 'নাম, ফোন, ইমেইল, হোয়াটসঅ্যাপ এবং ক্লাসের বিষয় আবশ্যক।',
                variant: 'destructive'
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${base_url}/class-request`, formData);

            if (response.data.acknowledged) {
                toast({
                    title: 'ক্লাসের জন্য রিকোয়েস্ট পাঠানো হয়েছে!',
                    description: 'ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
                });
                e.target.reset();
            }
        } catch (err) {
            console.error('Submit failed:', err);
            toast({
                title: 'রিকোয়েস্ট পাঠাতে ব্যর্থ',
                description: 'ইন্টারনেট সংযোগ চেক করুন অথবা পরে আবার চেষ্টা করুন।',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>ক্লাস রিকোয়েস্ট - UnicDropex</title>
                <meta name="description" content="আপনার পছন্দের ক্লাসের জন্য রিকোয়েস্ট করুন। আমরা আপনার সাথে যোগাযোগ করব।" />
            </Helmet>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-10"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            ক্লাস রিকোয়েস্ট করুন
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            আপনার পছন্দের বিষয়ে ক্লাস নিতে চান? নিচের ফর্মটি পূরণ করুন — আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
                        </p>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    আপনার নাম <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={user?.name}

                                        readOnly
                                        placeholder="আপনার পুরো নাম"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                    />
                                </div>
                            </div>



                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    ইমেইল <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        readOnly
                                        value={user?.email}
                                        placeholder="example@domain.com"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                    />
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    হোয়াটসঅ্যাপ নম্বর <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-3 top-3.5 w-5 h-5 text-green-500" />
                                    <input
                                        type="tel"
                                        id="whatsapp"
                                        name="whatsapp"
                                        required
                                        placeholder="হোয়াটসঅ্যাপে যোগাযোগের নম্বর"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Facebook (Optional) */}
                            <div>
                                <label htmlFor="facebook" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    ফেসবুক প্রোফাইল লিংক <span className="text-gray-400">(অপশনাল)</span>
                                </label>
                                <div className="relative">
                                    <Facebook className="absolute left-3 top-3.5 w-5 h-5 text-blue-600" />
                                    <input
                                        type="url"
                                        id="facebook"
                                        name="facebook"
                                        placeholder="https://facebook.com/yourprofile"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Class Topic */}
                            <div>
                                <label htmlFor="classTopic" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    ক্লাসের বিষয় <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="classTopic"
                                    name="classTopic"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                >
                                    <option value="">একটি বিষয় নির্বাচন করুন</option>
                                    <option value="dropshipping">ড্রপশিপিং শুরু করুন</option>
                                    <option value="facebook-marketing">ফেসবুক মার্কেটিং</option>
                                    <option value="seo">এসইও (SEO)</option>
                                    <option value="product-research">প্রোডাক্ট রিসার্চ</option>
                                    <option value="store-setup">স্টোর সেটআপ</option>
                                    <option value="ads">ফেসবুক অ্যাডস</option>
                                    <option value="other">অন্যান্য</option>
                                </select>
                            </div>

                            {/* Message (Optional) */}
                            <div>
                                <label htmlFor="message" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    অতিরিক্ত মেসেজ <span className="text-gray-400">(অপশনাল)</span>
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="4"
                                        placeholder="আপনার ক্লাস সম্পর্কে বিস্তারিত বলুন..."
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 text-base font-semibold bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        পাঠানো হচ্ছে...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        রিকোয়েস্ট পাঠান
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Footer Note */}
                        <p className="mt-6 text-center text-sm text-gray-500">
                            আমরা আপনার তথ্য গোপন রাখি। শুধুমাত্র ক্লাসের জন্য যোগাযোগ করা হবে।
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default ClassRequest;