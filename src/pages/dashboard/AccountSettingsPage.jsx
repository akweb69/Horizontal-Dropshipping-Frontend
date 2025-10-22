import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader } from 'lucide-react';
import axios from 'axios';

const AccountSettingsPage = () => {
    const { user } = useAuth();
    const { toast } = useToast(); // Fix: Properly destructure toast
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    // Load user data
    useEffect(() => {
        setLoading(true);
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/users`)
            .then((res) => {
                const data = res.data;
                const myData = data.find((item) => item.email === user.email);
                setFormData(myData || {});
                setLoading(false);
                console.log('User data:', myData);
            })
            .catch((err) => {
                setLoading(false);
                console.error('Error fetching user data:', err);
                toast({
                    title: 'ত্রুটি',
                    description: 'ব্যবহারকারীর তথ্য লোড করা যায়নি।',
                    variant: 'destructive',
                });
            });
    }, [user, toast]);

    // Handle image upload to ImgBB
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const imgBBFormData = new FormData();
        imgBBFormData.append('image', file);

        setLoading(true);
        axios
            .post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, imgBBFormData)
            .then((res) => {
                const imageUrl = res.data.data.url;
                setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
                setLoading(false);
                toast({
                    title: 'সফল',
                    description: 'প্রোফাইল ছবি সফলভাবে আপলোড হয়েছে!',
                    variant: 'success',
                });
            })
            .catch((err) => {
                setLoading(false);
                console.error('Error uploading image:', err);
                toast({
                    title: 'ত্রুটি',
                    description: 'ছবি আপলোড করা যায়নি।',
                    variant: 'destructive',
                });
            });
    };

    // Handle profile photo update
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData?._id || !formData?.profileImage) {
            toast({
                title: 'ত্রুটি',
                description: 'প্রোফাইল ছবি বা ব্যবহারকারী আইডি অনুপস্থিত।',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        axios
            .patch(`${import.meta.env.VITE_BASE_URL}/update-profile-photo/${formData._id}`, {
                formData: { profileImage: formData.profileImage },
            })
            .then((res) => {
                setLoading(false);
                console.log('Update response:', res.data);
                toast({
                    title: 'সফল',
                    description: 'আপনার প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!',
                    variant: 'success',
                });
            })
            .catch((err) => {
                setLoading(false);
                console.error('Error updating profile:', err);
                toast({
                    title: 'ত্রুটি',
                    description: 'প্রোফাইল ছবি আপডেট করা যায়নি।',
                    variant: 'destructive',
                });
            });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center w-full min-h-[60vh]">
                <Loader className="animate-spin w-8 h-8 text-primary" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>অ্যাকাউন্ট সেটিংস - LetsDropship</title>
            </Helmet>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">অ্যাকাউন্ট সেটিংস</h1>
                    <p className="text-muted-foreground">আপনার প্রোফাইল, স্টোর এবং বিলিং তথ্য পরিচালনা করুন।</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left side: Account info */}
                    <div>
                        {/* Profile photo upload */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>প্রোফাইল ছবি </CardTitle>
                                <CardDescription>আপনার প্রোফাইল ছবি </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* <form onSubmit={handleSubmit}>
                                    <div className="flex flex-col items-center">
                                        {formData?.storeInfo?.shopImage ? (
                                            <img
                                                referrerPolicy='no-referrer'
                                                src={formData?.storeInfo?.shopImage} alt="Profile" className="w-24 h-24 rounded-full" />

                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-500">
                                                    {formData?.name?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-2">নতুন ছবি আপলোড করুন।</p>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="mt-2 border border-yellow-300 p-2 rounded-lg w-full"
                                        />
                                        <Button type="submit" className="mt-4" disabled={loading || !formData?.profileImage}>
                                            {loading ? <Loader className="animate-spin w-5 h-5" /> : 'ছবি আপডেট করুন'}
                                        </Button>
                                    </div>
                                </form> */}
                                <img
                                    referrerPolicy='no-referrer'
                                    src={formData?.storeInfo?.shopImage} alt="Profile" className="w-24 h-24 rounded-full" />
                            </CardContent>
                        </Card>
                        {/* Account info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>অ্যাকাউন্ট তথ্য</CardTitle>
                                <CardDescription>আপনার প্রোফাইল তথ্য পরিচালনা করুন।</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col">
                                        <Label htmlFor="name">নাম</Label>
                                        <Input disabled id="name" value={formData.name || ''} />
                                    </div>
                                    <div className="flex flex-col">
                                        <Label htmlFor="email">ইমেইল</Label>
                                        <Input disabled id="email" value={formData.email || ''} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Right side: Store info */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>স্টোর তথ্য</CardTitle>
                                <CardDescription>আপনার স্টোর তথ্য পরিচালনা করুন।</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        {formData?.storeInfo?.shopImage ? (
                                            <img src={formData?.storeInfo?.shopImage}
                                                referrerPolicy='no-referrer'
                                                alt="StoreImage" className="h-full w-full  rounded-lg max-h-[200px]" />
                                        ) : (
                                            <div className="w-24 h-24 rounded bg-gray-200 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-500">S</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <Label htmlFor="store_name">স্টোর নাম</Label>
                                        <Input disabled id="store_name" value={formData?.storeInfo?.shopName || ''} />
                                    </div>
                                    <div className="flex flex-col">
                                        <Label htmlFor="store_address">স্টোর ঠিকানা</Label>
                                        <Input disabled id="store_address" value={formData?.storeInfo?.shopAddress || ''} />
                                    </div>
                                    <div className="flex flex-col">
                                        <Label htmlFor="store_contact">স্টোর যোগাযোগ</Label>
                                        <Input disabled id="store_contact" value={formData?.storeInfo?.shopContact || ''} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountSettingsPage;