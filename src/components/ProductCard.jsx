import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Lock, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const ProductCard = ({ product }) => {
  const { isMember, user, setLoveData, setCartData } = useAuth();
  const navigate = useNavigate();

  // ❤️ Add to favorites
  const handleLoveClick = async (productId) => {

    // console.log(user?.isMember)
    if (!isMember) {
      Swal.fire({
        icon: "error",
        title: "❤️ প্রিয় তালিকায় যুক্ত করা যায়নি",
        text: "আপনি ইতিমধ্যে একটি মেম্বার নন। প্রিয় তালিকায় যুক্ত করা যায়নি।",
      });
      navigate('/membership');
      return;
    }

    if (!user?.email) {
      toast({
        title: "অনুগ্রহ করে লগইন করুন!",
        className: "bg-red-500 text-white"
      });
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/love`, {
        productId,
        email: user.email
      });

      if (res.data.acknowledged) {
        const data = await axios.get(`${import.meta.env.VITE_BASE_URL}/love`);
        setLoveData(data.data.filter(item => item.email === user.email));
        toast({
          title: "❤️ প্রিয় তালিকায় যুক্ত হয়েছে!",
          className: "bg-green-500 text-white"
        });
      } else if (res.data?.message === "Already in favorites") {
        toast({
          title: "⚠️ ইতিমধ্যেই প্রিয় তালিকায় আছে!",
          className: "bg-yellow-500 text-white"
        });
      }
    } catch (err) {
      toast({
        title: "❌ কিছু সমস্যা হয়েছে!",
        className: "bg-red-500 text-white"
      });
    }
  };

  // 🛒 Add to cart
  const handleAddToCart = async (productId) => {
    if (!user?.email) {
      toast({
        title: "অনুগ্রহ করে লগইন করুন!",
        className: "bg-red-500 text-white"
      });
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/cart`, {
        productId,
        email: user.email,
      });

      if (res.data) {
        const data = await axios.get(`${import.meta.env.VITE_BASE_URL}/cart`);
        setCartData(data.data.filter(item => item.email === user.email));
        toast({
          title: "🛒 প্রোডাক্ট কার্টে যুক্ত হয়েছে!",
          className: "bg-green-500 text-white"
        });
      }
    } catch (err) {
      toast({
        title: "❌ কার্টে যোগ করতে সমস্যা হয়েছে!",
        className: "bg-red-500 text-white"
      });
    }
  };

  // Navigate to product details
  const handleProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl relative border border-gray-100"
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Love Icon with Animation */}
      <motion.div
        onClick={() => handleLoveClick(product._id)}
        className="absolute top-4 right-4 z-10"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <Heart className="w-6 h-6 text-red-500 hover:text-red-600 transition-colors" />
      </motion.div>

      {/* Product Image */}
      <div className="relative aspect-square bg-gray-50 rounded-t-xl overflow-hidden">
        <motion.img
          alt={product.name}
          className="w-full h-full object-cover"
          src={product?.thumbnail}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
        {/* Overlay for non-members */}
        <AnimatePresence>
          {!isMember && (
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Lock className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-4">
          {isMember ? (
            <span className="text-xl font-bold text-gray-900">
              ৳{product.price}
            </span>
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

        {/* Buttons */}
        {isMember ? (
          <div className="flex gap-2 w-full">
            <Button
              className=" w-full bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              onClick={() => handleProductDetails(product._id)}
            >
              Details
            </Button>
            <Button
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              onClick={() => handleAddToCart(product._id)}
            >
              <ShoppingCart size={18} />

            </Button>
          </div>
        ) : (
          <Button
            asChild
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Link to="/membership">দাম দেখতে মেম্বার হোন</Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;