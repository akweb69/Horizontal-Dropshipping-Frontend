import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CheckCircle, Clock, XCircle } from 'lucide-react';

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

    const toNum = (v) => (isNaN(v) ? 0 : Number(v));

    const fetchData = useCallback(() => {
        if (!user?.email) return;
        setLoading(true);

        Promise.all([
            axios.get(`${import.meta.env.VITE_BASE_URL}/orders`),
            axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw`)
        ])
            .then(([ordersRes, withdrawRes]) => {
                const email = user.email;
                const myOrders = ordersRes.data?.filter(o => o.email === email) || [];
                const myWithdrawals = withdrawRes.data?.filter(w => w.email === email) || [];

                const deliveredTotal = myOrders
                    .filter(o => o.status === 'Delivered')
                    .reduce((acc, cur) => acc + toNum(cur.amar_bikri_mullo - (cur.delivery_charge + cur.items_total)), 0);

                const approved = myWithdrawals.filter(w => w.status === 'Approved').reduce((a, c) => a + toNum(c.amount), 0);
                const pending = myWithdrawals.filter(w => w.status === 'Pending').reduce((a, c) => a + toNum(c.amount), 0);
                const rejected = myWithdrawals.filter(w => w.status === 'Rejected').reduce((a, c) => a + toNum(c.amount), 0);

                const withdrawable = deliveredTotal - (approved + pending);

                setOrders(myOrders);
                setWithdrawData(myWithdrawals);
                setWithdrawableBalance(withdrawable);
                setPendingWithdrawals(pending);
                setTotalApproved(approved);
                setTotalRejected(rejected);
            })
            .catch(() => toast.error('ডেটা লোড করতে সমস্যা হয়েছে।'))
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
            .catch(() => Swal.fire({ icon: 'error', title: 'ভুল!', text: 'রিকোয়েস্ট পাঠাতে ব্যর্থ', confirmButtonColor: '#2563eb' }))
            .finally(() => setWithdrawLoading(false));
    };

    const openDetails = (w) => setSelectedWithdrawal(w);
    const closeDetails = () => setSelectedWithdrawal(null);

    if (loading) {
        return (
            <motion.div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600" />
            </motion.div>
        );
    }

    return (
        <motion.div
            className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl shadow-inner"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            {/* Header */}
            <motion.div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">💰 উইথড্র ম্যানেজমেন্ট</h1>
                <p className="text-gray-600 mt-2 text-base">আপনার ব্যালেন্স ও রিকোয়েস্টগুলোর পূর্ণ নিয়ন্ত্রণ রাখুন।</p>
            </motion.div>

            {/* Summary Section */}
            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { title: 'উইথড্রযোগ্য ব্যালেন্স', value: `৳${withdrawableBalance.toFixed(2)}`, icon: <Wallet className="h-8 w-8 text-indigo-600" />, color: 'from-indigo-100 to-indigo-50' },
                    { title: 'পেন্ডিং উইথড্র', value: `৳${pendingWithdrawals.toFixed(2)}`, icon: <Clock className="h-8 w-8 text-yellow-600" />, color: 'from-yellow-100 to-yellow-50' },
                    { title: 'অনুমোদিত উইথড্র', value: `৳${totalApproved.toFixed(2)}`, icon: <CheckCircle className="h-8 w-8 text-green-600" />, color: 'from-green-100 to-green-50' },
                    { title: 'রিজেক্টেড উইথড্র', value: `৳${totalRejected.toFixed(2)}`, icon: <XCircle className="h-8 w-8 text-red-600" />, color: 'from-red-100 to-red-50' },
                ].map((c, i) => (
                    <motion.div
                        key={i}
                        className={`p-6 rounded-2xl shadow-lg bg-gradient-to-br ${c.color} flex items-center justify-between hover:shadow-2xl transition-all duration-300`}
                        whileHover={{ scale: 1.05 }}>
                        <div>
                            <p className="text-gray-800 font-semibold">{c.title}</p>
                            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{c.value}</h3>
                        </div>
                        {c.icon}
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-5 gap-8">
                {/* History Table */}
                <motion.div className="lg:col-span-3 bg-white rounded-3xl shadow-lg p-6 border border-gray-100 overflow-x-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">উইথড্র ইতিহাস</h2>

                    {withdrawData.length === 0 ? (
                        <p className="text-gray-600 text-center py-10">কোনো উইথড্র ইতিহাস নেই 😔</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        {['পরিমাণ', 'স্ট্যাটাস', 'রিকোয়েস্ট তারিখ', 'পেমেন্ট', 'অ্যাকশন'].map(h => (
                                            <th key={h} className="py-3 px-4 text-sm font-semibold">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {withdrawData.map((w, i) => (
                                            <motion.tr key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="border-b hover:bg-blue-50 transition-all duration-200">
                                                <td className="py-3 px-4 font-medium">৳{toNum(w.amount).toFixed(2)}</td>
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
                                                        className="px-4 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition">
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
                <motion.div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">উইথড্র রিকোয়েস্ট</h2>

                    <form onSubmit={handleWithdraw} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ</label>
                            <input
                                type="number"
                                min="1000"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="৳ পরিমাণ লিখুন"
                                required
                            />
                        </div>

                        {amount && toNum(amount) >= 1000 && (
                            <motion.div className="grid grid-cols-2 gap-4">
                                <div className="bg-red-50 rounded-xl p-3 text-center font-semibold text-red-700">
                                    চার্জ (১%) <br /> ৳{(toNum(amount) * 0.01).toFixed(2)}
                                </div>
                                <div className="bg-green-50 rounded-xl p-3 text-center font-semibold text-green-700">
                                    প্রাপ্ত হবে <br /> ৳{(toNum(amount) - toNum(amount) * 0.01).toFixed(2)}
                                </div>
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট মেথড</label>
                            <select name="paymentMethod" className="w-full p-3 border rounded-xl" required>
                                <option value="" disabled selected>নির্বাচন করুন</option>
                                <option value="Bkash">Bkash</option>
                                <option value="Nagad">Nagad</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট নম্বর</label>
                            <input name="paymentNumber" type="text" className="w-full p-3 border rounded-xl" required />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={withdrawLoading}
                            className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:bg-orange-400"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}>
                            {withdrawLoading ? 'প্রসেসিং...' : 'রিকোয়েস্ট পাঠান'}
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedWithdrawal && (
                    <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closeDetails}>
                        <motion.div
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            onClick={e => e.stopPropagation()}>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">উইথড্র বিস্তারিত</h3>
                            <div className="space-y-3 text-gray-700 text-sm">
                                <p><b>ইমেইল:</b> {selectedWithdrawal.email}</p>
                                <p><b>পরিমাণ:</b> ৳{selectedWithdrawal.amount}</p>
                                <p><b>চার্জ:</b> ৳{selectedWithdrawal.charge}</p>
                                <p><b>স্ট্যাটাস:</b> {selectedWithdrawal.status}</p>
                                <p><b>পেমেন্ট:</b> {selectedWithdrawal.paymentMethod} ({selectedWithdrawal.paymentNumber})</p>
                                <p><b>তারিখ:</b> {selectedWithdrawal.request_date}</p>
                            </div>
                            <div className="mt-6 text-right">
                                <button onClick={closeDetails}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg">
                                    বন্ধ করুন
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ConnectStorePage;
