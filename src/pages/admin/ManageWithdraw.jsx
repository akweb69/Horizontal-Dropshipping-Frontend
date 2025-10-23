import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ManageWithdraw = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

    // Fetch withdrawals
    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw`);
            setWithdrawals(response.data);
            setFilteredWithdrawals(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch withdrawals');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters
    useEffect(() => {
        let filtered = withdrawals;

        if (searchEmail) {
            filtered = filtered.filter(w => w.email.toLowerCase().includes(searchEmail.toLowerCase()));
        }

        if (fromDate || toDate) {
            filtered = filtered.filter(w => {
                const requestDate = new Date(w.request_date);
                const from = fromDate ? new Date(fromDate) : new Date(0);
                const to = toDate ? new Date(toDate) : new Date();
                return requestDate >= from && requestDate <= to;
            });
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter(w => w.status === statusFilter);
        }

        setFilteredWithdrawals(filtered);
    }, [searchEmail, fromDate, toDate, statusFilter, withdrawals]);

    // Update status with confirmation
    const updateWithdrawalStatus = async (id, newStatus) => {
        const action = newStatus === 'Approved' ? 'অনুমোদন' : 'প্রত্যাখ্যান';
        const result = await Swal.fire({
            title: `আপনি কি নিশ্চিত?`,
            text: `এই উইথড্র ${action} করতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'Approved' ? '#10b981' : '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `হ্যাঁ, ${action} করুন`,
            cancelButtonText: 'বাতিল'
        });

        if (result.isConfirmed) {
            try {
                await axios.patch(`${import.meta.env.VITE_BASE_URL}/withdraw/${id}`, { status: newStatus });
                toast.success(`উইথড্র ${action} করা হয়েছে!`);
                fetchWithdrawals();
                setSelectedWithdrawal(null);
            } catch (err) {
                toast.error('অপারেশন ব্যর্থ হয়েছে');
                console.error(err);
            }
        }
    };

    const openDetailsModal = (withdrawal) => setSelectedWithdrawal(withdrawal);
    const closeDetailsModal = () => setSelectedWithdrawal(null);

    // Helper
    const toNum = (v) => (isNaN(v) ? 0 : Number(v));

    // Loading
    if (loading) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 text-red-600 text-lg font-semibold">
                {error}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen"
        >
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Withdrawal Management</h2>
                <p className="mt-2 text-gray-600">সকল উইথড্র রিকোয়েস্ট সহজে পরিচালনা করুন</p>
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল অনুসন্ধান</label>
                        <input type="text" placeholder="ইমেইল লিখুন..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">শুরুর তারিখ</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">শেষ তারিখ</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            <option value="All">সব স্ট্যাটাস</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {['ইমেইল', 'পরিমাণ', 'স্ট্যাটাস', 'তারিখ', 'অ্যাকশন'].map(h => (
                                    <th key={h} className="py-4 px-6 text-left text-sm font-semibold text-gray-900">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredWithdrawals.map((w, i) => (
                                    <motion.tr
                                        key={w._id}
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="py-4 px-6 text-sm text-gray-700">{w.email}</td>
                                        <td className="py-4 px-6 text-sm font-bold text-gray-900">৳{toNum(w.amount).toFixed(2)}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit
                                                ${w.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    w.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {w.status === 'Approved' && 'Approved'}
                                                {w.status === 'Rejected' && 'Rejected'}
                                                {w.status === 'Pending' && 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-700">{w.request_date}</td>
                                        <td className="py-4 px-6 flex gap-2">
                                            <motion.button onClick={() => openDetailsModal(w)}
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                                                Details
                                            </motion.button>
                                            {w.status === 'Pending' && (
                                                <>
                                                    <motion.button onClick={() => updateWithdrawalStatus(w._id, 'Approved')}
                                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                                                        Approve
                                                    </motion.button>
                                                    <motion.button onClick={() => updateWithdrawalStatus(w._id, 'Rejected')}
                                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
                                                        Reject
                                                    </motion.button>
                                                </>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* === UPGRADED MODAL === */}
            <AnimatePresence>
                {selectedWithdrawal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closeDetailsModal}
                    >
                        <motion.div
                            className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 max-w-md w-full border border-gray-200"
                            initial={{ scale: 0.85, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.85, y: 50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="text-blue-600">Details</span> উইথড্র বিস্তারিত
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                                    ${selectedWithdrawal.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                        selectedWithdrawal.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'}`}>
                                    {selectedWithdrawal.status}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="space-y-4 text-sm">
                                {/* Email */}
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                    <span className="font-medium text-gray-700">ইমেইল</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-gray-900">{selectedWithdrawal.email}</span>
                                        <button onClick={() => { navigator.clipboard.writeText(selectedWithdrawal.email); toast.success('কপি হয়েছে!'); }}
                                            className="text-blue-600 hover:text-blue-800" title="কপি">
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                    <span className="font-medium text-gray-700">পরিমাণ</span>
                                    <span className="text-xl font-bold text-blue-700">৳{toNum(selectedWithdrawal.amount).toFixed(2)}</span>
                                </div>

                                {/* Charge */}
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                                    <span className="font-medium text-gray-700">চার্জ (১%)</span>
                                    <span className="font-bold text-red-700">-৳{toNum(selectedWithdrawal.charge).toFixed(2)}</span>
                                </div>

                                {/* Net Amount */}
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                                    <span className="font-medium text-gray-700">প্রাপ্ত হবে</span>
                                    <span className="text-lg font-bold text-green-700">
                                        ৳{(toNum(selectedWithdrawal.amount) - toNum(selectedWithdrawal.charge)).toFixed(2)}
                                    </span>
                                </div>

                                {/* Payment Method */}
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                                    <span className="font-medium text-gray-700">পেমেন্ট মেথড</span>
                                    <span className="font-semibold text-purple-700 flex items-center gap-1">
                                        {selectedWithdrawal.paymentMethod === 'Bkash' && 'Bkash'}
                                        {selectedWithdrawal.paymentMethod === 'Nagad' && 'Nagad'}
                                    </span>
                                </div>

                                {/* Payment Number */}
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                    <span className="font-medium text-gray-700">নম্বর</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-gray-900">{selectedWithdrawal.paymentNumber}</span>
                                        <button onClick={() => { navigator.clipboard.writeText(selectedWithdrawal.paymentNumber); toast.success('কপি হয়েছে!'); }}
                                            className="text-blue-600 hover:text-blue-800" title="কপি">
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                                        <p className="text-gray-600">রিকোয়েস্ট</p>
                                        <p className="font-semibold text-gray-800">{selectedWithdrawal.request_date}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                                        <p className="text-gray-600">অনুমোদন</p>
                                        <p className="font-semibold text-gray-800">{selectedWithdrawal.approval_date || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end gap-3">
                                {selectedWithdrawal.status === 'Pending' && (
                                    <>
                                        <motion.button
                                            onClick={() => updateWithdrawalStatus(selectedWithdrawal._id, 'Approved')}
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
                                        >
                                            Approve
                                        </motion.button>
                                        <motion.button
                                            onClick={() => updateWithdrawalStatus(selectedWithdrawal._id, 'Rejected')}
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
                                        >
                                            Reject
                                        </motion.button>
                                    </>
                                )}
                                <motion.button
                                    onClick={closeDetailsModal}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ManageWithdraw;