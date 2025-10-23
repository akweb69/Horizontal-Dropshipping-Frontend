import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.jsx";
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/data/categories';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', iconImage: '', color: '' });
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const imgbb_api_key = import.meta.env.VITE_IMGBB_API_KEY;
  const base_url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const handleCategoriesUpdate = async () => {
      setCategories(await getCategories());
    };

    handleCategoriesUpdate();

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
    };
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to ImgBB
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      fetch(`https://api.imgbb.com/1/upload?key=${imgbb_api_key}`, {
        method: 'POST',
        body: formDataUpload,
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setFormData(prev => ({ ...prev, iconImage: data.data.url }));
            toast({ title: "সফল", description: "ছবি আপলোড হয়েছে।" });
          } else {
            toast({ title: "ত্রুটি", description: "ছবি আপলোড ব্যর্থ।", variant: "destructive" });
          }
        })
        .catch(() => {
          toast({ title: "ত্রুটি", description: "ইন্টারনেট সংযোগ সমস্যা।", variant: "destructive" });
        });
    }
  };

  const handleAddNew = () => {
    setCurrentCategory(null);
    setFormData({ name: '', iconImage: '', color: 'bg-gray-100' });
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsDialogOpen(true);
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({ name: category.name, iconImage: category.iconImage || '', color: category.color || 'bg-gray-100' });
    setPreviewImage(category.iconImage || null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.iconImage) {
      toast({
        title: "ত্রুটি",
        description: "অনুগ্রহ করে ক্যাটাগরির নাম এবং ছবি দিন।",
        variant: "destructive",
      });
      return;
    }

    if (currentCategory) {
      await updateCategory({ ...currentCategory, ...formData });
      toast({ title: "সফল", description: "ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে।" });
    } else {
      await addCategory(formData);
      toast({ title: "সফল", description: "নতুন ক্যাটাগরি সফলভাবে যোগ করা হয়েছে।" });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (categoryId) => {
    await deleteCategory(categoryId);
    toast({ title: "সফল", description: "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।" });
  };

  return (
    <>
      <Helmet>
        <title>ক্যাটাগরি ম্যানেজ করুন - অ্যাডমিন</title>
        <meta name="description" content="অ্যাডমিন প্যানেল থেকে ক্যাটাগরি যোগ, সম্পাদনা এবং মুছে ফেলুন।" />
      </Helmet>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ক্যাটাগরি ম্যানেজমেন্ট</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> নতুন ক্যাটাগরি
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[500px] md:max-h-[400px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{currentCategory ? 'ক্যাটাগরি সম্পাদনা করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">নাম</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleFormChange} className="col-span-3" required />
                  </div>

                  {/* File Input for Image */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right">ছবি</Label>
                    <div className="col-span-3 space-y-2">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {previewImage && (
                        <div className="mt-2 flex justify-center">
                          <img src={previewImage} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                        </div>
                      )}
                      {formData.iconImage && !previewImage && (
                        <div className="mt-2 text-xs text-green-600">ছবি আপলোড হয়েছে</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="color" className="text-right">রঙ (Tailwind)</Label>
                    <Input id="color" name="color" value={formData.color} onChange={handleFormChange} className="col-span-3" placeholder="e.g., bg-blue-100" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">বাতিল</Button>
                  </DialogClose>
                  <Button type="submit">সংরক্ষণ করুন</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ছবি</TableHead>
                <TableHead>নাম</TableHead>
                <TableHead>রঙ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    {category.iconImage ? (
                      <img src={category.iconImage} alt={category.name} className="h-10 w-10 object-cover rounded" />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 border-2 border-dashed rounded flex items-center justify-center text-xs">
                        নেই
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded ${category.color || 'bg-gray-100'}`}></div>
                      <span className="text-sm text-gray-500">{category.color || 'bg-gray-100'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                          <AlertDialogDescription>
                            এই কাজটি বাতিল করা যাবে না। এটি স্থায়ীভাবে আপনার ডেটা থেকে ক্যাটাগরিটি মুছে ফেলবে।
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category._id)} className="bg-red-600 hover:bg-red-700">মুছে ফেলুন</AlertDialogAction>
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
    </>
  );
};

export default ManageCategoriesPage;