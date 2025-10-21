import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, RefreshCw, Trash2, Wallet, Smartphone } from 'lucide-react';

const Billing = () => {
    const [bkashNumber, setBkashNumber] = useState('');
    const [nagadNumber, setNagadNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [paymentData, setPaymentData] = useState({ bkashNumber: '', nagadNumber: '' });
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        fetchPaymentData();
    }, []);

    const fetchPaymentData = async () => {
        try {
            setLoadingData(true);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/payment-number`);
            setPaymentData(response.data);
        } catch (error) {
            console.error('Error fetching payment data:', error);
            setMessage({ type: 'error', text: 'Failed to load existing payment data.' });
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!bkashNumber.trim() && !nagadNumber.trim()) {
            setMessage({ type: 'error', text: 'Please enter at least one payment number.' });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/payment-number`, {
                bkashNumber,
                nagadNumber,
            });

            setMessage({ type: 'success', text: 'Payment numbers updated successfully!' });
            fetchPaymentData();
            setBkashNumber('');
            setNagadNumber('');
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 py-8 px-4">
            <Helmet>
                <title>বিলিং ম্যানেজ করুন</title>
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl md:text-5xl py-3 font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        বিলিং ম্যানেজ করুন
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">পেমেন্ট নম্বর আপডেট ও দেখুন</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl -z-10"></div>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                <Wallet className="h-6 w-6 text-blue-600" />
                                নতুন পেমেন্ট নম্বর যোগ করুন
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Bkash */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Bkash Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Smartphone className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="01XXXXXXXXX"
                                            value={bkashNumber}
                                            onChange={(e) => setBkashNumber(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            disabled={loading}
                                        />
                                    </div>
                                </motion.div>

                                {/* Nagad */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Nagad Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Smartphone className="h-5 w-5 text-green-500" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="01XXXXXXXXX"
                                            value={nagadNumber}
                                            onChange={(e) => setNagadNumber(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            disabled={loading}
                                        />
                                    </div>
                                </motion.div>

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            প্রক্রিয়াকরণ চলছে...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="h-5 w-5" />
                                            যোগ করুন
                                        </>
                                    )}
                                </motion.button>

                                {/* Message */}
                                <AnimatePresence>
                                    {message.text && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className={`p-4 rounded-xl text-center font-semibold border ${message.type === 'success'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                                }`}
                                        >
                                            {message.text}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </motion.div>

                    {/* Right: Existing Data */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 blur-3xl -z-10"></div>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 h-full flex flex-col">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                <Smartphone className="h-6 w-6 text-emerald-600" />
                                বর্তমান পেমেন্ট তথ্য
                            </h2>

                            {loadingData ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-6 flex-1">
                                    {/* Bkash */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 p-5 rounded-xl border border-blue-200 dark:border-blue-700"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-600 rounded-lg">
                                                <Smartphone className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="font-bold text-blue-800 dark:text-blue-300">Bkash Number</h3>
                                        </div>
                                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white pl-11">
                                            {paymentData[0]?.bkashNumber || '—'}
                                        </p>
                                    </motion.div>

                                    {/* Nagad */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/50 p-5 rounded-xl border border-emerald-200 dark:border-emerald-700"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-emerald-600 rounded-lg">
                                                <Smartphone className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="font-bold text-emerald-800 dark:text-emerald-300">Nagad Number</h3>
                                        </div>
                                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white pl-11">
                                            {paymentData[0]?.nagadNumber || '—'}
                                        </p>
                                    </motion.div>

                                    {/* Action Buttons */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="flex gap-3 pt-4"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={fetchPaymentData}
                                            disabled={loadingData}
                                            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            <RefreshCw className={`h-5 w-5 ${loadingData ? 'animate-spin' : ''}`} />
                                            রিফ্রেশ
                                        </motion.button>

                                        {(paymentData[0]?.bkashNumber || paymentData[0]?.nagadNumber) && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    if (window.confirm('আপনি কি নিশ্চিত যে সব ডেটা মুছে ফেলতে চান?')) {
                                                        setPaymentData([{ bkashNumber: '', nagadNumber: '' }]);
                                                        setMessage({ type: 'success', text: 'ডেটা সফলভাবে মুছে ফেলা হয়েছে!' });
                                                    }
                                                }}
                                                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                                মুছে ফেলুন
                                            </motion.button>
                                        )}
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Billing;