import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Loader11 from '../components/layout/Loader11';

const CollectGift = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    const [loading, setLoading] = React.useState(true);
    const { user } = useAuth();
    const [gift, setGift] = React.useState([]);
    const [openClimeForm, setOpenClimeForm] = React.useState(false);
    const [selectedGift, setSelectedGift] = React.useState({});
    const [paymentInfo, setPaymentInfo] = React.useState({
        method: '',
        number: '',
        name: '',
        address: '',
        phone: ''
    });
    const [accepted, setAccepted] = useState([]);

    // Load user gifts
    useEffect(() => {
        const email = user?.email;
        axios.get(`${base_url}/manage_gift`)
            .then(res => {
                const data = res.data;
                const userGifts = data.filter(item => item.email === email);
                setGift(userGifts);
                setAccepted(userGifts.filter(item => item.status === 'accepted'));
            })
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, [user?.email]);

    // Open claim form
    const handleOpenForm = (id) => {
        setOpenClimeForm(true);
        setSelectedGift(gift.find(item => item._id === id));
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo(prev => ({ ...prev, [name]: value }));
    };

    // Handle claim submission
    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`${base_url}/manage_gift_by_user/${selectedGift._id}`, {
                status: 'review',
                paymentInfo: paymentInfo
            });
            alert('Gift claimed successfully! Status is now under review.');
            setOpenClimeForm(false);
            const updatedGifts = gift.map(item =>
                item._id === selectedGift._id ? { ...item, status: 'review', paymentInfo } : item
            );
            setGift(updatedGifts);
        } catch (error) {
            console.log(error);
            alert('Something went wrong. Please try again.');
        }
    };

    if (loading) return <Loader11 />;

    return (
        <div className='w-full min-h-screen p-6 bg-gray-50'>
            <h2 className="text-3xl font-bold mb-6 text-orange-600">My Gifts</h2>

            <div className="grid md:grid-cols-2 gap-6">
                {gift?.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white border border-orange-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center p-4"
                    >
                        <img className="w-full  h-full object-cover rounded-lg mb-4" src={item.image} alt={item.name || 'Gift'} />
                        <h5 className="text-xl font-semibold text-gray-800 mb-2">{item.name || "Gift"}</h5>
                        <p className="text-sm text-gray-600 text-center mb-4 whitespace-pre-line">{item.description}</p>

                        {/* Claim button only active if status is pending */}
                        {item.status === "pending" ? (
                            <button
                                onClick={() => handleOpenForm(item._id)}
                                className="px-6 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold transition duration-200"
                            >
                                ক্লেইম করুন
                            </button>
                        ) : (
                            <div className={`px-6 py-2 rounded-md text-white font-semibold mt-2
                                ${item.status === "review" ? "bg-yellow-500" : "bg-green-500"}`}>
                                {item.status === "review" ? "Under Review" : "Claimed"}
                            </div>
                        )}

                        <span className="mt-3 text-sm text-gray-500">Status: <span className={`font-medium ${item.status === 'pending' ? 'text-orange-500' : item.status === 'review' ? 'text-yellow-500' : 'text-green-600'}`}>{item.status}</span></span>
                    </div>
                ))}
            </div>

            {/* Claim Modal */}
            {openClimeForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-start pt-20 z-50">
                    <div className="w-11/12 md:w-1/2 bg-white rounded-2xl shadow-xl p-6 relative">
                        <button
                            onClick={() => setOpenClimeForm(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-orange-500 text-2xl font-bold"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-orange-600">Your Gift Details</h2>

                        {selectedGift.category === "money" && (
                            <form onSubmit={handleClaimSubmit} className="space-y-4">
                                <p className="font-medium">Gift Category: Cash Gift</p>
                                <p>Amount: <span className="font-semibold">{selectedGift.amount}</span></p>

                                <h3 className="font-semibold mt-4">Enter Your Payment Info</h3>
                                <select
                                    name="method"
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded-md"
                                    required
                                >
                                    <option value="">Select Payment Method</option>
                                    <option value="Bkash">Bkash</option>
                                    <option value="Nagad">Nagad</option>
                                </select>
                                <input
                                    type="text"
                                    name="number"
                                    placeholder='Enter Your Payment Number'
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded-md"
                                    required
                                />
                                <input
                                    type="number"
                                    value={selectedGift.amount}
                                    readOnly
                                    className="w-full border p-2 rounded-md bg-gray-100"
                                />

                                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md transition duration-200">
                                    ক্লেইম করুন
                                </button>
                            </form>
                        )}

                        {selectedGift.category === "card" && (
                            <form onSubmit={handleClaimSubmit} className="space-y-4">
                                <p className="font-medium">Gift Category: Item Gift</p>

                                <h3 className="font-semibold mt-4">Enter Your Delivery Info</h3>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder='Enter Your Name'
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded-md"
                                    required
                                />
                                <input
                                    type="text"
                                    name="address"
                                    placeholder='Enter Your Address'
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded-md"
                                    required
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder='Enter Your Phone Number'
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded-md"
                                    required
                                />

                                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md transition duration-200">
                                    ক্লেইম করুন
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollectGift;
