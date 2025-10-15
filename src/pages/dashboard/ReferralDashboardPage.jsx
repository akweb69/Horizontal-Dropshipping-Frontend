import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Copy, DollarSign, Users, Gift, Loader2, Download, Send, X } from 'lucide-react';
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

// Custom Select Component (Fallback)
const Select = ({ children, value, onValueChange, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedValue = React.Children.toArray(children).find(child =>
        child.props.value === value
    );

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 border border-gray-300 rounded-md text-left bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...props}
            >
                {selectedValue?.props.children || 'Select an option'}
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {React.Children.map(children, child =>
                        React.cloneElement(child, {
                            onClick: () => {
                                onValueChange(child.props.value);
                                setIsOpen(false);
                            },
                            className: "w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const SelectTrigger = ({ children, ...props }) => <>{children}</>;
const SelectValue = ({ children }) => children;
const SelectContent = ({ children }) => children;
const SelectItem = ({ children, value, onClick, ...props }) => (
    <div onClick={onClick} className="px-4 py-2 hover:bg-gray-100 cursor-pointer" {...props}>
        {children}
    </div>
);

const ReferralDashboardPage = () => {
    const { user: authUser } = useAuth();
    const { toast } = useToast();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copyLoading, setCopyLoading] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [withdrawData, setWithdrawData] = useState({
        method: 'bkash',
        amount: '',
        number: ''
    });
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    // Fetch full user data from /users API
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
                if (currentUser) {
                    setUserData(currentUser);
                }
            })
            .catch(err => {
                console.error('Error fetching users:', err);
                toast({
                    title: "ত্রুটি!",
                    description: "রেফারেল ডেটা লোড করতে সমস্যা হয়েছে।",
                    variant: "destructive"
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [authUser?.email, toast]);

    const referredUsers = userData?.myReferralUser || [];
    const referralCode = userData?.myReferralCode || 'N/A';
    const referIncome = referredUsers.length * 50;
    const minimumWithdraw = 1000;

    const copyReferralCode = async () => {
        setCopyLoading(true);
        try {
            await navigator.clipboard.writeText(referralCode);
            toast({
                title: "সফল!",
                description: "আপনার রেফারেল কোড কপি করা হয়েছে।",
            });
        } catch (err) {
            toast({
                title: "ত্রুটি!",
                description: "কোড কপি করতে সমস্যা হয়েছে।",
                variant: "destructive"
            });
        } finally {
            setCopyLoading(false);
        }
    };

    const handleWithdrawModalOpen = () => {
        if (referIncome < minimumWithdraw) {
            toast({
                title: "যোগ্য নয়!",
                description: `ন্যূনতম ${minimumWithdraw} টাকা থাকতে হবে উত্তোলনের জন্য। বর্তমান আয়: ৳${referIncome}`,
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

        // Validation
        if (!amount || parseFloat(amount) < minimumWithdraw) {
            toast({
                title: "ত্রুটি!",
                description: `উত্তোলনের পরিমাণ ন্যূনতম ${minimumWithdraw} টাকা হতে হবে।`,
                variant: "destructive"
            });
            return;
        }

        if (!number || number.length < 10) {
            toast({
                title: "ত্রুটি!",
                description: "সঠিক মোবাইল নম্বর দিন (১০+ ডিজিট)।",
                variant: "destructive"
            });
            return;
        }

        if (parseFloat(amount) > referIncome) {
            toast({
                title: "ত্রুটি!",
                description: "উত্তোলনের পরিমাণ আপনার আয়ের চেয়ে বেশি হতে পারে না।",
                variant: "destructive"
            });
            return;
        }

        setWithdrawLoading(true);
        try {
            const withdrawRequest = {
                email: authUser.email,
                name: userData.name,
                phone: userData.phone,
                method: method.toUpperCase(),
                amount: parseFloat(amount),
                number,
                referralIncome: referIncome,
                status: 'Pending',
                date: new Date().toISOString(),
                withdrawId: `WD-${Date.now()}`
            };

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/withdraw`, withdrawRequest);

            if (response.data) {
                toast({
                    title: "সফল!",
                    description: `উত্তোলনের অনুরোধ জমা দেওয়া হয়েছে। Withdraw ID: ${withdrawRequest.withdrawId}`,
                });
                setWithdrawModalOpen(false);
                setWithdrawData({ method: 'bkash', amount: '', number: '' });

                // Refresh user data
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error('Withdraw error:', error);
            toast({
                title: "ত্রুটি!",
                description: "উত্তোলনের অনুরোধ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
                variant: "destructive"
            });
        } finally {
            setWithdrawLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'তারিখ উপলব্ধ নেই';
        }
    };

    // Simple Loading Spinner
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-muted-foreground">ডেটা লোড হচ্ছে...</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="space-y-6">
                <Helmet>
                    <title>রেফারেল প্রোগ্রাম - LetsDropship</title>
                </Helmet>
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">রেফারেল ডেটা লোড করতে সমস্যা হয়েছে।</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>রেফারেল প্রোগ্রাম - LetsDropship</title>
            </Helmet>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">রেফারেল প্রোগ্রাম</h1>
                    <p className="text-muted-foreground">আপনার বন্ধুদের রেফার করে আয় করুন। প্রতি রেফারেলে ৫০ টাকা বোনাস!</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">মোট রেফারেল আয়</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${referIncome >= minimumWithdraw ? 'text-green-600' : ''}`}>
                                ৳ {referIncome}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {referredUsers.length} জন × ৫০ টাকা = মোট আয়
                                {referIncome < minimumWithdraw && (
                                    <span className="block text-red-600">
                                        ন্যূনতম উত্তোলন: ৳{minimumWithdraw}
                                    </span>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">মোট রেফার করা ব্যবহারকারী</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{referredUsers.length}</div>
                            <p className="text-xs text-muted-foreground">সফলভাবে সাইন আপ করেছেন</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>আপনার রেফারেল কোড</CardTitle>
                        <CardDescription>আপনার বন্ধুদের সাথে এই কোডটি শেয়ার করুন এবং তারা সাইন আপ করলে ৫০ টাকা বোনাস পান।</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full">
                            <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input readOnly value={referralCode} className="text-lg font-mono pl-10" />
                        </div>
                        <Button onClick={copyReferralCode} className="w-full sm:w-auto shrink-0" disabled={copyLoading}>
                            {copyLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                            কোড কপি করুন
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle>রেফার করা ব্যবহারকারীদের তালিকা</CardTitle>
                            <CardDescription>যারা আপনার কোড ব্যবহার করে সাইন আপ করেছেন। প্রত্যেকের জন্য ৫০ টাকা বোনাস।</CardDescription>
                        </div>
                        <Button
                            onClick={handleWithdrawModalOpen}
                            disabled={referIncome < minimumWithdraw}
                            className={referIncome >= minimumWithdraw ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            উত্তোলন করুন
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {referredUsers.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>নাম</TableHead>
                                        <TableHead>সাইন আপের তারিখ</TableHead>
                                        <TableHead className="text-right">অর্জিত পরিমাণ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {referredUsers.map((refUser, index) => (
                                        <TableRow key={`${refUser.name}-${index}`}>
                                            <TableCell className="font-medium">{refUser.name}</TableCell>
                                            <TableCell>{formatDate(refUser.date)}</TableCell>
                                            <TableCell className="text-right font-semibold text-green-600">৳50</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-right font-semibold">মোট আয়:</TableCell>
                                        <TableCell className="text-right font-bold text-green-600">৳{referIncome}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="mx-auto h-12 w-12 mb-2" />
                                <p>এখনো কোনো রেফারেল নেই। আপনার কোড শেয়ার করুন!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Withdraw Modal */}
                <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                উত্তোলনের অনুরোধ
                                <button
                                    onClick={() => setWithdrawModalOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </DialogTitle>
                            <DialogDescription>
                                ন্যূনতম {minimumWithdraw} টাকা উত্তোলন করতে পারবেন। আপনার বর্তমান আয়: ৳{referIncome}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="method">উত্তোলনের পদ্ধতি</Label>
                                <Select value={withdrawData.method} onValueChange={(value) => handleInputChange('method', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bkash">বিকাশ</SelectItem>
                                        <SelectItem value="nagad">নগদ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">উত্তোলনের পরিমাণ (৳)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="ন্যূনতম ১০০০ টাকা"
                                    value={withdrawData.amount}
                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                    min={minimumWithdraw}
                                    max={referIncome}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="number">
                                    {withdrawData.method === 'bkash' ? 'বিকাশ' : 'নগদ'} নম্বর
                                </Label>
                                <Input
                                    id="number"
                                    type="tel"
                                    placeholder="01XXXXXXXXX"
                                    value={withdrawData.number}
                                    onChange={(e) => handleInputChange('number', e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setWithdrawModalOpen(false)}
                                disabled={withdrawLoading}
                            >
                                বাতিল
                            </Button>
                            <Button
                                onClick={handleWithdrawSubmit}
                                disabled={withdrawLoading || !withdrawData.amount || !withdrawData.number}
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