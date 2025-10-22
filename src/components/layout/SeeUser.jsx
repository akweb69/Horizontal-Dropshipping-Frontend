import axios from 'axios';
import { Loader } from 'lucide-react';
import React from 'react';

const SeeUser = () => {
    const [data, setData] = React.useState({});
    const [loading, setloading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [totalOrders, setTotalOrders] = React.useState(0);
    const [totalRevenue, setTotalRevenue] = React.useState(0);
    const [myIncome, setMyIncome] = React.useState(0);
    const [totalWithdraw, setTotalWithdraw] = React.useState(0);
    const [ordersData, setOrdersData] = React.useState([]);

    //load data from backend api

    const handelGetUser = () => {
        setloading(true);
        axios.get(`${import.meta.env.VITE_BASE_URL}/users`)
            .then(res => {
                const data = res.data;
                const userData = data.find(user => user.email === email);
                setData(userData);
                setloading(false);
            })
            .catch(err => {
                console.log(err);
                setloading(false);
            });
        axios.get(`${import.meta.env.VITE_BASE_URL}/orders`)
            .then(res => {
                const data = res.data;
                const orders = data.filter(order => order.email === email);
                setOrdersData(orders);
                setTotalOrders(orders.length);
                setTotalRevenue(orders.reduce((acc, order) => acc + order.amar_bikri_mullo, 0));
                setMyIncome((orders.reduce((acc, order) => acc + order.amar_bikri_mullo, 0)) - (orders.reduce((acc, order) => acc + order.grand_total, 0)));
            })

        axios.get(`${import.meta.env.VITE_BASE_URL}/withdraws`)
            .then(res => {
                const data = res.data;
                const myWithdraws = data.filter(withdraw => withdraw.email === email);
                const mydata = myWithdraws.filter(withdraw => withdraw.status === 'Approved');
                const total = mydata.reduce((acc, withdraw) => acc + withdraw.amount, 0);
                setTotalWithdraw(total);

            })
    }
    // check if data is loading
    if (loading) {
        return <div className="w-full min-h-[70vh] flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900">
                <Loader className="h-8 w-8 text-orange-900" />
            </div>
        </div >
    }
    return (
        <div className='w-full'>
            <div className="p-4 rounded-lg flex justify-between items-center gap-4 bg-white">
                <div className="">
                    <h1 className="text-2xl font-bold mb-2">ব্যবহারকারী ড্যাশবোর্ড</h1>
                    <p>এখানে আপনি ব্যবহারকারীদের ড্যাশবোর্ড দেখতে পারবেন।</p>
                </div>
                <div className="">
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ইমেইল দিয়ে অনুসন্ধান করুন"
                        type="email" />
                    {/* button */}
                    <button
                        onClick={handelGetUser}
                        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        অনুসন্ধান
                    </button>
                </div>
            </div>
            {/* if data is loading show spinner */}
            {
                data?.email && (
                    <div className="bg-white p-4 rounded-lg mt-4">
                        {/* user details information card */}
                        <div className="bg-white grid h-full items-center gap-4 md:grid-cols-2 rounded-lg">
                            <div className="bg-gradient-to-tr from-blue-50 via-pink-50 to-indigo-50 p-4 rounded-lg h-full">
                                <h2 className="text-xl font-bold ">ব্যবহারকারীর তথ্য</h2>
                                <p>নাম: {data.name}</p>
                                <p>ইমেইল: {data.email}</p>
                                <p>ফোন: {data.phone}</p>

                            </div>
                            {/* store information    */}
                            <div className="bg-gradient-to-tr from-orange-50 via-pink-50 to-red-50 p-4 rounded-lg">
                                <h2 className="text-xl font-bold mb-2">স্টোর তথ্য</h2>
                                <div className="flex gap-4 items-center">
                                    <img
                                        className=' object-cover h-16 w-16 rounded-full'
                                        src={data.storeInfo?.shopImage} alt="" />
                                    <div className="">
                                        <h1 className="">
                                            স্টোর নাম: {data.storeInfo?.shopName}
                                        </h1>
                                        <h1 className="">
                                            স্টোর যোগাযোগ: {data.storeInfo?.shopContact}
                                        </h1>
                                        <h1 className="">
                                            স্টোর ঠিকানা: {data.storeInfo?.shopAddress}
                                        </h1>

                                    </div>
                                </div>
                            </div>

                        </div>
                        {/* stats card */}
                        <div className="w-full mt-4 grid md:grid-2 lg:grid-cols-4 gap-4 items-center">
                            {/* card-1 */}
                            <div className="">
                                <div className="bg-gradient-to-tr from-green-50 via-green-100 to-green-200 p-4 rounded-lg">
                                    <h2 className="text-xl font-bold mb-2">মোট পণ্য</h2>
                                    <p className="text-3xl font-bold">{totalOrders || 0}</p>
                                </div>
                            </div>
                            {/* card-2   */}
                            <div className="">
                                <div className="bg-gradient-to-tr from-blue-50 via-orange-100 to-orange-200 p-4 rounded-lg">
                                    <h2 className="text-xl font-bold mb-2">মোট বিক্রয়</h2>
                                    <p className="text-3xl font-bold">{totalRevenue || 0}</p>
                                </div>
                            </div>
                            {/* card-3   */}
                            <div className="">
                                <div className="bg-gradient-to-tr from-purple-50 via-pink-100 to-purple-200 p-4 rounded-lg">
                                    <h2 className="text-xl font-bold mb-2">মোট আয়</h2>
                                    <p className="text-3xl font-bold">{myIncome || 0}</p>
                                </div>
                            </div>
                            {/* card-4   */}
                            <div className="">
                                <div className="bg-gradient-to-tr from-teal-50 via-green-100 to-teal-200 p-4 rounded-lg">
                                    <h2 className="text-xl font-bold mb-2">মোট ওয়াইথড্র</h2>
                                    <p className="text-3xl font-bold">{totalWithdraw || 0}</p>
                                </div>
                            </div>

                        </div>
                        {/* my orders */}
                        {/* <div className="">
                            {
                                ordersData.length > 0 && <div className="">
                                    <h2 className="text-2xl font-bold my-4">আমার অর্ডারসমূহ</h2>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="py-2 px-4 border-b border-gray-200">অর্ডার আইডি</th>
                                                    <th className="py-2 px-4 border-b border-gray-200">ইমেইল</th>
                                                    <th className="py-2 px-4 border-b border-gray-200">অর্ডার তারিখ</th>
                                                    <th className="py-2 px-4 border-b border-gray-200">মোট মূল্য</th>
                                                    <th className="py-2 px-4 border-b border-gray-200">অর্ডার স্ট্যাটাস</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {

                                                    ordersData.map((order) => (
                                                        <tr key={order._id}>
                                                            <td className="py-2 px-4 border-b border-gray-200">{order._id}</td>
                                                            <td className="py-2 px-4 border-b border-gray-200">{order.email}</td>
                                                            <td className="py-2 px-4 border-b border-gray-200">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                            <td className="py-2 px-4 border-b border-gray-200">{order.grand_total}</td>
                                                            <td className="py-2 px-4 border-b border-gray-200">{order.status}</td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            }
                        </div> */}
                    </div>
                )
            }
        </div >
    );
};

export default SeeUser;