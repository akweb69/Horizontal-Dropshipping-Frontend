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
    const { loading, cartData, setCartData, user, fetchCart } = useAuth();
    const [quantities, setQuantities] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('bKash');
    const [paymentNumber, setPaymentNumber] = useState('');
    const [tnxId, setTnxId] = useState('');
    const [amarBikriMullo, setAmarBikriMullo] = useState(''); // New state for Amar Bikri Mullo
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [isPaymentInfoLoading, setIsPaymentInfoLoading] = useState(true);
    const [deliveryName, setDeliveryName] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryPhone, setDeliveryPhone] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('inside');

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

        setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
    };

    const handleDecrement = async (id) => {
        setQuantities((prev) => ({ ...prev, [id]: Math.max((prev[id] || 1) - 1, 1) }));

    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/cart/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                axios.get(`${import.meta.env.VITE_BASE_URL}/cart`)
                    .then(res => {
                        setCartData(res.data.filter(item => item.email === user?.email));
                    })
                    .catch(err => {
                        console.log(err);
                    });

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

    const calculateItemsTotal = (items) => {
        if (!items || !Array.isArray(items)) return 0;
        return items
            .reduce((sum, item) => {
                const qty = quantities[item._id] || 1;
                return sum + (qty * parseFloat(item.price || 0));
            }, 0)
            .toFixed(2);
    };

    const getDeliveryCharge = () => {
        return deliveryLocation === 'inside' ? 80 : 150;
    };

    const calculateGrandTotal = (items) => {
        const itemsTotal = parseFloat(calculateItemsTotal(items));
        const delivery = getDeliveryCharge();
        return (itemsTotal + delivery).toFixed(2);
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
        setAmarBikriMullo(''); // Reset new field
        setDeliveryName(user?.displayName || '');
        setDeliveryPhone(user?.phone || '');
        setDeliveryAddress('');
        setDeliveryLocation('inside');
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
        if (!paymentMethod || !paymentNumber || !tnxId || !deliveryName || !deliveryAddress || !deliveryPhone || !deliveryLocation || !amarBikriMullo) {
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

        const itemsTotal = calculateItemsTotal(selectedItems);
        const deliveryCharge = getDeliveryCharge();
        const grandTotal = parseFloat(itemsTotal) + deliveryCharge;
        const orderDate = new Date().toISOString();
        const email = user?.email || selectedItems[0]?.email;

        const deliveryDetails = {
            name: deliveryName,
            address: deliveryAddress,
            phone: deliveryPhone,
            location: deliveryLocation === 'inside' ? 'Dhaka City' : 'Outside Dhaka'
        };

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
                items_total: parseFloat(itemsTotal),
                delivery_charge: deliveryCharge,
                grand_total: grandTotal,
                delivery_details: deliveryDetails,
                status: 'pending',
                payment_method: paymentMethod,
                payment_number: paymentNumber,
                tnx_id: tnxId,
                order_date: orderDate,
                email: email,
                amar_bikri_mullo: amarBikriMullo, // Add new field
            };
        } else {
            orderData = {
                productId: selectedItems._id,
                name: selectedItems.name,
                price: parseFloat(selectedItems.price),
                quantity: quantities[selectedItems._id] || 1,
                items_total: parseFloat(itemsTotal),
                delivery_charge: deliveryCharge,
                grand_total: grandTotal,
                delivery_details: deliveryDetails,
                status: 'pending',
                payment_method: paymentMethod,
                payment_number: paymentNumber,
                tnx_id: tnxId,
                order_date: orderDate,
                email: email,
                amar_bikri_mullo: amarBikriMullo, // Add new field
            };
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                toast({
                    title: "✅ অর্ডার সফল!",
                    description: "আপনার অর্ডার প্লেস করা হয়েছে। আমরা পেমেন্ট যাচাই করব।",
                });

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
        setAmarBikriMullo(''); // Reset new field
        setDeliveryName('');
        setDeliveryAddress('');
        setDeliveryPhone('');
        setDeliveryLocation('inside');
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

    const totalAmount = calculateItemsTotal(cartData);

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
                                    {/* {item.stock && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            স্টক: {item.stock} টি
                                        </p>
                                    )} */}
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg md:max-w-6xl w-full max-h-[95vh] overflow-y-scroll bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">💳 পেমেন্ট সম্পন্ন করুন</h2>
                                    <p className="text-green-100 text-sm opacity-90">নিরাপদ এবং দ্রুত পেমেন্ট</p>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(95vh-200px)]">
                        {/* Left Column: Payment Info and Order Summary */}
                        <div className="space-y-6">
                            {/* Payment Info Card */}
                            {paymentInfo ? (
                                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-green-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                                    <div className="flex items-center mb-4">
                                        <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                                            <ShoppingBag className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="ml-3 font-bold text-lg text-gray-800">আমাদের পেমেন্ট নাম্বার</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-l-4 border-blue-500">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-blue-800">🟢 bKash</span>
                                                <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                                                    <span className="font-mono text-sm font-bold text-gray-700 mr-2">
                                                        {paymentInfo.bkashNumber}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => navigator.clipboard.writeText(paymentInfo.bkashNumber)}
                                                        className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-l-4 border-orange-500">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-orange-800">🔴 Nagad</span>
                                                <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                                                    <span className="font-mono text-sm font-bold text-gray-700 mr-2">
                                                        {paymentInfo.nagadNumber}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => navigator.clipboard.writeText(paymentInfo.nagadNumber)}
                                                        className="h-8 w-8 p-0 bg-orange-600 hover:bg-orange-700 text-white"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                        <p className="text-sm text-yellow-800 flex items-center">
                                            📱 <span className="ml-2">"Send Money" ব্যবহার করে পেমেন্ট করুন এবং TxID সংরক্ষণ করুন</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Loader className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                                    <p className="text-gray-500 mt-2">পেমেন্ট তথ্য লোড হচ্ছে...</p>
                                </div>
                            )}

                            {/* Order Summary Card */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200 shadow-lg">
                                <div className="flex items-center mb-4">
                                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                                        <ShoppingBag className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="ml-3 font-bold text-lg text-gray-800">🛒 অর্ডার সারাংশ</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-700">
                                        <span>আইটেম মোট</span>
                                        <span>৳{calculateItemsTotal(selectedItems)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>ডেলিভারি চার্জ</span>
                                        <span>৳{getDeliveryCharge()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-emerald-600 border-t pt-2">
                                        <span>গ্র্যান্ড টোটাল</span>
                                        <span>৳{calculateGrandTotal(selectedItems)}</span>
                                    </div>
                                    {Array.isArray(selectedItems) && selectedItems.length > 1 && (
                                        <p className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full text-center">
                                            📦 {selectedItems.length}টি আইটেম
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Delivery Details, Payment Method, and Payment Details */}
                        <div className="space-y-6">
                            {/* Delivery Details Section */}
                            <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200 space-y-4">
                                <Label className="text-sm font-semibold text-gray-700 block">🚚 ডেলিভারি বিস্তারিত</Label>

                                <div>
                                    <Label htmlFor="deliveryName" className="text-sm font-medium text-gray-700 mb-1 block">পুরো নাম</Label>
                                    <Input
                                        id="deliveryName"
                                        value={deliveryName}
                                        onChange={(e) => setDeliveryName(e.target.value)}
                                        placeholder="আপনার পুরো নাম"
                                        className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="deliveryPhone" className="text-sm font-medium text-gray-700 mb-1 block">মোবাইল নাম্বার</Label>
                                    <Input
                                        id="deliveryPhone"
                                        type="tel"
                                        value={deliveryPhone}
                                        onChange={(e) => setDeliveryPhone(e.target.value)}
                                        placeholder="০১XXXXXXXXX"
                                        className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="deliveryAddress" className="text-sm font-medium text-gray-700 mb-1 block">ঠিকানা</Label>
                                    <Input
                                        id="deliveryAddress"
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        placeholder="আপনার বিস্তারিত ঠিকানা"
                                        className="border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="deliveryLocation" className="text-sm font-medium text-gray-700 mb-1 block">লোকেশন</Label>
                                    <select
                                        id="deliveryLocation"
                                        value={deliveryLocation}
                                        onChange={(e) => setDeliveryLocation(e.target.value)}
                                        className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="" disabled>লোকেশন নির্বাচন করুন</option>
                                        <option value="inside">ঢাকা সিটির ভিতরে (৮০ টাকা)</option>
                                        <option value="outside">ঢাকা সিটির বাইরে (১৫০ টাকা)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
                                <Label className="text-sm font-semibold text-gray-700 mb-3 block">💰 পেমেন্ট পদ্ধতি নির্বাচন করুন</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod('bKash')}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 ${paymentMethod === 'bKash'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                                            : 'bg-gray-50 hover:bg-blue-50 border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className={`w-3 h-3 rounded-full border-2 ${paymentMethod === 'bKash' ? 'bg-white border-white' : 'bg-transparent border-gray-400'
                                            }`}></div>
                                        <span className="font-semibold">bKash</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('Nagad')}
                                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 ${paymentMethod === 'Nagad'
                                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transform scale-105'
                                            : 'bg-gray-50 hover:bg-orange-50 border-gray-200 hover:border-orange-300'
                                            }`}
                                    >
                                        <div className={`w-3 h-3 rounded-full border-2 ${paymentMethod === 'Nagad' ? 'bg-white border-white' : 'bg-transparent border-gray-400'
                                            }`}></div>
                                        <span className="font-semibold">Nagad</span>
                                    </button>
                                </div>

                                {paymentMethod && paymentInfo && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={copyPaymentNumber}
                                        className="w-full mt-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-gray-300 text-gray-700 font-semibold"
                                    >
                                        📋 {getPaymentNumberForMethod().slice(0, 4)}**** কপি করুন
                                    </Button>
                                )}
                            </div>

                            {/* Payment Details Form */}
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                    <Label htmlFor="paymentNumber" className="text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                                        📞 আপনার মোবাইল নাম্বার
                                    </Label>
                                    <Input
                                        id="paymentNumber"
                                        type="tel"
                                        value={paymentNumber}
                                        onChange={(e) => setPaymentNumber(e.target.value)}
                                        placeholder="০১XXXXXXXXX"
                                        className="text-lg p-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Send Money করার জন্য আপনার নাম্বার দিন</p>
                                </div>

                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                    <Label htmlFor="tnxId" className="text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                                        🔑 ট্রানজেকশন আইডি
                                    </Label>
                                    <Input
                                        id="tnxId"
                                        value={tnxId}
                                        onChange={(e) => setTnxId(e.target.value)}
                                        placeholder="১৬ অঙ্কের ট্রানজেকশন আইডি"
                                        className="text-lg p-4 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Send Money সম্পন্ন করার পর পাওয়া TxID</p>
                                </div>

                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                    <Label htmlFor="amarBikriMullo" className="text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                                        💸 আমার বিক্রি মূল্য
                                    </Label>
                                    <Input
                                        type="number"
                                        id="amarBikriMullo"
                                        value={amarBikriMullo}
                                        onChange={(e) => setAmarBikriMullo(Number(e.target.value))} // convert to number
                                        placeholder="আপনার বিক্রি মূল্য লিখুন"
                                        className="text-lg p-4 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                                    />

                                    <p className="text-xs text-gray-500 mt-1">আপনার বিক্রি মূল্যের বিস্তারিত দিন</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold"
                            >
                                ❌ বাতিল করুন
                            </Button>
                            <Button
                                onClick={handlePlaceOrder}
                                disabled={isSubmitting || !paymentNumber || !tnxId || !paymentInfo || !deliveryName || !deliveryAddress || !deliveryPhone || !amarBikriMullo}
                                className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="h-4 w-4 animate-spin" />
                                        <span>প্রসেসিং...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>অর্ডার নিশ্চিত করুন</span>
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            🔒 আপনার তথ্য সম্পূর্ণ নিরাপদে সংরক্ষিত হবে
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CartPage;