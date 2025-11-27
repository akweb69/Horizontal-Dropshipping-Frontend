import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
    User,
    Mail,
    MessageCircle,
    Facebook,
    MessageSquare,
    Send,
    Loader2,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Sparkles,
    PartyPopper
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Loader11 from './Loader11';

const ClassRequest = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const [isClassReqAllow, setIsClassReqAllow] = useState(true);
    const [uiLoading, setUiLoading] = useState(true);
    const [classHistory, setClassHistory] = useState([]);
    const [isCompletedClasses, setIsCompletedClasses] = useState(false)

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

        if (!formData.whatsapp || !formData.classTopic) {
            toast({
                title: 'সব প্রয়োজনীয় তথ্য পূরণ করুন',
                description: 'হোয়াটসঅ্যাপ এবং ক্লাসের বিষয় আবশ্যক।',
                variant: 'destructive'
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${base_url}/class-request`, formData);
            if (response.data.acknowledged) {
                toast({
                    title: 'ক্লাস রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!',
                    description: 'আমরা খুব শীঘ্রই আপনার সাথে যোগাযোগ করব।',
                });
                e.target.reset();
            }
        } catch (err) {
            toast({
                title: 'রিকোয়েস্ট পাটে সমস্যা হয়েছে',
                description: 'ইন্টারনেট চেক করে আবার চেষ্টা করুন।',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {




        axios.get(`${base_url}/gift-certificate`)
            .then(res => {
                const myData = res.data.find(item => item.giftEmail === user?.email);
                if (myData) {
                    setIsCompletedClasses(true);
                }
            })
            .catch(console.error);

        axios.get(`${base_url}/class-management`)
            .then(res => {
                const myData = res.data.filter(item => item.classEmail === user?.email);
                setClassHistory(myData);
            })
            .catch(console.error);

        axios.get(`${base_url}/class-request`)
            .then(res => {
                const exists = res.data.some(item => item.email === user?.email);
                setIsClassReqAllow(!exists);
                setUiLoading(false);
            })
            .catch(err => {
                console.error(err);
                setUiLoading(false);
            });
    }, [user?.email]);

    if (uiLoading) return <Loader11 />;

    return (
        <>
            <Helmet>
                <title>ক্লাস রিকোয়েস্ট - UnicDropex</title>
            </Helmet>

            {/* ==================== CLASS REQUEST FORM ==================== */}
            <AnimatePresence mode="wait">
                {isClassReqAllow && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-screen  py-12 px-4"
                    >
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-center mb-12"
                            >
                                <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-4 py-3">
                                    ক্লাস রিকোয়েস্ট করুন
                                </h1>
                                <p className="text-xl text-gray-700">তোমার পছন্দের বিষয়ে একদম লাইভ ক্লাস নাও!</p>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-orange-100 p-8 md:p-12"
                            >
                                <form onSubmit={handleSubmit} className="space-y-7">
                                    {/* Name & Email - Readonly */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="relative">
                                            <User className="absolute left-4 top-4 w-5 h-5 text-orange-500" />
                                            <input
                                                type="text"
                                                value={user?.name || ''}
                                                readOnly
                                                className="w-full pl-12 pr-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl text-gray-800 font-medium"
                                                placeholder="নাম"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-4 w-5 h-5 text-orange-500" />
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                readOnly
                                                className="w-full pl-12 pr-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl text-gray-800 font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* WhatsApp */}
                                    <div className="relative">
                                        <MessageCircle className="absolute left-4 top-4 w-6 h-6 text-green-600" />
                                        <input
                                            type="tel"
                                            name="whatsapp"
                                            required
                                            placeholder="হোয়াটসঅ্যাপ নম্বর (যোগাযোগের জন্য)"
                                            className="w-full pl-14 pr-5 py-4 bg-white border-2 border-orange-300 rounded-2xl focus:border-orange-500 focus:outline-none transition"
                                        />
                                    </div>

                                    {/* Facebook Optional */}
                                    <div className="relative">
                                        <Facebook className="absolute left-4 top-4 w-6 h-6 text-blue-600" />
                                        <input
                                            type="url"
                                            name="facebook"
                                            placeholder="ফেসবুক প্রোফাইল লিংক (অপশনাল)"
                                            className="w-full pl-14 pr-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none transition"
                                        />
                                    </div>

                                    {/* Class Topic */}
                                    <select
                                        name="classTopic"
                                        required
                                        className="w-full px-6 py-4 bg-white border-2 border-orange-300 rounded-2xl focus:border-orange-500 focus:outline-none transition text-gray-700 font-medium"
                                    >
                                        <option value="">ক্লাসের বিষয় নির্বাচন করো</option>
                                        <option value="dropshipping">ড্রপশিপিং এবং ডিজিটাল মার্কেটিং</option>

                                    </select>

                                    {/* Message */}
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-4 w-6 h-6 text-orange-500" />
                                        <textarea
                                            name="message"
                                            rows="4"
                                            placeholder="বিস্তারিত বলো, কী শিখতে চাও... (অপশনাল)"
                                            className="w-full pl-14 pr-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none resize-none transition"
                                        />
                                    </div>

                                    {/* note for user */}
                                    {/* <div className="">
                                        শর্তসমূহ মনোযোগ দিয়ে পড়ুন ।
                                    </div>
                                    <div className="p-3 rounded-md bg-orange-50 ">
                                        আসসালামুয়ালাইকুম ,

                                        আমাদের প্ল্যাটফর্মে নতুন স্টোর খোলার জন্য একটি নির্ধারিত স্টোর ওপেন ফি প্রদান করতে হবে।

                                        এই ফি শুধুমাত্র স্টোর রেজিস্ট্রেশন, ভেরিফিকেশন ও প্রাথমিক সেটআপ সাপোর্টের জন্য ব্যবহৃত হবে।

                                        একবার স্টোর ওপেন ফি প্রদান করা হলে এই ফি কোনো অবস্থাতেই ফেরতযোগ্য (non-refundable) নয়।

                                        যদি কোনো কারণে স্টোর মালিক স্টোর বন্ধ করতে চান বা স্টোর নিষ্ক্রিয় করে রাখেন, তাহলেও প্রদত্ত ফি ফেরত দেওয়া হবে না।

                                        প্ল্যাটফর্ম যেকোনো সময় স্টোরের কার্যক্রম যাচাই করার অধিকার রাখে এবং প্রয়োজন অনুযায়ী অতিরিক্ত তথ্য চাইতে পারে।

                                        সকল স্টোর মালিককে আমাদের শর্তাবলি, নীতিমালা ও কমিউনিটি গাইডলাইন মেনে চলতে হবে।

                                        প্রতারণা, ভুয়া তথ্য বা নিয়ম ভঙ্গের কারণে স্টোর সাসপেন্ড বা ব্যান হলে—ফিরে কোনো ফি ফেরত দেওয়া হবে না।

                                        স্টোর ওপেন ফি সময় সময় আপডেট বা পরিবর্তন হতে পারে এবং যেকোনো পরিবর্তন আগে থেকেই স্টোর মালিককে জানানো হবে।

                                        আমাদের সাইটে স্টোর চালু করার মাধ্যমে আপনি স্বেচ্ছায় এই নীতিমালার সব শর্ত মেনে নিতে সম্মত হচ্ছেন।

                                    </div>
                                    <div className="flex items-center gap-3 text-lg">
                                        <input
                                            required
                                            type="radio" name="shorto" id="shorto" />
                                        <label htmlFor="shorto"> শর্তসমূহ মনোযোগ দিয়ে পড়েছি ।</label>

                                    </div> */}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                পাঠানো হচ্ছে...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-6 h-6" />
                                                রিকোয়েস্ট পাঠাও
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================== CLASS HISTORY (When Request Already Sent) ==================== */}
            <AnimatePresence mode="wait">
                {!isClassReqAllow && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-screen  py-16 px-4"
                    >
                        <div className="max-w-5xl mx-auto">
                            <motion.div
                                initial={{ y: -40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-center mb-12"
                            >
                                <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 flex items-center py-3 bangla  justify-center gap-4">
                                    <Sparkles className="w-12 h-12 text-amber-500" />
                                    আমার ক্লাস হিস্ট্রি
                                    <Sparkles className="w-12 h-12 text-amber-500" />
                                </h2>

                            </motion.div>

                            {/* congrates for conpmlete all classes */}
                            {
                                isCompletedClasses && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="flex items-center gap-3 bg-green-50 dark:bg-green-900/30 
                       border border-green-300 dark:border-green-700 
                       px-4 py-3 rounded-xl shadow-sm mb-4"
                                    >
                                        <PartyPopper className="text-green-600 dark:text-green-400 w-6 h-6" />

                                        <p className="text-green-700 dark:text-green-300 font-medium">
                                            🎉 Congratulations! You have completed all classes!
                                        </p>
                                    </motion.div>
                                )
                            }

                            {classHistory.length === 0 ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-20"
                                >
                                    <div className="bg-white/60 backdrop-blur rounded-3xl p-12 shadow-xl">
                                        <Calendar className="w-20 h-20 text-orange-300 mx-auto mb-4" />
                                        <p className="text-2xl text-gray-600">এখনো কোনো ক্লাস নেওয়া হয়নি</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {classHistory.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.15 }}
                                            whileHover={{ scale: 1.05, rotate: 1 }}
                                            className="group relative overflow-hidden rounded-3xl bg-white shadow-lg border border-orange-100"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-amber-400/10 group-hover:from-orange-400/20 transition" />

                                            <div className="relative p-8">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="w-8 h-8 text-orange-600" />
                                                        <h3 className="text-2xl font-bold text-gray-800">
                                                            {item.classDate || 'তারিখ নেই'}
                                                        </h3>
                                                    </div>
                                                    {item.classPresent === "Present" ? (
                                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                                    ) : (
                                                        <XCircle className="w-10 h-10 text-red-500" />
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <p className="text-lg font-semibold text-orange-700">
                                                        {item.classTitle || 'ক্লাসের নাম নেই'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="w-4 h-4 text-gray-500" />
                                                        <span className={`font-bold ${item.classPresent === "Present" ? "text-green-600" : "text-red-600"}`}>
                                                            {item.classPresent === "Absent" ? "উপস্থিত হয়নি" : "উপস্থিত ছিলেন"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-6 border-t border-orange-100">
                                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full text-orange-800 font-semibold text-sm">
                                                        <Sparkles className="w-4 h-4" />
                                                        {index + 1} নম্বর ক্লাস
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ClassRequest;