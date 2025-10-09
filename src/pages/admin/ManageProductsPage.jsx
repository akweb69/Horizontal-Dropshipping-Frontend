import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from '@/components/ui/use-toast';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
const base_url = import.meta.env.VITE_BASE_URL;

const ManageProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    thumbnail: '',
    sectionName: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);

  const sectionOptions = [
    'অফার প্যাক',
    'ছেলেদের ফ্যাশন',
    'মেয়েদের ফ্যাশন',
    'ঘর ও লাইফস্টাইল',
    'যাজেট ও ইলেকট্রনিক্স',
    'কিডস জোন',
    'কম্বো প্যাক ও গিফট প্যাক',
    'কাস্টমার গিফট জোন'
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${base_url}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast({ title: "ত্রুটি", description: "বিভাগ লোড করতে ব্যর্থ হয়েছে।", variant: "destructive" });
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${base_url}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast({ title: "ত্রুটি", description: "পণ্য লোড করতে ব্যর্থ হয়েছে।", variant: "destructive" });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadImage = async (file) => {
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({ title: "ত্রুটি", description: "ইমেজ আপলোড করতে ব্যর্থ হয়েছে।", variant: "destructive" });
      return null;
    }
  };

  const handleAddNew = () => {
    setCurrentProduct(null);
    setFormData({ name: '', price: '', category: '', stock: '', thumbnail: '', sectionName: '' });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category || '',
      stock: product.stock,
      thumbnail: product.thumbnail || '',
      sectionName: product.sectionName || ''
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    if (!formData.name || !formData.price || !formData.category || !formData.stock || !formData.sectionName) {
      toast({ title: "ত্রুটি", description: "অনুগ্রহ করে সমস্ত ঘর পূরণ করুন।", variant: "destructive" });
      setBtnLoading(false);
      return;
    }

    let thumbnailUrl = formData.thumbnail;
    if (selectedFile) {
      const uploadedUrl = await uploadImage(selectedFile);
      if (uploadedUrl) {
        thumbnailUrl = uploadedUrl;
      } else {
        return;
      }
    }

    const productData = { ...formData, thumbnail: thumbnailUrl };

    try {
      let res;
      if (currentProduct) {
        res = await fetch(`${base_url}/products/${currentProduct._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        setBtnLoading(false);
      } else {
        res = await fetch(`${base_url}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      }
      if (res.ok) {
        toast({ title: "সফল", description: currentProduct ? "পণ্য সফলভাবে আপডেট করা হয়েছে।" : "নতুন পণ্য সফলভাবে যোগ করা হয়েছে।" });
        setIsDialogOpen(false);
        fetchProducts();
        setBtnLoading(false);
      } else {
        toast({ title: "ত্রুটি", description: "অপারেশন ব্যর্থ হয়েছে।", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ত্রুটি", description: "এরর হয়েছে।", variant: "destructive" });
      setBtnLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const res = await fetch(`${base_url}/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: "সফল", description: "পণ্য সফলভাবে মুছে ফেলা হয়েছে।" });
        fetchProducts();
      } else {
        toast({ title: "ত্রুটি", description: "মুছে ফেলতে ব্যর্থ হয়েছে।", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ত্রুটি", description: "এরর হয়েছে।", variant: "destructive" });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>পণ্য ম্যানেজ করুন - অ্যাডমিন</title>
      </Helmet>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>পণ্য ম্যানেজমেন্ট</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="পণ্য খুঁজুন..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> নতুন পণ্য
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>থাম্বনেইল</TableHead>
                <TableHead>নাম</TableHead>
                <TableHead>মূল্য</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>সেকশন</TableHead>
                <TableHead>স্টক</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.name} className="h-10 w-10 object-cover rounded" />
                    ) : (
                      'নেই'
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>৳{product.price}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.sectionName}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                          <AlertDialogDescription>এই কাজটি বাতিল করা যাবে না। এটি স্থায়ীভাবে পণ্যটি মুছে ফেলবে।</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(product._id)} className="bg-red-600 hover:bg-red-700">মুছে ফেলুন</AlertDialogAction>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">নাম</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="price">মূল্য (৳)</Label>
              <Input id="price" name="price" type="number" value={formData.price} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="category">ক্যাটাগরি</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="p-2 rounded-lg outline outline-accent w-full"
                required
              >
                <option value="" disabled>ক্যাটাগরি নির্বাচন করুন</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="sectionName">পণ্যের সেকশন</Label>
              <select
                id="sectionName"
                name="sectionName"
                value={formData.sectionName}
                onChange={handleFormChange}
                className="p-2 rounded-lg outline outline-accent w-full"
                required
              >
                <option value="" disabled>সেকশন নির্বাচন করুন</option>
                {sectionOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="stock">স্টক</Label>
              <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleFormChange} required />
            </div>
            <div>
              <Label>থাম্বনেইল</Label>
              {formData.thumbnail && (
                <img src={formData.thumbnail} alt="থাম্বনেইল" className="h-20 w-20 object-cover mb-2 rounded" />
              )}
              <Input id="thumbnail" type="file" onChange={handleFileChange} accept="image/*" />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
              <Button type="submit">{btnLoading ? "Loading..." : "সংরক্ষণ করুন"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageProductsPage;