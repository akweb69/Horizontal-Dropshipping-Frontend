import axios from 'axios';
import { Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { XCircle, Info, CreditCard, Calendar, User, BadgeCheck, Wallet } from "lucide-react";


const ManagePackage = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    // load data-->
    useEffect(() => {
        setLoading(true)
        axios.get(`${import.meta.env.VITE_BASE_URL}/buy-package`)
            .then(res => {
                setPackages(res.data)
                setLoading(false)
                console.log(res.data)
            })
            .catch(err => {
                setLoading(false)
            })
    }, [])
    // handleDetail
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [modalData, setModalData] = useState({});
    const handleDetail = (pkg) => {
        setIsDetailOpen(true)
        setModalData(pkg)
    }

    // check loading
    if (loading) {
        return <div className='w-full flex justify-center items-center'>
            <Loader className='w-12 h-12 text-primary animate-spin' />
        </div>
    }
    // main output -->

    return (
        <div className='w-full'>
            {/* modal */}
            {
                isDetailOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
                        <div className="bg-white dark:bg-gray-900 w-[90%] md:w-[500px] p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all transform scale-100">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-blue-500" />
                                    প্যাকেজ বিস্তারিত
                                </h2>
                                <button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="text-red-500 hover:text-red-600 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                <p className="flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-green-500" />
                                    <strong>প্ল্যান নাম:</strong> {modalData?.planName}
                                </p>
                                <p className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-yellow-500" />
                                    <strong>টাকা পরিমাণ:</strong> {modalData?.amount} টাকা
                                </p>
                                <p className="flex items-center gap-2">
                                    <BadgeCheck className="w-5 h-5 text-purple-500" />
                                    <strong>পেমেন্ট মেথড:</strong> {modalData?.paymentMethod}
                                </p>
                                <p className="flex items-center gap-2 break-words">
                                    <CreditCard className="w-5 h-5 text-teal-500" />
                                    <strong>ট্রানজেকশন আইডি:</strong> {modalData?.transactionId}
                                </p>
                                <p className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <strong>টাইমস্ট্যাম্প:</strong>{" "}
                                    {new Date(modalData?.timestamp).toLocaleString()}
                                </p>
                                <p className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-orange-500" />
                                    <strong>ইউজার নাম:</strong> {modalData?.userName}
                                </p>
                                <p className="flex items-center gap-2">
                                    <BadgeCheck className="w-5 h-5 text-indigo-500" />
                                    <strong>প্যাকেজ স্ট্যাটাস:</strong> {modalData?.packageStatus}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full font-medium hover:opacity-90 transition"
                                >
                                    বন্ধ করুন
                                </button>
                            </div>
                        </div>
                    </div>

                )
            }


            <h1 className="text-2xl font-bold text-center text-primary">প্যাকেজ ম্যানেজ করুন</h1>
            {/* main data table */}
            <div className="bg-white p-4 md:p-6 rounded-lg mt-10">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="px-4 py-2">প্ল্যান নাম</th>
                                <th className="px-4 py-2">পেমেন্ট মেথড </th>
                                <th className="px-4 py-2">ট্রানজেকশন </th>
                                <th className="px-4 py-2">টাকা পরিমাণ</th>
                                <th className="px-4 py-2">প্যাকেজ স্ট্যাটাস</th>
                                <th className="px-4 py-2">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                packages.map(pkg => (
                                    <tr key={pkg._id} className="border-b">
                                        <td className="px-4 py-2">{pkg?.planName}</td>
                                        <td className="px-4 py-2">{pkg?.paymentMethod}</td>
                                        <td className="px-4 py-2">{pkg?.transactionId}</td>
                                        <td className="px-4 py-2">{pkg?.amount}</td>
                                        <td className="px-4 py-2">{pkg?.packageStatus}</td>
                                        <td className="px-4 py-2 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleDetail(pkg)}
                                                className='bg-red-500 text-white px-2 py-1 rounded-md'>
                                                বিস্তারিত
                                            </button>
                                            <button className='bg-green-500 text-white px-2 py-1 rounded-md'>
                                                স্ট্যাটাস পরিবর্তন
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagePackage;