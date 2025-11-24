import axios from 'axios';
import { Loader } from 'lucide-react';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Loader11 from './Loader11';
import Swal from 'sweetalert2';

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
    const [password, setPassword] = useState("");
    const [showpass, setShowPass] = useState(false);
    const [showStoreUpdateModal, setShowStoreUpdateModal] = useState(false);
    const [updateStoreEmail, setUpdateStoreEmail] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [userReferIncome, setUserReferIncome] = useState(0);
    const [totalRefferIncome, setTotalRefferIncome] = useState(0);


    const base_url = import.meta.env.VITE_BASE_URL;
    const imgbb_api_key = import.meta.env.VITE_IMGBB_API_KEY;


    const handelGetUser = async () => {
        if (!email.trim()) {
            Swal.fire({ icon: "warning", text: "ইমেইল দিন" });
            return;
        }

        setLoading(true);
        setData({});
        setOrdersData([]);
        setWithdrawData([]);
        setTotalOrders(0);
        setTotalRevenue(0);
        setMyIncome(0);
        setTotalWithdraw(0);
        setUserReferIncome(0);
        setTotalRefferIncome(0);

        try {
            const [usersRes, ordersRes, withdrawRes, referWithdrawRes] = await Promise.all([
                axios.get(`${base_url}/users`),
                axios.get(`${base_url}/orders`),
                axios.get(`${base_url}/withdraw`),
                axios.get(`${base_url}/refer-withdraw`)
            ]);

            // User খুঁজে বের করা
            const userData = usersRes.data.find(user => user.email === email);

            if (!userData) {
                Swal.fire({ icon: "error", text: "User খুঁজে পাওয়া যায়নি" });
                setLoading(false);
                return;
            }

            setData(userData);
            const referIncome = userData?.referIncome || 0;
            setUserReferIncome(referIncome);

            // Orders processing
            const userOrders = ordersRes.data.filter(order => order.email === email);
            const sortedOrders = userOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
            setOrdersData(sortedOrders);
            setTotalOrders(userOrders.length);

            const totalRev = userOrders.reduce((acc, o) => acc + (o.amar_bikri_mullo || 0), 0);
            const totalCost = userOrders.reduce((acc, o) => acc + (o.items_total || 0), 0);
            const deliveryCharges = userOrders.reduce((acc, o) => acc + (o.delivery_charge || 0), 0);

            setTotalRevenue(totalRev);
            setMyIncome(totalRev - totalCost - deliveryCharges);

            // Withdraw processing
            const userWithdraws = withdrawRes.data.filter(w => w.email === email);
            const approvedWithdraws = userWithdraws.filter(w => w.status === 'Approved');
            const totalWd = approvedWithdraws.reduce((acc, w) => acc + (w.amount || 0), 0);
            setTotalWithdraw(totalWd);
            const latest10 = approvedWithdraws
                .sort((a, b) => new Date(b.approval_date) - new Date(a.approval_date))
                .slice(0, 10);
            setWithdrawData(latest10);

            // Refer withdraw total
            const referData = referWithdrawRes.data.filter(i =>
                i.email === email && (i.status === 'Approved' || i.status === 'Pending')
            );
            const referBalance = referData.reduce((acc, i) => acc + (i.amount || 0), 0);
            setTotalRefferIncome(referBalance + referIncome);

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                text: "ডেটা লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
            });
        } finally {
            setLoading(false);
        }
    };

    // File select handler
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Update store image - main function
    const confirmUpdate = async () => {
        if (!updateStoreEmail.trim()) {
            Swal.fire({
                icon: "error",
                text: "ইমেইল দিন",
            });
            return;
        }
        if (!selectedFile) {
            Swal.fire({
                icon: "error",
                text: "ইমেজ সিলেক্ট করুন",
            });
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            // 1. Upload to ImgBB
            const imgbbResponse = await axios.post(
                `https://api.imgbb.com/1/upload?key=${imgbb_api_key}`,
                formData
            );

            const imageUrl = imgbbResponse.data.data.url;

            // 2. Update user in backend
            const response = await axios.patch(`${base_url}/update-store-image`, {
                email: updateStoreEmail,
                shopImage: imageUrl
            });

            if (response.data.modifiedCount > 0 || response.data.matchedCount > 0) {
                setUpdateError("স্টোর ইমেজ সফলভাবে আপডেট হয়েছে!");
                setShowStoreUpdateModal(false);
                setSelectedFile(null);
                setUpdateStoreEmail('');

                // Refresh current user data if same user is being viewed
                if (data?.email === updateStoreEmail) {
                    setData(prev => ({
                        ...prev,
                        storeInfo: { ...prev.storeInfo, shopImage: imageUrl }
                    }));
                }
            } else {
                setUpdateError("ইউজার পাওয়া যায়নি বা কোনো পরিবর্তন হয়নি");
            }
        } catch (err) {
            console.error(err);
            setUpdateError("আপডেট করতে সমস্যা হয়েছে");
        } finally {
            setUploading(false);
        }
    };

    // handle update store---->
    const handleUpdateStore = () => {
        setShowStoreUpdateModal(true);
        setUpdateStoreEmail('');
        setSelectedFile(null);
    };

    // check loading--->
    if (loading) {
        return <Loader11 />;
    }
    // final output return---->
    return (
        <div className="w-full relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="p-6 rounded-xl shadow-sm bg-white mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">ব্যবহারকারী ড্যাশবোর্ড</h1>
                        <p className="text-gray-600 mt-1">এখানে আপনি ব্যবহারকারীদের ড্যাশবোর্ড দেখতে পারবেন।</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full sm:w-64 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-gray-700 placeholder-gray-400"
                            placeholder="ইমেইল দিয়ে অনুসন্ধান করুন"
                            type="email"
                        />
                        <button
                            onClick={handelGetUser}
                            className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-medium"
                        >
                            অনুসন্ধান
                        </button>
                    </div>
                </div>
            </div>

            {/* Update Store Image Button */}
            <div
                onClick={handleUpdateStore}
                className="border border-orange-400 rounded-lg p-2 px-4 hover:bg-orange-50 font-semibold w-fit cursor-pointer transition-all mb-6">
                + Update User Store Image
            </div>

            {/* Store Update Modal */}
            {showStoreUpdateModal && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="p-6 rounded-lg bg-white shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold text-orange-600 mb-4">Update Store Image</h2>
                        {
                            updateError && <h1 className="text-red-600 p-2 px-4 border border-red-500 rounded-lg">{updateError}</h1>
                        }
                        <div className="space-y-4">
                            <input
                                type="email"
                                value={updateStoreEmail}
                                onChange={(e) => setUpdateStoreEmail(e.target.value)}
                                placeholder="User Email"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full p-3 border border-orange-400 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                            />

                            {selectedFile && (
                                <p className="text-sm text-green-600">Selected: {selectedFile.name}</p>
                            )}

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    onClick={() => {
                                        setShowStoreUpdateModal(false);
                                        setSelectedFile(null);
                                        setUpdateStoreEmail('');
                                    }}
                                    disabled={uploading}
                                    className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmUpdate}
                                    disabled={uploading}
                                    className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Store Image"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rest of your dashboard (unchanged) */}
            {data?.email && (
                <div className="space-y-6">
                    {/* Password Section */}
                    <div className="p-6 rounded-xl bg-orange-50 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-gray-700">
                            {showpass ? (
                                <span className="font-medium">{password.split("yk69d")[1]}</span>
                            ) : (
                                <span className="text-gray-500 italic">সংবেদনশীল তথ্য গোপন</span>
                            )}
                        </div>
                        <button
                            onClick={() => setShowPass(true)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-sm font-medium"
                        >
                            পাসওয়ার্ড দেখুন
                        </button>
                    </div>

                    {/* User & Store Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">ব্যবহারকারীর তথ্য</h2>
                            <div className="space-y-2 text-gray-600">
                                <p><span className="font-medium">নাম:</span> {data.name}</p>
                                <p><span className="font-medium">ইমেইল:</span> {data.email}</p>
                                <p><span className="font-medium">ফোন:</span> {data.phone}</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">স্টোর তথ্য</h2>
                            <div className="flex gap-4 items-center">
                                <img
                                    className="object-cover h-16 w-16 rounded-full border-2 border-gray-100"
                                    src={data.storeInfo?.shopImage || "/placeholder-store.jpg"}
                                    alt={data.storeInfo?.shopName}
                                />
                                <div className="space-y-2 text-gray-600">
                                    <p><span className="font-medium">স্টোর নাম:</span> {data.storeInfo?.shopName}</p>
                                    <p><span className="font-medium">স্টোর যোগাযোগ:</span> {data.storeInfo?.shopContact}</p>
                                    <p><span className="font-medium">স্টোর ঠিকানা:</span> {data.storeInfo?.shopAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { title: "মোট পণ্য", value: totalOrders, color: "from-green-50 to-green-200" },
                            { title: "মোট বিক্রয়", value: totalRevenue, color: "from-blue-50 to-orange-200" },
                            { title: "মোট আয়", value: myIncome + totalRefferIncome, color: "from-purple-50 to-purple-200" },
                            { title: "মোট উইথড্র", value: totalWithdraw, color: "from-teal-50 to-teal-200" },
                        ].map((stat, index) => (
                            <div key={index} className={`p-6 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm border border-gray-100`}>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">{stat.title}</h2>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 p-6">পণ্যের তালিকা</h1>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">পণ্যের নাম</TableHead>
                                        <TableHead className="font-semibold text-gray-700">ক্রয় মূল্য</TableHead>
                                        <TableHead className="font-semibold text-gray-700">পরিমাণ</TableHead>
                                        <TableHead className="font-semibold text-gray-700">সাবটোটাল</TableHead>
                                        <TableHead className="font-semibold text-gray-700">বিক্রয় মূল্য</TableHead>
                                        <TableHead className="font-semibold text-gray-700">লাভ</TableHead>
                                        <TableHead className="font-semibold text-gray-700">স্ট্যাটাস</TableHead>
                                        <TableHead className="font-semibold text-gray-700">অর্ডার তারিখ</TableHead>
                                        <TableHead className="font-semibold text-gray-700">পেমেন্ট</TableHead>
                                        <TableHead className="font-semibold text-gray-700">পেমেন্ট নাম্বার</TableHead>
                                        <TableHead className="font-semibold text-gray-700">পেমেন্ট ট্রাঞ্জেকশান</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ordersData.length > 0 ? (
                                        ordersData?.map((product, idx) => (
                                            <TableRow key={idx} className="hover:bg-gray-50">
                                                <TableCell className="font-medium text-gray-700">{product?.items[0]?.name}</TableCell>
                                                <TableCell>{product?.items_total}</TableCell>
                                                <TableCell>{product?.items[0].quantity}</TableCell>
                                                <TableCell>{product?.items_total * product?.items[0].quantity}</TableCell>
                                                <TableCell>{product?.amar_bikri_mullo - product?.delivery_charge}</TableCell>
                                                <TableCell>{product?.amar_bikri_mullo - (product?.delivery_charge + product.items_total)}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product?.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {product?.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{new Date(product?.order_date).toLocaleDateString('bn-BD')}</TableCell>
                                                <TableCell>{product?.payment_method}</TableCell>
                                                <TableCell>{product?.payment_number}</TableCell>
                                                <TableCell>{product?.tnx_id}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                                                কোনো ইম্পোর্ট করা পণ্য পাওয়া যায়নি।
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Latest Withdraws */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">লেটেস্ট উইথড্র</h2>
                        {withdrawData.length > 0 ? (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {withdrawData.map(withdraw => (
                                    <div key={withdraw._id?.$oid} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                                        <p className="text-gray-600"><span className="font-medium">মোট:</span> {withdraw.amount}</p>
                                        <p className="text-gray-600"><span className="font-medium">পেমেন্ট:</span> {withdraw.paymentMethod}</p>
                                        <p className="text-gray-600"><span className="font-medium">স্ট্যাটাস:</span>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${withdraw.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {withdraw.status}
                                            </span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">কোনো উইথড্র নেই।</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeeUser;