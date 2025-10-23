import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
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
    category: '',
    thumbnail: '',
    sectionName: '',
    description: '',
    sizes: []
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
    'কাস্টমার গিফট জোন',
    'Others'
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

  const handleSizeChange = (index, field, value) => {
    setFormData(prev => {
      const newSizes = [...prev.sizes];
      newSizes[index][field] = value;
      return { ...prev, sizes: newSizes };
    });
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', price: '', stock: '' }]
    }));
  };

  const removeSize = (index) => {
    setFormData(prev => {
      const newSizes = [...prev.sizes];
      newSizes.splice(index, 1);
      return { ...prev, sizes: newSizes };
    });
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
    setFormData({
      name: '',
      category: '',
      thumbnail: '',
      sectionName: '',
      description: '',
      sizes: []
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      category: product.category || '',
      thumbnail: product.thumbnail || '',
      sectionName: product.sectionName || '',
      description: product.description || '',
      sizes: product.sizes ? product.sizes.map(s => ({
        size: s.size,
        price: s.price.toString(),
        stock: s.stock.toString()
      })) : []
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    if (!formData.name || !formData.category || !formData.sectionName || !formData.description || formData.sizes.length === 0 || formData.sizes.some(s => !s.size || !s.price || !s.stock)) {
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
        setBtnLoading(false);
        return;
      }
    }

    const productData = {
      ...formData,
      thumbnail: thumbnailUrl,
      sizes: formData.sizes.map(s => ({
        size: s.size,
        price: parseFloat(s.price),
        stock: parseInt(s.stock, 10)
      }))
    };

    try {
      let res;
      if (currentProduct) {
        res = await fetch(`${base_url}/products/${currentProduct._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
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
      } else {
        toast({ title: "ত্রুটি", description: "অপারেশন ব্যর্থ হয়েছে।", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "ত্রুটি", description: "এরর হয়েছে।", variant: "destructive" });
    } finally {
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

  const getPriceRange = (sizes) => {
    if (!sizes || sizes.length === 0) return 'N/A';
    const prices = sizes.map(s => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `৳${min}` : `৳${min} - ৳${max}`;
  };

  const getTotalStock = (sizes) => {
    if (!sizes || sizes.length === 0) return 0;
    return sizes.reduce((sum, s) => sum + s.stock, 0);
  };

  const getAvailableSizes = (sizes) => {
    if (!sizes || sizes.length === 0) return 'নেই';
    return sizes.map(s => s.size).join(', ');
  };

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
                <TableHead>বিবরণ</TableHead>
                <TableHead>উপলব্ধ সাইজ</TableHead>
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
                  <TableCell>{getPriceRange(product.sizes)}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.sectionName}</TableCell>
                  <TableCell>{getTotalStock(product.sizes)}</TableCell>
                  <TableCell>{product?.description?.slice(0, 50) + " ..." || 'নেই'}</TableCell>
                  <TableCell>{getAvailableSizes(product.sizes)}</TableCell>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {currentProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">পণ্যের নাম <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="যেমন: পুরুষদের টি-শার্ট"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium">ক্যাটাগরি <span className="text-red-500">*</span></Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>ক্যাটাগরি নির্বাচন করুন</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sectionName" className="text-sm font-medium">সেকশন <span className="text-red-500">*</span></Label>
                <select
                  id="sectionName"
                  name="sectionName"
                  value={formData.sectionName}
                  onChange={handleFormChange}
                  className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>সেকশন নির্বাচন করুন</option>
                  {sectionOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">বিবরণ <span className="text-red-500">*</span></Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="পণ্যের বিস্তারিত বিবরণ লিখুন..."
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                  required
                />
              </div>
            </div>

            {/* Size, Price, Stock - Dynamic */}
            <Card className="p-4 border">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-semibold">সাইজ, মূল্য ও স্টক <span className="text-red-500">*</span></Label>
                <Button type="button" size="sm" onClick={addSize} className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" /> সাইজ যোগ করুন
                </Button>
              </div>

              <div className="space-y-3">
                {formData.sizes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    কোনো সাইজ যোগ করা হয়নি। "সাইজ যোগ করুন" বাটনে ক্লিক করুন।
                  </p>
                ) : (
                  formData.sizes.map((s, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end border-b pb-3 last:border-0">
                      <div>
                        <Label htmlFor={`size-${index}`} className="text-xs">সাইজ</Label>
                        <Input
                          id={`size-${index}`}
                          placeholder="S, M, L, XL"
                          value={s.size}
                          onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`price-${index}`} className="text-xs">মূল্য (৳)</Label>
                        <Input
                          id={`price-${index}`}
                          type="number"
                          placeholder="299"
                          value={s.price}
                          onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`stock-${index}`} className="text-xs">স্টক</Label>
                          <Input
                            id={`stock-${index}`}
                            type="number"
                            placeholder="50"
                            value={s.stock}
                            onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => removeSize(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Thumbnail */}
            <div>
              <Label className="text-sm font-medium">থাম্বনেইল ছবি</Label>
              <div className="mt-2 flex items-center gap-4">
                {formData.thumbnail ? (
                  <div className="relative">
                    <img
                      src={formData.thumbnail}
                      alt="Preview"
                      className="h-24 w-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, thumbnail: '' }));
                        setSelectedFile(null);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-24 w-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                    <span className="text-xs text-center">কোনো ছবি নেই</span>
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    সর্বোচ্চ 2MB, JPG/PNG
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-end gap-2 sm:gap-3 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={btnLoading}
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={btnLoading || formData.sizes.length === 0}
                className="min-w-[120px]"
              >
                {btnLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  'সংরক্ষণ করুন'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageProductsPage;