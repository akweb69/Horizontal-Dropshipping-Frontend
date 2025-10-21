import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useEffect, useState } from 'react';
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
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const email = user?.email;

                // Fetch orders
                const ordersResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders`);
                const ordersData = ordersResponse.data || [];
                const myOrders = ordersData.filter(item => item.email === email);

                // Calculate initial withdrawable balance from delivered orders
                const deliveredBalance = myOrders
                    .filter(item => item.status === 'Delivered')
                    .reduce((acc, cur) => acc + parseInt(cur.amar_bikri_mullo || 0), 0);

                // Fetch withdrawals
                const withdrawResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw`);
                const withdrawData = withdrawResponse.data || [];
                const myWithdrawals = withdrawData.filter(item => item.email === email);

                // Calculate final withdrawable balance
                const totalWithdrawn = myWithdrawals.reduce((acc, cur) => acc + parseInt(cur.amount || 0), 0);
                const pendingWithdrawalsAmount = myWithdrawals
                    .filter(item => item.status === 'Pending')
                    .reduce((acc, cur) => acc + parseInt(cur.amount || 0), 0);
                const approvedWithdrawalsAmount = myWithdrawals
                    .filter(item => item.status === 'Approved')
                    .reduce((acc, cur) => acc + parseInt(cur.amount || 0), 0);

                setOrders(myOrders);
                setWithdrawData(myWithdrawals);
                setWithdrawableBalance(deliveredBalance - totalWithdrawn);
                setPendingWithdrawals(pendingWithdrawalsAmount);
                setTotalWithdrawals(approvedWithdrawalsAmount);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (user?.email) {
            fetchData();
        }
    }, [user]);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setWithdrawLoading(true);

        const withdrawAmount = parseInt(amount);
        if (withdrawAmount < 1000) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Minimum withdraw amount is 1000!',
            });
            setWithdrawLoading(false);
            return;
        }

        if (withdrawAmount > withdrawableBalance) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Insufficient balance!',
            });
            setWithdrawLoading(false);
            return;
        }

        const data = {
            email: user?.email,
            amount: withdrawAmount,
            status: 'Pending',
            request_date: new Date().toLocaleDateString(),
            approval_date: '',
            paymentMethod: e.target.paymentMethod.value,
            paymentNumber: e.target.paymentNumber.value,
            charge: withdrawAmount * 0.01,
            withdrawableBalance: withdrawableBalance - (withdrawAmount + withdrawAmount * 0.01),
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/withdraw`, data);
            if (response.data) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Withdraw request sent successfully',
                });
                // Update state after successful withdrawal
                setWithdrawData([...withdrawData, data]);
                setWithdrawableBalance(prev => prev - (withdrawAmount + withdrawAmount * 0.01));
                setPendingWithdrawals(prev => prev + withdrawAmount);
                setAmount(''); // Reset form
                e.target.reset();
            }
        } catch (error) {
            console.error('Withdraw request failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Withdraw request failed!',
            });
        } finally {
            setWithdrawLoading(false);
        }
    };

    if (loading) {
        return (
            <motion.div
                className="flex justify-center items-center h-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="max-w-7xl mx-auto px-4 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <h2 className="text-2xl font-bold text-gray-800">ওইথড্র ম্যানেজমেন্ট</h2>
                <p className="text-gray-600">এই পেজে আপনি আপনার স্টোরের ওইথড্র রিকোয়েস্টগুলি পরিচালনা করতে পারবেন।</p>
            </motion.div>

            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white p-4 rounded-md shadow-md mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
            >
                <motion.div
                    className="bg-teal-100 flex justify-center items-center gap-3 flex-col p-4 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                >
                    <h2 className="text-2xl font-bold text-gray-800">Total Orders</h2>
                    <div className="text-3xl font-bold text-gray-800">
                        {orders.length > 0 ? orders.length : 'No Orders'}
                    </div>
                </motion.div>
                <motion.div
                    className="bg-orange-100 flex justify-center items-center gap-3 flex-col p-4 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                >
                    <h2 className="text-2xl font-bold text-gray-800">Total Main Balance</h2>
                    <div className="text-3xl font-bold text-gray-800">
                        {orders.length > 0 ? orders.reduce((acc, cur) => acc + parseInt(cur.amar_bikri_mullo || 0), 0) : 'No Orders'}
                    </div>
                </motion.div>
                <motion.div
                    className="bg-indigo-100 flex justify-center items-center gap-3 flex-col p-4 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                >
                    <h2 className="text-2xl text-center font-bold text-gray-800">Total Withdrawable Balance</h2>
                    <div className="text-3xl font-bold text-gray-800">
                        {withdrawableBalance || 0}
                    </div>
                </motion.div>
                <motion.div
                    className="bg-purple-100 flex justify-center items-center gap-3 flex-col p-4 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                >
                    <h2 className="text-2xl font-bold text-center text-gray-800">Total Pending Balance</h2>
                    <div className="text-3xl font-bold text-gray-800">
                        {pendingWithdrawals || 0}
                    </div>
                </motion.div>
                <motion.div
                    className="bg-red-100 flex justify-center items-center gap-3 flex-col p-4 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                >
                    <h2 className="text-2xl text-center font-bold text-gray-800">Total Approved Balance</h2>
                    <div className="text-3xl font-bold text-gray-800">
                        {totalWithdrawals || 0}
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                className="w-full grid mt-10 shadow-sm rounded-lg p-4 md:grid-cols-5 items-center gap-4 bg-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <motion.div
                    className="col-span-3 bg-gray-50 p-4 rounded-lg h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-2xl font-bold text-gray-800">Withdraw History</h2>
                    {withdrawData.length === 0 ? (
                        <p className="text-gray-600 mt-2">No withdrawal history available.</p>
                    ) : (
                        <motion.div
                            className="mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                        >
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2 text-gray-700">Amount</th>
                                        <th className="p-2 text-gray-700">Status</th>
                                        <th className="p-2 text-gray-700">Request Date</th>
                                        <th className="p-2 text-gray-700">Payment Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {withdrawData.map((withdraw, index) => (
                                            <motion.tr
                                                key={withdraw._id.$oid}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                whileHover={{ backgroundColor: 'hsl(var(--muted)/0.1)' }}
                                            >
                                                <td className="p-2">৳{withdraw.amount}</td>
                                                <td className="p-2">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${withdraw.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                                            }`}
                                                    >
                                                        {withdraw.status}
                                                    </span>
                                                </td>
                                                <td className="p-2">{withdraw.request_date}</td>
                                                <td className="p-2">{withdraw.paymentMethod}</td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </motion.div>

                <motion.div
                    className="col-span-2 bg-white p-4 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-2xl font-bold text-gray-800">Withdraw Request Form</h2>
                    <p className="text-gray-600">Please fill out the form below to request a withdraw.</p>
                    <form onSubmit={handleWithdraw} className="mt-4">
                        <div className="mb-4">
                            <label htmlFor="withdraw" className="block text-sm font-medium text-gray-700">Withdraw Amount</label>
                            <input
                                onChange={(e) => setAmount(e.target.value)}
                                value={amount}
                                type="number"
                                id="withdraw"
                                name="withdraw"
                                min="1000"
                                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                required
                            />
                        </div>
                        {amount && amount >= 1000 ? (
                            <motion.div
                                className="grid grid-cols-2 gap-4 items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-4">
                                    <label htmlFor="charge" className="block text-sm font-medium text-gray-700">Withdraw Charge</label>
                                    <div className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-red-400 font-semibold text-white text-xl">
                                        {parseFloat(amount * 0.01).toFixed(2)}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="total" className="block text-sm font-medium text-gray-700">Withdraw Total</label>
                                    <div className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-green-400 font-semibold text-white text-xl">
                                        {parseInt(amount - (amount * 0.01))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}
                        <div className="mb-4">
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Select Payment Method</label>
                            <select id="paymentMethod" name="paymentMethod" className="mt-1 p-2 border border-gray-300 rounded-md w-full" required>
                                <option disabled value="">Select Payment Method</option>
                                <option value="Bkash">Bkash</option>
                                <option value="Nagad">Nagad</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="paymentNumber" className="block text-sm font-medium text-gray-700">Payment Number</label>
                            <input
                                type="text"
                                id="paymentNumber"
                                name="paymentNumber"
                                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="withdrawPassword" className="block text-sm font-medium text-gray-700">Withdraw Password</label>
                            <input
                                type="password"
                                id="withdrawPassword"
                                name="withdrawPassword"
                                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                                required
                            />
                        </div>
                        <motion.button
                            type="submit"
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                            disabled={withdrawLoading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {withdrawLoading ? 'Processing...' : 'Request Withdraw'}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default ConnectStorePage;