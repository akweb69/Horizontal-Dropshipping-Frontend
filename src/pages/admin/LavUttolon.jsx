import axios from 'axios';
import { Eye, FileText, Loader, User, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { motion } from "framer-motion";
import { X, ShoppingBag, DollarSign, Calendar, MapPin, Store } from "lucide-react";

const LavUttolon = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [totalbalance, setTotalBalance] = useState(0);
    const [totalwithdraw, setTotalWithdraw] = useState(0);
    const [openDetailsWithdraw, setOpenDetailsWithdraw] = useState(false);
    const [openOrdersWithdraw, setOpenOrdersWithdraw] = useState(false);
    const { user } = useAuth();

    // Pagination States
    const [withdrawPage, setWithdrawPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
    const itemsPerPage = 5;

    const balance = totalbalance - totalwithdraw;

    // Load data
    useEffect(() => {
        setLoading(true);

        // Fetch orders data
        axios.get(`${import.meta.env.VITE_BASE_URL}/orders`)
            .then(res => {
                const data = res.data || [];
                const successData = data.filter(item => item.status === 'Delivered');
                setTotalBalance(successData.reduce((acc, order) => acc + order.profit, 0));
                setOrders(successData);
            })
            .catch(err => {
                setError("Something went wrong!");
            });

        // Load withdraw data
        axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw_admin`)
            .then(res => {
                const data = res.data;
                setData(data);
                setTotalWithdraw(data.reduce((acc, order) => acc + order.amount, 0));
            })
            .catch(err => {
                setError("Something went wrong!");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Handle withdraw
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState("");
    const date = new Date().toLocaleDateString('bn-BD');

    const withdarwDetails = {
        amount: parseInt(amount),
        description,
        date,
        who: user?.email
    };

    const handleWithdraw = (e) => {
        e.preventDefault();


        // check balance sufficient
        if (amount > balance) {
            return Swal.fire({
                icon: 'error',
                title: 'Insufficient balance',
                showConfirmButton: false,
                timer: 1500
            });
        }
        axios.post(`${import.meta.env.VITE_BASE_URL}/withdraw_admin`, withdarwDetails)
            .then(res => {
                Swal.fire({
                    icon: 'success',
                    title: 'Withdraw added successfully',
                    showConfirmButton: false,
                    timer: 1500
                });
                axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw_admin`)
                    .then(res => {
                        const data = res.data;
                        setData(data);
                        setTotalWithdraw(data.reduce((acc, order) => acc + order.amount, 0));
                        setWithdrawPage(1); // Reset to first page
                    });
            })
            .catch(err => {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to add withdraw',
                    showConfirmButton: false,
                    timer: 1500
                });
            });
    };

    // View details
    const [details, setDetails] = useState({});
    const handleViewDetails = (withdraw) => {
        setDetails(withdraw);
        setOpenDetailsWithdraw(true);
    };

    const [orderDetails, setOrderDetails] = useState({});
    const handleViewOrders = (order) => {
        setOrderDetails(order);
        setOpenOrdersWithdraw(true);
    };

    const getDate = (date) => {
        const newDate = new Date(date);
        return newDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Pagination Logic
    const paginate = (array, page, perPage) => {
        const start = (page - 1) * perPage;
        return array.slice(start, start + perPage);
    };

    const totalWithdrawPages = Math.ceil(data.length / itemsPerPage);
    const totalOrdersPages = Math.ceil(orders.length / itemsPerPage);

    const currentWithdrawData = paginate(data, withdrawPage, itemsPerPage);
    const currentOrdersData = paginate(orders, ordersPage, itemsPerPage);

    // Pagination Controls
    const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
        return (
            <div className="flex justify-center items-center gap-2 mt-4">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'} transition-all`}
                >
                    <ChevronLeft size={18} />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => onPageChange(i + 1)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'} transition-all`}
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center h-64">
                <Loader className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className='w-full min-h-[50vh] bangla'>
            {/* Amount Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 flex w-full flex-col justify-center items-center gap-4 rounded-lg shadow-lg bg-white">
                    <div className="text-center text-xl md:text-2xl font-semibold">Total Balance</div>
                    <div className="text-2xl md:text-3xl font-semibold">{balance} Tk</div>
                </div>
                <div className="p-4 flex w-full flex-col rounded-lg shadow-lg bg-white justify-center items-center gap-4">
                    <div className="text-center text-xl md:text-2xl font-semibold">Total Withdraw</div>
                    <div className="text-2xl md:text-3xl font-semibold">{totalwithdraw} Tk</div>
                </div>
            </div>

            {/* Withdraw Form */}
            <form onSubmit={handleWithdraw}>
                <div className="mt-4 w-full rounded-lg bg-white shadow-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-4">
                    <input
                        className="w-full lg:col-span-3 sm:col-span-2 p-3 rounded-md outline-dashed outline-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        type="number"
                        placeholder="Enter Withdraw Amount"
                        required
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <input
                        className="w-full lg:col-span-5 sm:col-span-2 p-3 rounded-md outline-dashed outline-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        type="text"
                        placeholder="Enter Why Withdraw Balance"
                        required
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full lg:col-span-2 sm:col-span-2 p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-300"
                    >
                        Withdraw
                    </button>
                </div>
            </form>

            {/* History Tables with Pagination */}
            <div className="lg:grid grid-cols-2 gap-4 mt-6 lg:mt-10">
                {/* Withdraw History */}
                <div className="w-full bg-white shadow-lg p-4 rounded-lg">
                    <h1 className="text-lg md:text-xl font-semibold">Withdraw History</h1>
                    <div className="overflow-x-auto mt-4">
                        <table className="table w-full border rounded-lg">
                            <thead className='bg-orange-500 text-white'>
                                <tr>
                                    <th className='text-center text-sm py-2 border-l'>Amount</th>
                                    <th className='text-center text-sm py-2 border-l'>Description</th>
                                    <th className='text-center text-sm py-2 border-l'>Date</th>
                                    <th className='text-center text-sm py-2 border-l'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentWithdrawData.length > 0 ? (
                                    currentWithdrawData.map((item, index) => (
                                        <tr className='hover:bg-orange-50 border' key={index}>
                                            <td className='text-center p-2 border-l text-xs md:text-sm'>{item?.amount} Tk</td>
                                            <td className='text-center p-2 border-l text-xs md:text-sm'>{item?.description.slice(0, 15)}...</td>
                                            <td className='text-center p-2 border-l text-xs md:text-sm'>{item?.date}</td>
                                            <td className='text-center p-2 border-l'>
                                                <Eye
                                                    onClick={() => handleViewDetails(item)}
                                                    className='h-5 w-5 mx-auto rounded-full hover:p-1 hover:bg-orange-500 cursor-pointer text-orange-600'
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-500">No withdraw history</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalWithdrawPages > 1 && (
                        <PaginationControls
                            currentPage={withdrawPage}
                            totalPages={totalWithdrawPages}
                            onPageChange={setWithdrawPage}
                        />
                    )}
                </div>

                {/* Orders History */}
                <div className="mt-6 lg:mt-0">
                    <div className="w-full bg-white shadow-lg p-4 rounded-lg">
                        <h1 className="text-lg md:text-xl font-semibold">Orders History</h1>
                        <div className="overflow-x-auto mt-4">
                            <table className="table w-full border rounded-lg">
                                <thead className='bg-orange-500 text-white'>
                                    <tr>
                                        <th className='text-center text-sm py-2 border-l'>Product</th>
                                        <th className='text-center text-sm py-2 border-l'>Price</th>
                                        <th className='text-center text-sm py-2 border-l'>Profit</th>
                                        <th className='text-center text-sm py-2 border-l'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOrdersData.length > 0 ? (
                                        currentOrdersData.map((item, index) => (
                                            <tr className='hover:bg-orange-50 border' key={index}>
                                                <td className='text-center p-2 border-l text-xs md:text-sm'>
                                                    {item?.items[0]?.name.slice(0, 20)}...
                                                </td>
                                                <td className='text-center p-2 border-l text-xs md:text-sm'>৳{item?.items[0]?.price}</td>
                                                <td className='text-center p-2 border-l bg-green-100 text-xs md:text-sm font-medium'>
                                                    ৳{item?.items[0]?.profit}
                                                </td>
                                                <td className='text-center p-2 border-l'>
                                                    <Eye
                                                        onClick={() => handleViewOrders(item)}
                                                        className='h-5 w-5 mx-auto rounded-full hover:p-1 hover:bg-orange-500 cursor-pointer text-orange-600'
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-gray-500">No orders history</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalOrdersPages > 1 && (
                            <PaginationControls
                                currentPage={ordersPage}
                                totalPages={totalOrdersPages}
                                onPageChange={setOrdersPage}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Withdraw Details Modal */}
            {openDetailsWithdraw && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-3">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white w-full max-w-md sm:max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6"
                    >
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-orange-500" />
                                Withdraw Details
                            </h1>
                            <button
                                onClick={() => setOpenDetailsWithdraw(false)}
                                className="text-gray-600 hover:text-red-500 transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm flex items-center gap-2 text-gray-700">
                                <DollarSign className="text-green-600" size={16} />
                                <span className="font-medium">Amount:</span> {details?.amount} Tk
                            </p>
                            <p className="text-sm flex items-center gap-2 text-gray-700">
                                <FileText className="text-blue-600" size={16} />
                                <span className="font-medium">Description:</span> {details?.description}
                            </p>
                            <p className="text-sm flex items-center gap-2 text-gray-700">
                                <Calendar className="text-orange-600" size={16} />
                                <span className="font-medium">Date:</span>{" "}
                                {new Date(details?.date).toLocaleString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                            <p className="text-sm flex items-center gap-2 text-gray-700">
                                <User className="text-purple-600" size={16} />
                                <span className="font-medium">Who:</span> {details?.who}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setOpenDetailsWithdraw(false)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Order Details Modal */}
            {openOrdersWithdraw && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-3">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white w-full h-[80vh] overflow-y-auto max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6"
                    >
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                Order Details
                            </h1>
                            <button
                                onClick={() => setOpenOrdersWithdraw(false)}
                                className="text-gray-600 hover:text-red-500 transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <img
                                src={orderDetails?.items[0]?.thumbnail}
                                alt={orderDetails?.items[0]?.name}
                                className="w-full h-48 rounded-lg border object-cover"
                            />
                            <p className="text-base font-medium text-gray-800 mt-2">{orderDetails?.items[0]?.name}</p>
                            <p className="text-sm text-gray-600">Size: {orderDetails?.items[0]?.size}</p>
                            <p className="text-sm text-gray-600">Quantity: {orderDetails?.items[0]?.quantity}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <DollarSign size={16} className="text-green-600" />
                                Price: ৳{orderDetails?.items[0]?.price}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <DollarSign size={16} className="text-emerald-600" />
                                Profit: ৳{orderDetails?.items[0]?.profit}
                            </p>
                        </div>

                        <div className="mt-5 bg-orange-50 rounded-lg p-3 space-y-1">
                            <h2 className="font-semibold text-orange-700 mb-1 flex items-center gap-2">
                                <MapPin size={18} />
                                Delivery Info
                            </h2>
                            <p className="text-sm text-gray-700">Name: {orderDetails?.delivery_details?.name}</p>
                            <p className="text-sm text-gray-700">Phone: {orderDetails?.delivery_details?.phone}</p>
                            <p className="text-sm text-gray-700">Address: {orderDetails?.delivery_details?.address}</p>
                            <p className="text-sm text-gray-700">Location: {orderDetails?.delivery_details?.location}</p>
                        </div>

                        <div className="mt-4 bg-gray-50 rounded-lg p-3 space-y-1">
                            <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                <Store size={18} />
                                Store Info
                            </h2>
                            <p className="text-sm text-gray-700">Shop: {orderDetails?.store_info?.shopName}</p>
                            <p className="text-sm text-gray-700">Address: {orderDetails?.store_info?.shopAddress}</p>
                            <p className="text-sm text-gray-700">Contact: {orderDetails?.store_info?.shopContact}</p>
                        </div>

                        <div className="mt-4 bg-orange-100 rounded-lg p-3 space-y-1 text-sm">
                            <p>Items Total: ৳{orderDetails?.items_total}</p>
                            <p>Delivery Charge: ৳{orderDetails?.delivery_charge}</p>
                            <p className="font-semibold text-gray-800">Grand Total: ৳{orderDetails?.grand_total}</p>
                            <p>Paid Amount: ৳{orderDetails?.paid_amount}</p>
                            <p>Due Amount: ৳{orderDetails?.due_amount}</p>
                            <p className="flex items-center gap-2 text-gray-700 mt-1">
                                <Calendar size={16} className="text-orange-600" />
                                Date: {getDate(orderDetails?.order_date)}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setOpenOrdersWithdraw(false)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default LavUttolon;