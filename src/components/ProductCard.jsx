import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Lock, Heart, ShoppingCart, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSearch } from '../context/SearchContext';

const ProductCard = ({ product }) => {
  const { isMember, user, setLoveData, setCartData } = useAuth();
  const navigate = useNavigate();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const { setIsSearchOpen } = useSearch()

  // Helper: Get price range
  const getPriceRange = () => {
    if (!product.sizes || product.sizes.length === 0) return 'N/A';
    const prices = product.sizes.map(s => parseFloat(s.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `৳${min}` : `৳${min}`;
  };

  // Helper: Get total stock
  const getTotalStock = () => {
    if (!product.sizes || product.sizes.length === 0) return 0;
    return product.sizes.reduce((sum, s) => sum + parseInt(s.stock, 10), 0);
  };

  // Add to favorites
  const handleLoveClick = async (productId) => {
    if (!isMember) {
      Swal.fire({
        icon: "error",
        title: "প্রিয় তালিকায় যুক্ত করা যায়নি",
        text: "আপনি মেম্বার নন। প্রিয় তালিকায় যোগ করতে মেম্বার হোন।",
      });
      navigate('/membership');
      return;
    }

    if (!user?.email) {
      toast({ title: "অনুগ্রহ করে লগইন করুন!", variant: "destructive" });
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/love`, {
        productId,
        email: user.email,
        price: product.sizes && product.sizes.length > 0 ? product.sizes[0].price : 0,
        size: product.sizes && product.sizes.length > 0 ? product.sizes[0].size : 'N/A',
      });

      if (res.data.acknowledged) {
        const data = await axios.get(`${import.meta.env.VITE_BASE_URL}/love`);
        setLoveData(data.data.filter(item => item.email === user.email));
        toast({ title: "প্রিয় তালিকায় যুক্ত হয়েছে!", className: "bg-green-500 text-white" });
      } else if (res.data?.message === "Already in favorites") {
        toast({ title: "ইতিমধ্যেই প্রিয় তালিকায় আছে!", className: "bg-yellow-500 text-white" });
      }
    } catch (err) {
      toast({ title: "কিছু সমস্যা হয়েছে!", variant: "destructive" });
    }
  };

  // Open size modal
  const handleOpenSizeModal = () => {
    if (!isMember) {
      navigate('/membership');
      return;
    }
    if (!user?.email) {
      toast({ title: "অনুগ্রহ করে লগইন করুন!", variant: "destructive" });
      return;
    }
    setShowSizeModal(true);
  };

  // Add to cart with selected size
  const handleAddToCart = async () => {
    if (!selectedSize) return;

    const stock = parseInt(selectedSize.stock, 10);
    if (stock <= 0) {
      toast({ title: `${selectedSize.size} সাইজটি স্টকে নেই!`, variant: "destructive" });
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/cart`, {
        productId: product._id,
        email: user.email,
        size: selectedSize.size,
        price: selectedSize.price,
        profit: selectedSize.profit
      });

      if (res.data) {
        const data = await axios.get(`${import.meta.env.VITE_BASE_URL}/cart`);
        setCartData(data.data.filter(item => item.email === user.email));
        toast({ title: `${selectedSize.size} কার্টে যুক্ত হয়েছে!`, className: "bg-green-500 text-white" });
        setShowSizeModal(false);
        setSelectedSize(null);
      }
    } catch (err) {
      toast({ title: "কার্টে যোগ করতে সমস্যা হয়েছে!", variant: "destructive" });
    }
  };

  // Navigate to product details
  const handleProductDetails = (productId) => {
    if (user?.isMember === false) {
      navigate(`/membership`);
      return
    }
    else {
      navigate(`/product/${productId}`);
      setIsSearchOpen(false)
    }
  };

  const hasSizes = product.sizes && product.sizes.length > 0;
  const isOutOfStock = getTotalStock() === 0;

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl relative border border-gray-100 bangla"
        whileHover={{ y: -5, scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >


        {/* Product Image */}
        <div
          onClick={() => handleProductDetails(product._id)}
          className="relative aspect-square bg-gray-50 rounded-t-xl overflow-hidden cursor-pointer">
          <motion.img
            alt={product.name}
            className="w-full h-full object-cover"
            src={product?.thumbnail || '/placeholder.jpg'}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onError={(e) => e.target.src = '/placeholder.jpg'}
          />

          {/* Member Lock Overlay */}
          <AnimatePresence>
            {!isMember && (
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              স্টক শেষ
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight">
            {product?.name.slice(0, 20)}{product?.name.length > 20 ? '...' : ''}
          </h3>

          {/* Price & Rating */}
          <div className="flex items-center justify-between">
            {isMember ? (
              <div>
                <p className="text-xl font-bold text-orange-600">{getPriceRange()}</p>
                {hasSizes && (
                  <p className="text-xs text-gray-500 mt-1">
                    {product.sizes.length}টি সাইজ উপলব্ধ
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-orange-500 font-medium">
                <Lock size={16} />
                <span>সদস্যদের জন্য</span>
              </div>
            )}

            <div className="flex items-center">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 ml-1">4.5</span>
            </div>
          </div>

          {/* Action Buttons */}
          {isMember ? (
            <div className=" lg:flex gap-2 space-y-2 lg:space-y-0 w-full">
              <Button
                variant="outline"
                className="flex-1 rounded-lg  w-full outline-orange-500 hover:bg-orange-50 text-orange-600 hover:text-orange-700 text-xs"
                onClick={() => handleProductDetails(product._id)}
              >
                বিস্তারিত
              </Button>
              <Button
                className="flex-1 w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center gap-1 text-xs"
                onClick={handleOpenSizeModal}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={18} />
                {isOutOfStock ? 'স্টক শেষ' : 'কার্টে যোগ'}
              </Button>
            </div>
          ) : (
            <Button
              asChild
              className="w-full bg-gradient-to-r text-center px-2 from-orange-500 to-orange-600 hover:from-orange-600 text-sm md:text-base hover:to-orange-700 text-white rounded-lg"
            >
              <Link to="/membership"> দাম দেখতে স্টোর খুলুন</Link>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Size Selection Modal */}
      <Dialog open={showSizeModal} onOpenChange={setShowSizeModal}>
        <DialogContent className="sm:max-w-md  max-h-[400px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">সাইজ নির্বাচন করুন</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {product.sizes?.map((s, i) => {
              const inStock = parseInt(s.stock, 10) > 0;
              return (
                <motion.div
                  key={i}
                  whileHover={inStock ? { scale: 1.02 } : {}}
                  onClick={() => inStock && setSelectedSize(s)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedSize?.size === s.size
                    ? 'border-orange-600 bg-orange-50'
                    : inStock
                      ? 'border-gray-300 hover:border-orange-400'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{s.size}</p>
                      <p className="text-sm text-gray-600">৳{s.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {inStock ? `${s.stock} টি আছে` : 'স্টক শেষ'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSizeModal(false)}>
              বাতিল
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {selectedSize ? `${selectedSize.size} যোগ করুন` : 'সাইজ বেছে নিন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;