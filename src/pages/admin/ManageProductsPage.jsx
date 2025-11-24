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
import Loader11 from '../../components/layout/Loader11';

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
    sizes: [],
    sliderImages: [],
    colors: []                 // ← নতুন ফিল্ড
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSliderFiles, setSelectedSliderFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    } catch (error) {
      toast({ title: "ত্রুটি", description: "পণ্য লোড করতে ব্যর্থ হয়েছে।", variant: "destructive" });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ---------- SIZES ---------- */
  const handleSizeChange = (index, field, value) => {
    setFormData(prev => {
      const newSizes = [...prev.sizes];
      newSizes[index] = { ...newSizes[index], [field]: value };
      const price = parseFloat(newSizes[index].price) || 0;
      const buyPrice = parseFloat(newSizes[index].buyPrice) || 0;
      newSizes[index].profit = (price - buyPrice).toFixed(2);
      return { ...prev, sizes: newSizes };
    });
  };
  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', price: '', buyPrice: '', profit: '0.00', stock: '' }]
    }));
  };
  const removeSize = (index) => {
    setFormData(prev => {
      const newSizes = [...prev.sizes];
      newSizes.splice(index, 1);
      return { ...prev, sizes: newSizes };
    });
  };

  /* ---------- COLORS ---------- */
  const handleColorChange = (index, value) => {
    setFormData(prev => {
      const newColors = [...prev.colors];
      newColors[index] = value.trim();
      return { ...prev, colors: newColors };
    });
  };
  const addColor = () => {
    setFormData(prev => ({ ...prev, colors: [...prev.colors, ''] }));
  };
  const removeColor = (index) => {
    setFormData(prev => {
      const newColors = [...prev.colors];
      newColors.splice(index, 1);
      return { ...prev, colors: newColors };
    });
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const handleSliderFilesChange = (e) => setSelectedSliderFiles(Array.from(e.target.files));

  const removeSliderImage = (index) => {
    setFormData(prev => {
      const newSliderImages = [...prev.sliderImages];
      newSliderImages.splice(index, 1);
      return { ...prev, sliderImages: newSliderImages };
    });
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
      return data.success ? data.data.url : null;
    } catch {
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
      sizes: [],
      sliderImages: [],
      colors: []               // ← রিসেট
    });
    setSelectedFile(null);
    setSelectedSliderFiles([]);
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
        buyPrice: s.buyPrice?.toString() || '',
        profit: s.profit?.toString() || '0.00',
        stock: s.stock.toString()
      })) : [],
      sliderImages: product.sliderImages || [],
      colors: product.colors || []          // ← লোড
    });
    setSelectedFile(null);
    setSelectedSliderFiles([]);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    if (!formData.name || !formData.category || !formData.sectionName || !formData.description ||
      formData.sizes.length === 0 ||
      formData.sizes.some(s => !s.size || !s.price || !s.buyPrice || !s.stock)) {
      toast({ title: "ত্রুটি", description: "অনুগ্রহ করে সমস্ত বাধ্যতামূলক ঘর পূরণ করুন।", variant: "destructive" });
      setBtnLoading(false);
      return;
    }

    // ---------- Thumbnail ----------
    let thumbnailUrl = formData.thumbnail;
    if (selectedFile) {
      const url = await uploadImage(selectedFile);
      if (!url) { setBtnLoading(false); return; }
      thumbnailUrl = url;
    }

    // ---------- Slider ----------
    let sliderImageUrls = [...formData.sliderImages];
    if (selectedSliderFiles.length) {
      const urls = await Promise.all(selectedSliderFiles.map(uploadImage));
      if (urls.some(u => !u)) { setBtnLoading(false); return; }
      sliderImageUrls.push(...urls);
    }

    // ---------- Final payload ----------
    const productData = {
      ...formData,
      thumbnail: thumbnailUrl,
      sliderImages: sliderImageUrls,
      colors: formData.colors.filter(c => c),            // শুধু non-empty
      sizes: formData.sizes.map(s => ({
        size: s.size,
        price: parseFloat(s.price),
        buyPrice: parseFloat(s.buyPrice),
        profit: parseFloat(s.profit),
        stock: parseInt(s.stock, 10)
      }))
    };

    try {
      const method = currentProduct ? 'PATCH' : 'POST';
      const url = currentProduct ? `${base_url}/products/${currentProduct._id}` : `${base_url}/products`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        toast({ title: "সফল", description: currentProduct ? "পণ্য আপডেট হয়েছে।" : "নতুন পণ্য যোগ হয়েছে।" });
        setIsDialogOpen(false);
        fetchProducts();
      } else {
        toast({ title: "ত্রুটি", description: "অপারেশন ব্যর্থ।", variant: "destructive" });
      }
    } catch {
      toast({ title: "ত্রুটি", description: "সার্ভার এরর।", variant: "destructive" });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const res = await fetch(`${base_url}/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: "সফল", description: "পণ্য মুছে ফেলা হয়েছে।" });
        fetchProducts();
      }
    } catch {
      toast({ title: "ত্রুটি", description: "মুছে ফেলতে ব্যর্থ।", variant: "destructive" });
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------- Helper UI ---------- */
  const getPriceRange = (sizes) => {
    if (!sizes?.length) return 'N/A';
    const prices = sizes.map(s => s.price);
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? `৳${min}` : `৳${min} - ৳${max}`;
  };
  const getPriceRange1 = (sizes) => {
    if (!sizes?.length) return 'N/A';
    const prices = sizes.map(s => s.buyPrice);
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? `৳${min}` : `৳${min} - ৳${max}`;
  };
  const getTotalStock = (sizes) => sizes?.reduce((s, c) => s + c.stock, 0) ?? 0;
  const getTotalProfit = (sizes) => {
    const total = sizes?.reduce((s, c) => s + (c.profit || 0), 0) ?? 0;
    return total.toFixed(2);
  };
  const getAvailableSizes = (sizes) => sizes?.length ? sizes.map(s => `${s.size} (৳${s.profit})`).join(', ') : 'নেই';
  const getAvailableColors = (colors) => colors?.length ? colors.join(', ') : 'নেই';
  const getSliderImagesPreview = (imgs) => {
    if (!imgs?.length) return 'নেই';
    return (
      <div className="flex gap-2">
        {imgs.slice(0, 3).map((url, i) => (
          <img key={i} src={url} alt="" className="h-10 w-10 object-cover rounded" />
        ))}
        {imgs.length > 3 && <span className="text-sm">+{imgs.length - 3}</span>}
      </div>
    );
  };

  if (loading) {
    return <Loader11></Loader11>
  }

  return (
    <>
      <Helmet><title>পণ্য ম্যানেজ করুন - অ্যাডমিন</title></Helmet>

      {/* ---------- Product List ---------- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>পণ্য ম্যানেজমেন্ট</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="পণ্য খুঁজুন..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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
                <TableHead>ক্রয় মূল্য</TableHead>
                <TableHead>বিক্রয় মূল্য</TableHead>
                <TableHead>মোট লাভ</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>সেকশন</TableHead>
                <TableHead>স্টক</TableHead>
                <TableHead>সাইজ ও লাভ</TableHead>
                <TableHead>কালার</TableHead>   {/* ← নতুন কলাম */}
                <TableHead>স্লাইডার</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(p => (
                <TableRow key={p._id}>
                  <TableCell>
                    {p.thumbnail ? <img src={p.thumbnail} alt={p.name} className="h-10 w-10 object-cover rounded" /> : 'নেই'}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{getPriceRange1(p.sizes)}</TableCell>
                  <TableCell>{getPriceRange(p.sizes)}</TableCell>
                  <TableCell className="font-semibold text-green-600">৳{getTotalProfit(p.sizes)}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.sectionName}</TableCell>
                  <TableCell>{getTotalStock(p.sizes)}</TableCell>
                  <TableCell>{getAvailableSizes(p.sizes)}</TableCell>
                  <TableCell>{getAvailableColors(p.colors)}</TableCell>
                  <TableCell>{getSliderImagesPreview(p.sliderImages)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                          <AlertDialogDescription>এই পণ্যটি স্থায়ীভাবে মুছে যাবে।</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(p._id)} className="bg-red-600">মুছে ফেলুন</AlertDialogAction>
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

      {/* ---------- Add / Edit Dialog ---------- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {currentProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">পণ্যের নাম <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" value={formData.name} onChange={handleFormChange} placeholder="যেমন: পুরুষদের টি-শার্ট" required />
              </div>
              <div>
                <Label htmlFor="category">ক্যাটাগরি <span className="text-red-500">*</span></Label>
                <select id="category" name="category" value={formData.category} onChange={handleFormChange}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" disabled>নির্বাচন করুন</option>
                  {categories?.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Section & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sectionName">সেকশন <span className="text-red-500">*</span></Label>
                <select id="sectionName" name="sectionName" value={formData.sectionName} onChange={handleFormChange}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" disabled>নির্বাচন করুন</option>
                  {sectionOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="description">বিবরণ <span className="text-red-500">*</span></Label>
                <textarea id="description" name="description" value={formData.description} onChange={handleFormChange}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" required />
              </div>
            </div>

            {/* ---------- Available Colors (Optional) ---------- */}
            <Card className="p-4 border">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-semibold">উপলব্ধ কালার (ঐচ্ছিক)</Label>
                <Button type="button" size="sm" onClick={addColor} className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" /> কালার যোগ করুন
                </Button>
              </div>

              <div className="space-y-3">
                {formData.colors.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    কোনো কালার যোগ করা হয়নি। চাইলে “কালার যোগ করুন” বাটনে ক্লিক করুন।
                  </p>
                ) : (
                  formData.colors.map((col, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="যেমন: red"
                        value={col}
                        onChange={e => handleColorChange(idx, e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeColor(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
                {formData.colors.length > 0 && (
                  <Button type="button" variant="outline" size="sm" onClick={addColor} className="w-full">
                    আরও কালার যোগ করুন
                  </Button>
                )}
              </div>
            </Card>

            {/* ---------- Sizes ---------- */}
            <Card className="p-4 border">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-sm font-semibold">সাইজ, মূল্য, ক্রয় মূল্য, লাভ ও স্টক <span className="text-red-500">*</span></Label>
                <Button type="button" size="sm" onClick={addSize}>
                  <PlusCircle className="h-4 w-4" /> সাইজ যোগ করুন
                </Button>
              </div>
              <div className="space-y-3">
                {formData.sizes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    কোনো সাইজ যোগ করা হয়নি। “সাইজ যোগ করুন” বাটনে ক্লিক করুন।
                  </p>
                ) : (
                  formData.sizes.map((s, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end border-b pb-3 last:border-0">
                      <div>
                        <Label className="text-xs">সাইজ</Label>
                        <Input placeholder="S, M, L" value={s.size} onChange={e => handleSizeChange(i, 'size', e.target.value)} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs">ক্রয় মূল্য (৳)</Label>
                        <Input type="number" placeholder="200" value={s.buyPrice} onChange={e => handleSizeChange(i, 'buyPrice', e.target.value)} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs">বিক্রয় মূল্য (৳)</Label>
                        <Input type="number" placeholder="299" value={s.price} onChange={e => handleSizeChange(i, 'price', e.target.value)} className="h-9" />
                      </div>
                      <div>
                        <Label className="text-xs">লাভ (৳)</Label>
                        <Input value={s.profit} disabled className="h-9 bg-muted" />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs">স্টক</Label>
                          <Input type="number" placeholder="50" value={s.stock} onChange={e => handleSizeChange(i, 'stock', e.target.value)} className="h-9" />
                        </div>
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeSize(i)} className="h-9 w-9">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* ---------- Thumbnail ---------- */}
            <div>
              <Label>থাম্বনেইল ছবি</Label>
              <div className="mt-2 flex items-center gap-4">
                {formData.thumbnail ? (
                  <div className="relative">
                    <img src={formData.thumbnail} alt="thumb" className="h-24 w-24 object-cover rounded-lg border" />
                    <Button type="button" variant="destructive" size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => { setFormData(p => ({ ...p, thumbnail: '' })); setSelectedFile(null); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-24 w-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                    <span className="text-xs text-center">কোনো ছবি নেই</span>
                  </div>
                )}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                  <p className="text-xs text-muted-foreground mt-1">সর্বোচ্চ 2MB, JPG/PNG</p>
                </div>
              </div>
            </div>

            {/* ---------- Slider Images ---------- */}
            <div>
              <Label>স্লাইডার ছবি</Label>
              <div className="mt-2">
                <div className="flex flex-wrap gap-4 mb-4">
                  {formData.sliderImages.length ? formData.sliderImages.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt={`slide-${i}`} className="h-24 w-24 object-cover rounded-lg border" />
                      <Button type="button" variant="destructive" size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => removeSliderImage(i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )) : (
                    <div className="h-24 w-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                      <span className="text-xs text-center">কোনো ছবি নেই</span>
                    </div>
                  )}
                </div>
                <Input type="file" accept="image/*" multiple onChange={handleSliderFilesChange} className="cursor-pointer" />
                <p className="text-xs text-muted-foreground mt-1">একাধিক ছবি, প্রতিটি 2MB পর্যন্ত</p>
              </div>
            </div>

            {/* ---------- Footer ---------- */}
            <DialogFooter className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={btnLoading}>
                বাতিল
              </Button>
              <Button type="submit" disabled={btnLoading || formData.sizes.length === 0}>
                {btnLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : 'সংরক্ষণ করুন'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageProductsPage;