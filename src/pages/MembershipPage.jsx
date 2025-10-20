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
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-xl  shadow-lg p-8 border-2 ${plan.recommended ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'} flex flex-col justify-between hover:shadow-xl transition-shadow duration-300`}
    >
        <div className="">
            {plan.recommended && (
                <div className="text-center mb-4">
                    <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">সবচেয়ে জনপ্রিয়</span>
                </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800 text-center">{plan.name}</h2>
            <p className="text-4xl font-extrabold text-gray-900 text-center my-4">
                ৳{plan.price}<span className="text-lg font-normal text-gray-500">/বছর</span>
            </p>
            <ul className="space-y-3 mb-8">
                {plan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                    </li>
                ))}
            </ul>
        </div>
        <Button onClick={() => onBuyNow(plan)} size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
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
    const [payableAmount, setPayableAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaymentInfoLoading, setIsPaymentInfoLoading] = useState(true);
    const [adminPaymentNumber, setAdminPaymentNumber] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [storeInfo, setStoreInfo] = useState({
        shopName: '',
        shopAddress: '',
        shopContact: '',
        shopImage: '',
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [showCongrats, setShowCongrats] = useState(false);

    useEffect(() => {
        fetchPaymentNumbers();
        fetchAllUser();
    }, []);

    const fetchAllUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`);
            if (response.data && response.data.length > 0) {
                setAllUsers(response.data);
            } else {
                throw new Error('No users found');
            }
        } catch (error) {
            console.error('User fetch error:', error);
        }
    };

    const handleCheckReferralCode = (referralCode) => {
        const foundUser = allUsers.find(user => user.myReferralCode === referralCode);
        if (foundUser) {
            setDiscount(60);
            setPayableAmount(selectedPlan.price - 60);
            toast({
                title: "✅ সফল",
                description: "রেফারেল কোড যাচাই হয়েছে! ডিসকাউন্ট প্রয়োগ করা হয়েছে।",
            });
            setShowCongrats(true);
            setTimeout(() => setShowCongrats(false), 1000);
        } else {
            toast({
                title: "❌ ত্রুটি",
                description: "অবৈধ রেফারেল কোড!",
                variant: "destructive"
            });
        }
    };

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

    const [plans, setPlans] = useState([]);
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/manage-package`)
            .then(res => {
                setPlans(res.data);
            });
    }, []);

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
        setPayableAmount(plan.price);
        setDiscount(0);
        setCurrentStep(1);
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
        setReferralCode('');
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
                    key: import.meta.env.VITE_IMGBB_API_KEY,
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

        setCurrentStep(2);
    };

    const handleNextToStep3 = () => {
        setCurrentStep(3);
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
        if (!paymentMethod || !transactionId || !paymentNumber) {
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
                amount: payableAmount,
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
        setPayableAmount(0);
        setDiscount(0);
        setSelectedPlan(null);
        setStoreInfo({
            shopName: '',
            shopAddress: '',
            shopContact: '',
            shopImage: '',
        });
        setImagePreview(null);
        setReferralCode('');
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

            <div className="bg-gray-50 py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            আমাদের এক্সক্লুসিভ মেম্বার হোন
                        </h1>
                        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                            বিশেষ সুবিধা, সেরা ডিল এবং আপনার ব্যবসার প্রসারে প্রয়োজনীয় সকল টুলস পেতে
                            আজই আমাদের মেম্বারশিপ গ্রহণ করুন।
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {plans.map((plan, index) => (
                            <MembershipPlan key={index} plan={plan} onBuyNow={handleBuyNow} />
                        ))}
                    </div>
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >


                        <div className="p-6">
                            {/* Step Indicator */}
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center space-x-4">
                                    <motion.div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                        animate={{ scale: currentStep === 1 ? 1.1 : 1 }}
                                    >
                                        ১
                                    </motion.div>
                                    <div className="w-16 h-1 bg-gray-200">
                                        <motion.div
                                            className="h-full bg-indigo-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: currentStep > 1 ? '100%' : '0%' }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <motion.div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === 2 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                        animate={{ scale: currentStep === 2 ? 1.1 : 1 }}
                                    >
                                        ২
                                    </motion.div>
                                    <div className="w-16 h-1 bg-gray-200">
                                        <motion.div
                                            className="h-full bg-indigo-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: currentStep > 2 ? '100%' : '0%' }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <motion.div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === 3 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                        animate={{ scale: currentStep === 3 ? 1.1 : 1 }}
                                    >
                                        ৩
                                    </motion.div>
                                </div>
                            </div>

                            {currentStep === 1 ? (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">স্টোর তথ্য দিন</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <Label htmlFor="shopName" className="text-sm font-semibold text-gray-700 mb-2 block">
                                                    দোকানের নাম
                                                </Label>
                                                <Input
                                                    id="shopName"
                                                    value={storeInfo.shopName}
                                                    onChange={(e) => setStoreInfo((prev) => ({ ...prev, shopName: e.target.value }))}
                                                    placeholder="আপনার দোকানের নাম লিখুন"
                                                    className="text-base p-3 border bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                                                />
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                                className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <Label htmlFor="shopAddress" className="text-sm font-semibold text-gray-700 mb-2 block">
                                                    দোকানের ঠিকানা
                                                </Label>
                                                <Input
                                                    id="shopAddress"
                                                    value={storeInfo.shopAddress}
                                                    onChange={(e) => setStoreInfo((prev) => ({ ...prev, shopAddress: e.target.value }))}
                                                    placeholder="আপনার দোকানের ঠিকানা লিখুন"
                                                    className="text-base p-3 border border-gray-200 focus:border-indigo-500 bg-white focus:ring-indigo-500 rounded-lg"
                                                />
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: 0.2 }}
                                                className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <Label htmlFor="shopContact" className="text-sm font-semibold text-gray-700 mb-2 block">
                                                    যোগাযোগ নম্বর
                                                </Label>
                                                <Input
                                                    id="shopContact"
                                                    value={storeInfo.shopContact}
                                                    onChange={(e) => setStoreInfo((prev) => ({ ...prev, shopContact: e.target.value }))}
                                                    placeholder="১১ সংখ্যার মোবাইল নম্বর লিখুন"
                                                    className="text-base p-3 border border-gray-200 focus:border-indigo-500 bg-white focus:ring-indigo-500 rounded-lg"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">শুধুমাত্র ১১ সংখ্যার মোবাইল নম্বর গ্রহণযোগ্য</p>
                                            </motion.div>
                                        </div>

                                        <div className="space-y-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <Label htmlFor="shopImage" className="text-sm font-semibold text-gray-700 mb-2 block">
                                                    দোকানের ছবি
                                                </Label>
                                                <Input
                                                    id="shopImage"
                                                    type="file"
                                                    accept="image/jpeg,image/png"
                                                    onChange={handleImageUpload}
                                                    className="text-base p-3 border border-gray-200 focus:border-indigo-500 bg-white focus:ring-indigo-500 rounded-lg"
                                                    disabled={isUploading}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">শুধুমাত্র JPG/PNG, সর্বোচ্চ ৫ এমবি</p>
                                                {isUploading && (
                                                    <div className="text-center py-2">
                                                        <motion.div
                                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity }}
                                                        />
                                                        <p className="text-gray-500">ইমেজ আপলোড হচ্ছে...</p>
                                                    </div>
                                                )}
                                                {imagePreview && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="mt-4"
                                                    >
                                                        <img
                                                            src={imagePreview}
                                                            alt="Shop Preview"
                                                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                                        />
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        </div>
                                    </div>
                                </>
                            ) : currentStep === 2 ? (
                                <div className="">
                                    <h2 className="text-2xl text-center font-bold text-gray-800 mb-4">প্ল্যান তথ্য এবং ডিসকাউন্ট</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        <div className="space-y-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <div className="flex items-center mb-4">
                                                    <div className="p-2 bg-teal-100 rounded-lg">
                                                        <Package className="w-5 h-5 text-teal-600" />
                                                    </div>
                                                    <h3 className="ml-3 font-bold text-lg text-gray-800">নির্বাচিত প্ল্যান তথ্য</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="font-bold text-lg flex justify-center items-center bg-orange-500 text-white px-4 py-2 rounded-lg">{selectedPlan?.name || ''}</div>
                                                    <div className="font-bold text-lg text-gray-800 flex justify-center items-center bg-teal-100 px-4 py-2 rounded-lg">মূল মূল্য: ৳{selectedPlan?.price} TK</div>
                                                    {discount > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="font-bold text-lg text-green-600 flex justify-center items-center bg-green-100 px-4 py-2 rounded-lg"
                                                        >
                                                            ডিসকাউন্ট: ৳{discount} TK
                                                        </motion.div>
                                                    )}
                                                    <div className="font-bold text-lg text-gray-800 flex justify-center items-center bg-indigo-100 px-4 py-2 rounded-lg">পরিশোধ্য: ৳{payableAmount} TK</div>
                                                </div>
                                            </motion.div>
                                        </div>

                                        <div className="space-y-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <Label htmlFor="referralcode" className="text-sm font-semibold text-gray-700 mb-2 block">
                                                    রেফারেল কোড (ঐচ্ছিক)
                                                </Label>
                                                <Input
                                                    id="referralcode"
                                                    type="text"
                                                    placeholder="রেফারেল কোড লিখুন"
                                                    value={referralCode}
                                                    onChange={(e) => setReferralCode(e.target.value)}
                                                    className="text-base p-3 border border-gray-200 focus:border-indigo-500 bg-white focus:ring-indigo-500 rounded-lg"
                                                />
                                                <Button
                                                    onClick={() => handleCheckReferralCode(referralCode)}
                                                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                                                    disabled={!referralCode || isPaymentInfoLoading}
                                                >
                                                    যাচাই করুন
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="">
                                    <h2 className="text-2xl text-center font-bold text-gray-800 mb-4">পেমেন্ট করুন</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <div className="flex items-center mb-4">
                                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                                        <Gift className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <h3 className="ml-3 font-bold text-lg text-gray-800">আমাদের পেমেন্ট নাম্বার</h3>
                                                </div>
                                                {isPaymentInfoLoading ? (
                                                    <div className="text-center py-4">
                                                        <motion.div
                                                            className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto mb-2"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity }}
                                                        />
                                                        <p className="text-gray-500">লোড হচ্ছে...</p>
                                                    </div>
                                                ) : adminPaymentNumber ? (
                                                    <div className="space-y-4">
                                                        <div className="grid md:grid-cols-2 gap-2 items-center">
                                                            <div className="bg-red-700 p-4 rounded-lg">
                                                                <div className="flex items-center justify-between flex-col gap-4">
                                                                    <span className="font-semibold text-white justify-center flex items-center">🟢 bKash</span>
                                                                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                                                                        <span className="font-mono text-sm font-bold text-gray-700 mr-2">
                                                                            {adminPaymentNumber.bkashNumber}
                                                                        </span>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => navigator.clipboard.writeText(adminPaymentNumber.bkashNumber)}
                                                                            className="h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full"
                                                                        >
                                                                            <Copy className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="bg-orange-500 p-4 rounded-lg">
                                                                <div className="flex items-center justify-between flex-col gap-4">
                                                                    <span className="font-semibold text-white justify-center flex items-center">🔴 Nagad</span>
                                                                    <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm">
                                                                        <span className="font-mono text-sm font-bold text-gray-700 mr-2">
                                                                            {adminPaymentNumber.nagadNumber}
                                                                        </span>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => navigator.clipboard.writeText(adminPaymentNumber.nagadNumber)}
                                                                            className="h-8 w-8 p-0 bg-teal-600 hover:bg-teal-700 text-white rounded-full"
                                                                        >
                                                                            <Copy className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                            <p className="text-sm text-yellow-800 flex items-center">
                                                                📱 <span className="ml-2">"Send Money" অপশন ব্যবহার করে পেমেন্ট করুন এবং TxID সংরক্ষণ করুন</span>
                                                            </p>
                                                        </div>
                                                        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                                            <h3 className="font-bold text-lg text-indigo-800">পরিশোধ্য পরিমাণ: ৳{payableAmount} TK</h3>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-red-500 bg-red-50 p-3 rounded-lg">
                                                        ❌ পেমেন্ট তথ্য লোড করা যায়নি
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>

                                        <div className="space-y-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                                className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-100"
                                            >
                                                <Label className="text-sm font-semibold text-gray-700 mb-3 block">পেমেন্ট পদ্ধতি নির্বাচন করুন</Label>
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <motion.button
                                                        onClick={() => setPaymentMethod('bKash')}
                                                        className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center space-x-3 ${paymentMethod === 'bKash' ? 'bg-red-600 text-white shadow-lg' : 'bg-white hover:bg-indigo-50 border-gray-200 hover:border-indigo-300'}`}
                                                        disabled={isPaymentInfoLoading}
                                                        whileHover={{ scale: 1.02 }}
                                                    >
                                                        <div className={`w-3 h-3 rounded-full border-2 ${paymentMethod === 'bKash' ? 'bg-white border-white' : 'bg-transparent border-gray-400'}`}></div>
                                                        <span className="font-semibold">bKash</span>
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => setPaymentMethod('Nagad')}
                                                        className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center space-x-3 ${paymentMethod === 'Nagad' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white hover:bg-teal-50 border-gray-200 hover:border-teal-300'}`}
                                                        disabled={isPaymentInfoLoading}
                                                        whileHover={{ scale: 1.02 }}
                                                    >
                                                        <div className={`w-3 h-3 rounded-full border-2 ${paymentMethod === 'Nagad' ? 'bg-white border-white' : 'bg-transparent border-gray-400'}`}></div>
                                                        <span className="font-semibold">Nagad</span>
                                                    </motion.button>
                                                </div>
                                                {paymentMethod && adminPaymentNumber && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={copyPaymentNumber}
                                                        className="w-full bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 font-semibold rounded-lg"
                                                    >
                                                        📋 {getPaymentNumberForMethod().slice(0, 4)}**** নাম্বার কপি করুন
                                                    </Button>
                                                )}
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: 0.2 }}
                                                className="space-y-4"
                                            >
                                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                                                    <Label htmlFor="paymentRef" className="text-sm font-semibold text-gray-700 mb-2 block">
                                                        পেমেন্ট রেফারেন্স নাম্বার
                                                    </Label>
                                                    <Input
                                                        id="paymentRef"
                                                        value={paymentNumber}
                                                        onChange={(e) => setPaymentNumber(e.target.value)}
                                                        placeholder="Send Money এর পর পাওয়া রেফারেন্স নাম্বার"
                                                        className="text-base p-3 border border-gray-200 focus:border-indigo-500 bg-white focus:ring-indigo-500 rounded-lg"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Send Money করার সময় পাওয়া রেফারেন্স নাম্বার লিখুন</p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                                                    <Label htmlFor="transactionId" className="text-sm font-semibold text-gray-700 mb-2 block">
                                                        ট্রানজেকশন আইডি
                                                    </Label>
                                                    <Input
                                                        id="transactionId"
                                                        value={transactionId}
                                                        onChange={(e) => setTransactionId(e.target.value)}
                                                        placeholder="ট্রানজেকশন আইডি (১৬ অঙ্কের)"
                                                        className="text-base p-3 border border-gray-200 focus:border-indigo-500 bg-white focus:ring-indigo-500 rounded-lg"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">bKash/Nagad থেকে পাওয়া ১৬ অঙ্কের ট্রানজেকশন আইডি</p>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-6 border-t border-gray-200 rounded-b-2xl">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={currentStep === 1 ? handleCloseModal : () => setCurrentStep(currentStep - 1)}
                                    disabled={isLoading || isUploading}
                                    className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-100 rounded-lg font-semibold"
                                >
                                    {currentStep === 1 ? 'বাতিল করুন' : 'পিছনে'}
                                </Button>
                                {currentStep < 3 ? (
                                    <Button
                                        onClick={currentStep === 1 ? handleStoreInfoSubmit : handleNextToStep3}
                                        disabled={isLoading || isUploading}
                                        className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        <span>পরবর্তী</span>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handlePaymentSubmit}
                                        disabled={isLoading || !paymentMethod}
                                        className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <motion.div
                                                    className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                />
                                                <span>প্রসেসিং...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>পেমেন্ট নিশ্চিত করুন</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-3">
                                🔒 আপনার তথ্য সম্পূর্ণ নিরাপদে সংরক্ষিত হবে
                            </p>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>

            <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
                <DialogContent className="sm:max-w-md overflow-hidden max-h-[200px] ">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-6"
                    >
                        <h2 className="text-2xl font-bold text-green-600 mb-4">অভিনন্দন!</h2>
                        <p className="text-lg text-gray-700 mb-2">ডিসকাউন্ট: ৳{discount}</p>
                        <p className="text-lg text-gray-700">পরিশোধ্য পরিমাণ: ৳{payableAmount}</p>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MembershipPage;