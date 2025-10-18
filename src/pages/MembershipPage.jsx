import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, Star, Package, Truck, Gift, Copy, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import Swal from 'sweetalert2';

const MembershipPlan = ({ plan, onBuyNow }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-white rounded-xl shadow-lg p-8 border-2 ${plan.recommended ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'}`}
    >
        {plan.recommended && (
            <div className="text-center mb-4">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">সবচেয়ে জনপ্রিয়</span>
            </div>
        )}
        <h2 className="text-2xl font-bold text-gray-800 text-center">{plan.name}</h2>
        <p className="text-4xl font-extrabold text-gray-900 text-center my-4">
            ৳{plan.price}<span className="text-lg font-normal text-gray-500">/বছর</span>
        </p>
        <ul className="space-y-3 mb-8">
            {plan.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                </li>
            ))}
        </ul>
        <Button onClick={() => onBuyNow(plan)} size="lg" className="w-full">
            এখনি কিনুন
        </Button>
    </motion.div>
);

const MembershipPage = () => {
    const { isAuthenticated, user, becomeMember } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [paymentNumber, setPaymentNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPaymentInfoLoading, setIsPaymentInfoLoading] = useState(true);
    const [adminPaymentNumber, setAdminPaymentNumber] = useState(null);
    // Step 1: Store Information State
    const [storeInfo, setStoreInfo] = useState({
        shopName: '',
        shopAddress: '',
        shopContact: '',
        shopImage: '',
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchPaymentNumbers();
    }, []);

    const fetchPaymentNumbers = async () => {
        setIsPaymentInfoLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/payment-number`);
            if (response.data && response.data.length > 0) {
                setAdminPaymentNumber(response.data[0]);
            } else {
                throw new Error('No payment info found');
            }
        } catch (error) {
            console.error('Payment number fetch error:', error);
            toast({
                title: "❌ ত্রুটি",
                description: "পেমেন্ট তথ্য লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
                variant: "destructive"
            });
        } finally {
            setIsPaymentInfoLoading(false);
        }
    };

    // const plans = [
    //     {
    //         name: 'বেসিক মেম্বার',
    //         price: '৪৯৯',
    //         benefits: [
    //             'সকল পণ্যের দাম দেখুন',
    //             'সাধারণ গ্রাহক সাপোর্ট',
    //             'মাসিক নিউজলেটার'
    //         ],
    //         recommended: false
    //     },
    //     {
    //         name: 'প্রো সেলার',
    //         price: '৯৯৯',
    //         benefits: [
    //             'সকল বেসিক সুবিধা',
    //             'অগ্রাধিকার গ্রাহক সাপোর্ট',
    //             'বিশেষ ডিসকাউন্ট',
    //             'সাপ্তাহিক বিক্রয় রিপোর্ট'
    //         ],
    //         recommended: true
    //     },
    //     {
    //         name: 'প্রিমিয়াম পার্টনার',
    //         price: '১৯৯৯',
    //         benefits: [
    //             'সকল প্রো সুবিধা',
    //             'ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার',
    //             'নতুন পণ্যে আর্লি অ্যাক্সেস',
    //             'ফ্রি ডেলিভারি (শর্ত প্রযোজ্য)'
    //         ],
    //         recommended: false
    //     },
    // ];
    ``
    const [plans, setPlans] = useState([]);
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/manage-package`)
            .then(res => {
                setPlans(res.data);
            })
    }, [])


    const handleBuyNow = (plan) => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/membership');
            return;
        }

        if (!adminPaymentNumber) {
            toast({
                title: "❌ ত্রুটি",
                description: "পেমেন্ট তথ্য লোড হয়নি। পুনরায় চেষ্টা করুন।",
                variant: "destructive"
            });
            return;
        }

        setSelectedPlan(plan);
        setAmount(plan.price);
        setCurrentStep(1); // Start with Step 1
        setStoreInfo({
            shopName: '',
            shopAddress: '',
            shopContact: '',
            shopImage: '',
        });
        setImagePreview(null);
        setPaymentMethod('');
        setTransactionId('');
        setPaymentNumber('');
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            toast({
                title: "❌ ত্রুটি",
                description: "শুধুমাত্র JPG বা PNG ফাইল আপলোড করা যাবে।",
                variant: "destructive"
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "❌ ত্রুটি",
                description: "ইমেজ সাইজ ৫ এমবি-এর বেশি হতে পারবে না।",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
                params: {
                    key: import.meta.env.VITE_IMGBB_API_KEY, // Replace with your ImgBB API key
                },
            });

            if (response.data.success) {
                setStoreInfo((prev) => ({ ...prev, shopImage: response.data.data.url }));
                setImagePreview(response.data.data.url);
                toast({
                    title: "✅ সফল",
                    description: "ইমেজ সফলভাবে আপলোড হয়েছে।",
                });
            } else {
                throw new Error('Image upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast({
                title: "❌ ত্রুটি",
                description: "ইমেজ আপলোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleStoreInfoSubmit = () => {
        const { shopName, shopAddress, shopContact, shopImage } = storeInfo;
        if (!shopName || !shopAddress || !shopContact || !shopImage) {
            toast({
                title: "❌ ত্রুটি",
                description: "সকল স্টোর তথ্য পূরণ করুন এবং ইমেজ আপলোড করুন।",
                variant: "destructive"
            });
            return;
        }

        if (!/^\d{11}$/.test(shopContact)) {
            toast({
                title: "❌ ত্রুটি",
                description: "যোগাযোগ নম্বর ১১ সংখ্যার মোবাইল নম্বর হতে হবে।",
                variant: "destructive"
            });
            return;
        }

        setCurrentStep(2); // Proceed to Step 2
    };

    const copyPaymentNumber = () => {
        if (!adminPaymentNumber || !paymentMethod) {
            toast({
                title: "❌ ত্রুটি",
                description: "প্রথমে পেমেন্ট পদ্ধতি নির্বাচন করুন",
                variant: "destructive"
            });
            return;
        }

        const numberToCopy = paymentMethod === 'bKash'
            ? adminPaymentNumber.bkashNumber
            : adminPaymentNumber.nagadNumber;

        navigator.clipboard.writeText(numberToCopy).then(() => {
            toast({
                title: "✅ পেমেন্ট নাম্বার কপি করা হয়েছে!",
                description: `${paymentMethod}: ${numberToCopy}`,
            });
        }).catch(err => {
            console.error('Failed to copy:', err);
            toast({
                title: "❌ কপি ব্যর্থ",
                description: "ম্যানুয়ালি কপি করুন",
                variant: "destructive"
            });
        });
    };

    const handlePaymentSubmit = async () => {
        if (!paymentMethod || !transactionId || !paymentNumber || !amount) {
            toast({
                title: "❌ ত্রুটি",
                description: "সকল পেমেন্ট ফিল্ড পূরণ করুন",
                variant: "destructive"
            });
            return;
        }

        if (transactionId.length < 8) {
            toast({
                title: "❌ ত্রুটি",
                description: "ট্রানজেকশন আইডি সঠিক নয় (কমপক্ষে ৮ অঙ্ক)",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const paymentData = {
                email: user.email,
                planName: selectedPlan.name,
                amount: amount,
                paymentMethod: paymentMethod,
                transactionId: transactionId,
                paymentNumber: paymentNumber,
                timestamp: new Date().toISOString(),
                packageStatus: 'pending',
                storeInfo: {
                    shopName: storeInfo.shopName,
                    shopAddress: storeInfo.shopAddress,
                    shopContact: storeInfo.shopContact,
                    shopImage: storeInfo.shopImage,
                },
            };

            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/buy-package`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Payment submission failed');
            }

            await becomeMember();

            Swal.fire({
                title: `🎉 অভিনন্দন, ${user.name}!`,
                text: `আপনি সফলভাবে "${selectedPlan.name}" প্ল্যানটি কিনেছেন। আমরা আগামী ২৪ ঘন্টার মধ্যে
                 আপনার পেমেন্ট এবং স্টোর তথ্য যাচাই করব।`,
                icon: "success",
                draggable: true
            });


            handleCloseModal();
        } catch (error) {
            console.error('Payment error:', error);
            toast({
                title: "❌ পেমেন্ট ব্যর্থ",
                description: error.message || "দয়া করে আবার চেষ্টা করুন অথবা সাপোর্ট টিমের সাথে যোগাযোগ করুন",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentStep(1);
        setPaymentMethod('');
        setTransactionId('');
        setPaymentNumber('');
        setAmount('');
        setSelectedPlan(null);
        setStoreInfo({
            shopName: '',
            shopAddress: '',
            shopContact: '',
            shopImage: '',
        });
        setImagePreview(null);
    };

    const copyReferralLink = () => {
        if (!user?.myReferralCode) {
            toast({
                title: "❌ ত্রুটি",
                description: "রেফারেল কোড লোড হয়নি",
                variant: "destructive"
            });
            return;
        }

        const referralUrl = `https://letsdropship.com/signup?ref=${user.myReferralCode}`;
        navigator.clipboard.writeText(referralUrl).then(() => {
            toast({
                title: "✅ লিঙ্ক কপি করা হয়েছে!",
                description: "আপনার বন্ধুদের সাথে রেফারেল লিঙ্ক শেয়ার করুন এবং বোনাস পান!",
            });
        }).catch(err => {
            console.error('Failed to copy referral link:', err);
        });
    };

    const getPaymentNumberForMethod = () => {
        if (!adminPaymentNumber || !paymentMethod) return '';
        return paymentMethod === 'bKash'
            ? adminPaymentNumber.bkashNumber
            : adminPaymentNumber.nagadNumber;
    };

    return (
        <>
            <Helmet>
                <title>মেম্বারশিপ - LetsDropship</title>
                <meta name="description" content="আমাদের মেম্বার হয়ে বিশেষ সুবিধা উপভোগ করুন এবং সকল পণ্যের দাম দেখুন।" />
            </Helmet>

            <div className="bg-slate-50 py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            আমাদের এক্সক্লুসিভ মেম্বার হোন
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            বিশেষ সুবিধা, সেরা ডিল এবং আপনার ব্যবসার প্রসারে প্রয়োজনীয় সকল টুলস পেতে
                            আজই আমাদের মেম্বারশিপ গ্রহণ করুন।
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {plans.map((plan, index) => (
                            <MembershipPlan key={index} plan={plan} onBuyNow={handleBuyNow} />
                        ))}
                    </div>

                    {/* Other sections remain unchanged */}
                </div>
            </div>

            {/* Two-Step Payment Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg md:max-w-3xl w-full max-h-[95vh] overflow-y-scroll bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <Star className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {currentStep === 1 ? '🛒 স্টোর তথ্য প্রদান করুন' : '💳 পেমেন্ট সম্পন্ন করুন'}
                                    </h2>
                                    <p className="text-orange-100 text-sm opacity-90">
                                        {currentStep === 1 ? 'আপনার দোকানের বিবরণ দিন' : 'আপনার ব্যবসাকে পরবর্তী স্তরে নিয়ে যান'}
                                    </p>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-200px)]">
                        {/* Step Indicator */}
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center space-x-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    ১
                                </div>
                                <div className="w-16 h-1 bg-gray-300">
                                    <div className={`h-full ${currentStep === 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    ২
                                </div>
                            </div>
                        </div>

                        {currentStep === 1 ? (
                            // Step 1: Store Information
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                    <Label htmlFor="shopName" className="text-sm font-semibold text-gray-700 mb-2 block">
                                        দোকানের নাম
                                    </Label>
                                    <Input
                                        id="shopName"
                                        value={storeInfo.shopName}
                                        onChange={(e) => setStoreInfo((prev) => ({ ...prev, shopName: e.target.value }))}
                                        placeholder="আপনার দোকানের নাম লিখুন"
                                        className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                    />
                                </div>

                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                    <Label htmlFor="shopAddress" className="text-sm font-semibold text-gray-700 mb-2 block">
                                        দোকানের ঠিকানা
                                    </Label>
                                    <Input
                                        id="shopAddress"
                                        value={storeInfo.shopAddress}
                                        onChange={(e) => setStoreInfo((prev) => ({ ...prev, shopAddress: e.target.value }))}
                                        placeholder="আপনার দোকানের ঠিকানা লিখুন"
                                        className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                    />
                                </div>

                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                    <Label htmlFor="shopContact" className="text-sm font-semibold text-gray-700 mb-2 block">
                                        যোগাযোগ নম্বর
                                    </Label>
                                    <Input
                                        id="shopContact"
                                        value={storeInfo.shopContact}
                                        onChange={(e) => setStoreInfo((prev) => ({ ...prev, shopContact: e.target.value }))}
                                        placeholder="১১ সংখ্যার মোবাইল নম্বর লিখুন"
                                        className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">শুধুমাত্র ১১ সংখ্যার মোবাইল নম্বর গ্রহণযোগ্য</p>
                                </div>

                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                    <Label htmlFor="shopImage" className="text-sm font-semibold text-gray-700 mb-2 block">
                                        দোকানের ছবি
                                    </Label>
                                    <Input
                                        id="shopImage"
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={handleImageUpload}
                                        className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                        disabled={isUploading}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">শুধুমাত্র JPG/PNG, সর্বোচ্চ ৫ এমবি</p>
                                    {isUploading && (
                                        <div className="text-center py-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                                            <p className="text-gray-500">ইমেজ আপলোড হচ্ছে...</p>
                                        </div>
                                    )}
                                    {imagePreview && (
                                        <div className="mt-4">
                                            <img
                                                src={imagePreview}
                                                alt="Shop Preview"
                                                className="w-full h-48 object-cover rounded-xl border border-gray-200"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Step 2: Payment Information (unchanged)
                            <>
                                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-100 shadow-xl">
                                    <div className="flex items-center mb-4">
                                        <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                                            <Gift className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="ml-3 font-bold text-lg text-gray-800">আমাদের পেমেন্ট নাম্বার</h3>
                                    </div>

                                    {isPaymentInfoLoading ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                                            <p className="text-gray-500">লোড হচ্ছে...</p>
                                        </div>
                                    ) : adminPaymentNumber ? (
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-l-4 border-blue-500">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-blue-800 flex items-center">🟢 bKash</span>
                                                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                                                        <span className="font-mono text-sm font-bold text-gray-700 mr-2">
                                                            {adminPaymentNumber.bkashNumber}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => navigator.clipboard.writeText(adminPaymentNumber.bkashNumber)}
                                                            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-l-4 border-orange-500">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-orange-800 flex items-center">🔴 Nagad</span>
                                                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                                                        <span className="font-mono text-sm font-bold text-gray-700 mr-2">
                                                            {adminPaymentNumber.nagadNumber}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => navigator.clipboard.writeText(adminPaymentNumber.nagadNumber)}
                                                            className="h-8 w-8 p-0 bg-orange-600 hover:bg-orange-700 text-white"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                                                <p className="text-sm text-yellow-800 flex items-center">
                                                    📱 <span className="ml-2">"Send Money" অপশন ব্যবহার করে পেমেন্ট করুন এবং TxID সংরক্ষণ করুন</span>
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-red-500 bg-red-50 p-3 rounded-lg">
                                            ❌ পেমেন্ট তথ্য লোড করা যায়নি
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200 shadow-lg">
                                    <div className="flex items-center mb-4">
                                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                                            <Package className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="ml-3 font-bold text-lg text-gray-800">📋 নির্বাচিত প্ল্যান তথ্য</h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl shadow-inner">
                                            <Label className="text-sm font-semibold text-gray-600 mb-2 block">প্ল্যানের নাম</Label>
                                            <Input
                                                value={selectedPlan?.name || ''}
                                                readOnly
                                                className="bg-gray-50 border-gray-200 text-lg font-semibold text-gray-800"
                                            />
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-inner">
                                            <Label className="text-sm font-semibold text-gray-600 mb-2 block">পরিমাণ</Label>
                                            <div className="text-center space-y-2">
                                                <p className="text-3xl font-bold text-emerald-600">৳{amount}</p>
                                                <p className="text-xs text-gray-500">/বছর</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
                                    <Label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center">
                                        💰 পেমেন্ট পদ্ধতি নির্বাচন করুন
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button
                                            onClick={() => setPaymentMethod('bKash')}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 ${paymentMethod === 'bKash'
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                                                : 'bg-gray-50 hover:bg-blue-50 border-gray-200 hover:border-blue-300'
                                                }`}
                                            disabled={isPaymentInfoLoading}
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
                                            disabled={isPaymentInfoLoading}
                                        >
                                            <div className={`w-3 h-3 rounded-full border-2 ${paymentMethod === 'Nagad' ? 'bg-white border-white' : 'bg-transparent border-gray-400'
                                                }`}></div>
                                            <span className="font-semibold">Nagad</span>
                                        </button>
                                    </div>

                                    {paymentMethod && adminPaymentNumber && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={copyPaymentNumber}
                                            className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-gray-300 text-gray-700 font-semibold"
                                        >
                                            📋 {getPaymentNumberForMethod().slice(0, 4)}**** নাম্বার কপি করুন
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                        <Label htmlFor="paymentRef" className="text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                                            🔗 পেমেন্ট রেফারেন্স নাম্বার
                                        </Label>
                                        <Input
                                            id="paymentRef"
                                            value={paymentNumber}
                                            onChange={(e) => setPaymentNumber(e.target.value)}
                                            placeholder="Send Money এর পর পাওয়া রেফারেন্স নাম্বার"
                                            className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Send Money করার সময় পাওয়া রেফারেন্স নাম্বার লিখুন</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                        <Label htmlFor="transactionId" className="text-sm font-semibold text-gray-700 mb-2 block flex items-center">
                                            🔑 ট্রানজেকশন আইডি
                                        </Label>
                                        <Input
                                            id="transactionId"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder="ট্রানজেকশন আইডি (১৬ অঙ্কের)"
                                            className="text-lg p-4 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">bKash/Nagad থেকে পাওয়া ১৬ অঙ্কের ট্রানজেকশন আইডি</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                        <div className="flex gap-3">
                            {currentStep === 1 ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handleCloseModal}
                                        disabled={isLoading || isUploading}
                                        className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold"
                                    >
                                        ❌ বাতিল করুন
                                    </Button>
                                    <Button
                                        onClick={handleStoreInfoSubmit}
                                        disabled={isLoading || isUploading}
                                        className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        <span>পরবর্তী</span>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(1)}
                                        disabled={isLoading}
                                        className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold"
                                    >
                                        ⬅️ পিছনে
                                    </Button>
                                    <Button
                                        onClick={handlePaymentSubmit}
                                        disabled={isLoading || !paymentMethod}
                                        className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>প্রসেসিং...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>পেমেন্ট নিশ্চিত করুন</span>
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            🔒 আপনার তথ্য সম্পূর্ণ নিরাপদে সংরক্ষিত হবে
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MembershipPage;