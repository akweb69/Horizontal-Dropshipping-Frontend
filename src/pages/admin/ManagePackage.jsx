import axios from 'axios';
import { Loader, Search, Filter, X, Calendar, XCircle } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Info, CreditCard, Calendar as CalendarIcon, User, BadgeCheck, Wallet, Edit3, Eye } from "lucide-react";
import { toast } from '@/components/ui/use-toast';

const ManagePackage = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [modalData, setModalData] = useState({});
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Load data
    useEffect(() => {
        setLoading(true);
        axios.get(`${import.meta.env.VITE_BASE_URL}/buy-package`)
            .then(res => {
                setPackages(res.data);
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
                console.error(err);
                toast({ title: 'ডেটা লোড করতে ব্যর্থ', variant: 'destructive' });
            });
    }, []);

    // Handle detail modal
    const handleDetail = (pkg) => {
        setIsDetailOpen(true);
        setModalData(pkg);
    };

    // Handle status change initiation
    const handleStatusChange = (pkg) => {
        setSelectedPackage(pkg);
        setNewStatus(pkg.packageStatus);
        setIsStatusModalOpen(true);
    };

    // Handle status update
    const updateStatus = async () => {
        if (!selectedPackage || !newStatus) return;

        setStatusLoading(true);
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_BASE_URL}/buy-package/${selectedPackage._id}`,
                { packageStatus: newStatus, email: selectedPackage.email, planName: selectedPackage.planName, storeInfo: selectedPackage.storeInfo, validityDays: selectedPackage.validityDays }
            );
            if (response.data) {
                setPackages(packages.map(pkg =>
                    pkg._id === selectedPackage._id ? { ...pkg, packageStatus: newStatus } : pkg
                ));
                setIsStatusModalOpen(false);
                toast({ title: 'স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!' });
            } else {
                toast({ title: 'কোনো পরিবর্তন হয়নি।', variant: 'destructive' });
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'স্ট্যাটাস আপডেট করতে ব্যর্থ।', variant: 'destructive' });
        } finally {
            setStatusLoading(false);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('All');
        setPaymentFilter('All');
        setFromDate('');
        setToDate('');
        toast({ title: 'সকল ফিল্টার ক্লিয়ার করা হয়েছে' });
    };

    // Filter Logic using useMemo
    const filteredPackages = useMemo(() => {
        return packages.filter(pkg => {
            // Search
            const matchesSearch = searchQuery === '' ||
                pkg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pkg.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pkg.planName?.toLowerCase().includes(searchQuery.toLowerCase());

            // Status
            const matchesStatus = statusFilter === 'All' || pkg.packageStatus === statusFilter;

            // Payment Method
            const matchesPayment = paymentFilter === 'All' || pkg.paymentMethod === paymentFilter;

            // Date Range
            const pkgDate = new Date(pkg.timestamp);
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            const matchesDate = (!from || pkgDate >= from) && (!to || pkgDate <= to);

            return matchesSearch && matchesStatus && matchesPayment && matchesDate;
        });
    }, [packages, searchQuery, statusFilter, paymentFilter, fromDate, toDate]);

    // Loading UI
    if (loading) {
        return (
            <div className='min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'>
                <Loader className='w-16 h-16 text-primary animate-spin' />
                <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">লোড হচ্ছে...</p>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4'>
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    প্যাকেজ ম্যানেজমেন্ট
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">সকল ক্রয়কৃত প্যাকেজ দেখুন ও নিয়ন্ত্রণ করুন</p>
            </div>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সার্চ করুন</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ইমেইল, ট্রানজেকশন, প্ল্যান..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">স্ট্যাটাস</label>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                            >
                                <option value="All">সব</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Payment Method */}
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পেমেন্ট</label>
                            <select
                                value={paymentFilter}
                                onChange={e => setPaymentFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                            >
                                <option value="All">সব</option>
                                <option value="Bkash">Bkash</option>
                                <option value="Nagad">Nagad</option>
                                <option value="Rocket">Rocket</option>
                                <option value="Bank">Bank</option>
                            </select>
                        </div>

                        {/* From Date */}
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">শুরু</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* To Date */}
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">শেষ</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Clear Filters */}
                        <button
                            onClick={clearFilters}
                            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
                        >
                            <X className="w-4 h-4" />
                            ক্লিয়ার
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {isDetailOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50">
                    <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl w-full max-w-2xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700">
                        <button onClick={() => setIsDetailOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-600">
                            <XCircle className="w-8 h-8" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-6">
                            <Info className="w-7 h-7 text-blue-500" />
                            প্যাকেজের বিস্তারিত তথ্য
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl">
                                <Wallet className="w-6 h-6 text-emerald-600" />
                                <div>
                                    <p className="text-sm text-gray-500">প্ল্যান নাম</p>
                                    <p className="font-semibold">{modalData?.planName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl">
                                <CreditCard className="w-6 h-6 text-amber-600" />
                                <div>
                                    <p className="text-sm text-gray-500">পরিমাণ</p>
                                    <p className="font-semibold">{modalData?.amount} টাকা</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl">
                                <BadgeCheck className="w-6 h-6 text-purple-600" />
                                <div>
                                    <p className="text-sm text-gray-500">পেমেন্ট মেথড</p>
                                    <p className="font-semibold">{modalData?.paymentMethod}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl">
                                <CreditCard className="w-6 h-6 text-pink-600" />
                                <div>
                                    <p className="text-sm text-gray-500">ট্রানজেকশন আইডি</p>
                                    <p className="font-semibold break-all">{modalData?.transactionId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl">
                                <CreditCard className="w-6 h-6 text-pink-600" />
                                <div>
                                    <p className="text-sm text-gray-500">পেমেন্ট নাম্বার</p>
                                    <p className="font-semibold break-all">{modalData?.paymentNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl col-span-2">
                                <CalendarIcon className="w-6 h-6 text-cyan-600" />
                                <div>
                                    <p className="text-sm text-gray-500">তারিখ ও সময়</p>
                                    <p className="font-semibold">{new Date(modalData?.timestamp).toLocaleString('bn-BD')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl">
                                <User className="w-6 h-6 text-orange-600" />
                                <div>
                                    <p className="text-sm text-gray-500">ইউজার ইমেইল</p>
                                    <p className="font-semibold">{modalData?.email}</p>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-xl col-span-1
                                ${modalData?.packageStatus === 'Approved' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                                    modalData?.packageStatus === 'Rejected' ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' :
                                        'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'}`}>
                                <BadgeCheck className="w-6 h-6" />
                                <div>
                                    <p className="text-sm">স্ট্যাটাস</p>
                                    <p className="font-bold">{modalData?.packageStatus}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <Edit3 className="w-6 h-6 text-indigo-500" />
                                স্ট্যাটাস আপডেট
                            </h2>
                            <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-500 hover:text-red-600">
                                <XCircle className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                নতুন স্ট্যাটাস নির্বাচন করুন
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsStatusModalOpen(false)}
                                className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                বাতিল
                            </button>
                            <button
                                onClick={updateStatus}
                                disabled={statusLoading}
                                className={`px-6 py-2.5 rounded-xl font-semibold text-white shadow-md transition-all ${statusLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105'
                                    }`}
                            >
                                {statusLoading ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Table */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-primary to-indigo-600 text-white">
                                    <th className="px-6 py-4 text-left font-semibold">প্ল্যান নাম</th>
                                    <th className="px-6 py-4 text-left font-semibold">পেমেন্ট</th>
                                    <th className="px-6 py-4 text-left font-semibold">ট্রানজেকশন</th>
                                    <th className="px-6 py-4 text-center font-semibold">পরিমাণ</th>
                                    <th className="px-6 py-4 text-center font-semibold">স্ট্যাটাস</th>
                                    <th className="px-6 py-4 text-center font-semibold">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredPackages.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-500 dark:text-gray-400">
                                            কোনো প্যাকেজ পাওয়া যায়নি
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPackages.map(pkg => (
                                        <tr key={pkg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                                            <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{pkg?.planName}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{pkg?.paymentMethod}</td>
                                            <td className="px-6 py-4 text-sm font-mono text-gray-700 dark:text-gray-300">{pkg?.transactionId}</td>
                                            <td className="px-6 py-4 text-center font-bold text-lg text-primary">{pkg?.amount}৳</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                                                    ${pkg?.packageStatus === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                        pkg?.packageStatus === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                                    {pkg?.packageStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleDetail(pkg)}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        বিস্তারিত
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(pkg)}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                        স্ট্যাটাস
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagePackage;