import { useAuth } from '@/context/AuthContext';
import { Loader, Trash2, Minus, Plus, ShoppingBag, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

const CartPage = () => {
    const { loading, cartData, fetchCart } = useAuth(); // Assumes fetchCart is available in AuthContext to refresh cart
    const [quantities, setQuantities] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [paymentNumber, setPaymentNumber] = useState('');
    const [tnxId, setTnxId] = useState('');
    const merchantNumber = '01768037870';

    useEffect(() => {
        if (cartData) {
            const initialQuantities = {};
            cartData.forEach((item) => {
                initialQuantities[item._id] = item.quantity || 1;
            });
            setQuantities(initialQuantities);
        }
    }, [cartData]);

    const handleIncrement = async (id) => {
        const item = cartData.find((i) => i._id === id);
        const current = quantities[id] || 1;
        if (current >= parseInt(item.stock)) {
            toast({
                title: "স্টক সীমা",
                description: "এই পণ্যের জন্য আরও স্টক উপলব্ধ নেই।",
                variant: "destructive",
            });
            return;
        }

        try {
            const newQuantity = current + 1;
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/cart/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQuantity }),
            });
            if (res.ok) {
                setQuantities((prev) => ({ ...prev, [id]: newQuantity }));
                if (fetchCart) fetchCart(); // Refresh cart data
                toast({
                    title: "সফল",
                    description: "পণ্যের পরিমাণ আপডেট করা হয়েছে।",
                });
            } else {
                throw new Error("Failed to update quantity");
            }
        } catch (e) {
            console.error(e);
            toast({
                title: "ত্রুটি",
                description: "পরিমাণ আপডেট করতে ব্যর্থ হয়েছে।",
                variant: "destructive",
            });
        }
    };

    const handleDecrement = async (id) => {
        const current = quantities[id] || 1;
        if (current <= 1) {
            toast({
                title: "সীমা",
                description: "পরিমাণ ১-এর কম হতে পারে না।",
                variant: "destructive",
            });
            return;
        }

        try {
            const newQuantity = current - 1;
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/cart/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQuantity }),
            });
            if (res.ok) {
                setQuantities((prev) => ({ ...prev, [id]: newQuantity }));
                if (fetchCart) fetchCart(); // Refresh cart data
                toast({
                    title: "সফল",
                    description: "পণ্যের পরিমাণ আপডেট করা হয়েছে।",
                });
            } else {
                throw new Error("Failed to update quantity");
            }
        } catch (e) {
            console.error(e);
            toast({
                title: "ত্রুটি",
                description: "পরিমাণ আপডেট করতে ব্যর্থ হয়েছে।",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/cart/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                if (fetchCart) fetchCart();
                toast({
                    title: "সফল",
                    description: "পণ্য কার্ট থেকে মুছে ফেলা হয়েছে।",
                });
            } else {
                throw new Error("Failed to delete item");
            }
        } catch (e) {
            console.error(e);
            toast({
                title: "ত্রুটি",
                description: "কার্ট থেকে পণ্য মুছতে ব্যর্থ হয়েছে।",
                variant: "destructive",
            });
        }
    };

    const calculateTotal = (items) => {
        if (!items) return 0;
        if (Array.isArray(items)) {
            return items
                .reduce((sum, item) => sum + quantities[item._id] * parseFloat(item.price), 0)
                .toFixed(2);
        }
        return (quantities[items._id] * parseFloat(items.price)).toFixed(2);
    };

    const openModal = (items) => {
        setSelectedItems(items);
        setIsModalOpen(true);
        setPaymentNumber('');
        setTnxId('');
        setPaymentMethod('bkash');
    };

    const handleBuyNow = (id) => {
        const item = cartData.find((i) => i._id === id);
        openModal(item);
    };

    const handleCheckout = () => {
        openModal(cartData);
    };

    const handlePlaceOrder = async () => {
        let orderData;
        const totalAmount = calculateTotal(selectedItems);
        const orderDate = new Date().toISOString();
        const email = selectedItems?.email || cartData[0]?.email || 'user@email.com';

        if (Array.isArray(selectedItems)) {
            orderData = {
                items: selectedItems.map((item) => ({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: quantities[item._id],
                    subtotal: quantities[item._id] * parseFloat(item.price),
                })),
                total: totalAmount,
                status: 'pending',
                payment_method: paymentMethod,
                payment_number: paymentNumber,
                tnx_id: tnxId,
                amount: totalAmount,
                order_date: orderDate,
                email: email,
            };
        } else {
            orderData = {
                productId: selectedItems._id,
                name: selectedItems.name,
                price: selectedItems.price,
                quantity: quantities[selectedItems._id],
                total: totalAmount,
                status: 'pending',
                payment_method: paymentMethod,
                payment_number: paymentNumber,
                tnx_id: tnxId,
                amount: totalAmount,
                order_date: orderDate,
                email: email,
            };
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            if (res.ok) {
                toast({
                    title: "সফল",
                    description: "অর্ডার সফলভাবে প্লেস করা হয়েছে! স্ট্যাটাস: পেন্ডিং",
                });
                setIsModalOpen(false);
                if (Array.isArray(selectedItems)) {
                    for (const item of selectedItems) {
                        await handleDelete(item._id);
                    }
                } else {
                    await handleDelete(selectedItems._id);
                }
            } else {
                throw new Error("Failed to place order");
            }
        } catch (e) {
            console.error(e);
            toast({
                title: "ত্রুটি",
                description: "অর্ডার প্লেস করতে ব্যর্থ হয়েছে।",
                variant: "destructive",
            });
        }
    };

    const copyMerchantNumber = () => {
        navigator.clipboard.writeText(merchantNumber);
        toast({
            title: "সফল",
            description: "নম্বর কপি করা হয়েছে!",
        });
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!cartData || cartData.length === 0) {
        return (
            <div className="w-full max-w-7xl mx-auto py-8 px-4 min-h-[90vh]">
                <h1 className="text-2xl md:text-3xl font-bold text-center text-primary pb-4">
                    আপনার কার্ট
                </h1>
                <p className="text-center text-gray-500 text-base md:text-lg">Your cart is empty.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[90vh]">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-primary pb-6 border-b border-gray-200">
                আপনার কার্ট
            </h1>
            <div className="mt-6 space-y-4">
                {cartData?.map((item) => (
                    <div
                        key={item?._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border border-gray-200 rounded-lg shadow-sm bg-white"
                    >
                        <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
                            <img
                                src={item?.thumbnail}
                                alt={item?.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover"
                            />
                            <div className="ml-4 flex-1">
                                <h2 className="font-semibold text-lg sm:text-xl text-gray-800">
                                    {item?.name}
                                </h2>
                                <p className="text-gray-600 text-sm sm:text-base mt-1">${item?.price}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
                            <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                    onClick={() => handleDecrement(item._id)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="px-3 py-2 text-center min-w-[40px] bg-gray-50 text-sm">
                                    {quantities[item._id] || 1}
                                </span>
                                <button
                                    onClick={() => handleIncrement(item._id)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <p className="text-base sm:text-lg font-bold text-gray-800">
                                ${(quantities[item._id] * parseFloat(item.price)).toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <button
                                    onClick={() => handleBuyNow(item._id)}
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center gap-1 sm:gap-2 text-sm sm:text-base transition-colors"
                                >
                                    <ShoppingBag size={16} /> Buy
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 p-4 sm:p-6 bg-gray-50 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Total: ${calculateTotal(cartData)}
                </h2>
                <button
                    onClick={handleCheckout}
                    className="px-6 py-2 sm:px-8 sm:py-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base transition-colors"
                >
                    Checkout All
                </button>
            </div>

            {/* Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-md mx-4 shadow-2xl">
                        <h2 className="text-2xl font-bold text-center text-primary mb-4">
                            Checkout Payment
                        </h2>
                        <p className="text-center text-gray-600 mb-6">
                            Complete your payment using bKash or Nagad
                        </p>

                        {/* Payment Method Selection */}
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={() => setPaymentMethod('bkash')}
                                className={`px-4 py-2 rounded-l-md ${paymentMethod === 'bkash' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'} transition-colors`}
                            >
                                bKash
                            </button>
                            <button
                                onClick={() => setPaymentMethod('nagad')}
                                className={`px-4 py-2 rounded-r-md ${paymentMethod === 'nagad' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'} transition-colors`}
                            >
                                Nagad
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Payment Instructions
                            </h3>
                            <p className="text-gray-600 mb-2">আপনাকে টাকা পাঠাতে হবে।</p>
                            <p className="text-gray-600 mb-2">Send money to: {merchantNumber}</p>
                            <button
                                onClick={copyMerchantNumber}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                            >
                                <Copy size={16} /> Copy Number
                            </button>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Number
                                </label>
                                <input
                                    type="text"
                                    value={paymentNumber}
                                    onChange={(e) => setPaymentNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter your number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Transaction ID (TxID)
                                </label>
                                <input
                                    type="text"
                                    value={tnxId}
                                    onChange={(e) => setTnxId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter TxID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount
                                </label>
                                <input
                                    type="text"
                                    value={`$${calculateTotal(selectedItems)}`}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={!paymentNumber || !tnxId}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;