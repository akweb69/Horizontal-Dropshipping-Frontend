import axios from 'axios';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

const Billing = () => {
    const [bkashNumber, setBkashNumber] = useState('');
    const [nagadNumber, setNagadNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
        <div className="max-w-lg mx-auto p-6">
            <Helmet>
                <title>বিলিং ম্যানেজ করুন</title>
            </Helmet>

            <h1 className="text-2xl font-bold mb-6 text-center">বিলিং ম্যানেজ করুন</h1>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 bg-white shadow-md p-5 rounded-xl border border-gray-100"
            >
                <div className="flex flex-col gap-2">
                    <label htmlFor="bkashNumber" className="font-medium text-gray-700">
                        Bkash Number
                    </label>
                    <input
                        id="bkashNumber"
                        type="text"
                        placeholder="Enter your Bkash number"
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="nagadNumber" className="font-medium text-gray-700">
                        Nagad Number
                    </label>
                    <input
                        id="nagadNumber"
                        type="text"
                        placeholder="Enter your Nagad number"
                        value={nagadNumber}
                        onChange={(e) => setNagadNumber(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition disabled:opacity-60 flex justify-center items-center gap-2"
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
                            Processing...
                        </>
                    ) : (
                        'Submit'
                    )}
                </button>

                {message.text && (
                    <p
                        className={`text-center font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'
                            }`}
                    >
                        {message.text}
                    </p>
                )}
            </form>
        </div>
    );
};

export default Billing;
