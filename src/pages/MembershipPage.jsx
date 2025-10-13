import React, { useState } from 'react';
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

const MembershipPlan = ({ plan, onBuyNow }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-white rounded-xl shadow-lg p-8 border-2 ${plan.recommended ? 'border-orange-500' : 'border-transparent'}`}
    >
        {plan.recommended && (
            <div className="text-center mb-4">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">সবচেয়ে জনপ্রিয়</span>
            </div>
        )}
        <h2 className="text-2xl font-bold text-gray-800 text-center">{plan.name}</h2>
        <p className="text-4xl font-extrabold text-gray-900 text-center my-4">৳{plan.price}<span className="text-lg font-normal text-gray-500">/বছর</span></p>
        <ul className="space-y-3 mb-8">
            {plan.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
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

    const sendNumber = '01768037870';

    const plans = [
        { name: 'বেসিক মেম্বার', price: '৪৯৯', benefits: ['সকল পণ্যের দাম দেখুন', 'সাধারণ গ্রাহক সাপোর্ট', 'মাসিক নিউজলেটার'], recommended: false },
        { name: 'প্রো সেলার', price: '৯৯৯', benefits: ['সকল বেসিক সুবিধা', 'অগ্রাধিকার গ্রাহক সাপোর্ট', 'বিশেষ ডিসকাউন্ট', 'সাপ্তাহিক বিক্রয় রিপোর্ট'], recommended: true },
        { name: 'প্রিমিয়াম পার্টনার', price: '১৯৯৯', benefits: ['সকল প্রো সুবিধা', 'ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার', 'নতুন পণ্যে আর্লি অ্যাক্সেস', 'ফ্রি ডেলিভারি (শর্ত প্রযোজ্য)'], recommended: false },
    ];

    const handleBuyNow = (plan) => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/membership');
        } else {
            setSelectedPlan(plan);
            setAmount(plan.price);
            setIsModalOpen(true);
        }
    };

    const copyPaymentNumber = () => {
        navigator.clipboard.writeText(sendNumber);
        toast({
            title: "✅ পেমেন্ট নাম্বার কপি করা হয়েছে!",
            description: `নাম্বার: ${sendNumber}`,
        });
    };

    const handlePaymentSubmit = async () => {
        if (!paymentMethod || !transactionId || !amount) {
            toast({
                title: "❌ ত্রুটি",
                description: "সকল ফিল্ড পূরণ করুন",
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
                },
                body: JSON.stringify(paymentData),
            });

            if (response.ok) {
                becomeMember();
                toast({
                    title: `🎉 অভিনন্দন, ${user.name}!`,
                    description: `আপনি সফলভাবে "${selectedPlan.name}" প্ল্যানটি কিনেছেন।`,
                });
                setIsModalOpen(false);
                setPaymentMethod('');
                setTransactionId('');
                setAmount('');
            } else {
                throw new Error('Payment submission failed');
            }
        } catch (error) {
            toast({
                title: "❌ পেমেন্ট ব্যর্থ",
                description: "দয়া করে আবার চেষ্টা করুন অথবা সাপোর্ট টিমের সাথে যোগাযোগ করুন",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyReferralLink = () => {
        navigator.clipboard.writeText(`https://letsdropship.com/signup?ref=${user.referralCode}`);
        toast({
            title: "✅ লিঙ্ক কপি করা হয়েছে!",
            description: "আপনার বন্ধুদের সাথে রেফারেল লিঙ্ক শেয়ার করুন।",
        });
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
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">আমাদের এক্সক্লুসিভ মেম্বার হোন</h1>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">বিশেষ সুবিধা, সেরা ডিল এবং আপনার ব্যবসার প্রসারে প্রয়োজনীয় সকল টুলস পেতে আজই আমাদের মেম্বারশিপ গ্রহণ করুন।</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {plans.map((plan, index) => (
                            <MembershipPlan key={index} plan={plan} onBuyNow={handleBuyNow} />
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">কেন মেম্বার হবেন?</h2>
                            <p className="text-gray-600 mb-6">আমাদের মেম্বারশিপ শুধু একটি সাবস্ক্রিপশন নয়, এটি আপনার ব্যবসার সাফল্যের চাবিকাঠি। আমরা আপনাকে এমন সব টুলস এবং সুবিধা দিই যা আপনার ব্যবসাকে পরবর্তী স্তরে নিয়ে যেতে সাহায্য করবে।</p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4"><Star className="w-6 h-6 text-yellow-500 mt-1 shrink-0" /><div><h3 className="font-semibold">সেরা মূল্য</h3><p className="text-gray-600">সদস্যরা পাইকারি মূল্যে পণ্য কেনার সুযোগ পান, যা আপনার লাভের মার্জিন বাড়াতে সাহায্য করে।</p></div></div>
                                <div className="flex items-start gap-4"><Package className="w-6 h-6 text-blue-500 mt-1 shrink-0" /><div><h3 className="font-semibold">এক্সক্লুসিভ পণ্য</h3><p className="text-gray-600">শুধুমাত্র সদস্যদের জন্য সংরক্ষিত ট্রেন্ডিং এবং উচ্চ-চাহিদার পণ্যগুলিতে অ্যাক্সেস পান।</p></div></div>
                                <div className="flex items-start gap-4"><Truck className="w-6 h-6 text-green-500 mt-1 shrink-0" /><div><h3 className="font-semibold">দ্রুত ডেলিভারি</h3><p className="text-gray-600">আপনার অর্ডারগুলি অগ্রাধিকার ভিত্তিতে প্রসেস করা হয়, যা গ্রাহক সন্তুষ্টি বাড়ায়।</p></div></div>
                            </div>
                        </div>
                        <div>
                            <img alt="একজন ব্যক্তি ল্যাপটপে কাজ করছেন" className="rounded-xl shadow-lg" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3" />
                        </div>
                    </div>

                    {isAuthenticated && user && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-lg p-8 text-center"
                        >
                            <Gift className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800">আপনার রেফারেল লিঙ্ক শেয়ার করুন</h2>
                            <p className="text-gray-600 mt-2 mb-6">আপনার বন্ধুদের রেফার করে আয় করুন! আপনার লিঙ্ক থেকে কেউ সাইন আপ করলে আপনি পাবেন আকর্ষণীয় বোনাস।</p>
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-md">
                                    <input
                                        type="text"
                                        value={`https://letsdropship.com/signup?ref=${user.referralCode}`}
                                        readOnly
                                        className="w-full bg-slate-100 border border-gray-300 rounded-lg py-3 pl-4 pr-12 text-gray-700"
                                    />
                                    <Button onClick={copyReferralLink} size="icon" className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <Copy className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>পেমেন্ট সম্পন্ন করুন</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">পেমেন্ট নাম্বার: {sendNumber}</h3>
                                <p className="text-sm text-gray-600">এই নাম্বারে পেমেন্ট পাঠান - সেন্ড মানি করতে হবে।</p>
                            </div>
                            <Button onClick={copyPaymentNumber} size="sm">
                                <Copy className="w-4 h-4 mr-2" /> কপি
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="plan">প্ল্যান</Label>
                            <Input id="plan" value={selectedPlan?.name} readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount">পরিমাণ</Label>
                            <Input id="amount" value={amount} readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="paymentMethod">পেমেন্ট পদ্ধতি</Label>
                            <select
                                id="paymentMethod"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">পেমেন্ট পদ্ধতি নির্বাচন করুন</option>
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transactionId">আপনার পেমেন্ট নাম্বার লিখুন</Label>
                            <Input
                                id="transactionId"
                                value={paymentNumber}
                                onChange={(e) => setPaymentNumber(e.target.value)}
                                placeholder="আপনার পেমেন্ট নাম্বার লিখুন"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transactionId">ট্রানজেকশন আইডি</Label>
                            <Input
                                id="transactionId"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="ট্রানজেকশন আইডি লিখুন"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            বাতিল
                        </Button>
                        <Button onClick={handlePaymentSubmit} disabled={isLoading}>
                            {isLoading ? 'প্রসেসিং...' : 'পেমেন্ট নিশ্চিত করুন'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MembershipPage;