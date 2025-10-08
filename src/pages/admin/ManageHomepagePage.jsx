import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ManageHomepagePage = () => {
  const [banners, setBanners] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', buttonText: '', link: '', thumbnail: '' });
  const [featuredForm, setFeaturedForm] = useState({ name: '', link: '' });
  const [isBannerEdit, setIsBannerEdit] = useState(false);
  const [isFeaturedEdit, setIsFeaturedEdit] = useState(false);
  const [currentBannerId, setCurrentBannerId] = useState(null);
  const [currentFeaturedId, setCurrentFeaturedId] = useState(null);
  const [openBannerDialog, setOpenBannerDialog] = useState(false);
  const [openFeaturedDialog, setOpenFeaturedDialog] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const base_url = import.meta.env.VITE_BASE_URL;
  const imgbb_url = 'https://api.imgbb.com/1/upload';
  const imgbb_api_key = import.meta.env.VITE_IMGBB_API_KEY;

  useEffect(() => {
    fetchBanners();
    fetchFeaturedItems();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${base_url}/hero-section-banner`);
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'ব্যানার লোড করতে ব্যর্থ!' });
    }
  };

  const fetchFeaturedItems = async () => {
    try {
      const res = await fetch(`${base_url}/featured-items`);
      const data = await res.json();
      setFeaturedItems(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'ফিচারড আইটেম লোড করতে ব্যর্থ!' });
    }
  };

  const openAddBanner = () => {
    setBannerForm({ title: '', subtitle: '', buttonText: '', link: '', thumbnail: '' });
    setThumbnailFile(null);
    setIsBannerEdit(false);
    setCurrentBannerId(null);
    setOpenBannerDialog(true);
  };

  const openEditBanner = (banner) => {
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle,
      buttonText: banner.buttonText,
      link: banner.link,
      thumbnail: banner.thumbnail || '',
    });
    setThumbnailFile(null);
    setIsBannerEdit(true);
    setCurrentBannerId(banner._id);
    setOpenBannerDialog(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${imgbb_url}?key=${imgbb_api_key}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'ইমেজ আপলোড ব্যর্থ!' });
      return null;
    }
  };

  const handleBannerSubmit = async () => {
    try {
      let thumbnailUrl = bannerForm.thumbnail;
      if (thumbnailFile) {
        thumbnailUrl = await handleImageUpload(thumbnailFile);
        if (!thumbnailUrl) return;
      }

      const bannerData = { ...bannerForm, thumbnail: thumbnailUrl };
      let res;
      if (isBannerEdit) {
        res = await fetch(`${base_url}/hero-section-banner/${currentBannerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerData),
        });
      } else {
        res = await fetch(`${base_url}/hero-section-banner`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerData),
        });
      }
      if (res.ok) {
        toast({ title: isBannerEdit ? 'সফলভাবে আপডেট হয়েছে!' : 'সফলভাবে যোগ করা হয়েছে!' });
        setOpenBannerDialog(false);
        setThumbnailFile(null);
        fetchBanners();
      } else {
        toast({ variant: 'destructive', title: 'অপারেশন ব্যর্থ!' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'এরর হয়েছে!' });
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এটি মুছতে চান?')) return;
    try {
      const res = await fetch(`${base_url}/hero-section-banner/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'সফলভাবে মুছে ফেলা হয়েছে!' });
        fetchBanners();
      } else {
        toast({ variant: 'destructive', title: 'মুছে ফেলতে ব্যর্থ!' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'এরর হয়েছে!' });
    }
  };

  const openAddFeatured = () => {
    setFeaturedForm({ name: '', link: '' });
    setIsFeaturedEdit(false);
    setCurrentFeaturedId(null);
    setOpenFeaturedDialog(true);
  };

  const openEditFeatured = (item) => {
    setFeaturedForm({
      name: item.name,
      link: item.link,
    });
    setIsFeaturedEdit(true);
    setCurrentFeaturedId(item._id);
    setOpenFeaturedDialog(true);
  };

  const handleFeaturedSubmit = async () => {
    try {
      let res;
      if (isFeaturedEdit) {
        res = await fetch(`${base_url}/featured-items/${currentFeaturedId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(featuredForm),
        });
      } else {
        res = await fetch(`${base_url}/featured-items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(featuredForm),
        });
      }
      if (res.ok) {
        toast({ title: isFeaturedEdit ? 'সফলভাবে আপডেট হয়েছে!' : 'সফলভাবে যোগ করা হয়েছে!' });
        setOpenFeaturedDialog(false);
        fetchFeaturedItems();
      } else {
        toast({ variant: 'destructive', title: 'অপারেশন ব্যর্থ!' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'এরর হয়েছে!' });
    }
  };

  const handleDeleteFeatured = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এটি মুছতে চান?')) return;
    try {
      const res = await fetch(`${base_url}/featured-items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'সফলভাবে মুছে ফেলা হয়েছে!' });
        fetchFeaturedItems();
      } else {
        toast({ variant: 'destructive', title: 'মুছে ফেলতে ব্যর্থ!' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'এরর হয়েছে!' });
    }
  };

  return (
    <>
      <Helmet>
        <title>হোমপেজ ম্যানেজ করুন - অ্যাডমিন</title>
        <meta name="description" content="অ্যাডমিন প্যানেল থেকে হোমপেজের কনটেন্ট ম্যানেজ করুন।" />
      </Helmet>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">হোমপেজ ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">আপনার ওয়েবসাইটের প্রথম পেজটি নিয়ন্ত্রণ করুন।</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>হিরো সেকশন ব্যানার</CardTitle>
            <Button onClick={openAddBanner}><PlusCircle className="mr-2 h-4 w-4" /> নতুন ব্যানার</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>শিরোনাম</TableHead>
                  <TableHead>সাবটাইটেল</TableHead>
                  <TableHead>বাটন টেক্সট</TableHead>
                  <TableHead>লিংক</TableHead>
                  <TableHead>থাম্বনেইল</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map(banner => (
                  <TableRow key={banner._id}>
                    <TableCell>{banner.title}</TableCell>
                    <TableCell>{banner.subtitle}</TableCell>
                    <TableCell>{banner.buttonText}</TableCell>
                    <TableCell>
                      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {banner.link}
                      </a>
                    </TableCell>
                    <TableCell>
                      {banner.thumbnail ? (
                        <img src={banner.thumbnail} alt="Thumbnail" className="h-12 w-12 object-cover" />
                      ) : (
                        'No Thumbnail'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditBanner(banner)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteBanner(banner._id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>ফিচারড আইটেম</CardTitle>
            <Button onClick={openAddFeatured}><PlusCircle className="mr-2 h-4 w-4" /> নতুন আইটেম</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>আইটেমের নাম</TableHead>
                  <TableHead>লিংক</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featuredItems.map(item => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.link}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditFeatured(item)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteFeatured(item._id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Banner Dialog */}
      <Dialog open={openBannerDialog} onOpenChange={setOpenBannerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isBannerEdit ? 'ব্যানার এডিট করুন' : 'নতুন ব্যানার যোগ করুন'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">শিরোনাম</Label>
              <Input id="title" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subtitle" className="text-right">সাবটাইটেল</Label>
              <Input id="subtitle" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="buttonText" className="text-right">বাটন টেক্সট</Label>
              <Input id="buttonText" value={bannerForm.buttonText} onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">লিংক</Label>
              <Input id="link" value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="thumbnail" className="text-right">থাম্বনেইল</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                className="col-span-3"
              />
            </div>
            {bannerForm.thumbnail && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">বর্তমান থাম্বনেইল</Label>
                <img src={bannerForm.thumbnail} alt="Current Thumbnail" className="col-span-3 h-24 w-24 object-cover" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleBannerSubmit}>সংরক্ষণ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Featured Item Dialog */}
      <Dialog open={openFeaturedDialog} onOpenChange={setOpenFeaturedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isFeaturedEdit ? 'আইটেম এডিট করুন' : 'নতুন আইটেম যোগ করুন'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">আইটেমের নাম</Label>
              <Input id="name" value={featuredForm.name} onChange={(e) => setFeaturedForm({ ...featuredForm, name: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">লিংক</Label>
              <Input id="link" value={featuredForm.link} onChange={(e) => setFeaturedForm({ ...featuredForm, link: e.target.value })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleFeaturedSubmit}>সংরক্ষণ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageHomepagePage;