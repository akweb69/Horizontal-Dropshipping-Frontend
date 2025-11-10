import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageGift = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    const imgbb_api_key = import.meta.env.VITE_IMGBB_API_KEY;

    const [gifts, setGifts] = useState([]);
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState(0);
    const [underReview, setUnderReview] = useState([]);
    const [selectedGift, setSelectedGift] = useState(null); // Modal

    // Fetch all gifts
    const fetchGifts = async () => {
        try {
            const res = await axios.get(`${base_url}/manage_gift`);
            setGifts(res.data);
            setUnderReview(res.data.filter(item => item.status === "review"));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchGifts();
    }, []);

    // Upload image
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        const res = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbb_api_key}`, formData);
        return res.data.data.url;
    };

    // Add new gift
    const handleAddGift = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = image ? await uploadImage(image) : "";
            const giftData = { email, description, image: imageUrl, status: "pending", category, amount };
            await axios.post(`${base_url}/manage_gift`, giftData);
            setEmail(""); setDescription(""); setImage(null); setCategory(""); setAmount(0);
            fetchGifts();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Update gift status
    const handleUpdateStatus = async (id, status) => {
        try {
            await axios.patch(`${base_url}/manage_gift_by_user/${id}`, { status });
            fetchGifts();
        } catch (err) {
            console.error(err);
        }
    };

    // Delete gift
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${base_url}/manage_gift/${id}`);
            fetchGifts();
        } catch (err) {
            console.error(err);
        }
    };

    // Open/Close modal
    const handleOpenDetails = (gift) => setSelectedGift(gift);
    const handleCloseDetails = () => setSelectedGift(null);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold text-orange-600 mb-6">Manage Gifts</h2>

            <div className="md:grid grid-cols-2 gap-6 items-start">

                {/* Left: Add Gift */}
                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-orange-500">Send Gift</h2>
                    <form onSubmit={handleAddGift} className="space-y-4">
                        <input type="email" placeholder="User Email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="border p-3 w-full rounded-md" required />
                        <input type="file" onChange={(e) => setImage(e.target.files[0])}
                            className="border p-3 w-full rounded-md" accept="image/*" />
                        <textarea rows={4} placeholder="Gift Description" value={description} onChange={(e) => setDescription(e.target.value)}
                            className="border p-3 w-full rounded-md" required />
                        <select onChange={(e) => setCategory(e.target.value)} className="w-full p-3 rounded-md border" required>
                            <option value="">Select Gift Category</option>
                            <option value="card">Item Gift</option>
                            <option value="money">Money Gift</option>
                        </select>
                        {category === "money" && (
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount" className="border p-3 w-full rounded-md" />
                        )}
                        <button type="submit" disabled={loading}
                            className="w-full py-3 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold transition">
                            {loading ? "Adding..." : "Add Gift"}
                        </button>
                    </form>

                    {/* Gifts List */}
                    <div className="mt-6 space-y-4">
                        {gifts.map(gift => (
                            <div key={gift._id.$oid || gift._id} className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md flex justify-between items-center shadow-sm hover:shadow-md transition">
                                <div>
                                    <h3 className="font-semibold text-orange-600">{gift.email}</h3>
                                    <p className="text-gray-700">{gift.description}</p>
                                    <span className={`text-sm font-medium ${gift.status === 'pending' ? 'text-orange-500' : gift.status === 'review' ? 'text-yellow-500' : 'text-green-600'}`}>Status: {gift.status}</span>
                                </div>
                                <button onClick={() => handleDelete(gift._id.$oid || gift._id)}
                                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md">
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Under Review */}
                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-orange-500">Under Review Gifts - {underReview.length}</h2>
                    <div className="space-y-4">
                        {underReview.map(gift => (
                            <div key={gift._id.$oid || gift._id} className="bg-orange-50 p-4 rounded-md flex justify-between items-center shadow-sm hover:shadow-md transition">
                                <div>
                                    <h3 className="font-semibold text-orange-600">{gift.email}</h3>
                                    <p className="text-gray-700">{gift.description}</p>
                                    <span className="text-yellow-500 font-medium">Status: {gift.status}</span>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <button onClick={() => handleUpdateStatus(gift._id.$oid || gift._id, "accepted")}
                                        className={`px-3 py-1 rounded-md text-white ${gift.status !== 'review' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                                        disabled={gift.status !== 'review'}>
                                        Accept
                                    </button>
                                    <button onClick={() => handleUpdateStatus(gift._id.$oid || gift._id, "cancel")}
                                        className={`px-3 py-1 rounded-md text-white ${gift.status !== 'review' ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                                        disabled={gift.status !== 'review'}>
                                        Cancel
                                    </button>
                                    <button onClick={() => handleOpenDetails(gift)}
                                        className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white">
                                        See Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Modal */}
            {selectedGift && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-11/12 md:w-1/2 relative shadow-lg">
                        <button onClick={handleCloseDetails}
                            className="absolute top-3 right-3 text-red-500 font-bold text-2xl">&times;</button>
                        <h2 className="text-2xl font-bold text-orange-600 mb-4">Gift Details</h2>
                        {selectedGift.image && <img src={selectedGift.image} className="w-full h-64 object-cover rounded-md mb-4" />}
                        <p><strong>Email:</strong> {selectedGift.email}</p>
                        <p><strong>Description:</strong> {selectedGift.description}</p>
                        <p><strong>Category:</strong> {selectedGift.category}</p>
                        {selectedGift.category === "money" && <p><strong>Amount:</strong> {selectedGift.amount}</p>}
                        <p><strong>Status:</strong> {selectedGift.status}</p>

                        {selectedGift.paymentInfo && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2 text-orange-500">Payment Info</h3>
                                {selectedGift.category === "money" ? (
                                    <>
                                        <p><strong>Name:</strong> {selectedGift.paymentInfo.name}</p>
                                        <p><strong>Method:</strong> {selectedGift.paymentInfo.method}</p>
                                        <p><strong>Number:</strong> {selectedGift.paymentInfo.number}</p>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Name:</strong> {selectedGift.paymentInfo.name}</p>
                                        <p><strong>Address:</strong> {selectedGift.paymentInfo.address}</p>
                                        <p><strong>Phone:</strong> {selectedGift.paymentInfo.phone}</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageGift;
