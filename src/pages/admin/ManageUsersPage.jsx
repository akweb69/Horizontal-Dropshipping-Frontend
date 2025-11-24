import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { Edit, Trash2, Search, UserPlus, ShieldCheck, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/use-toast';
// import { auth } from '@/firebase';
import {
  sendPasswordResetEmail,
  confirmPasswordReset,
} from 'firebase/auth';

const base_url = import.meta.env.VITE_BASE_URL;
import { useAuth } from '@/context/AuthContext';
import auth from '../../firebase';
import Loader11 from '../../components/layout/Loader11';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user', subscription: 'Basic', status: 'Active' });
  const { user } = useAuth();

  // Password Reset States
  const [openPasswordReset, setOpenPasswordReset] = useState(false);
  const [resetStep, setResetStep] = useState('email'); // 'email' | 'newPassword' | 'emailSent'
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [oobCode, setOobCode] = useState(''); // Firebase reset code from URL

  useEffect(() => {
    fetchUsers();
  }, []);

  // Check if we are in password reset mode (after clicking email link)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const code = urlParams.get('oobCode');

    if (mode === 'resetPassword' && code) {
      setOobCode(code);
      setResetStep('newPassword');
      setOpenPasswordReset(true);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${base_url}/users`);
      setUsers(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({ title: "ত্রুটি", description: "ব্যবহারকারী লোড করতে ব্যর্থ হয়েছে।", variant: "destructive" });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setCurrentUser(null);
    setFormData({ name: '', email: '', role: 'user', subscription: 'Basic', status: 'Active' });
    setIsDialogOpen(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription?.plan || user.subscription || 'Basic',
      status: user.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role || !formData.subscription || !formData.status) {
      toast({ title: "ত্রুটি", description: "অনুগ্রহ করে সমস্ত প্রয়োজনীয় ঘর পূরণ করুন।", variant: "destructive" });
      return;
    }

    try {
      let res;
      if (currentUser) {
        res = await axios.patch(`${base_url}/users/${currentUser._id}`, formData);
      } else {
        res = await axios.post(`${base_url}/users`, formData);
      }

      if (res.status === 200 || res.status === 201) {
        toast({ title: "সফল", description: currentUser ? "ব্যবহারকারী সফলভাবে আপডেট করা হয়েছে।" : "নতুন ব্যবহারকারী সফলভাবে যোগ করা হয়েছে।" });
        setIsDialogOpen(false);
        fetchUsers();
      } else {
        toast({ title: "ত্রুটি", description: "অপারেশন ব্যর্থ হয়েছে।", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ত্রুটি", description: "এরর হয়েছে।", variant: "destructive" });
    }
  };

  const handleDelete = async (userId, userEmail) => {
    if (userEmail === 'freelancerrobi8@gmail.com') {
      toast({ title: "ত্রুটি", description: "মূল অ্যাডমিনকে মুছে ফেলা যাবে না।", variant: "destructive" });
      return;
    }
    try {
      const res = await axios.delete(`${base_url}/users/${userId}`);
      if (res.status === 200) {
        toast({ title: "সফল", description: "ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে।" });
        fetchUsers();
      } else {
        toast({ title: "ত্রুটি", description: "মুছে ফেলতে ব্যর্থ হয়েছে।", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ত্রুটি", description: "এরর হয়েছে।", variant: "destructive" });
    }
  };

  const handleToggleAdmin = async (userId, userEmail) => {
    if (userEmail === 'freelancerrobi8@gmail.com') {
      toast({ title: "ত্রুটি", description: "মূল অ্যাডমিনকে পরিবর্তন করা যাবে না।", variant: "destructive" });
      return;
    }
    const user = users.find(u => u._id === userId);
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await axios.patch(`${base_url}/users/${userId}`, { role: newRole });
      if (res.status === 200) {
        toast({ title: "সফল", description: "ব্যবহারকারীর ভূমিকা পরিবর্তন করা হয়েছে।" });
        fetchUsers();
      } else {
        toast({ title: "ত্রুটি", description: "ভূমিকা পরিবর্তন করতে ব্যর্থ হয়েছে।", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ত্রুটি", description: "এরর হয়েছে।", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // handleUpdateUserRole
  const handleUpdateUserRole = async (newRole, email, userId) => {
    if (email === 'freelancerrobi8@gmail.com') {
      toast({ title: "ত্রুটি", description: "মূল অ্যাডমিনকে পরিবর্তন করা যাবে না।", variant: "destructive" });
      return;
    }

    axios.patch(`${base_url}/users/${userId}`, { role: newRole })
      .then(res => {
        if (res.status === 200) {
          toast({ title: "সফল", description: "ব্যবহারকারীর ভূমিকা সফলভাবে আপডেট করা হয়েছে।" });
          fetchUsers();
        } else {
          toast({ title: "ত্রুটি", description: "ভূমিকা আপডেট করতে ব্যর্থ হয়েছে।", variant: "destructive" });
        }
      })
      .catch(error => {
        toast({ title: "ত্রুটি", description: "এরর হয়েছে।", variant: "destructive" });
      });
  };

  // Step 1: Send Reset Email
  const handleSendResetEmail = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({ title: "ত্রুটি", description: "সঠিক ইমেইল দিন।", variant: "destructive" });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ title: "সফল", description: `রিসেট লিঙ্ক পাঠানো হয়েছে ${resetEmail} এ।` });
      setResetStep('emailSent');
    } catch (error) {
      toast({ title: "ত্রুটি", description: error.message || "ইমেইল পাঠাতে ব্যর্থ।", variant: "destructive" });
    }
  };

  // Step 2: Confirm New Password
  const handleConfirmNewPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "ত্রুটি", description: "পাসওয়ার্ড মিলছে না।", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "ত্রুটি", description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।", variant: "destructive" });
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast({ title: "সফল", description: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে।" });
      setOpenPasswordReset(false);
      setResetStep('email');
      setResetEmail('');
      setNewPassword('');
      setConfirmPassword('');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      toast({ title: "ত্রুটি", description: error.message || "পাসওয়ার্ড আপডেট ব্যর্থ।", variant: "destructive" });
    }
  };

  // Reset Modal Close
  const closeResetModal = () => {
    setOpenPasswordReset(false);
    setResetStep('email');
    setResetEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setOobCode('');
    window.history.replaceState({}, document.title, window.location.pathname);
  };


  if (loading) {
    return <Loader11 />
  }

  return (
    <>
      <Helmet>
        <title>ব্যবহারকারী ম্যানেজ করুন - অ্যাডমিন</title>
      </Helmet>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ব্যবহারকারী ম্যানেজমেন্ট</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ব্যবহারকারী খুঁজুন..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={() => { setOpenPasswordReset(true); setResetStep('email'); }}
              variant="primary"
              className="flex items-center bg-orange-500 hover:bg-orange-600"
            >
              <UserPlus className="mr-2 h-4 w-4" /> ব্যবহারকারী পাসওয়ার্ড রিসেট করুন
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>ইমেল</TableHead>
                <TableHead>ভূমিকা</TableHead>
                <TableHead>সাবস্ক্রিপশন</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>

                  {/* ✅ Fixed subscription rendering */}
                  <TableCell>
                    {typeof user.subscription === 'object' ? (
                      <div className="flex flex-col">
                        <span>Plan: {user.subscription.plan || 'N/A'}</span>
                        {/* {user.subscription.validUntil && (
                          <span>Valid: {user.subscription.validUntil}</span>
                        )} */}
                      </div>
                    ) : (
                      user.subscription || 'No Plan'
                    )}
                  </TableCell>

                  <TableCell>
                    <select
                      defaultValue={user.role}
                      onChange={(e) => handleUpdateUserRole(e.target.value, user.email, user._id)}
                      name="role"
                      id="role"
                      className="border rounded p-1"
                    >
                      <option value="user">User</option>
                      <option value="Order Manager">Order Manager</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Withdraw Manager">Withdraw Manager</option>
                      <option value="admin">Admin</option>
                    </select>

                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleAdmin(user._id, user.email)}
                      title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      disabled={user.email === 'admin@UnicDropex.com'}
                    >
                      {user.role === 'admin' ? (
                        <ShieldOff className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      )}
                    </Button>

                    {/* <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button> */}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          disabled={user.email === 'admin@UnicDropex.com'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                          <AlertDialogDescription>
                            এই কাজটি বাতিল করা যাবে না। এটি স্থায়ীভাবে ব্যবহারকারীকে মুছে ফেলবে।
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(user._id, user.email)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            মুছে ফেলুন
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Password Reset Modal */}
      {openPasswordReset && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {resetStep === 'email' && 'পাসওয়ার্ড রিসেট করুন'}
                {resetStep === 'emailSent' && 'ইমেইল পাঠানো হয়েছে'}
                {resetStep === 'newPassword' && 'নতুন পাসওয়ার্ড সেট করুন'}
              </CardTitle>
            </CardHeader>
            <CardContent>

              {/* Step 1: Enter Email */}
              {resetStep === 'email' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">ইউজারের ইমেইল</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="user@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={closeResetModal} className="flex-1">
                      বাতিল
                    </Button>
                    <Button onClick={handleSendResetEmail} className="flex-1 bg-orange-500 hover:bg-orange-600">
                      লিঙ্ক পাঠান
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 1.5: Email Sent */}
              {resetStep === 'emailSent' && (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    আমরা <strong>{resetEmail}</strong> এ একটি রিসেট লিঙ্ক পাঠিয়েছি। <br />
                    ইমেইল চেক করুন এবং লিঙ্কে ক্লিক করে পাসওয়ার্ড পরিবর্তন করুন।
                  </p>
                  <Button variant="outline" onClick={closeResetModal} className="w-full">
                    বন্ধ করুন
                  </Button>
                </div>
              )}

              {/* Step 2: New Password Form */}
              {resetStep === 'newPassword' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-password">নতুন পাসওয়ার্ড</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">কনফার্ম পাসওয়ার্ড</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={closeResetModal} className="flex-1">
                      বাতিল
                    </Button>
                    <Button onClick={handleConfirmNewPassword} className="flex-1 bg-orange-500 hover:bg-orange-600">
                      পাসওয়ার্ড আপডেট
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ManageUsersPage;