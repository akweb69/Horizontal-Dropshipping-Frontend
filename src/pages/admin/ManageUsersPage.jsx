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

const base_url = import.meta.env.VITE_BASE_URL;

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user', subscription: 'Basic', status: 'Active' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${base_url}/users`);
      setUsers(res.data);
    } catch (error) {
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
    if (userEmail === 'admin@letsdropship.com') {
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
    if (userEmail === 'admin@letsdropship.com') {
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
            <Button onClick={handleAddNew}>
              <UserPlus className="mr-2 h-4 w-4" /> নতুন ব্যবহারকারী
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
                        {user.subscription.validUntil && (
                          <span>Valid: {user.subscription.validUntil}</span>
                        )}
                      </div>
                    ) : (
                      user.subscription || 'No Plan'
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'success' : 'outline'}>
                      {user.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleAdmin(user._id, user.email)}
                      title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      disabled={user.email === 'admin@letsdropship.com'}
                    >
                      {user.role === 'admin' ? (
                        <ShieldOff className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      )}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          disabled={user.email === 'admin@letsdropship.com'}
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

      {/* ✅ Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentUser ? 'ব্যবহারকারী সম্পাদনা করুন' : 'নতুন ব্যবহারকারী যোগ করুন'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">নাম</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="email">ইমেল</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="role">ভূমিকা</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                disabled={currentUser && currentUser.email === 'admin@letsdropship.com'}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <Label htmlFor="subscription">সাবস্ক্রিপশন</Label>
              <select
                id="subscription"
                name="subscription"
                value={formData.subscription}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status">স্ট্যাটাস</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit">সংরক্ষণ করুন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageUsersPage;
