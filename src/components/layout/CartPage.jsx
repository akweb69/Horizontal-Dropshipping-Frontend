import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader, Trash2, Minus, Plus, ShoppingBag, Copy, CheckCircle, Truck } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const { loading, cartData, setCartData, user, fetchCart } = useAuth();
    const [quantities, setQuantities] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // শুধু একটি আইটেম
    const [paymentMethod, setPaymentMethod] = useState('bKash');
    const [paymentNumber, setPaymentNumber] = useState('');
    const [tnxId, setTnxId] = useState('');
    const [amarBikriMullo, setAmarBikriMullo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [isPaymentInfoLoading, setIsPaymentInfoLoading] = useState(true);
    const [deliveryName, setDeliveryName] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryPhone, setDeliveryPhone] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('inside');
    const [step, setStep] = useState(1);

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
                title: "ত্রুটি",
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
        const item = cartData.find(i => i._id === id);
        const maxStock = item.sizeStock || 999;
        if ((quantities[id] || 1) >= maxStock) {
            toast({ title: "স্টক সীমিত", description: `এই সাইজে মাত্র ${maxStock} টি আছে`, variant: "destructive" });
            return;
        }
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
                const updatedCart = cartData.filter(item => item._id !== id);
                setCartData(updatedCart);
                toast({ title: "সফল", description: "পণ্য কার্ট থেকে মুছে ফেলা হয়েছে।" });
            } else {
                throw new Error("Failed to delete item");
            }
        } catch (e) {
            toast({ title: "ত্রুটি", description: "কার্ট থেকে পণ্য মুছতে ব্যর্থ হয়েছে।", variant: "destructive" });
        }
    };

    const calculateItemTotal = (item) => {
        const qty = quantities[item._id] || 1;
        return (qty * parseFloat(item.price || 0)).toFixed(2);
    };

    const getDeliveryCharge = () => {
        return deliveryLocation === 'inside' ? 80 : 150;
    };

    const calculateGrandTotal = () => {
        if (!selectedItem) return 0;
        const itemTotal = parseFloat(calculateItemTotal(selectedItem));
        const delivery = getDeliveryCharge();
        return (itemTotal + delivery).toFixed(2);
    };

    const openModal = (item) => {
        if (!paymentInfo) {
            toast({ title: "ত্রুটি", description: "পেমেন্ট তথ্য লোড হয়নি। পুনরায় চেষ্টা করুন।", variant: "destructive" });
            return;
        }

        setSelectedItem(item);
        setPaymentMethod('bKash');
        setPaymentNumber('');
        setTnxId('');
        setAmarBikriMullo('');
        setDeliveryName(user?.displayName || '');
        setDeliveryPhone(user?.phone || '');
        setDeliveryAddress('');
        setDeliveryLocation('inside');
        setStep(1);
        setIsModalOpen(true);
    };

    const handleBuyNow = (id) => {
        const item = cartData.find((i) => i._id === id);
        if (item) openModal(item);
    };

    const copyPaymentNumber = () => {
        if (!paymentInfo || !paymentMethod) return;
        const numberToCopy = paymentMethod === 'bKash' ? paymentInfo.bkashNumber : paymentInfo.nagadNumber;
        navigator.clipboard.writeText(numberToCopy).then(() => {
            toast({ title: "নাম্বার কপি হয়েছে!", description: `${paymentMethod}: ${numberToCopy}` });
        });
    };

    const handlePlaceOrder = async () => {
        if (!deliveryName || !deliveryPhone || !deliveryAddress || !amarBikriMullo) {
            toast({ title: "ত্রুটি", description: "সকল ডেলিভারি তথ্য পূরণ করুন", variant: "destructive" });
            return;
        }

        if (['bKash', 'Nagad'].includes(paymentMethod) && (!paymentNumber || !tnxId || tnxId.length < 8)) {
            toast({ title: "ত্রুটি", description: "পেমেন্ট নাম্বার ও TxID দিন", variant: "destructive" });
            return;
        }

        const qty = quantities[selectedItem._id] || 1;
        const itemTotal = qty * parseFloat(selectedItem.price);
        const deliveryCharge = getDeliveryCharge();
        const grandTotal = itemTotal + deliveryCharge;
        const orderDate = new Date().toISOString();
        const email = user?.email || selectedItem?.email;

        const deliveryDetails = {
            name: deliveryName,
            address: deliveryAddress,
            phone: deliveryPhone,
            location: deliveryLocation === 'inside' ? 'Dhaka City' : 'Outside Dhaka'
        };

        const orderData = {
            items: [{
                productId: selectedItem.productId,
                name: selectedItem.name,
                price: parseFloat(selectedItem.price),
                size: selectedItem.size,
                sizeStock: selectedItem.sizeStock,
                quantity: qty,
                subtotal: qty * parseFloat(selectedItem.price),
                thumbnail: selectedItem.thumbnail,
            }],
            items_total: itemTotal,
            delivery_charge: deliveryCharge,
            grand_total: grandTotal,
            delivery_details: deliveryDetails,
            status: 'pending',
            payment_method: paymentMethod,
            payment_number: paymentMethod === 'Cash on Delivery' ? 'N/A' : paymentNumber,
            tnx_id: paymentMethod === 'Cash on Delivery' ? 'N/A' : tnxId,
            order_date: orderDate,
            email: email,
            amar_bikri_mullo: amarBikriMullo,
            store_info: user?.storeInfo,
        };

        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                toast({ title: "অর্ডার সফল!", description: paymentMethod === 'Cash on Delivery' ? "COD অর্ডার প্লেস হয়েছে।" : "অর্ডার প্লেস হয়েছে।" });

                await handleDelete(selectedItem._id);
                setIsModalOpen(false);
                if (fetchCart) await fetchCart();
            } else {
                throw new Error("Failed to place order");
            }
        } catch (e) {
            toast({ title: "অর্ডার ব্যর্থ", description: "অর্ডার প্লেস করতে সমস্যা হয়েছে", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
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
                <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 pb-4">আপনার কার্ট</h1>
                <p className="text-center text-gray-500 text-lg">আপনার কার্ট খালি।</p>
                <div className="text-center mt-4">
                    <Button asChild><Link to="/">কেনাকাটা শুরু করুন</Link></Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[90vh]">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 border-b border-gray-200 pb-4">
                আপনার কার্ট
            </h1>

            <div className="space-y-6">
                {cartData.map((item) => {
                    const qty = quantities[item._id] || 1;
                    const subtotal = qty * parseFloat(item.price || 0);
                    const maxStock = item.sizeStock || 999;

                    return (
                        <div
                            key={item._id}
                            className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center w-full lg:w-auto mb-4 lg:mb-0">
                                <img
                                    src={item.thumbnail || '/placeholder.jpg'}
                                    alt={item.name}
                                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover flex-shrink-0"
                                />
                                <div className="ml-4 flex-1 min-w-0">
                                    <h2 className="font-semibold text-lg text-gray-800 truncate">{item.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                            {item.size}
                                        </span>
                                        <span className="text-green-600 font-bold">৳{parseFloat(item.price).toFixed(2)}</span>
                                    </div>
                                    {maxStock < 10 && (
                                        <p className="text-xs text-red-600 mt-1">মাত্র {maxStock} টি আছে!</p>
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
                                        disabled={qty <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="px-4 py-2 text-center min-w-[50px] bg-gray-50 text-sm font-medium">
                                        {qty}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleIncrement(item._id)}
                                        className="h-10 w-10 p-0"
                                        disabled={qty >= maxStock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <p className="text-lg font-bold text-gray-800 whitespace-nowrap">
                                    ৳{subtotal.toFixed(2)}
                                </p>

                                <div className="flex items-center gap-2">
                                    <Button onClick={() => handleBuyNow(item._id)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                                        <ShoppingBag className="w-4 h-4 mr-2" /> কিনুন
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Checkout Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-4xl md:max-w-6xl w-full max-h-[95vh] overflow-y-auto bg-white p-0">
                    {/* Step Indicator */}
                    <div className="sticky top-0 bg-white border-b z-10 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
                            <div className="w-20 h-1 bg-gray-200"><div className={`h-full transition-all ${step === 2 ? 'bg-blue-600 w-full' : 'bg-gray-200'}`}></div></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Step {step === 1 ? '০১: অর্ডার বিস্তারিত' : '০২: পেমেন্ট'}</p>
                    </div>

                    {/* Step 1 */}
                    {step === 1 && selectedItem && (
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-5 rounded-2xl border">
                                    <h3 className="font-bold text-lg mb-4 flex items-center">
                                        <ShoppingBag className="w-5 h-5 mr-2 text-blue-600" /> পণ্যের বিস্তারিত
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-3">
                                                <img src={selectedItem.thumbnail || '/placeholder.jpg'} alt={selectedItem.name} className="w-12 h-12 rounded-lg object-cover" />
                                                <div>
                                                    <p className="font-medium">{selectedItem.name}</p>
                                                    <p className="text-xs text-gray-500">{selectedItem.size} × ৳{selectedItem.price} × {quantities[selectedItem._id] || 1}</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold">৳{calculateItemTotal(selectedItem)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border">
                                    <h3 className="font-bold text-lg mb-4">অর্ডার সারাংশ</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span>আইটেম মোট</span><span>৳{calculateItemTotal(selectedItem)}</span></div>
                                        <div className="flex justify-between"><span>ডেলিভারি চার্জ</span><span>৳{getDeliveryCharge()}</span></div>
                                        <div className="border-t pt-2 font-bold flex justify-between text-blue-700">
                                            <span>গ্র্যান্ড টোটাল</span><span>৳{calculateGrandTotal()}</span>
                                        </div>
                                    </div>
                                    {amarBikriMullo && (
                                        <div className="mt-3 p-3 bg-white/70 rounded-lg">
                                            <div className="flex justify-between text-sm"><span>গ্র্যান্ড টোটাল</span><span>৳{calculateGrandTotal()}</span></div>
                                            <div className="flex justify-between text-sm"><span>আপনার মূল্য</span><span>৳{amarBikriMullo}</span></div>
                                            <div className="w-full h-[0.5px] bg-green-500"></div>
                                            <div className="flex justify-between font-bold text-green-600 mt-1">
                                                <span>আপনার লাভ</span>
                                                <span>৳{(amarBikriMullo - calculateGrandTotal()).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 flex items-center">
                                        <Truck className="w-5 h-5 mr-2 text-green-600" /> ডেলিভারি বিস্তারিত
                                    </h3>
                                    <div className="space-y-4">
                                        <div><Label>নাম</Label><Input value={deliveryName} onChange={(e) => setDeliveryName(e.target.value)} placeholder="আপনার পুরো নাম" className="mt-1" /></div>
                                        <div><Label>মোবাইল</Label><Input type="tel" value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} placeholder="০১XXXXXXXXX" className="mt-1" /></div>
                                        <div><Label>ঠিকানা</Label><Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="বিস্তারিত ঠিকানা" className="mt-1" /></div>
                                        <div>
                                            <Label>লোকেশন</Label>
                                            <select value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} className="w-full mt-1 p-2 border rounded-lg text-sm">
                                                <option value="inside">ঢাকা সিটির ভিতরে (৳80)</option>
                                                <option value="outside">ঢাকা সিটির বাইরে (৳150)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl border">
                                    <h3 className="font-bold text-lg mb-3">আমার বিক্রি মূল্য</h3>
                                    <Input type="number" value={amarBikriMullo} onChange={(e) => setAmarBikriMullo(e.target.value ? Number(e.target.value) : '')} placeholder="আপনার বিক্রয় মূল্য লিখুন" className="text-lg font-bold" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="p-6 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border shadow-sm">
                                <h3 className="font-bold text-lg mb-4">পেমেন্ট পদ্ধতি</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['bKash', 'Nagad', 'Cash on Delivery'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center space-x-3 ${paymentMethod === method ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            {method === 'bKash' && <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">bK</div>}
                                            {method === 'Nagad' && <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs">NG</div>}
                                            {method === 'Cash on Delivery' && <Truck className="w-6 h-6 text-green-600" />}
                                            <span className="font-bold">{method === 'Cash on Delivery' ? 'COD' : method}</span>
                                            {paymentMethod === method && <CheckCircle className="w-5 h-5 text-blue-600" />}
                                        </button>
                                    ))}
                                </div>

                                {['bKash', 'Nagad'].includes(paymentMethod) && paymentInfo && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">পেমেন্ট করুন:</p>
                                            <p className="font-mono font-bold text-lg">
                                                {paymentMethod === 'bKash' ? paymentInfo.bkashNumber : paymentInfo.nagadNumber}
                                            </p>
                                        </div>
                                        <Button size="sm" onClick={copyPaymentNumber}><Copy className="w-4 h-4 mr-1" /> কপি</Button>
                                    </div>
                                )}

                                {paymentMethod === 'Cash on Delivery' && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <p className="text-sm text-green-800 flex items-center">
                                            <Truck className="w-5 h-5 mr-2" /> ডেলিভারির সময় নগদে পেমেন্ট করুন।
                                        </p>
                                    </div>
                                )}
                            </div>

                            {['bKash', 'Nagad'].includes(paymentMethod) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><Label>পেমেন্ট মোবাইল নাম্বার</Label><Input type="tel" value={paymentNumber} onChange={(e) => setPaymentNumber(e.target.value)} placeholder="০১XXXXXXXXX" className="mt-1" /></div>
                                    <div><Label>ট্রানজেকশন আইডি (TxID)</Label><Input value={tnxId} onChange={(e) => setTnxId(e.target.value)} placeholder="১৬ অঙ্কের TxID" className="mt-1" /></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
                        {step === 2 && <Button variant="outline" onClick={() => setStep(1)} className="flex-1">পিছনে</Button>}
                        {step === 1 && (
                            <Button
                                onClick={() => {
                                    if (!deliveryName || !deliveryPhone || !deliveryAddress || !amarBikriMullo) {
                                        toast({ title: "সকল তথ্য পূরণ করুন", variant: "destructive" });
                                        return;
                                    }
                                    setStep(2);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                পরবর্তী ধাপ
                            </Button>
                        )}
                        {step === 2 && (
                            <Button
                                onClick={handlePlaceOrder}
                                disabled={isSubmitting || (['bKash', 'Nagad'].includes(paymentMethod) && (!paymentNumber || !tnxId))}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? (
                                    <> <Loader className="w-4 h-4 mr-2 animate-spin" /> প্রসেসিং... </>
                                ) : (
                                    <> <CheckCircle className="w-5 h-5 mr-2" /> {paymentMethod === 'Cash on Delivery' ? 'COD অর্ডার নিশ্চিত করুন' : 'অর্ডার নিশ্চিত করুন'} </>
                                )}
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CartPage;