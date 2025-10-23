import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';


const ConnectStorePage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawableBalance, setWithdrawableBalance] = useState(0);
    const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
    const [totalApproved, setTotalApproved] = useState(0);
    const [totalRejected, setTotalRejected] = useState(0);
    const [withdrawData, setWithdrawData] = useState([]);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const { user } = useAuth();

    // Helper: Safe number conversion
    const toNum = (v) => (isNaN(v) ? 0 : Number(v));

    // Fetch all data
    const fetchData = useCallback(() => {
        if (!user?.email) return;

        setLoading(true);
        const email = user.email;

        Promise.all([
            axios.get(`${import.meta.env.VITE_BASE_URL}/orders`),
            axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw`)
        ])
            .then(([ordersRes, withdrawRes]) => {
                const myOrders = (ordersRes.data || []).filter(o => o.email === email);
                const myWithdrawals = (withdrawRes.data || []).filter(w => w.email === email);

                // Delivered total
                const deliveredTotal = myOrders
                    .filter(o => o.status?.trim() === 'Delivered')
                    .reduce((acc, cur) => acc + toNum(cur.amar_bikri_mullo), 0);

                // Withdrawals breakdown
                const approved = myWithdrawals
                    .filter(w => w.status?.trim() === 'Approved')
                    .reduce((acc, cur) => acc + toNum(cur.amount), 0);

                const pending = myWithdrawals
                    .filter(w => w.status?.trim() === 'Pending')
                    .reduce((acc, cur) => acc + toNum(cur.amount), 0);

                const rejected = myWithdrawals
                    .filter(w => w.status?.trim() === 'Rejected')
                    .reduce((acc, cur) => acc + toNum(cur.amount), 0);

                // Correct withdrawable balance
                const withdrawable = deliveredTotal - (approved + pending);

                setOrders(myOrders);
                setWithdrawData(myWithdrawals);
                setWithdrawableBalance(withdrawable);
                setPendingWithdrawals(pending); // Fixed: "ured);" ছিল
                setTotalApproved(approved);
                setTotalRejected(rejected);
            })
            .catch(err => {
                console.error(err);
                toast.error('ডেটা লোড করতে সমস্যা হয়েছে।');
            })
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle Withdraw Request
    const handleWithdraw = (e) => {
        e.preventDefault();
        setWithdrawLoading(true);

        const withdrawAmt = toNum(amount);
        const paymentMethod = e.target.paymentMethod.value;
        const paymentNumber = e.target.paymentNumber.value;

        if (withdrawAmt < 1000) {
            Swal.fire({ icon: 'error', title: 'ভুল!', text: 'সর্বনিম্ন ৳1000', confirmButtonColor: '#2563eb' });
            setWithdrawLoading(false);
            return;
        }
        if (withdrawAmt > withdrawableBalance) {
            Swal.fire({ icon: 'error', title: 'ভুল!', text: 'পর্যাপ্ত ব্যালেন্স নেই', confirmButtonColor: '#2563eb' });
            setWithdrawLoading(false);
            return;
        }

        const charge = Math.round(withdrawAmt * 0.01 * 100) / 100;

        const payload = {
            email: user?.email,
            amount: withdrawAmt,
            status: 'Pending',
            request_date: new Date().toLocaleDateString('en-GB'),
            approval_date: '',
            paymentMethod,
            paymentNumber,
            charge,
            withdrawableBalance: withdrawAmt - charge,
        };

        axios.post(`${import.meta.env.VITE_BASE_URL}/withdraw`, payload)
            .then(() => {
                Swal.fire({ icon: 'success', title: 'সফল!', text: 'উইথড্র রিকোয়েস্ট পাঠানো হয়েছে', confirmButtonColor: '#2563eb' });
                setAmount('');
                e.target.reset();
                fetchData();
            })
            .catch(err => {
                console.error(err);
                Swal.fire({ icon: 'error', title: 'ভুল!', text: 'রিকোয়েস্ট পাঠাতে ব্যর্থ', confirmButtonColor: '#2563eb' });
            })
            .finally(() => setWithdrawLoading(false));
    };

    const openDetails = (w) => setSelectedWithdrawal(w);
    const closeDetails = () => setSelectedWithdrawal(null);

    // Loading UI
    if (loading) {
        return (
            <motion.div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
            </motion.div>
        );
    }

    return (
        <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Header */}
            <motion.div className="mb-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">উইথড্র ম্যানেজমেন্ট</h2>
                <p className="mt-2 text-gray-600">স্টোরের উইথড্র রিকোয়েস্টগুলি সহজে পরিচালনা করুন।</p>
            </motion.div>

            {/* Summary Cards */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                    { title: 'মোট অর্ডার', value: orders.length, color: 'bg-teal-100' },
                    { title: 'মোট অর্ডার মূল্য', value: `৳${orders.reduce((a, o) => a + toNum(o.amar_bikri_mullo), 0)}`, color: 'bg-blue-100' },
                    { title: 'উইথড্রযোগ্য ব্যালেন্স', value: `৳${withdrawableBalance.toFixed(2)}`, color: 'bg-indigo-100' },
                    { title: 'পেন্ডিং উইথড্র', value: `৳${pendingWithdrawals.toFixed(2)}`, color: 'bg-purple-100' },
                    { title: 'অনুমোদিত উইথড্র', value: `৳${totalApproved.toFixed(2)}`, color: 'bg-green-100' },
                    { title: 'রিজেক্টেড উইথড্র', value: `৳${totalRejected.toFixed(2)}`, color: 'bg-red-100' },
                ].map((c, i) => (
                    <motion.div
                        key={i}
                        className={`${c.color} rounded-2xl p-6 shadow-lg flex items-center space-x-4`}
                        whileHover={{ scale: 1.03 }}>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{c.title}</h3>
                            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Withdraw History */}
                <motion.div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">উইথড্র ইতিহাস</h2>

                    {withdrawData.length === 0 ? (
                        <p className="text-gray-600">কোনো উইথড্র ইতিহাস নেই।</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['পরিমাণ', 'স্ট্যাটাস', 'রিকোয়েস্ট তারিখ', 'পেমেন্ট মেথড', 'বিস্তারিত'].map(h => (
                                            <th key={h} className="py-3 px-4 text-sm font-semibold text-gray-900">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {withdrawData.map((w, idx) => (
                                            <motion.tr
                                                key={w._id?.$oid || w._id || idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">৳{toNum(w.amount).toFixed(2)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                        ${w.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            w.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{w.request_date}</td>
                                                <td className="py-3 px-4">{w.paymentMethod}</td>
                                                <td className="py-3 px-4">
                                                    <button onClick={() => openDetails(w)}
                                                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm">
                                                        বিস্তারিত
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

                {/* Withdraw Form */}
                <motion.div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">উইথড্র রিকোয়েস্ট</h2>

                    <form onSubmit={handleWithdraw}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ</label>
                            <input
                                type="number"
                                min="1000"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {amount && toNum(amount) >= 1000 && (
                            <motion.div className="grid grid-cols-2 gap-4 mb-4"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">চার্জ (1%)</label>
                                    <div className="p-3 bg-red-100 text-red-800 font-semibold rounded-lg">
                                        ৳{((toNum(amount) * 0.01) * 100 / 100).toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">প্রাপ্ত পরিমাণ</label>
                                    <div className="p-3 bg-green-100 text-green-800 font-semibold rounded-lg">
                                        ৳{(toNum(amount) - (toNum(amount) * 0.01)).toFixed(2)}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট মেথড</label>
                            <select name="paymentMethod" className="w-full p-3 border rounded-lg" required>
                                <option value="" disabled selected>নির্বাচন করুন</option>
                                <option value="Bkash">Bkash</option>
                                <option value="Nagad">Nagad</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট নম্বর</label>
                            <input name="paymentNumber" type="text" className="w-full p-3 border rounded-lg" required />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={withdrawLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            {withdrawLoading ? 'প্রসেসিং...' : 'রিকোয়েস্ট পাঠান'}
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            {/* Details Modal */}
            {/* Enhanced Details Modal */}
            <AnimatePresence>
                {selectedWithdrawal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDetails}
                    >
                        <motion.div
                            className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 max-w-md w-full border border-gray-200"
                            initial={{ scale: 0.85, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.85, y: 50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with Status */}
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="text-blue-600"></span> উইথড্র বিস্তারিত
                                </h3>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
              ${selectedWithdrawal.status === 'Approved'
                                            ? 'bg-green-100 text-green-700'
                                            : selectedWithdrawal.status === 'Rejected'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                >
                                    {selectedWithdrawal.status === 'Approved' && 'Approved'}
                                    {selectedWithdrawal.status === 'Rejected' && 'Rejected'}
                                    {selectedWithdrawal.status === 'Pending' && 'Pending'}
                                </span>
                            </div>

                            {/* Content Grid */}
                            <div className="space-y-4 text-sm">
                                {/* Email */}
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                    <span className="font-medium text-gray-700">ইমেইল</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-900 font-mono">{selectedWithdrawal.email}</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedWithdrawal.email);
                                                toast.success('ইমেইল কপি করা হয়েছে!');
                                            }}
                                            className="text-blue-600 hover:text-blue-800 transition"
                                            title="কপি করুন"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                    <span className="font-medium text-gray-700">পরিমাণ</span>
                                    <span className="text-xl font-bold text-blue-700">
                                        ৳{toNum(selectedWithdrawal.amount).toFixed(2)}
                                    </span>
                                </div>

                                {/* Charge */}
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                                    <span className="font-medium text-gray-700">চার্জ (১%)</span>
                                    <span className="font-bold text-red-700">
                                        -৳{toNum(selectedWithdrawal.charge).toFixed(2)}
                                    </span>
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
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedWithdrawal.paymentNumber);
                                                toast.success('নম্বর কপি করা হয়েছে!');
                                            }}
                                            className="text-blue-600 hover:text-blue-800 transition"
                                            title="কপি করুন"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                                        <p className="text-gray-600">রিকোয়েস্ট</p>
                                        <p className="font-semibold text-gray-800">{selectedWithdrawal.request_date}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl text-center">
                                        <p className="text-gray-600">অনুমোদন</p>
                                        <p className="font-semibold text-gray-800">
                                            {selectedWithdrawal.approval_date || <span className="text-gray-400">—</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="mt-6 flex justify-end">
                                <motion.button
                                    onClick={closeDetails}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Close বন্ধ করুন
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ConnectStorePage;