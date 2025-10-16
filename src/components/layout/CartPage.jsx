import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader, Trash2, Minus, Plus, ShoppingBag, Copy, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const { loading, cartData, fetchCart, setCartData, user } = useAuth();
    const [quantities, setQuantities] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('bKash');
    const [paymentNumber, setPaymentNumber] = useState('');
    const [tnxId, setTnxId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [isPaymentInfoLoading, setIsPaymentInfoLoading] = useState(true);

    // Fetch payment info on component mount
    useEffect(() => {
        fetchPaymentInfo();
    }, []);

    const fetchPaymentInfo = async () => {
        setIsPaymentInfoLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/payment-number`);
            if (response.data && response.data.length > 0) {
                setPaymentInfo(response.data[0]);
            }
        } catch (error) {
            console.error('Payment info fetch error:', error);
            toast({
                title: "❌ ত্রুটি",
                description: "পেমেন্ট তথ্য লোড করতে সমস্যা হয়েছে",
                variant: "destructive"
            });
        } finally {
            setIsPaymentInfoLoading(false);
        }
    };

    useEffect(() => {
        if (cartData && cartData.length > 0) {
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

        if (!item || current >= parseInt(item.stock || 0)) {
            toast({
                title: "❌ স্টক সীমা",
                description: "এই পণ্যের জন্য আরও স্টক উপলব্ধ নেই।",
                variant: "destructive",
            });
            return;
        }

        try {
            const newQuantity = current + 1;
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/cart/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth header if needed
                },
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (res.ok) {
                setQuantities((prev) => ({ ...prev, [id]: newQuantity }));
                if (fetchCart) await fetchCart();
                toast({
                    title: "✅ সফল",
                    description: "পণ্যের পরিমাণ আপডেট করা হয়েছে।",
                });
            } else {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to update quantity");
            }
        } catch (e) {
            console.error(e);
            toast({
                title: "❌ ত্রুটি",
                description: "পরিমাণ আপডেট করতে ব্যর্থ হয়েছে।",
                variant: "destructive",
            });
        }
    };

    const handleDecrement = async (id) => {
        const current = quantities[id] || 1;
        if (current <= 1) {
            toast({
                title: "❌ সীমা",
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
                if (fetchCart) await fetchCart();
                toast({
                    title: "✅ সফল",
                    description: "পণ্যের পরিমাণ আপডেট করা হয়েছে।",
                });
            } else {
                throw new Error("Failed to update quantity");
            }
        } catch (e) {
            console.error(e);
            toast({
                title: "❌ ত্রুটি",
                description: "পরিমাণ আপডেট করতে ব্যর্থ হয়েছে।",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('আপনি কি এই পণ্যটি কার্ট থেকে মুছে ফেলতে চান?')) {
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/cart/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                if (fetchCart) await fetchCart();
                toast({
                    title: "✅ সফল",
                    description: "পণ্য কার্ট থেকে মুছে ফেলা হয়েছে।",
                });
            } else {
                throw new Error("Failed to delete item");
            }
        } catch (e) {
            console.error(e);
            toast({
                title: "❌ ত্রুটি",
                description: "কার্ট থেকে পণ্য মুছতে ব্যর্থ হয়েছে।",
                variant: "destructive",
            });
        }
    };

    const calculateTotal = (items) => {
        if (!items || !Array.isArray(items)) return 0;
        return items
            .reduce((sum, item) => {
                const qty = quantities[item._id] || 1;
                return sum + (qty * parseFloat(item.price || 0));
            }, 0)
            .toFixed(2);
    };

    const openModal = (items) => {
        if (!paymentInfo) {
            toast({
                title: "❌ ত্রুটি",
                description: "পেমেন্ট তথ্য লোড হয়নি। পুনরায় চেষ্টা করুন।",
                variant: "destructive"
            });
            return;
        }

        setSelectedItems(items);
        setPaymentMethod('bKash');
        setPaymentNumber('');
        setTnxId('');
        setIsModalOpen(true);
    };

    const handleBuyNow = (id) => {
        const item = cartData.find((i) => i._id === id);
        if (item) {
            openModal([item]);
        }
    };

    const handleCheckout = () => {
        if (cartData && cartData.length > 0) {
            openModal(cartData);
        }
    };

    const copyPaymentNumber = () => {
        if (!paymentInfo || !paymentMethod) {
            toast({
                title: "❌ ত্রুটি",
                description: "পেমেন্ট তথ্য উপলব্ধ নেই",
                variant: "destructive"
            });
            return;
        }

        const numberToCopy = paymentMethod === 'bKash'
            ? paymentInfo.bkashNumber
            : paymentInfo.nagadNumber;

        navigator.clipboard.writeText(numberToCopy).then(() => {
            toast({
                title: "✅ নাম্বার কপি হয়েছে!",
                description: `${paymentMethod}: ${numberToCopy}`,
            });
        }).catch(() => {
            toast({
                title: "❌ কপি ব্যর্থ",
                description: "ম্যানুয়ালি কপি করুন",
                variant: "destructive"
            });
        });
    };

    const handlePlaceOrder = async () => {
        // Validation
        if (!paymentMethod || !paymentNumber || !tnxId) {
            toast({
                title: "❌ ত্রুটি",
                description: "সকল ফিল্ড পূরণ করুন",
                variant: "destructive"
            });
            return;
        }

        if (tnxId.length < 8) {
            toast({
                title: "❌ ত্রুটি",
                description: "ট্রানজেকশন আইডি সঠিক নয়",
                variant: "destructive"
            });
            return;
        }

        const totalAmount = calculateTotal(selectedItems);
        const orderDate = new Date().toISOString();
        const email = user?.email || selectedItems[0]?.email;

        let orderData;
        if (Array.isArray(selectedItems)) {
            orderData = {
                items: selectedItems.map((item) => ({
                    productId: item._id,
                    name: item.name,
                    price: parseFloat(item.price),
                    quantity: quantities[item._id] || 1,
                    subtotal: (quantities[item._id] || 1) * parseFloat(item.price),
                })),
                total: parseFloat(totalAmount),
                status: 'pending',
                payment_method: paymentMethod,
                payment_number: paymentNumber,
                tnx_id: tnxId,
                amount: parseFloat(totalAmount),
                order_date: orderDate,
                email: email,
            };
        } else {
            orderData = {
                productId: selectedItems._id,
                name: selectedItems.name,
                price: parseFloat(selectedItems.price),
                quantity: quantities[selectedItems._id] || 1,
                total: parseFloat(totalAmount),
                status: 'pending',
                payment_method: paymentMethod,
                payment_number: paymentNumber,
                tnx_id: tnxId,
                amount: parseFloat(totalAmount),
                order_date: orderDate,
                email: email,
            };
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth header if needed
                },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                toast({
                    title: "✅ অর্ডার সফল!",
                    description: "আপনার অর্ডার প্লেস করা হয়েছে। আমরা পেমেন্ট যাচাই করব।",
                });

                // Clear cart items
                if (Array.isArray(selectedItems)) {
                    for (const item of selectedItems) {
                        await handleDelete(item._id);
                    }
                } else {
                    await handleDelete(selectedItems._id);
                }

                setIsModalOpen(false);
                if (fetchCart) await fetchCart();
            } else {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to place order");
            }
        } catch (e) {
            console.error(e);
            toast({
                title: "❌ অর্ডার ব্যর্থ",
                description: e.message || "অর্ডার প্লেস করতে সমস্যা হয়েছে",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPaymentMethod('bKash');
        setPaymentNumber('');
        setTnxId('');
        setSelectedItems(null);
    };

    const getPaymentNumberForMethod = () => {
        if (!paymentInfo || !paymentMethod) return '';
        return paymentMethod === 'bKash'
            ? paymentInfo.bkashNumber
            : paymentInfo.nagadNumber;
    };

    if (loading || isPaymentInfoLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (!cartData || cartData.length === 0) {
        return (
            <div className="w-full max-w-7xl mx-auto py-8 px-4 min-h-[90vh]">
                <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 pb-4">
                    🛒 আপনার কার্ট
                </h1>
                <p className="text-center text-gray-500 text-lg">আপনার কার্ট খালি।</p>
                <div className="text-center mt-4">
                    <Button asChild>
                        <Link to="/">কেনাকাটা শুরু করুন</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const totalAmount = calculateTotal(cartData);

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[90vh]">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 border-b border-gray-200 pb-4">
                🛒 আপনার কার্ট
            </h1>

            <div className="space-y-6">
                {cartData.map((item) => {
                    const itemTotal = (quantities[item._id] || 1) * parseFloat(item.price || 0);
                    return (
                        <div
                            key={item._id}
                            className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center w-full lg:w-auto mb-4 lg:mb-0">
                                <img
                                    src={item.thumbnail || '/placeholder-image.jpg'}
                                    alt={item.name}
                                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover flex-shrink-0"
                                    loading="lazy"
                                />
                                <div className="ml-4 flex-1 min-w-0">
                                    <h2 className="font-semibold text-lg text-gray-800 truncate">
                                        {item.name}
                                    </h2>
                                    <p className="text-green-600 font-bold mt-1">
                                        ৳{parseFloat(item.price || 0).toFixed(2)}
                                    </p>
                                    {item.stock && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            স্টক: {item.stock} টি
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between w-full lg:w-auto gap-4 lg:gap-6">
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDecrement(item._id)}
                                        className="h-10 w-10 p-0"
                                        disabled={quantities[item._id] <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="px-4 py-2 text-center min-w-[50px] bg-gray-50 text-sm font-medium">
                                        {quantities[item._id] || 1}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleIncrement(item._id)}
                                        className="h-10 w-10 p-0"
                                        disabled={(quantities[item._id] || 1) >= (item.stock || 999)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <p className="text-lg font-bold text-gray-800 whitespace-nowrap">
                                    ৳{itemTotal.toFixed(2)}
                                </p>

                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => handleBuyNow(item._id)}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        কিনুন
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(item._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                        মোট: ৳{totalAmount}
                    </h2>
                    <Button
                        onClick={handleCheckout}
                        size="lg"
                        className="px-8 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                        disabled={cartData.length === 0}
                    >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        সকল কিনুন
                    </Button>
                </div>
            </div>

            {/* Payment Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">💳 পেমেন্ট সম্পন্ন করুন</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Payment Info */}
                        {paymentInfo ? (
                            <div className="bg-yellow-50 p-4 rounded-lg border">
                                <h3 className="font-semibold mb-2">আমাদের পেমেন্ট নাম্বার:</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-sm">বিকাশ:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm">{paymentInfo.bkashNumber}</span>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => navigator.clipboard.writeText(paymentInfo.bkashNumber)}
                                                className="h-6 w-6"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-sm">নগদ:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm">{paymentInfo.nagadNumber}</span>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => navigator.clipboard.writeText(paymentInfo.nagadNumber)}
                                                className="h-6 w-6"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    📱 "Send Money" ব্যবহার করে পেমেন্ট করুন
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-red-500">
                                পেমেন্ট তথ্য লোড হচ্ছে...
                            </div>
                        )}

                        {/* Order Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">অর্ডার সারাংশ</h3>
                            <p className="text-lg font-bold text-green-600">
                                মোট: ৳{calculateTotal(selectedItems)}
                            </p>
                            {Array.isArray(selectedItems) && selectedItems.length > 1 && (
                                <p className="text-sm text-gray-600">
                                    আইটেম: {selectedItems.length}টি
                                </p>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="grid gap-2">
                            <Label>পেমেন্ট পদ্ধতি</Label>
                            <div className="flex bg-white rounded-lg border p-1">
                                <Button
                                    variant={paymentMethod === 'bKash' ? 'default' : 'ghost'}
                                    className="flex-1 rounded-md"
                                    onClick={() => setPaymentMethod('bKash')}
                                >
                                    bKash
                                </Button>
                                <Button
                                    variant={paymentMethod === 'Nagad' ? 'default' : 'ghost'}
                                    className="flex-1 rounded-md"
                                    onClick={() => setPaymentMethod('Nagad')}
                                >
                                    Nagad
                                </Button>
                            </div>
                            {paymentMethod && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={copyPaymentNumber}
                                    disabled={!paymentInfo}
                                    className="w-full"
                                >
                                    📋 {getPaymentNumberForMethod().slice(0, 4)}**** কপি করুন
                                </Button>
                            )}
                        </div>

                        {/* Payment Details */}
                        <div className="grid gap-2">
                            <Label htmlFor="paymentNumber">আপনার মোবাইল নাম্বার</Label>
                            <Input
                                id="paymentNumber"
                                type="tel"
                                value={paymentNumber}
                                onChange={(e) => setPaymentNumber(e.target.value)}
                                placeholder="০১XXXXXXXXX"
                                className="text-sm"
                            />
                            <p className="text-xs text-gray-500">Send Money করার জন্য আপনার নাম্বার</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tnxId">ট্রানজেকশন আইডি</Label>
                            <Input
                                id="tnxId"
                                value={tnxId}
                                onChange={(e) => setTnxId(e.target.value)}
                                placeholder="১৬ অঙ্কের ট্রানজেকশন আইডি"
                                className="text-sm"
                            />
                            <p className="text-xs text-gray-500">Send Money করার পর পাওয়া TxID</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
                            বাতিল
                        </Button>
                        <Button
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting || !paymentNumber || !tnxId || !paymentInfo}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    প্রসেসিং...
                                </>
                            ) : (
                                'অর্ডার নিশ্চিত করুন'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CartPage;