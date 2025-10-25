import axios from 'axios';
import { Loader } from 'lucide-react';
import React from 'react';

const SeeUser = () => {
    const [data, setData] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [totalOrders, setTotalOrders] = React.useState(0);
    const [totalRevenue, setTotalRevenue] = React.useState(0);
    const [myIncome, setMyIncome] = React.useState(0);
    const [totalWithdraw, setTotalWithdraw] = React.useState(0);
    const [ordersData, setOrdersData] = React.useState([]);
    const [withdrawData, setWithdrawData] = React.useState([]);

    const handelGetUser = () => {
        setLoading(true);
        axios.get(`${import.meta.env.VITE_BASE_URL}/users`)
            .then(res => {
                const userData = res.data.find(user => user.email === email);
                setData(userData);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });

        axios.get(`${import.meta.env.VITE_BASE_URL}/orders`)
            .then(res => {
                const orders = res.data.filter(order => order.email === email);
                const sortedOrders = orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date)).slice(0, 10); // latest 10
                setOrdersData(sortedOrders);
                setTotalOrders(orders.length);
                setTotalRevenue(orders.reduce((acc, order) => acc + order.amar_bikri_mullo, 0));
                setMyIncome((orders.reduce((acc, order) => acc + order.amar_bikri_mullo, 0)) - (orders.reduce((acc, order) => acc + order.grand_total, 0)));
            });

        axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw`)
            .then(res => {
                const myWithdraws = res.data.filter(withdraw => withdraw.email === email);
                const approvedWithdraws = myWithdraws.filter(withdraw => withdraw.status === 'Approved');
                const total = approvedWithdraws.reduce((acc, withdraw) => acc + withdraw.amount, 0);
                setTotalWithdraw(total);
                const latestWithdraws = approvedWithdraws.sort((a, b) => new Date(b.approval_date) - new Date(a.approval_date)).slice(0, 10); // latest 10
                setWithdrawData(latestWithdraws);
            });
    }

    if (loading) {
        return (
            <div className="w-full min-h-[70vh] flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900">
                    <Loader className="h-8 w-8 text-orange-900" />
                </div>
            </div>
        )
    }

    return (
        <div className='w-full'>
            {/* Header */}
            <div className="p-4 rounded-lg flex justify-between items-center gap-4 bg-white">
                <div>
                    <h1 className="text-2xl font-bold mb-2">ব্যবহারকারী ড্যাশবোর্ড</h1>
                    <p>এখানে আপনি ব্যবহারকারীদের ড্যাশবোর্ড দেখতে পারবেন।</p>
                </div>
                <div className="flex items-center">
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ইমেইল দিয়ে অনুসন্ধান করুন"
                        type="email" />
                    <button
                        onClick={handelGetUser}
                        className="ml-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        অনুসন্ধান
                    </button>
                </div>
            </div>

            {/* User Data */}
            {data?.email && (
                <div className="bg-white p-4 rounded-lg mt-4 space-y-4">
                    {/* User & Store Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-tr from-blue-50 via-pink-50 to-indigo-50 p-4 rounded-lg">
                            <h2 className="text-xl font-bold">ব্যবহারকারীর তথ্য</h2>
                            <p>নাম: {data.name}</p>
                            <p>ইমেইল: {data.email}</p>
                            <p>ফোন: {data.phone}</p>
                        </div>
                        <div className="bg-gradient-to-tr from-orange-50 via-pink-50 to-red-50 p-4 rounded-lg">
                            <h2 className="text-xl font-bold mb-2">স্টোর তথ্য</h2>
                            <div className="flex gap-4 items-center">
                                <img
                                    className='object-cover h-16 w-16 rounded-full'
                                    src={data.storeInfo?.shopImage} alt="" />
                                <div>
                                    <p>স্টোর নাম: {data.storeInfo?.shopName}</p>
                                    <p>স্টোর যোগাযোগ: {data.storeInfo?.shopContact}</p>
                                    <p>স্টোর ঠিকানা: {data.storeInfo?.shopAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-gradient-to-tr from-green-50 via-green-100 to-green-200 p-4 rounded-lg">
                            <h2 className="text-xl font-bold mb-2">মোট পণ্য</h2>
                            <p className="text-3xl font-bold">{totalOrders}</p>
                        </div>
                        <div className="bg-gradient-to-tr from-blue-50 via-orange-100 to-orange-200 p-4 rounded-lg">
                            <h2 className="text-xl font-bold mb-2">মোট বিক্রয়</h2>
                            <p className="text-3xl font-bold">{totalRevenue}</p>
                        </div>
                        <div className="bg-gradient-to-tr from-purple-50 via-pink-100 to-purple-200 p-4 rounded-lg">
                            <h2 className="text-xl font-bold mb-2">মোট আয়</h2>
                            <p className="text-3xl font-bold">{myIncome}</p>
                        </div>
                        <div className="bg-gradient-to-tr from-teal-50 via-green-100 to-teal-200 p-4 rounded-lg">
                            <h2 className="text-xl font-bold mb-2">মোট উইথড্র</h2>
                            <p className="text-3xl font-bold">{totalWithdraw}</p>
                        </div>
                    </div>

                    {/* Latest Orders & Withdraws */}
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        {/* Latest Orders */}
                        <div className="bg-white border rounded-lg p-4 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">লেটেস্ট অর্ডারসমূহ</h2>
                            {ordersData.length > 0 ? (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {ordersData.map(order => (
                                        <div key={order._id?.$oid} className="border p-2 rounded-lg flex justify-between items-center">
                                            <p>অর্ডার : {order?.items[0]?.name}</p>
                                            <p>মোট: {order.grand_total}</p>
                                            <p>স্ট্যাটাস: {order.status}</p>
                                        </div>
                                    ))}

                                </div>
                            ) : <p>কোনো অর্ডার নেই।</p>}
                        </div>

                        {/* Latest Withdraws */}
                        <div className="bg-white border rounded-lg p-4 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">লেটেস্ট উইথড্র হল</h2>
                            {withdrawData.length > 0 ? (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {withdrawData.map(withdraw => (
                                        <div key={withdraw._id?.$oid} className="border p-2 rounded-lg flex justify-between items-center">
                                            <p>মোট: {withdraw.amount}</p>
                                            <p>পেমেন্ট: {withdraw.paymentMethod}</p>
                                            <p>স্ট্যাটাস: {withdraw.status}</p>
                                        </div>
                                    ))}

                                </div>
                            ) : <p>কোনো উইথড্র নেই।</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeeUser;
