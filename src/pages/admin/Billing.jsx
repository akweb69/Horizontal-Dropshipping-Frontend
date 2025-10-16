import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';

const Billing = () => {
    const [bkashNumber, setBkashNumber] = useState('');
    const [nagadNumber, setNagadNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [paymentData, setPaymentData] = useState({ bkashNumber: '', nagadNumber: '' });
    const [loadingData, setLoadingData] = useState(true);

    // Fetch existing payment data on component mount
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

            console.log(response);
            setMessage({ type: 'success', text: 'Payment numbers updated successfully!' });

            // Refresh the data after successful update
            fetchPaymentData();

            // Clear input fields
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
        <div className="min-h-screen bg-gray-50 py-8">
            <Helmet>
                <title>বিলিং ম্যানেজ করুন</title>
            </Helmet>

            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">বিলিং ম্যানেজ করুন</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Form */}
                    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold mb-6 text-gray-800">নতুন পেমেন্ট নম্বর যোগ করুন</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="bkashNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    Bkash Number
                                </label>
                                <input
                                    id="bkashNumber"
                                    type="text"
                                    placeholder="Enter your Bkash number"
                                    value={bkashNumber}
                                    onChange={(e) => setBkashNumber(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="nagadNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nagad Number
                                </label>
                                <input
                                    id="nagadNumber"
                                    type="text"
                                    placeholder="Enter your Nagad number"
                                    value={nagadNumber}
                                    onChange={(e) => setNagadNumber(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            ></path>
                                        </svg>
                                        প্রক্রিয়াকরণ চলছে...
                                    </>
                                ) : (
                                    'যোগ করুন'
                                )}
                            </button>

                            {message.text && (
                                <div
                                    className={`p-3 rounded-lg text-center font-medium ${message.type === 'success'
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-red-100 text-red-700 border border-red-200'
                                        }`}
                                >
                                    {message.text}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right Column - Existing Data */}
                    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold mb-6 text-gray-800">বর্তমান পেমেন্ট তথ্য</h2>

                        {loadingData ? (
                            <div className="flex justify-center items-center h-48">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-blue-800 mb-2">Bkash Number</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {paymentData[0].bkashNumber || 'কোনো নম্বর সেট করা নেই'}
                                    </p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-green-800 mb-2">Nagad Number</h3>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {paymentData[0].nagadNumber || 'কোনো নম্বর সেট করা নেই'}
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={fetchPaymentData}
                                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                        disabled={loadingData}
                                    >
                                        রিফ্রেশ করুন
                                    </button>
                                    {paymentData.bkashNumber || paymentData.nagadNumber ? (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('আপনি কি নিশ্চিত যে সব ডেটা মুছে ফেলতে চান?')) {
                                                    // Add delete API call here
                                                    setPaymentData({ bkashNumber: '', nagadNumber: '' });
                                                    setMessage({ type: 'success', text: 'ডেটা সফলভাবে মুছে ফেলা হয়েছে!' });
                                                }
                                            }}
                                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                        >
                                            মুছে ফেলুন
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;