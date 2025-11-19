import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Trash2, Edit, Plus, CheckCircle, X } from 'lucide-react';
import axios from 'axios';

const ManagePackageData = () => {
    const [packages, setPackages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPackage, setCurrentPackage] = useState({
        name: '',
        price: '',
        discountAmount: '',
        validityDays: '',
        benefits: [''],
        recommended: false,
        canDoClass: false,
    });
    const [editPackageId, setEditPackageId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Fetch all packages
    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/manage-package`);
            setPackages(response.data);
        } catch (error) {
            console.error('Fetch packages error:', error);
            toast({
                title: "ত্রুটি",
                description: "প্যাকেজ তালিকা লোড করতে সমস্যা হয়েছে।",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e, index = null) => {
        const { name, value } = e.target;
        if (name === 'benefits') {
            const updatedBenefits = [...currentPackage.benefits];
            updatedBenefits[index] = value;
            setCurrentPackage((prev) => ({ ...prev, benefits: updatedBenefits }));
        } else {
            setCurrentPackage((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handle recommended checkbox
    const handleRecommendedChange = (checked) => {
        setCurrentPackage((prev) => ({ ...prev, recommended: checked }));
    };

    // Handle canDoClass checkbox
    const handleCanDoClassChange = (checked) => {
        setCurrentPackage((prev) => ({ ...prev, canDoClass: checked }));
    };

    // Add or remove benefit fields
    const addBenefitField = () => {
        setCurrentPackage((prev) => ({
            ...prev,
            benefits: [...prev.benefits, ''],
        }));
    };

    const removeBenefitField = (index) => {
        if (currentPackage.benefits.length > 1) {
            setCurrentPackage((prev) => ({
                ...prev,
                benefits: prev.benefits.filter((_, i) => i !== index),
            }));
        }
    };

    // Handle form submission (create or update)
    const handleSubmit = async () => {
        const { name, price, discountAmount, validityDays, benefits } = currentPackage;

        // Validation
        if (!name || !price || !validityDays || benefits.some((b) => !b.trim())) {
            toast({
                title: "ত্রুটি",
                description: "সকল ফিল্ড পূরণ করুন এবং কোনো সুবিধা খালি রাখবেন না।",
                variant: "destructive",
            });
            return;
        }

        if (!/^\d+$/.test(price) || !/^\d+$/.test(validityDays)) {
            toast({
                title: "ত্রুটি",
                description: "দাম এবং মেয়াদ দিন শুধুমাত্র সংখ্যা হতে হবে।",
                variant: "destructive",
            });
            return;
        }

        // discountAmount optional, কিন্তু দিলে শুধু সংখ্যা হতে হবে
        if (discountAmount && !/^\d+$/.test(discountAmount)) {
            toast({
                title: "ত্রুটি",
                description: "বোনাস পরিমাণ শুধুমাত্র সংখ্যা হতে হবে।",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const packageData = {
                ...currentPackage,
                price: parseInt(price),
                validityDays: parseInt(validityDays),
                discountAmount: discountAmount ? parseInt(discountAmount) : 0, // default 0
                benefits: benefits.map((b) => b.trim()),
            };

            if (isEditMode) {
                // Update package
                const response = await axios.patch(
                    `${import.meta.env.VITE_BASE_URL}/manage-package/${editPackageId}`,
                    packageData
                );
                if (response.data.modifiedCount > 0) {
                    setPackages((prev) =>
                        prev.map((pkg) =>
                            pkg._id === editPackageId ? { ...pkg, ...packageData } : pkg
                        )
                    );
                    toast({
                        title: "সফল",
                        description: "প্যাকেজ সফলভাবে আপডেট হয়েছে।",
                    });
                }
            } else {
                // Create package
                await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/manage-package`,
                    packageData
                );
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/manage-package`);
                setPackages(response.data);
                toast({
                    title: "সফল",
                    description: "নতুন প্যাকেজ সফলভাবে যোগ হয়েছে।",
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Submit error:', error);
            toast({
                title: "ত্রুটি",
                description: "প্যাকেজ সংরক্ষণ করতে সমস্যা হয়েছে।",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle edit package
    const handleEdit = (pkg) => {
        setIsEditMode(true);
        setEditPackageId(pkg._id);
        setCurrentPackage({
            name: pkg.name,
            price: pkg.price?.toString() || '',
            discountAmount: pkg.discountAmount?.toString() || '',
            validityDays: pkg.validityDays?.toString() || '',
            benefits: pkg.benefits || [''],
            recommended: pkg.recommended || false,
            canDoClass: pkg.canDoClass || false,
        });
        setIsModalOpen(true);
    };

    // Handle delete package
    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        setIsLoading(true);
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}/manage-package/${deleteConfirmId}`
            );
            if (response.data.deletedCount > 0) {
                setPackages((prev) => prev.filter((pkg) => pkg._id !== deleteConfirmId));
                toast({
                    title: "সফল",
                    description: "প্যাকেজ সফলভাবে মুছে ফেলা হয়েছে।",
                });
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: "ত্রুটি",
                description: "প্যাকেজ মুছতে সমস্যা হয়েছে।",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setDeleteConfirmId(null);
        }
    };

    // Open modal for adding new package
    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setCurrentPackage({
            name: '',
            price: '',
            discountAmount: '',
            validityDays: '',
            benefits: [''],
            recommended: false,
            canDoClass: false,
        });
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditPackageId(null);
        setCurrentPackage({
            name: '',
            price: '',
            discountAmount: '',
            validityDays: '',
            benefits: [''],
            recommended: false,
            canDoClass: false,
        });
    };

    return (
        <>
            <Helmet>
                <title>প্যাকেজ ম্যানেজ করুন - UnicDropex</title>
                <meta name="description" content="মেম্বারশিপ প্যাকেজ তৈরি, সম্পাদনা, এবং মুছে ফেলুন।" />
            </Helmet>

            <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                            প্যাকেজ ম্যানেজমেন্ট
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            মেম্বারশিপ প্যাকেজ তৈরি, সম্পাদনা, এবং মুছে ফেলুন। আপনার ব্যবসার জন্য উপযুক্ত প্ল্যান ডিজাইন করুন।
                        </p>
                    </motion.div>

                    <div className="mb-8">
                        <Button
                            onClick={handleOpenAddModal}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            নতুন প্যাকেজ যোগ করুন
                        </Button>
                    </div>

                    {isLoading && packages.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">লোড হচ্ছে...</p>
                        </div>
                    ) : packages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            কোনো প্যাকেজ পাওয়া যায়নি। নতুন প্যাকেজ যোগ করুন।
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg) => {
                                const finalPrice = pkg.discountAmount > 0
                                    ? pkg.price - pkg.discountAmount
                                    : pkg.price;

                                return (
                                    <motion.div
                                        key={pkg._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className={`bg-white rounded-xl shadow-lg p-6 border-2 ${pkg.recommended
                                            ? 'border-orange-500 ring-2 ring-orange-200'
                                            : 'border-gray-200'
                                            } relative`}
                                    >
                                        {pkg.recommended && (
                                            <div className="text-center mb-4">
                                                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                    সবচেয়ে জনপ্রিয়
                                                </span>
                                            </div>
                                        )}

                                        {/* Discount Badge */}
                                        {pkg.discountAmount > 0 && (
                                            <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                ৳{pkg.discountAmount} বোনাস
                                            </div>
                                        )}

                                        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
                                            {pkg.name}
                                        </h2>

                                        <div className="text-center mb-4">
                                            <p className="text-3xl font-extrabold text-gray-900">
                                                ৳{pkg.price}
                                            </p>
                                        </div>

                                        <p className="text-sm text-gray-500 text-center mb-4">
                                            মেয়াদ: {pkg.validityDays} দিন
                                        </p>

                                        <ul className="space-y-2 mb-6">
                                            {pkg.benefits.map((benefit, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {pkg.canDoClass && (
                                            <p className="text-sm text-gray-700 mt-2 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                ক্লাস করতে পারবে
                                            </p>
                                        )}

                                        <div className="flex justify-between mt-6">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(pkg)}
                                                className="flex-1 mr-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                সম্পাদনা
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setDeleteConfirmId(pkg._id)}
                                                className="flex-1 ml-2 bg-red-600 hover:bg-red-700"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                মুছুন
                                            </Button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Package Form Modal */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-lg md:max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {isEditMode ? 'প্যাকেজ সম্পাদনা করুন' : 'নতুন প্যাকেজ যোগ করুন'}
                                    </h2>
                                    <p className="text-orange-100 text-sm opacity-90">
                                        প্যাকেজের বিবরণ পূরণ করুন
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">
                                প্যাকেজের নাম
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={currentPackage.name}
                                onChange={handleInputChange}
                                placeholder="প্যাকেজের নাম লিখুন"
                                className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Price */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <Label htmlFor="price" className="text-sm font-semibold text-gray-700 mb-2 block">
                                    মূল দাম (টাকায়)
                                </Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    value={currentPackage.price}
                                    onChange={handleInputChange}
                                    placeholder="999"
                                    className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>

                            {/* Discount Amount */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <Label htmlFor="discountAmount" className="text-sm font-semibold text-gray-700 mb-2 block">
                                    বোনাস (টাকায়)
                                </Label>
                                <Input
                                    id="discountAmount"
                                    name="discountAmount"
                                    type="number"
                                    min="0"
                                    value={currentPackage.discountAmount}
                                    onChange={handleInputChange}
                                    placeholder="200 (ঐচ্ছিক)"
                                    className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                />
                                <p className="text-xs text-gray-500 mt-1">বোনাস না থাকলে খালি রাখুন</p>
                            </div>

                            {/* Validity Days */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <Label htmlFor="validityDays" className="text-sm font-semibold text-gray-700 mb-2 block">
                                    মেয়াদ (দিন)
                                </Label>
                                <Input
                                    id="validityDays"
                                    name="validityDays"
                                    type="number"
                                    min="1"
                                    value={currentPackage.validityDays}
                                    onChange={handleInputChange}
                                    placeholder="365"
                                    className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                                সুবিধাসমূহ
                            </Label>
                            {currentPackage.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <Input
                                        name="benefits"
                                        value={benefit}
                                        onChange={(e) => handleInputChange(e, index)}
                                        placeholder={`সুবিধা ${index + 1}`}
                                        className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl flex-1"
                                    />
                                    {currentPackage.benefits.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeBenefitField(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={addBenefitField}
                                className="mt-2 text-gray-700 border-gray-300 hover:bg-gray-50"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                নতুন সুবিধা যোগ করুন
                            </Button>
                        </div>

                        {/* Recommended & Can Do Class */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="recommended"
                                        checked={currentPackage.recommended}
                                        onChange={(e) => handleRecommendedChange(e.target.checked)}
                                    />
                                    <Label htmlFor="recommended" className="text-sm font-semibold text-gray-700">
                                        সবচেয়ে জনপ্রিয় হিসেবে চিহ্নিত করুন
                                    </Label>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="canDoClass"
                                        checked={currentPackage.canDoClass}
                                        onChange={(e) => handleCanDoClassChange(e.target.checked)}
                                    />
                                    <Label htmlFor="canDoClass" className="text-sm font-semibold text-gray-700">
                                        ক্লাস করতে পারবে
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCloseModal}
                                disabled={isLoading}
                                className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold"
                            >
                                বাতিল করুন
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
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
                                        <span>{isEditMode ? 'আপডেট করুন' : 'যোগ করুন'}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>প্যাকেজ মুছুন</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        আপনি কি নিশ্চিত এই প্যাকেজটি মুছে ফেলতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                            বাতিল
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>মুছা হচ্ছে...</span>
                                </>
                            ) : (
                                'মুছুন'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ManagePackageData;