import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle, Clock,
    DollarSign,
    Phone,
    Mail,
    User,
    Calendar,
    Loader2,
    Copy,
    Edit3,
    Eye
} from 'lucide-react';
import Loader11 from '../../components/layout/Loader11';

const ManageRefferWithDraw = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    const [withdraws, setWithdraws] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [selectedWithdraw, setSelectedWithdraw] = useState(null);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);

    // Fetch all withdraw requests
    const fetchWithdraws = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${base_url}/refer-withdraw`);
            setWithdraws(res.data);
            setFiltered(res.data);
        } catch (err) {
            toast({ title: 'ডেটা লোড করতে ব্যর্থ', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdraws();
    }, [base_url]);

    // Search & Filter
    useEffect(() => {
        let result = withdraws;

        if (search) {
            result = result.filter(w =>
                w.email?.toLowerCase().includes(search.toLowerCase()) ||
                w.withdrawId?.toLowerCase().includes(search.toLowerCase()) ||
                w.number?.includes(search)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(w => w.status === statusFilter);
        }

        if (methodFilter !== 'all') {
            result = result.filter(w => w.method === methodFilter);
        }

        setFiltered(result);
    }, [search, statusFilter, methodFilter, withdraws]);

    // Open Status Modal
    const openStatusModal = (w) => {
        setSelectedWithdraw(w);
        setNewStatus(w.status);
        setStatusModalOpen(true);
    };

    // Update Status
    const updateStatus = async () => {
        if (!selectedWithdraw || !newStatus || newStatus === selectedWithdraw.status) return;

        setStatusLoading(true);
        try {
            const payload = { status: newStatus, email: selectedWithdraw.email, amount: selectedWithdraw.amount };
            if (newStatus === 'Approved') {
                payload.approvedAt = new Date().toISOString();
            }

            const res = await axios.patch(`${base_url}/refer-withdraw/${selectedWithdraw._id}`, payload);

            if (res.data) {
                // Update UI
                setWithdraws(prev => prev.map(w =>
                    w._id === selectedWithdraw._id
                        ? { ...w, status: newStatus, approvedAt: newStatus === 'Approved' ? payload.approvedAt : w.approvedAt }
                        : w
                ));


                toast({ title: `স্ট্যাটাস ${newStatus === 'Approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে!` });
                setStatusModalOpen(false);
            }
        } catch (err) {
            console.error(err);
            // toast({ title: 'স্ট্যাটাস আপডেট ব্যর্থ', variant: 'destructive' });
        } finally {
            setStatusLoading(false);
        }
    };

    // Copy to Clipboard
    const copyText = (text, label) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${label} কপি হয়েছে!` });
    };

    const formatDate = (date) => date ? new Date(date).toLocaleString('bn-BD') : '—';

    if (loading) {
        return (
            <Loader11></Loader11>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-3">
                    <DollarSign className="w-10 h-10 text-green-600" />
                    রেফারেল উত্তোলন ম্যানেজমেন্ট
                </h1>
                <p className="text-gray-600 mt-2">সকল রেফারেল উত্তোলনের অনুরোধ দেখুন ও অনুমোদন করুন</p>
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ইমেইল, ID, নম্বর..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">সব স্ট্যাটাস</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <select
                        value={methodFilter}
                        onChange={e => setMethodFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">সব পদ্ধতি</option>
                        <option value="BKASH">বিকাশ</option>
                        <option value="NAGAD">নগদ</option>
                    </select>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                        <DollarSign className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">কোনো উত্তোলনের অনুরোধ পাওয়া যায়নি</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                                <tr>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase">ID</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase">ইউজার</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase">পদ্ধতি</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase">পরিমাণ</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase">অনুরোধ</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase">স্ট্যাটাস</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filtered.map((w, i) => (
                                        <motion.tr
                                            key={w._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-green-50 transition"
                                        >
                                            <td className="py-4 px-6 text-sm font-mono text-gray-700">{w.withdrawId}</td>
                                            <td className="py-4 px-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{w.name}</p>
                                                        <p className="text-xs text-gray-500">{w.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                          ${w.method === 'BKASH' ? 'bg-orange-100 text-orange-700' : 'bg-pink-100 text-pink-700'}`}>
                                                    {w.method === 'BKASH' ? 'বিকাশ' : 'নগদ'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-bold text-green-600">৳{w.amount}</td>
                                            <td className="py-4 px-6 text-xs text-gray-600 flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(w.requestDate)}
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
                          ${w.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        w.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {w.status === 'Approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {w.status === 'Rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                                    {w.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                                                    {w.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedWithdraw(w)}
                                                        className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                                        title="বিস্তারিত"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openStatusModal(w)}
                                                        className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition"
                                                        title="স্ট্যাটাস পরিবর্তন"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedWithdraw && !statusModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedWithdraw(null)}
                    >
                        <motion.div
                            className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <DollarSign className="w-8 h-8 text-green-600" />
                                    উত্তোলনের বিস্তারিত
                                </h3>
                                <button onClick={() => setSelectedWithdraw(null)} className="text-gray-400 hover:text-gray-600">×</button>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                                    <span className="font-medium text-gray-700">উত্তোলন আইডি</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono">{selectedWithdraw.withdrawId}</span>
                                        <button onClick={() => copyText(selectedWithdraw.withdrawId, 'ID')} className="text-gray-600">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between p-4 bg-blue-50 rounded-xl">
                                    <span className="font-medium text-gray-700">ইউজার</span>
                                    <div>
                                        <p className="font-semibold">{selectedWithdraw.name}</p>
                                        <p className="text-xs text-gray-600 flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {selectedWithdraw.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between p-4 bg-orange-50 rounded-xl">
                                    <span className="font-medium text-gray-700">পদ্ধতি</span>
                                    <span className="font-bold text-orange-700">
                                        {selectedWithdraw.method === 'BKASH' ? 'বিকাশ' : 'নগদ'}
                                    </span>
                                </div>

                                <div className="flex justify-between p-4 bg-green-50 rounded-xl">
                                    <span className="font-medium text-gray-700">নম্বর</span>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-green-700" />
                                        <span className="font-mono">{selectedWithdraw.number}</span>
                                        <button onClick={() => copyText(selectedWithdraw.number, 'নম্বর')} className="text-green-600">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between p-4 bg-purple-50 rounded-xl">
                                    <span className="font-medium text-gray-700">পরিমাণ</span>
                                    <span className="font-bold text-purple-700">৳{selectedWithdraw.amount}</span>
                                </div>

                                <div className="flex justify-between p-4 bg-cyan-50 rounded-xl">
                                    <span className="font-medium text-gray-700">অনুরোধের তারিখ</span>
                                    <span className="font-medium">{formatDate(selectedWithdraw.requestDate)}</span>
                                </div>

                                {selectedWithdraw.approvedAt && (
                                    <div className="flex justify-between p-4 bg-emerald-50 rounded-xl">
                                        <span className="font-medium text-gray-700">অনুমোদনের তারিখ</span>
                                        <span className="font-medium">{formatDate(selectedWithdraw.approvedAt)}</span>
                                    </div>
                                )}

                                <div className={`flex justify-between p-4 rounded-xl
                  ${selectedWithdraw.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        selectedWithdraw.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'}`}>
                                    <span className="font-medium">স্ট্যাটাস</span>
                                    <span className="font-bold">{selectedWithdraw.status}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => openStatusModal(selectedWithdraw)}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition"
                                >
                                    স্ট্যাটাস পরিবর্তন
                                </button>
                                <button
                                    onClick={() => setSelectedWithdraw(null)}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
                                >
                                    বন্ধ করুন
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Update Modal */}
            <AnimatePresence>
                {statusModalOpen && selectedWithdraw && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setStatusModalOpen(false)}
                    >
                        <motion.div
                            className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full"
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Edit3 className="w-6 h-6 text-indigo-600" />
                                স্ট্যাটাস আপডেট
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600">উত্তোলন আইডি: <span className="font-mono">{selectedWithdraw.withdrawId}</span></p>
                                    <p className="text-sm text-gray-600">ইউজার: {selectedWithdraw.email}</p>
                                    <p className="text-sm text-gray-600">পরিমাণ: ৳{selectedWithdraw.amount}</p>
                                </div>

                                <select
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setStatusModalOpen(false)}
                                    className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300"
                                >
                                    বাতিল
                                </button>
                                <button
                                    onClick={updateStatus}
                                    disabled={statusLoading || newStatus === selectedWithdraw.status}
                                    className={`px-6 py-2.5 rounded-xl font-semibold text-white shadow-md transition-all ${statusLoading || newStatus === selectedWithdraw.status
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                                        }`}
                                >
                                    {statusLoading ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageRefferWithDraw;