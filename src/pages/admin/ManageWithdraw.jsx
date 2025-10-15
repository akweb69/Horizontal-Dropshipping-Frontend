import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Loader2,
    Eye,
    CheckCircle,
    XCircle,
    Download,
    Search,
    User,
    DollarSign,
    Clock
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

const ManageWithdraw = () => {
    const { toast } = useToast();
    const [withdraws, setWithdraws] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWithdraw, setSelectedWithdraw] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadWithdraws();
    }, []);

    const loadWithdraws = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/withdraw`);
            const data = response.data || [];
            setWithdraws(data);
        } catch (error) {
            console.error('Error loading withdraws:', error);
            toast({
                title: "ত্রুটি!",
                description: "উত্তোলনের তথ্য লোড করতে সমস্যা হয়েছে।",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (withdrawId, newStatus) => {
        setActionLoading(prev => ({ ...prev, [withdrawId]: true }));

        try {
            const response = await axios.patch(`${import.meta.env.VITE_BASE_URL}/withdraw/${withdrawId}`, {
                status: newStatus,
                email: selectedWithdraw.email,
                amount: selectedWithdraw.amount
            });

            if (response.data.success) {
                // Update local state
                setWithdraws(prev =>
                    prev.map(withdraw =>
                        withdraw._id?.$oid === withdrawId || withdraw._id === withdrawId
                            ? { ...withdraw, status: newStatus }
                            : withdraw
                    )
                );

                toast({
                    title: "সফল!",
                    description: `উত্তোলনের স্ট্যাটাস ${newStatus === 'Approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে।`,
                });

                setModalOpen(false);
                setSelectedWithdraw(null);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: "ত্রুটি!",
                description: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।",
                variant: "destructive"
            });
        } finally {
            setActionLoading(prev => ({ ...prev, [withdrawId]: false }));
        }
    };

    const openDetailsModal = (withdraw) => {
        setSelectedWithdraw(withdraw);
        setModalOpen(true);
    };

    const filteredWithdraws = withdraws.filter(withdraw => {
        const matchesSearch = withdraw.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            withdraw.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            withdraw.withdrawId?.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || withdraw.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <Badge variant="success" className="flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> অনুমোদিত</Badge>;
            case 'Rejected':
                return <Badge variant="destructive" className="flex items-center"><XCircle className="h-3 w-3 mr-1" /> প্রত্যাখ্যাত</Badge>;
            case 'Pending':
            default:
                return <Badge variant="secondary" className="flex items-center"><Clock className="h-3 w-3 mr-1" /> অপেক্ষমাণ</Badge>;
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>উত্তোলনের তথ্য লোড হচ্ছে...</span>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>উত্তোলন পরিচালনা - LetsDropship</title>
            </Helmet>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">উত্তোলন পরিচালনা</h1>
                    <p className="text-muted-foreground">সকল উত্তোলনের অনুরোধ এখানে পরিচালনা করুন।</p>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>ফিল্টার এবং সার্চ</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="নাম, ইমেইল বা Withdraw ID দিয়ে সার্চ করুন..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">সকল স্ট্যাটাস</option>
                            <option value="Pending">অপেক্ষমাণ</option>
                            <option value="Approved">অনুমোদিত</option>
                            <option value="Rejected">প্রত্যাখ্যাত</option>
                        </select>
                        <Button onClick={loadWithdraws} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            রিফ্রেশ
                        </Button>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">মোট উত্তোলন</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{withdraws.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">অপেক্ষমাণ</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{withdraws.filter(w => w.status === 'Pending').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">অনুমোদিত</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {withdraws.filter(w => w.status === 'Approved').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">প্রত্যাখ্যাত</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {withdraws.filter(w => w.status === 'Rejected').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Withdraws Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>উত্তোলনের তালিকা</CardTitle>
                        <CardDescription>
                            সাম্প্রতিক থেকে পুরাতন উত্তোলনের অনুরোধসমূহ।
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredWithdraws.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Withdraw ID</TableHead>
                                        <TableHead>নাম</TableHead>
                                        <TableHead>ইমেইল</TableHead>
                                        <TableHead>পরিমাণ</TableHead>
                                        <TableHead>পদ্ধতি</TableHead>
                                        <TableHead>স্ট্যাটাস</TableHead>
                                        <TableHead>তারিখ</TableHead>
                                        <TableHead>অ্যাকশন</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredWithdraws.map((withdraw) => {
                                        const withdrawId = withdraw._id?.$oid || withdraw._id;
                                        return (
                                            <TableRow key={withdrawId}>
                                                <TableCell className="font-mono">
                                                    {withdraw.withdrawId || `#${withdrawId?.substring(0, 8)}...`}
                                                </TableCell>
                                                <TableCell className="font-medium">{withdraw.name}</TableCell>
                                                <TableCell className="max-w-xs">
                                                    <div className="truncate">{withdraw.email}</div>
                                                </TableCell>
                                                <TableCell className="font-semibold">৳{withdraw.amount}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {withdraw.method}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(withdraw.status)}</TableCell>
                                                <TableCell className="text-sm">{formatDate(withdraw.date)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openDetailsModal(withdraw)}
                                                        disabled={actionLoading[withdrawId]}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        বিস্তারিত
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12">
                                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">কোনো উত্তোলনের অনুরোধ পাওয়া যায়নি</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Details Modal */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>উত্তোলনের বিস্তারিত</DialogTitle>
                            <DialogDescription>
                                Withdraw ID: {selectedWithdraw?.withdrawId || `#${selectedWithdraw?._id?.$oid?.substring(0, 8)}...`}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedWithdraw && (
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">নাম:</span>
                                        <p className="font-medium">{selectedWithdraw.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">ইমেইল:</span>
                                        <p>{selectedWithdraw.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">ফোন:</span>
                                        <p>{selectedWithdraw.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">পরিমাণ:</span>
                                        <p className="font-semibold">৳{selectedWithdraw.amount}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">পদ্ধতি:</span>
                                        <p className="font-medium">{selectedWithdraw.method}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">নম্বর:</span>
                                        <p>{selectedWithdraw.number}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">তারিখ:</span>
                                        <p>{formatDate(selectedWithdraw.date)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">রেফারেল আয়:</span>
                                        <p className="font-semibold">৳{selectedWithdraw.referralIncome}</p>
                                    </div>
                                </div>

                                {selectedWithdraw.status === 'Pending' && (
                                    <div className="pt-4 border-t">
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleStatusUpdate(selectedWithdraw._id?.$oid || selectedWithdraw._id, 'Approved')}
                                                disabled={actionLoading[selectedWithdraw._id?.$oid || selectedWithdraw._id]}
                                                className="flex-1"
                                            >
                                                {actionLoading[selectedWithdraw._id?.$oid || selectedWithdraw._id] ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                )}
                                                অনুমোদন করুন
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleStatusUpdate(selectedWithdraw._id?.$oid || selectedWithdraw._id, 'Rejected')}
                                                disabled={actionLoading[selectedWithdraw._id?.$oid || selectedWithdraw._id]}
                                                className="flex-1"
                                            >
                                                {actionLoading[selectedWithdraw._id?.$oid || selectedWithdraw._id] ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                )}
                                                প্রত্যাখ্যান করুন
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalOpen(false)}>
                                বন্ধ করুন
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default ManageWithdraw;