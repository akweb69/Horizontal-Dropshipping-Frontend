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
    const [totalWithdrawals, setTotalWithdrawals] = useState(0);
    const [withdrawData, setWithdrawData] = useState([]);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [totalRejectedWithdrawals, setTotalRejectedWithdrawals] = useState(0);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const { user } = useAuth();

    // ✅ fetchData extracted with useCallback for reusability
    const fetchData = useCallback(async () => {
        if (!user?.email) return;

        try {
            setLoading(true);
            const email = user.email;

            // Fetch orders
            const { data: ordersResponse } = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders`);
            const myOrders = (ordersResponse || []).filter((item) => item.email === email);

            // Calculate withdrawable from Delivered orders
            const deliveredBalance = myOrders
                .filter((item) => item.status === 'Delivered')
                .reduce((acc, cur) => acc + (parseInt(cur.amar_bikri_mullo) || 0), 0);

            // Fetch withdrawals
            const { data: withdrawResponse } = await axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw`);
            const myWithdrawals = (withdrawResponse || []).filter((item) => item.email === email);

            // Calculate all balances
            const totalWithdrawn = myWithdrawals.reduce((acc, cur) => acc + (parseInt(cur.amount) || 0), 0);
            const pendingAmount = myWithdrawals
                .filter((w) => w.status === 'Pending')
                .reduce((acc, cur) => acc + (parseInt(cur.amount) || 0), 0);
            const approvedAmount = myWithdrawals
                .filter((w) => w.status === 'Approved')
                .reduce((acc, cur) => acc + (parseInt(cur.amount) || 0), 0);
            const rejectedAmount = myWithdrawals
                .filter((w) => w.status === 'Rejected')
                .reduce((acc, cur) => acc + (parseInt(cur.amount) || 0), 0);

            setOrders(myOrders);
            setWithdrawData(myWithdrawals);
            setWithdrawableBalance(deliveredBalance - totalWithdrawn + rejectedAmount);
            setPendingWithdrawals(pendingAmount);
            setTotalWithdrawals(approvedAmount);
            setTotalRejectedWithdrawals(rejectedAmount);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ Handle Withdraw Request
    const handleWithdraw = async (e) => {
        e.preventDefault();
        setWithdrawLoading(true);

        const withdrawAmount = parseInt(amount);
        const paymentMethod = e.target.paymentMethod.value;
        const paymentNumber = e.target.paymentNumber.value;

        if (withdrawAmount < 1000) {
            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Minimum withdraw amount is 1000!',
                confirmButtonColor: '#2563eb',
            });
            setWithdrawLoading(false);
            return;
        }

        if (withdrawAmount > withdrawableBalance) {
            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Insufficient balance!',
                confirmButtonColor: '#2563eb',
            });
            setWithdrawLoading(false);
            return;
        }

        const charge = withdrawAmount * 0.01;
        const data = {
            email: user?.email,
            amount: withdrawAmount,
            status: 'Pending',
            request_date: new Date().toLocaleDateString(),
            approval_date: '',
            paymentMethod,
            paymentNumber,
            charge,
            withdrawableBalance: withdrawableBalance - (withdrawAmount + charge),
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/withdraw`, data);
            if (response.data) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Withdraw request sent successfully',
                    confirmButtonColor: '#2563eb',
                });
                setAmount('');
                e.target.reset();
                fetchData();
            }
        } catch (error) {
            console.error('Withdraw request failed:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Withdraw request failed!',
                confirmButtonColor: '#2563eb',
            });
        } finally {
            setWithdrawLoading(false);
        }
    };

    const openDetailsModal = (withdrawal) => setSelectedWithdrawal(withdrawal);
    const closeDetailsModal = () => setSelectedWithdrawal(null);

    // ✅ Loading Spinner
    if (loading) {
        return (
            <motion.div
                className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 text-center"
            >
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">ওইথড্র ম্যানেজমেন্ট</h2>
                <p className="mt-2 text-gray-600 text-sm sm:text-base">
                    আপনার স্টোরের ওইথড্র রিকোয়েস্টগুলি সহজে পরিচালনা করুন।
                </p>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
            >
                {[
                    { title: 'Total Orders', value: orders.length || 'No Orders', color: 'bg-teal-100', icon: '📦' },
                    {
                        title: 'Total Orders Balance',
                        value:
                            orders.length > 0
                                ? `৳${orders.reduce((acc, cur) => acc + (parseInt(cur.amar_bikri_mullo) || 0), 0)}`
                                : 'No Orders',
                        color: 'bg-orange-100',
                        icon: '💰',
                    },
                    { title: 'Total Withdrawable Balance', value: `৳${withdrawableBalance || 0}`, color: 'bg-indigo-100', icon: '🏦' },
                    { title: 'Total Pending Balance', value: `৳${pendingWithdrawals || 0}`, color: 'bg-purple-100', icon: '⏳' },
                    { title: 'Total Approved Balance', value: `৳${totalWithdrawals || 0}`, color: 'bg-green-100', icon: '✅' },
                    { title: 'Total Rejected Balance', value: `৳${totalRejectedWithdrawals || 0}`, color: 'bg-red-100', icon: '❌' },
                ].map((card, index) => (
                    <motion.div
                        key={index}
                        className={`${card.color} rounded-2xl p-6 shadow-lg flex items-center space-x-4 transition-transform duration-200`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                    >
                        <span className="text-3xl">{card.icon}</span>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Content */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-5 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                {/* Withdraw History */}
                <motion.div
                    className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Withdraw History</h2>
                    {withdrawData.length === 0 ? (
                        <p className="text-gray-600">No withdrawal history available.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Amount', 'Status', 'Request Date', 'Payment Method', 'Details'].map((header) => (
                                            <th key={header} className="py-4 px-4 text-sm font-semibold text-gray-900">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {withdrawData.map((withdraw, index) => (
                                            <motion.tr
                                                key={withdraw._id?.$oid || withdraw._id || index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className="border-b border-gray-200 hover:bg-gray-50"
                                            >
                                                <td className="py-4 px-4 text-sm text-gray-700">৳{withdraw.amount}</td>
                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${withdraw.status === 'Pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : withdraw.status === 'Approved'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {withdraw.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-700">{withdraw.request_date}</td>
                                                <td className="py-4 px-4 text-sm text-gray-700">{withdraw.paymentMethod}</td>
                                                <td className="py-4 px-4">
                                                    <motion.button
                                                        onClick={() => openDetailsModal(withdraw)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                                    >
                                                        Details
                                                    </motion.button>
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
                <motion.div
                    className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Withdraw Request Form</h2>
                    <p className="text-gray-600 mb-4">Please fill out the form below to request a withdrawal.</p>
                    <form onSubmit={handleWithdraw}>
                        <div className="mb-4">
                            <label htmlFor="withdraw" className="block text-sm font-medium text-gray-700 mb-1">
                                Withdraw Amount
                            </label>
                            <input
                                onChange={(e) => setAmount(e.target.value)}
                                value={amount}
                                type="number"
                                id="withdraw"
                                name="withdraw"
                                min="1000"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                required
                            />
                        </div>
                        {amount && amount >= 1000 && (
                            <motion.div
                                className="grid grid-cols-2 gap-4 mb-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div>
                                    <label htmlFor="charge" className="block text-sm font-medium text-gray-700 mb-1">
                                        Withdraw Charge
                                    </label>
                                    <div className="p-3 bg-red-100 text-red-800 font-semibold rounded-lg">
                                        ৳{parseFloat(amount * 0.01).toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-1">
                                        Withdraw Total
                                    </label>
                                    <div className="p-3 bg-green-100 text-green-800 font-semibold rounded-lg">
                                        ৳{parseInt(amount - amount * 0.01)}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div className="mb-4">
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Payment Method
                            </label>
                            <select
                                id="paymentMethod"
                                name="paymentMethod"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                required
                            >
                                <option disabled value="">
                                    Select Payment Method
                                </option>
                                <option value="Bkash">Bkash</option>
                                <option value="Nagad">Nagad</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="paymentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Number
                            </label>
                            <input
                                type="text"
                                id="paymentNumber"
                                name="paymentNumber"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                required
                            />
                        </div>
                        <motion.button
                            type="submit"
                            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                            disabled={withdrawLoading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {withdrawLoading ? 'Processing...' : 'Request Withdraw'}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedWithdrawal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={closeDetailsModal}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Withdrawal Details</h3>
                            <div className="space-y-3">
                                <p>
                                    <strong>Email:</strong> {selectedWithdrawal.email}
                                </p>
                                <p>
                                    <strong>Amount:</strong> ৳{selectedWithdrawal.amount}
                                </p>
                                <p>
                                    <strong>Payment Method:</strong> {selectedWithdrawal.paymentMethod}
                                </p>
                                <p>
                                    <strong>Payment Number:</strong> {selectedWithdrawal.paymentNumber}
                                </p>
                                <p>
                                    <strong>Charge:</strong> ৳{selectedWithdrawal.charge}
                                </p>
                                <p>
                                    <strong>Withdrawable Balance:</strong> ৳{selectedWithdrawal.withdrawableBalance}
                                </p>
                                <p>
                                    <strong>Request Date:</strong> {selectedWithdrawal.request_date}
                                </p>
                                <p>
                                    <strong>Approval Date:</strong> {selectedWithdrawal.approval_date || '-'}
                                </p>
                                <p>
                                    <strong>Status:</strong>{' '}
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedWithdrawal.status === 'Approved'
                                            ? 'bg-green-100 text-green-800'
                                            : selectedWithdrawal.status === 'Rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {selectedWithdrawal.status}
                                    </span>
                                </p>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <motion.button
                                    onClick={closeDetailsModal}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
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

export default ConnectStorePage;
