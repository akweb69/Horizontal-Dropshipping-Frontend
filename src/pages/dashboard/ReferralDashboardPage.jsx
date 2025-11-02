import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Copy, DollarSign, Users, Gift, Loader2, Download, Send, X, CheckCircle, XCircle as XCircleIcon, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import axios from 'axios';
import Loader11 from '../../components/layout/Loader11';

// =================== FULLY FUNCTIONAL CUSTOM SELECT ===================
const Select = ({ value, onValueChange, children, placeholder = "Select an option", ...props }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedChild = React.Children.toArray(children).find(
        child => child && child.props && child.props.value === value
    );


    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                {...props}
            >
                <span className={value ? "text-gray-900 font-medium" : "text-gray-500"}>
                    {selectedChild?.props?.children || placeholder}
                </span>
                <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {React.Children.map(children, (child) => {
                        if (!child || !child.props) return null;
                        return React.cloneElement(child, {
                            onClick: () => {
                                onValueChange(child.props.value);
                                setIsOpen(false);
                            },
                        });
                    })}
                </div>
            )}
        </div>
    );
};

// Select Item
const SelectItem = ({ children, value, onClick, ...props }) => (
    <div
        onClick={onClick}
        className="px-4 py-2.5 text-left hover:bg-gray-100 cursor-pointer transition-colors duration-150"
        {...props}
    >
        {children}
    </div>
);
// =====================================================================

const ReferralDashboardPage = () => {
    const { user: authUser } = useAuth();
    const { toast } = useToast();
    const [userData, setUserData] = useState(null);
    const [withdrawHistory, setWithdrawHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [copyLoading, setCopyLoading] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [withdrawData, setWithdrawData] = useState({
        method: 'bkash',
        amount: '',
        number: ''
    });
    const [withdrawLoading, setWithdrawLoading] = useState(false);


    const [minimumWithdraw, setMinimumWithdraw] = useState(1000)
    const [runningBonus, setRunningBonus] = useState(0);
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/referral-bonus`)
            .then((res) => {
                setRunningBonus(res.data.bonus);
                console.log(res.data);
            })
            .catch((err) => {
                console.error('Error fetching referral bonus:', err);
            });

        axios.get(`${import.meta.env.VITE_BASE_URL}/minimum_withdraw_amount`)
            .then(res => {
                const data = res.data;
                setMinimumWithdraw(data.amount)
            })
    }, [])

    // Fetch user data
    useEffect(() => {
        if (!authUser?.email) {
            setLoading(false);
            return;
        }

        setLoading(true);
        axios.get(`${import.meta.env.VITE_BASE_URL}/users`)
            .then(res => {
                const users = res.data || [];
                const currentUser = users.find(u => u.email === authUser.email);
                if (currentUser) setUserData(currentUser);
            })
            .catch(err => {
                console.error(err);
                toast({ title: "ত্রুটি!", description: "রেফারেল ডেটা লোড করতে সমস্যা।", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    }, [authUser?.email, toast]);

    // Fetch withdraw history
    useEffect(() => {
        if (!authUser?.email) return;

        setHistoryLoading(true);
        axios.get(`${import.meta.env.VITE_BASE_URL}/refer-withdraw`)
            .then(res => {
                const allWithdraws = res.data || [];
                const userWithdraws = allWithdraws.filter(w => w.email === authUser.email);
                setWithdrawHistory(userWithdraws);
            })
            .catch(err => {
                console.error(err);
                toast({ title: "ত্রুটি!", description: "উত্তোলনের ইতিহাস লোড করতে সমস্যা।", variant: "destructive" });
            })
            .finally(() => setHistoryLoading(false));
    }, [authUser?.email, toast]);

    const referredUsers = userData?.myReferralUser || [];
    const referralCode = userData?.myReferralCode || 'N/A';
    const referIncome = userData?.referIncome || 0;

    const copyReferralCode = async () => {
        setCopyLoading(true);
        try {
            await navigator.clipboard.writeText(referralCode);
            toast({ title: "সফল!", description: "রেফারেল কোড কপি হয়েছে।" });
        } catch {
            toast({ title: "ত্রুটি!", description: "কোড কপি করতে সমস্যা।", variant: "destructive" });
        } finally {
            setCopyLoading(false);
        }
    };

    const handleWithdrawModalOpen = () => {
        if (referIncome < minimumWithdraw) {
            toast({
                title: "যোগ্য নয়!",
                description: `ন্যূনতম ${minimumWithdraw} টাকা প্রয়োজন। বর্তমান: ৳${referIncome}`,
                variant: "destructive"
            });
            return;
        }
        setWithdrawModalOpen(true);
    };

    const handleInputChange = (field, value) => {
        setWithdrawData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleWithdrawSubmit = async () => {
        const { method, amount, number } = withdrawData;

        if (!amount || parseFloat(amount) < minimumWithdraw) {
            toast({ title: "ত্রুটি!", description: `ন্যূনতম ${minimumWithdraw} টাকা।`, variant: "destructive" });
            return;
        }
        if (!number || number.length < 10) {
            toast({ title: "ত্রুটি!", description: "সঠিক নম্বর দিন।", variant: "destructive" });
            return;
        }
        if (parseFloat(amount) > referIncome) {
            toast({ title: "ত্রুটি!", description: "উত্তোলন আয়ের চেয়ে বেশি।", variant: "destructive" });
            return;
        }

        setWithdrawLoading(true);
        try {
            const payload = {
                email: authUser.email,
                name: userData.name,
                phone: userData.phone,
                method: method.toUpperCase(),
                amount: parseFloat(amount),
                number,
                status: 'Pending',
                requestDate: new Date().toISOString(),
                withdrawId: `REF-WD-${Date.now()}`
            };

            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/refer-withdraw`, payload);

            if (res.data.acknowledged) {
                toast({
                    title: "সফল!",
                    description: `উত্তোলনের অনুরোধ জমা দেওয়া হয়েছে। ID: ${payload.withdrawId}`
                });
                setWithdrawModalOpen(false);
                setWithdrawData({ method: 'bkash', amount: '', number: '' });
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (err) {
            console.error(err);
            toast({ title: "ত্রুটি!", description: "অনুরোধ জমা দিতে ব্যর্থ।", variant: "destructive" });
        } finally {
            setWithdrawLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('bn-BD', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Loader11></Loader11>
        );
    }

    if (!userData) {
        return (
            <div className="space-y-6">
                <Helmet><title>রেফারেল - UnicDropex</title></Helmet>
                <Card><CardContent className="text-center py-8 text-muted-foreground">ডেটা লোড করতে সমস্যা।</CardContent></Card>
            </div>
        );
    }

    return (
        <>
            <Helmet><title>রেফারেল প্রোগ্রাম - UnicDropex</title></Helmet>
            <div className="space-y-6 p-4 md:p-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">রেফারেল প্রোগ্রাম</h1>
                    <p className="text-muted-foreground">প্রতি রেফারেলে {runningBonus} টাকা বোনাস! আপনার বন্ধুদের আমন্ত্রণ জানান।</p>
                </div>


                <div className="max-w-[500px] mx-auto">
                    <div className=''>
                        <div className="w-full hover:translate-y-[-2px] hover:shadow-[6px_6px_12px_#a3b1c6,_-6px_-6px_12px_#ffffff] mx-auto p-[2px] rounded-2xl bg-[##e0e5ec]  border-none outline-none shadow-[5px_5px_10px_#a3b1c6,_-5px_-5px_10px_#ffffff]">
                            <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-4 md:p-6 overflow-hidden">
                                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                    <div
                                        className="absolute inset-0 opacity-30"
                                        style={{
                                            backgroundImage: `repeating-linear-gradient(
                                                    -45deg,
                                                    #f2f2f2 0px,
                                                    #dbe6f9 6px,
                                                    transparent 10px,
                                                    transparent 10px,
                                                    #f2f2f2 10px,
                                                    #f2f2f2 13px,
                                                    transparent 8px,
                                                    transparent 14px
                                                )`,
                                            backgroundSize: '20px 20px'
                                        }}
                                    ></div>
                                </div>
                                <div className="relative z-10">
                                    <p className="inline-block bg-orange-400 text-white text-sm font-semibold px-4 py-1 rounded-md">
                                        UnicDropex · <span>{authUser?.subscription?.plan}</span>
                                    </p>
                                    <div className="md:mt-6 mt-2 text-gray-600 tracking-widest text-lg font-semibold">
                                        ****** {authUser?.phone.slice(5, 11)}
                                    </div>
                                    <div className="flex justify-between items-center md:mt-6 mt-2">
                                        <div>
                                            <p className="text-gray-500 text-sm">CARD HOLDER</p>
                                            <p className="text-gray-800 font-semibold text-lg">{authUser?.name}</p>
                                        </div>
                                        {/* <div>
                                            <p className="text-gray-500 text-sm">EXPIRES</p>
                                            <p className="text-gray-800 font-semibold text-lg">

                                            </p>
                                        </div> */}
                                    </div>
                                    <div className="flex justify-between items-center md:mt-6 mt-2">
                                        <p className="text-gray-600 font-medium text-xl"> ইনকাম</p>
                                        <p className="text-orange-400 text-5xl md:text-6xl  font-extrabold">৳  {referIncome.toLocaleString("bn-BD")} </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-2 ">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">মোট রেফারেল আয়</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${referIncome >= minimumWithdraw ? 'text-green-600' : ''}`}>
                                ৳ {referIncome}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {referredUsers.length} জন × {runningBonus} = মোট আয়
                                {referIncome < minimumWithdraw && (
                                    <span className="block text-red-600">ন্যূনতম উত্তোলন: ৳{minimumWithdraw}</span>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">রেফার করা ব্যবহারকারী</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{referredUsers.length}</div>
                            <p className="text-xs text-muted-foreground">সফল সাইনআপ</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Referral Code */}
                <Card>
                    <CardHeader>
                        <CardTitle>আপনার রেফারেল কোড</CardTitle>
                        <CardDescription>শেয়ার করুন এবং বোনাস পান</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1">
                            <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input readOnly value={referralCode} className="pl-10 font-mono text-lg" />
                        </div>
                        <Button onClick={copyReferralCode} disabled={copyLoading} className="w-full sm:w-auto">
                            {copyLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                            কপি করুন
                        </Button>
                    </CardContent>
                </Card>

                {/* Referred Users */}
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle>রেফার করা ব্যবহারকারী</CardTitle>
                            <CardDescription>প্রত্যেকের জন্য {runningBonus} টাকা বোনাস</CardDescription>
                        </div>
                        <Button
                            onClick={handleWithdrawModalOpen}
                            disabled={referIncome < minimumWithdraw}
                            className={referIncome >= minimumWithdraw ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            উত্তোলন
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {referredUsers.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ইমেইল</TableHead>
                                        <TableHead>প্ল্যান</TableHead>
                                        <TableHead className="text-right">বোনাস</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {referredUsers.map((u, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{u.email}</TableCell>
                                            <TableCell>{u.planName}</TableCell>
                                            <TableCell className="text-right text-green-600 font-semibold">৳{runningBonus}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-right font-bold">মোট:</TableCell>
                                        <TableCell className="text-right text-green-600 font-bold">৳{referIncome}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="mx-auto h-12 w-12 mb-2" />
                                <p>কোনো রেফারেল নেই। কোড শেয়ার করুন!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Withdraw History */}
                <Card>
                    <CardHeader>
                        <CardTitle>উত্তোলনের ইতিহাস</CardTitle>
                        <CardDescription>আপনার সকল উত্তোলনের অনুরোধ</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {historyLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : withdrawHistory.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>পদ্ধতি</TableHead>
                                        <TableHead>পরিমাণ</TableHead>
                                        <TableHead>অনুরোধ</TableHead>
                                        <TableHead>অনুমোদন</TableHead>
                                        <TableHead className="text-center">স্ট্যাটাস</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {withdrawHistory.map(w => (
                                        <TableRow key={w._id}>
                                            <TableCell className="font-mono text-xs">{w.withdrawId}</TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-1">
                                                    {w.method === 'BKASH' ? 'বিকাশ' : 'নগদ'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-semibold">৳{w.amount}</TableCell>
                                            <TableCell className="text-xs">{formatDate(w.requestDate)}</TableCell>
                                            <TableCell className="text-xs">{formatDate(w.approvedAt)}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                                    ${w.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        w.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {w.status === 'Approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {w.status === 'Rejected' && <XCircleIcon className="w-3 h-3 mr-1" />}
                                                    {w.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                                                    {w.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <DollarSign className="mx-auto h-12 w-12 mb-2" />
                                <p>কোনো উত্তোলনের অনুরোধ নেই।</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ================ WITHDRAW MODAL - FULLY WORKING ================ */}
                <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
                    <DialogContent className="max-w-[550px] max-h-[500px] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between text-xl">
                                উত্তোলনের অনুরোধ

                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                ন্যূনতম {minimumWithdraw} টাকা। বর্তমান আয়: <strong className="text-green-600">৳{referIncome}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5 py-4">
                            {/* Payment Method - NOW WORKING */}
                            <div className="space-y-2">
                                <Label htmlFor="method" className="font-medium">পদ্ধতি</Label>
                                <Select
                                    value={withdrawData.method}
                                    onValueChange={(v) => handleInputChange('method', v)}
                                    placeholder="পদ্ধতি নির্বাচন করুন"
                                >
                                    <SelectItem value="bkash">বিকাশ</SelectItem>
                                    <SelectItem value="nagad">নগদ</SelectItem>
                                </Select>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="font-medium">পরিমাণ (৳)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder={`ন্যূনতম ${minimumWithdraw}`}
                                    value={withdrawData.amount}
                                    onChange={e => handleInputChange('amount', e.target.value)}
                                    min={minimumWithdraw}
                                    max={referIncome}
                                    className="text-lg"
                                />
                            </div>

                            {/* Number - Dynamic Label */}
                            <div className="space-y-2">
                                <Label htmlFor="number" className="font-medium">
                                    {withdrawData.method === 'bkash' ? 'বিকাশ' : 'নগদ'} নম্বর
                                </Label>
                                <Input
                                    id="number"
                                    type="tel"
                                    placeholder="01XXXXXXXXX"
                                    value={withdrawData.number}
                                    onChange={e => handleInputChange('number', e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex gap-3 sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setWithdrawModalOpen(false)}
                                disabled={withdrawLoading}
                                className="px-6"
                            >
                                বাতিল
                            </Button>
                            <Button
                                onClick={handleWithdrawSubmit}
                                disabled={withdrawLoading || !withdrawData.amount || !withdrawData.number}
                                className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                {withdrawLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        জমা দিচ্ছে...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        উত্তোলন করুন
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default ReferralDashboardPage;