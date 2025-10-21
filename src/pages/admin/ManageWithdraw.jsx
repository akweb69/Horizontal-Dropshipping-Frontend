import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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

    // Fetch withdrawals on component mount
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

    // Apply filters whenever filter states change
    useEffect(() => {
        let filtered = withdrawals;

        // Filter by email
        if (searchEmail) {
            filtered = filtered.filter(w => w.email.toLowerCase().includes(searchEmail.toLowerCase()));
        }

        // Filter by date range
        if (fromDate || toDate) {
            filtered = filtered.filter(w => {
                const requestDate = new Date(w.request_date);
                const from = fromDate ? new Date(fromDate) : new Date(0);
                const to = toDate ? new Date(toDate) : new Date();
                return requestDate >= from && requestDate <= to;
            });
        }

        // Filter by status
        if (statusFilter !== 'All') {
            filtered = filtered.filter(w => w.status === statusFilter);
        }

        setFilteredWithdrawals(filtered);
    }, [searchEmail, fromDate, toDate, statusFilter, withdrawals]);

    const updateWithdrawalStatus = async (id, newStatus) => {
        try {
            await axios.patch(`${import.meta.env.VITE_BASE_URL}/withdraw/${id}`, { status: newStatus });
            await fetchWithdrawals(); // Refresh the list
            setSelectedWithdrawal(null); // Close modal if open
        } catch (err) {
            setError('Failed to update withdrawal status');
            console.error(err);
        }
    };

    const openDetailsModal = (withdrawal) => {
        setSelectedWithdrawal(withdrawal);
    };

    const closeDetailsModal = () => {
        setSelectedWithdrawal(null);
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100"
            >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 text-red-600 text-lg font-semibold"
            >
                {error}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
            >
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Withdrawal Management</h2>
                <p className="mt-2 text-gray-600 text-sm sm:text-base">Manage all withdrawal requests efficiently</p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search by Email</label>
                        <input
                            type="text"
                            placeholder="Enter email..."
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Email', 'Amount', 'Status', 'Request Date', 'Actions'].map((header) => (
                                    <th
                                        key={header}
                                        className="py-4 px-6 text-left text-sm font-semibold text-gray-900"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredWithdrawals.map((withdrawal, index) => (
                                    <motion.tr
                                        key={withdrawal._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="py-4 px-6 text-sm text-gray-700">{withdrawal.email}</td>
                                        <td className="py-4 px-6 text-sm text-gray-700">৳{withdrawal.amount}</td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${withdrawal.status === 'Approved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : withdrawal.status === 'Rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {withdrawal.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-700">{withdrawal.request_date}</td>
                                        <td className="py-4 px-6 flex space-x-3">
                                            <motion.button
                                                onClick={() => openDetailsModal(withdrawal)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                            >
                                                Details
                                            </motion.button>
                                            {withdrawal.status === 'Pending' ? (
                                                <>
                                                    <motion.button
                                                        onClick={() => updateWithdrawalStatus(withdrawal._id, 'Approved')}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                                                    >
                                                        Approve
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => updateWithdrawalStatus(withdrawal._id, 'Rejected')}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                                                    >
                                                        Reject
                                                    </motion.button>
                                                </>
                                            ) : null}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
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
                                <p><strong>Email:</strong> {selectedWithdrawal.email}</p>
                                <p><strong>Amount:</strong> ৳{selectedWithdrawal.amount}</p>
                                <p><strong>Payment Method:</strong> {selectedWithdrawal.paymentMethod}</p>
                                <p><strong>Payment Number:</strong> {selectedWithdrawal.paymentNumber}</p>
                                <p><strong>Charge:</strong> ৳{selectedWithdrawal.charge}</p>
                                <p><strong>Withdrawable Balance:</strong> ৳{selectedWithdrawal.withdrawableBalance}</p>
                                <p><strong>Request Date:</strong> {selectedWithdrawal.request_date}</p>
                                <p><strong>Approval Date:</strong> {selectedWithdrawal.approval_date || '-'}</p>
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
                            <div className="mt-6 flex justify-end space-x-3">
                                {selectedWithdrawal.status === 'Pending' && (
                                    <>
                                        <motion.button
                                            onClick={() => updateWithdrawalStatus(selectedWithdrawal._id, 'Approved')}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                                        >
                                            Approve
                                        </motion.button>
                                        <motion.button
                                            onClick={() => updateWithdrawalStatus(selectedWithdrawal._id, 'Rejected')}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                                        >
                                            Reject
                                        </motion.button>
                                    </>
                                )}
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

export default ManageWithdraw;