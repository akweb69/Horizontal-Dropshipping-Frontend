import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, Star, Package, Truck, Zap, Gift, Copy, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

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
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [paymentNumber, setPaymentNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPaymentInfoLoading, setIsPaymentInfoLoading] = useState(true);
    const [adminPaymentNumber, setAdminPaymentNumber] = useState(null);

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

    const plans = [
        {
            name: 'বেসিক মেম্বার',
            price: '৪৯৯',
            benefits: [
                'সকল পণ্যের দাম দেখুন',
                'সাধারণ গ্রাহক সাপোর্ট',
                'মাসিক নিউজলেটার'
            ],
            recommended: false
        },
        {
            name: 'প্রো সেলার',
            price: '৯৯৯',
            benefits: [
                'সকল বেসিক সুবিধা',
                'অগ্রাধিকার গ্রাহক সাপোর্ট',
                'বিশেষ ডিসকাউন্ট',
                'সাপ্তাহিক বিক্রয় রিপোর্ট'
            ],
            recommended: true
        },
        {
            name: 'প্রিমিয়াম পার্টনার',
            price: '১৯৯৯',
            benefits: [
                'সকল প্রো সুবিধা',
                'ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার',
                'নতুন পণ্যে আর্লি অ্যাক্সেস',
                'ফ্রি ডেলিভারি (শর্ত প্রযোজ্য)'
            ],
            recommended: false
        },
    ];

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
        setPaymentMethod('');
        setTransactionId('');
        setPaymentNumber('');
        setIsModalOpen(true);
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
        // Validation
        if (!paymentMethod || !transactionId || !paymentNumber || !amount) {
            toast({
                title: "❌ ত্রুটি",
                description: "সকল ফিল্ড পূরণ করুন",
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
                packageStatus: 'pending'
            };

            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/buy-package`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth header if needed
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(paymentData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Payment submission failed');
            }

            await becomeMember();
            toast({
                title: `🎉 অভিনন্দন, ${user.name}!`,
                description: `আপনি সফলভাবে "${selectedPlan.name}" প্ল্যানটি কিনেছেন। আমরা আপনার পেমেন্ট যাচাই করব।`,
            });

            // Reset form and close modal
            handleCloseModal();

            // Optionally redirect or refresh
            // navigate('/dashboard');

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
        setPaymentMethod('');
        setTransactionId('');
        setPaymentNumber('');
        setAmount('');
        setSelectedPlan(null);
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

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">কেন মেম্বার হবেন?</h2>
                            <p className="text-gray-600 mb-6">
                                আমাদের মেম্বারশিপ শুধু একটি সাবস্ক্রিপশন নয়, এটি আপনার ব্যবসার সাফল্যের চাবিকাঠি।
                                আমরা আপনাকে এমন সব টুলস এবং সুবিধা দিই যা আপনার ব্যবসাকে পরবর্তী স্তরে নিয়ে যেতে সাহায্য করবে।
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <Star className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold">সেরা মূল্য</h3>
                                        <p className="text-gray-600 text-sm">
                                            সদস্যরা পাইকারি মূল্যে পণ্য কেনার সুযোগ পান, যা আপনার লাভের মার্জিন বাড়াতে সাহায্য করে।
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Package className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold">এক্সক্লুসিভ পণ্য</h3>
                                        <p className="text-gray-600 text-sm">
                                            শুধুমাত্র সদস্যদের জন্য সংরক্ষিত ট্রেন্ডিং এবং উচ্চ-চাহিদার পণ্যগুলিতে অ্যাক্সেস পান।
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Truck className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold">দ্রুত ডেলিভারি</h3>
                                        <p className="text-gray-600 text-sm">
                                            আপনার অর্ডারগুলি অগ্রাধিকার ভিত্তিতে প্রসেস করা হয়, যা গ্রাহক সন্তুষ্টি বাড়ায়।
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                alt="একজন ব্যক্তি ল্যাপটপে কাজ করছেন"
                                className="rounded-xl shadow-lg w-full h-auto"
                                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {isAuthenticated && user?.myReferralCode && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-lg p-8 text-center"
                        >
                            <Gift className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">আপনার রেফারেল লিঙ্ক শেয়ার করুন</h2>
                            <p className="text-gray-600 mb-6">
                                আপনার বন্ধুদের রেফার করে আয় করুন! আপনার লিঙ্ক থেকে কেউ সাইন আপ করলে আপনি পাবেন আকর্ষণীয় বোনাস।
                            </p>
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-md">
                                    <input
                                        type="text"
                                        value={`https://letsdropship.com/signup?ref=${user.myReferralCode}`}
                                        readOnly
                                        className="w-full bg-slate-100 border border-gray-300 rounded-lg py-3 pl-4 pr-12 text-gray-700 focus:outline-none"
                                    />
                                    <Button
                                        onClick={copyReferralLink}
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">পেমেন্ট সম্পন্ন করুন</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Payment Numbers Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2 text-gray-800">আমাদের পেমেন্ট নাম্বার:</h3>
                            {isPaymentInfoLoading ? (
                                <div className="text-center py-4">লোড হচ্ছে...</div>
                            ) : adminPaymentNumber ? (
                                <>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm">বিকাশ:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm">{adminPaymentNumber.bkashNumber}</span>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => navigator.clipboard.writeText(adminPaymentNumber.bkashNumber)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm">নগদ:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm">{adminPaymentNumber.nagadNumber}</span>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => navigator.clipboard.writeText(adminPaymentNumber.nagadNumber)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        📱 "Send Money" অপশন ব্যবহার করে পেমেন্ট করুন
                                    </p>
                                </>
                            ) : (
                                <div className="text-red-500 text-sm">পেমেন্ট তথ্য লোড করা যায়নি</div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="plan">নির্বাচিত প্ল্যান</Label>
                            <Input id="plan" value={selectedPlan?.name || ''} readOnly className="bg-gray-50" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">পরিমাণ</Label>
                            <Input id="amount" value={`৳${amount}`} readOnly className="bg-gray-50" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentMethod">পেমেন্ট পদ্ধতি</Label>
                            <select
                                id="paymentMethod"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                disabled={isPaymentInfoLoading}
                            >
                                <option value="">পেমেন্ট পদ্ধতি নির্বাচন করুন</option>
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                            </select>
                            {paymentMethod && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={copyPaymentNumber}
                                    className="mt-1"
                                    disabled={!adminPaymentNumber}
                                >
                                    📋 নাম্বার কপি করুন
                                </Button>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentRef">পেমেন্ট রেফারেন্স নাম্বার</Label>
                            <Input
                                id="paymentRef"
                                value={paymentNumber}
                                onChange={(e) => setPaymentNumber(e.target.value)}
                                placeholder="Send Money এর পর পাওয়া রেফারেন্স নাম্বার"
                                className="text-sm"
                            />
                            <p className="text-xs text-gray-500">
                                Send Money করার সময় পাওয়া রেফারেন্স নাম্বার লিখুন
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="transactionId">ট্রানজেকশন আইডি</Label>
                            <Input
                                id="transactionId"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="ট্রানজেকশন আইডি (১৬ অঙ্কের)"
                                className="text-sm"
                            />
                            <p className="text-xs text-gray-500">
                                bKash/Nagad থেকে পাওয়া ১৬ অঙ্কের ট্রানজেকশন আইডি
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCloseModal}
                            disabled={isLoading}
                        >
                            বাতিল
                        </Button>
                        <Button
                            onClick={handlePaymentSubmit}
                            disabled={isLoading || !paymentMethod}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    প্রসেসিং...
                                </>
                            ) : (
                                'পেমেন্ট নিশ্চিত করুন'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MembershipPage;