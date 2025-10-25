import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, Star, Package, Truck, Gift, Copy, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
        className={`bg-white rounded-xl shadow-lg p-8 border-2 ${plan.recommended ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'} flex flex-col justify-between hover:shadow-xl transition-shadow duration-300`}
    >
        <div>
            {plan.recommended && (
                <div className="text-center mb-4">
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">সবচেয়ে জনপ্রিয়</span>
                </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800 text-center">{plan.name}</h2>
            <p className="text-4xl font-extrabold text-gray-900 text-center my-4">
                ৳{plan.price}<span className="text-lg font-normal text-gray-500">/{plan.validityDays}দিন</span>
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
        <Button onClick={() => onBuyNow(plan)} size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
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
    const [isDiscountApplied, setIsDiscountApplied] = useState(false);
    const [invite_user_email, set_invite_user_email] = useState('');

    useEffect(() => {
        fetchPaymentNumbers();
        fetchAllUser();
    }, []);

    const fetchAllUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`);
            if (response.data && response.data.length > 0) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.error('User fetch error:', error);
        }
    };

    const handleCheckReferralCode = () => {
        if (!selectedPlan) return;
        const foundUser = allUsers.find(u => u.myReferralCode === referralCode);
        if (foundUser && discount === 0) {
            const newDiscount = 50;
            setDiscount(newDiscount);
            setIsDiscountApplied(true);
            set_invite_user_email(foundUser.email);
            setPayableAmount(selectedPlan.price - newDiscount);
            toast({
                title: "সফল",
                description: "রেফারেল কোড যাচাই হয়েছে! ডিসকাউন্ট প্রয়োগ করা হয়েছে।",
            });
            setShowCongrats(true);
            setTimeout(() => setShowCongrats(false), 1500);
        } else if (!foundUser) {
            setIsDiscountApplied(false);
            toast({
                title: "ত্রুটি",
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
            }
        } catch (error) {
            console.error('Payment number fetch error:', error);
            toast({
                title: "ত্রুটি",
                description: "পেমেন্ট তথ্য লোড করতে সমস্যা হয়েছে।",
                variant: "destructive"
            });
        } finally {
            setIsPaymentInfoLoading(false);
        }
    };

    const [plans, setPlans] = useState([]);
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/manage-package`)
            .then(res => setPlans(res.data))
            .catch(() => toast({ title: "ত্রুটি", description: "প্যাকেজ লোড করতে ব্যর্থ", variant: "destructive" }));
    }, []);

    const handleBuyNow = (plan) => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/membership');
            return;
        }
        if (!adminPaymentNumber) {
            toast({ title: "ত্রুটি", description: "পেমেন্ট তথ্য লোড হয়নি।", variant: "destructive" });
            return;
        }

        setSelectedPlan(plan);
        setPayableAmount(plan.price);
        setDiscount(0);
        setCurrentStep(1);
        setReferralCode('');
        setPaymentMethod('');
        setTransactionId('');
        setPaymentNumber('');
        setImagePreview(null);

        if (user?.isMember && user?.storeInfo) {
            setStoreInfo(user.storeInfo);
            setImagePreview(user.storeInfo.shopImage);
        } else {
            setStoreInfo({ shopName: '', shopAddress: '', shopContact: '', shopImage: '' });
        }

        setIsModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            toast({ title: "ত্রুটি", description: "শুধুমাত্র JPG/PNG", variant: "destructive" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "ত্রুটি", description: "ইমেজ ৫ এমবি-এর বেশি হবে না", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('https://api.imgbb.com/1/upload', formData, {
                params: { key: import.meta.env.VITE_IMGBB_API_KEY },
            });
            if (res.data.success) {
                const url = res.data.data.url;
                setStoreInfo(prev => ({ ...prev, shopImage: url }));
                setImagePreview(url);
                toast({ title: "সফল", description: "ইমেজ আপলোড হয়েছে" });
            }
        } catch (error) {
            toast({ title: "ত্রুটি", description: "ইমেজ আপলোড ব্যর্থ", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleStoreInfoSubmit = () => {
        const { shopName, shopAddress, shopContact, shopImage } = storeInfo;
        if (!shopName || !shopAddress || !shopContact || !shopImage) {
            toast({ title: "ত্রুটি", description: "সকল স্টোর তথ্য পূরণ করুন", variant: "destructive" });
            return;
        }
        if (!/^\d{11}$/.test(shopContact)) {
            toast({ title: "ত্রুটি", description: "১১ সংখ্যার মোবাইল নম্বর দিন", variant: "destructive" });
            return;
        }
        setCurrentStep(2);
    };

    const copyPaymentNumber = () => {
        if (!paymentMethod || !adminPaymentNumber) return;
        const number = paymentMethod === 'bKash' ? adminPaymentNumber.bkashNumber : adminPaymentNumber.nagadNumber;
        navigator.clipboard.writeText(number).then(() => {
            toast({ title: "কপি হয়েছে!", description: `${paymentMethod}: ${number}` });
        });
    };

    const handlePaymentSubmit = async () => {
        if (!paymentMethod || !transactionId || !paymentNumber) {
            toast({ title: "ত্রুটি", description: "সকল পেমেন্ট তথ্য পূরণ করুন", variant: "destructive" });
            return;
        }
        if (transactionId.length < 8) {
            toast({ title: "ত্রুটি", description: "ট্রানজেকশন আইডি কমপক্ষে ৮ অঙ্কের", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                email: user.email,
                planName: selectedPlan.name,
                amount: payableAmount,
                paymentMethod,
                transactionId,
                paymentNumber,
                timestamp: new Date().toISOString(),
                packageStatus: 'pending',
                storeInfo,
                use_refferal: isDiscountApplied,
                invite_user_email: invite_user_email,
                validityDays: selectedPlan.validityDays,
            };

            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/buy-package`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Payment submission failed');

            await becomeMember();

            Swal.fire({
                title: `অভিনন্দন, ${user.name}!`,
                text: `আপনি "${selectedPlan.name}" প্ল্যান কিনেছেন। ২৪ ঘণ্টার মধ্যে যাচাই করা হবে।`,
                icon: "success",
            });

            handleCloseModal();
        } catch (error) {
            toast({ title: "পেমেন্ট ব্যর্থ", description: error.message || "আবার চেষ্টা করুন", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentStep(1);
        setSelectedPlan(null);
        setPaymentMethod('');
        setTransactionId('');
        setPaymentNumber('');
        setPayableAmount(0);
        setDiscount(0);
        setReferralCode('');
        setStoreInfo({ shopName: '', shopAddress: '', shopContact: '', shopImage: '' });
        setImagePreview(null);
    };

    return (
        <>
            <Helmet>
                <title>মেম্বারশিপ - LetsDropship</title>
                <meta name="description" content="বিশেষ সুবিধা উপভোগ করুন এবং সকল পণ্যের দাম দেখুন।" />
            </Helmet>

            <div className="bg-gray-50 py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            আমাদের এক্সক্লুসিভ মেম্বার হোন
                        </h1>
                        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                            বিশেষ সুবিধা, সেরা ডিল এবং ব্যবসার প্রসারে প্রয়োজনীয় সকল টুলস।
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {plans.map((plan, i) => (
                            <MembershipPlan key={i} plan={plan} onBuyNow={handleBuyNow} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-0">
                    <div className="p-6">
                        {/* Step Indicator */}
                        <div className="flex justify-center mb-6">
                            {[1, 2, 3].map((step) => (
                                <React.Fragment key={step}>
                                    <motion.div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                                        animate={{ scale: currentStep === step ? 1.1 : 1 }}
                                    >
                                        {step}
                                    </motion.div>
                                    {step < 3 && (
                                        <div className="w-16 h-1 bg-gray-200 mx-1">
                                            <motion.div
                                                className="h-full bg-orange-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: currentStep > step ? '100%' : '0%' }}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Step 1: Store Info */}
                        {currentStep === 1 && (
                            <div>
                                <h2 className="text-2xl font-bold text-center mb-6">
                                    {user?.isMember ? 'আপনার স্টোর তথ্য' : 'স্টোর তথ্য দিন'}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        {['shopName', 'shopAddress', 'shopContact'].map((field, i) => (
                                            <motion.div
                                                key={field}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-gray-50 p-5 rounded-xl border"
                                            >
                                                <Label className="block mb-2">
                                                    {field === 'shopName' ? 'দোকানের নাম' : field === 'shopAddress' ? 'ঠিকানা' : 'যোগাযোগ নম্বর'}
                                                </Label>
                                                <Input
                                                    value={storeInfo[field]}
                                                    onChange={(e) => setStoreInfo(prev => ({ ...prev, [field]: e.target.value }))}
                                                    placeholder={field === 'shopContact' ? '১১ সংখ্যার মোবাইল' : ''}
                                                    readOnly={user?.isMember}
                                                    className="bg-white"
                                                />
                                                {field === 'shopContact' && <p className="text-xs text-gray-500 mt-1">১১ সংখ্যার মোবাইল নম্বর</p>}
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div>
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-50 p-5 rounded-xl border">
                                            <Label>দোকানের ছবি</Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={isUploading || user?.isMember}
                                                className="mt-2"
                                            />
                                            {isUploading && <p className="text-sm text-indigo-600 mt-2">আপলোড হচ্ছে...</p>}
                                            {imagePreview && (
                                                <img src={imagePreview} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
                                            )}
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Plan & Referral */}
                        {currentStep === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-3 flex items-center">
                                        <Package className="w-5 h-5 mr-2 text-teal-600" /> নির্বাচিত প্ল্যান
                                    </h3>
                                    <div className="space-y-2 text-center">
                                        <p className="bg-orange-500 text-white py-2 rounded">{selectedPlan?.name}</p>
                                        <p className="bg-teal-100 py-2 rounded">মূল মূল্য: ৳{selectedPlan?.price}</p>
                                        {discount > 0 && <p className="bg-green-100 text-green-700 py-2 rounded">ডিসকাউন্ট: ৳{discount}</p>}
                                        <p className="bg-indigo-100 py-2 rounded">পরিশোধ্য: ৳{payableAmount}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label>রেফারেল কোড (ঐচ্ছিক)</Label>
                                    <Input
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value)}
                                        placeholder="কোড লিখুন"
                                        className="mt-2"
                                    />
                                    <Button onClick={handleCheckReferralCode} className="w-full mt-3" disabled={!referralCode}>
                                        যাচাই করুন
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {currentStep === 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-3 flex items-center">
                                        <Gift className="w-5 h-5 mr-2 text-indigo-600" /> পেমেন্ট নম্বর
                                    </h3>
                                    {isPaymentInfoLoading ? (
                                        <p className="text-center">লোড হচ্ছে...</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {['bKash', 'Nagad'].map((method) => (
                                                <div key={method} className={`p-3 rounded-lg ${method === 'bKash' ? 'bg-red-700' : 'bg-orange-500'} text-white`}>
                                                    <div className="flex justify-between items-center">
                                                        <span>{method === 'bKash' ? 'bKash' : 'Nagad'}</span>
                                                        <Button size="sm" onClick={() => navigator.clipboard.writeText(adminPaymentNumber[method.toLowerCase() + 'Number'])}>
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="font-mono mt-1">{adminPaymentNumber[method.toLowerCase() + 'Number']}</p>
                                                </div>
                                            ))}
                                            <p className="text-sm bg-yellow-50 p-2 rounded">Send Money করে TxID সংরক্ষণ করুন</p>
                                            <p className="text-lg font-bold bg-indigo-50 p-2 rounded text-center">পরিশোধ্য: ৳{payableAmount}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label>পেমেন্ট পদ্ধতি</Label>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {['bKash', 'Nagad'].map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => setPaymentMethod(m)}
                                                    className={`p-3 rounded border-2 ${paymentMethod === m ? 'bg-orange-600 text-white' : 'bg-white'} `}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Input
                                        placeholder="পেমেন্ট নম্বর"
                                        value={paymentNumber}
                                        onChange={(e) => setPaymentNumber(e.target.value)}
                                    />
                                    <Input
                                        placeholder="ট্রানজেকশন আইডি"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-6 border-t">
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={currentStep === 1 ? handleCloseModal : () => setCurrentStep(prev => prev - 1)} className="flex-1">
                                {currentStep === 1 ? 'বাতিল' : 'পিছনে'}
                            </Button>
                            {currentStep < 3 ? (
                                <Button onClick={currentStep === 1 ? handleStoreInfoSubmit : () => setCurrentStep(3)} className="flex-1 bg-orange-600 text-white">
                                    পরবর্তী
                                </Button>
                            ) : (
                                <Button onClick={handlePaymentSubmit} disabled={isLoading} className="flex-1 bg-green-600 text-white">
                                    {isLoading ? 'প্রসেসিং...' : 'পেমেন্ট নিশ্চিত করুন'}
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Congrats Modal */}
            <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
                <DialogContent className="text-center">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                        <h2 className="text-2xl font-bold text-green-600">অভিনন্দন!</h2>
                        <p className="mt-2">ডিসকাউন্ট: ৳{discount}</p>
                        <p>পরিশোধ্য: ৳{payableAmount}</p>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MembershipPage;