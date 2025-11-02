import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import {
    User,
    Phone,
    Mail,
    MessageCircle,
    Facebook,
    Calendar,
    Search,
    Filter,
    Eye,
    Copy,
    Loader2,
    GraduationCap
} from 'lucide-react';
import Loader11 from '../../components/layout/Loader11';

const ManageClassRequest = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    const [requests, setRequests] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [topicFilter, setTopicFilter] = useState('all');
    const [selectedReq, setSelectedReq] = useState(null);

    // Fetch all class requests
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${base_url}/class-request`);
            setRequests(res.data);
            setFiltered(res.data);
        } catch (err) {
            toast({ title: 'ডেটা লোড করতে ব্যর্থ', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [base_url]);

    // Search & Filter
    useEffect(() => {
        let result = requests;

        if (search) {
            result = result.filter(r =>
                r.name?.toLowerCase().includes(search.toLowerCase()) ||
                r.email?.toLowerCase().includes(search.toLowerCase()) ||
                r.whatsapp?.includes(search)
            );
        }

        if (topicFilter !== 'all') {
            result = result.filter(r => r.classTopic === topicFilter);
        }

        setFiltered(result);
    }, [search, topicFilter, requests]);

    // Open Modal
    const openModal = (req) => setSelectedReq(req);
    const closeModal = () => setSelectedReq(null);

    // Copy to Clipboard
    const copyText = (text, label) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${label} কপি হয়েছে!` });
    };

    // Loading UI
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
                    <GraduationCap className="w-10 h-10 text-blue-600" />
                    ক্লাস রিকোয়েস্ট ম্যানেজমেন্ট
                </h1>
                <p className="text-gray-600 mt-2">সকল ক্লাস রিকোয়েস্ট দেখুন ও যোগাযোগ করুন</p>
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relativeτικού">
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="নাম, ইমেইল, ফোন অনুসন্ধান..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <select
                            value={topicFilter}
                            onChange={e => setTopicFilter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                        >
                            <option value="all">সব বিষয়</option>
                            <option value="dropshipping">ড্রপশিপিং</option>
                            <option value="facebook-marketing">ফেসবুক মার্কেটিং</option>
                            <option value="seo">এসইও</option>
                            <option value="product-research">প্রোডাক্ট রিসার্চ</option>
                            <option value="store-setup">স্টোর সেটআপ</option>
                            <option value="ads">ফেসবুক অ্যাডস</option>
                            <option value="other">অন্যান্য</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                        <GraduationCap className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">কোনো ক্লাস রিকোয়েস্ট পাওয়া যায়নি</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                <tr>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase">নাম</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase">বিষয়</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase">তারিখ</th>
                                    {/* <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase">যোগাযোগ</th> */}
                                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filtered.map((r, i) => (
                                        <motion.tr
                                            key={r._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-blue-50 transition"
                                        >
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900 flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-600" />
                                                {r.name}
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                    {r.classTopic === 'dropshipping' && 'ড্রপশিপিং'}
                                                    {r.classTopic === 'facebook-marketing' && 'ফেসবুক মার্কেটিং'}
                                                    {r.classTopic === 'seo' && 'এসইও'}
                                                    {r.classTopic === 'product-research' && 'প্রোডাক্ট রিসার্চ'}
                                                    {r.classTopic === 'store-setup' && 'স্টোর সেটআপ'}
                                                    {r.classTopic === 'ads' && 'ফেসবুক অ্যাডস'}
                                                    {r.classTopic === 'other' && 'অন্যান্য'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(r.submittedAt).toLocaleDateString('bn-BD')}
                                            </td>
                                            {/* <td className="py-4 px-6 text-sm text-gray-600">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <a href={`tel:${r.phone}`} className="text-green-600 hover:underline flex items-center gap-1">
                                                        <Phone className="w-4 h-4" /> {r.phone}
                                                    </a>
                                                    <span>|</span>
                                                    <a href={`https://wa.me/${r.whatsapp.replace(/\+/g, '')}`} target="_blank" className="text-green-500 hover:underline flex items-center gap-1">
                                                        <MessageCircle className="w-4 h-4" /> {r.whatsapp}
                                                    </a>
                                                </div>
                                            </td> */}
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => openModal(r)}
                                                    className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shadow-md"
                                                    title="বিস্তারিত"
                                                >
                                                    <Eye className="w-4 h-4" />
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
                {selectedReq && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div
                            className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-gray-200"
                            initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <GraduationCap className="w-8 h-8 text-blue-600" />
                                    ক্লাস রিকোয়েস্ট বিস্তারিত
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    ×
                                </button>
                            </div>

                            <div className="space-y-5 text-sm">
                                {/* Name */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium text-gray-700">নাম</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{selectedReq.name}</span>
                                </div>

                                {/* Topic */}
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium text-gray-700">ক্লাসের বিষয়</span>
                                    </div>
                                    <span className="font-bold text-blue-700">
                                        {selectedReq.classTopic === 'dropshipping' && 'ড্রপশিপিং'}
                                        {selectedReq.classTopic === 'facebook-marketing' && 'ফেসবুক মার্কেটিং'}
                                        {selectedReq.classTopic === 'seo' && 'এসইও'}
                                        {selectedReq.classTopic === 'product-research' && 'প্রোডাক্ট রিসার্চ'}
                                        {selectedReq.classTopic === 'store-setup' && 'স্টোর সেটআপ'}
                                        {selectedReq.classTopic === 'ads' && 'ফেসবুক অ্যাডস'}
                                        {selectedReq.classTopic === 'other' && 'অন্যান্য'}
                                    </span>
                                </div>



                                {/* WhatsApp */}
                                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="w-5 h-5 text-emerald-600" />
                                        <span className="font-medium text-gray-700">হোয়াটসঅ্যাপ</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href={`https://wa.me/${selectedReq.whatsapp.replace(/\+/g, '')}`} target="_blank" className="font-mono text-emerald-700">
                                            {selectedReq.whatsapp}
                                        </a>
                                        <button onClick={() => copyText(selectedReq.whatsapp, 'হোয়াটসঅ্যাপ')} className="text-emerald-600 hover:text-emerald-800">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-purple-600" />
                                        <span className="font-medium text-gray-700">ইমেইল</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href={`mailto:${selectedReq.email}`} className="font-mono text-purple-700 break-all">
                                            {selectedReq.email}
                                        </a>
                                        <button onClick={() => copyText(selectedReq.email, 'ইমেইল')} className="text-purple-600 hover:text-purple-800">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Facebook */}
                                {selectedReq.facebook && (
                                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Facebook className="w-5 h-5 text-indigo-600" />
                                            <span className="font-medium text-gray-700">ফেসবুক</span>
                                        </div>
                                        <a href={selectedReq.facebook} target="_blank" className="text-indigo-700 hover:underline text-sm">
                                            প্রোফাইল দেখুন
                                        </a>
                                    </div>
                                )}

                                {/* Message */}
                                {selectedReq.message && (
                                    <div className="p-4 bg-orange-50 rounded-xl">
                                        <p className="font-medium text-gray-700 mb-2">অতিরিক্ত মেসেজ</p>
                                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                            {selectedReq.message}
                                        </p>
                                    </div>
                                )}

                                {/* Date */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl text-xs">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-600">পাঠানো হয়েছে</span>
                                    </div>
                                    <span className="font-medium text-gray-800">
                                        {new Date(selectedReq.submittedAt).toLocaleString('bn-BD')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition"
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

export default ManageClassRequest;