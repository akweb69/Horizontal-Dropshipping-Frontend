import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import {
    Mail,
    User,
    Calendar,
    Search,
    Filter,
    Eye,
    EyeOff,
    Trash2,
    Loader2,
    MessageSquare
} from 'lucide-react';
import Swal from 'sweetalert2';
import Loader11 from '../../components/layout/Loader11';

const ManageContactUs = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    const [contacts, setContacts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMsg, setSelectedMsg] = useState(null);

    // Fetch all messages
    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${base_url}/contact-us`);
            setContacts(res.data);
            setFiltered(res.data);
        } catch (err) {
            toast({ title: 'ডেটা লোড করতে ব্যর্থ', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [base_url]);

    // Search & Filter
    useEffect(() => {
        let result = contacts;

        if (search) {
            result = result.filter(c =>
                c.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.email?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(c => c.status === statusFilter);
        }

        setFiltered(result);
    }, [search, statusFilter, contacts]);

    // Mark as Read/Unread
    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
        try {
            await axios.patch(`${base_url}/contact-us/${id}`, { status: newStatus });
            toast({ title: `মেসেজ ${newStatus === 'read' ? 'পড়া' : 'অপড়া'} হিসেবে চিহ্নিত` });
            fetchContacts();
        } catch (err) {
            toast({ title: 'স্ট্যাটাস পরিবর্তন ব্যর্থ', variant: 'destructive' });
        }
    };

    // Delete Message
    const deleteMessage = async (id) => {
        const result = await Swal.fire({
            title: 'নিশ্চিত?',
            text: 'এই মেসেজ মুছে ফেলা হবে!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'বাতিল'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${base_url}/contact-us/${id}`);
                toast({ title: 'মেসেজ মুছে ফেলা হয়েছে' });
                fetchContacts();
            } catch (err) {
                toast({ title: 'মুছতে ব্যর্থ', variant: 'destructive' });
            }
        }
    };

    // Open Modal
    const openModal = (msg) => setSelectedMsg(msg);
    const closeModal = () => setSelectedMsg(null);

    // Loading UI
    if (loading) {
        return (
            <Loader11></Loader11>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    যোগাযোগ বার্তা ব্যবস্থাপনা
                </h1>
                <p className="text-gray-600 mt-1">সকল গ্রাহক বার্তা পরিচালনা করুন</p>
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-md p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="নাম বা ইমেইল অনুসন্ধান..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">সব স্ট্যাটাস</option>
                            <option value="unread">অপড়া</option>
                            <option value="read">পড়া</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-md overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>কোনো বার্তা পাওয়া যায়নি</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">নাম</th>
                                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">ইমেইল</th>
                                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">স্ট্যাটাস</th>
                                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filtered.map((c, i) => (
                                        <motion.tr
                                            key={c._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900 flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                {c.name}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                <a href={`mailto:${c.email}`} className="hover:text-orange-600 flex items-center gap-1">
                                                    <Mail className="w-4 h-4" />
                                                    {c.email}
                                                </a>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(c.submittedAt).toLocaleDateString('bn-BD')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit
                          ${c.status === 'unread' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {c.status === 'unread' ? (
                                                        <>
                                                            <EyeOff className="w-3 h-3" /> অপড়া
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-3 h-3" /> পড়া
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 flex gap-2">
                                                <button
                                                    onClick={() => openModal(c)}
                                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                                                    title="বিস্তারিত"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(c._id, c.status)}
                                                    className={`p-2 rounded-lg transition ${c.status === 'unread'
                                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                                                        }`}
                                                    title={c.status === 'unread' ? 'পড়া হিসেবে চিহ্নিত' : 'অপড়া হিসেবে চিহ্নিত'}
                                                >
                                                    {c.status === 'unread' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => deleteMessage(c._id)}
                                                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                                                    title="মুছুন"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedMsg && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                            initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-5">
                                <h3 className="text-2xl font-bold text-gray-800">বার্তা বিস্তারিত</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold
                  ${selectedMsg.status === 'unread' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {selectedMsg.status === 'unread' ? 'অপড়া' : 'পড়া'}
                                </span>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <User className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-700">নাম</p>
                                        <p className="text-gray-900">{selectedMsg.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-700">ইমেইল</p>
                                        <a href={`mailto:${selectedMsg.email}`} className="text-blue-600 hover:underline">
                                            {selectedMsg.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-gray-700">পাঠানো হয়েছে</p>
                                        <p className="text-gray-900">
                                            {new Date(selectedMsg.submittedAt).toLocaleString('bn-BD')}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-orange-50 rounded-xl">
                                    <p className="font-medium text-gray-700 mb-2">বার্তা</p>
                                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        {selectedMsg.message}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => toggleStatus(selectedMsg._id, selectedMsg.status)}
                                    className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition ${selectedMsg.status === 'unread'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                                        }`}
                                >
                                    {selectedMsg.status === 'unread' ? (
                                        <>পড়া হিসেবে চিহ্নিত</>
                                    ) : (
                                        <>অপড়া হিসেবে চিহ্নিত</>
                                    )}
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium"
                                >
                                    বন্ধ করুন
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageContactUs;