import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const { isMember, user, setLoveData } = useAuth();

  const showToast = () => {
    toast({
      title: "🚧 এই ফিচারটি এখনও চালু হয়নি—তবে চিন্তা করবেন না! আপনি পরবর্তী প্রম্পটে এটি যোগ করার জন্য অনুরোধ করতে পারেন! 🚀"
    });
  };
  // handleLoveClick
  const handleLoveClick = (productId) => {
    // check login
    if (!user?.email) {
      toast({
        title: "অনুগ্রহ করে লগইন করুন!",
        className: "bg-red-500 text-white"
      });
      return;
    }
    axios.post(`${import.meta.env.VITE_BASE_URL}/love`, { productId, email: user?.email })
      .then(res => {
        if (res.data.acknowledged) {
          // update love data
          axios.get(`${import.meta.env.VITE_BASE_URL}/love`)
            .then(res => {
              setLoveData(res.data);
            })
            .catch(err => {
              console.log(err);
            })
          toast({
            title: "ফাইভে যোগ করা হয়েছে!",
            className: "bg-green-500 text-white"
          });

        }
      })
      .catch(err => {
        toast({
          title: "কিছু সমস্যা হয়েছে!",
          className: "bg-red-500 text-white"
        });
      });

  };

  return (
    <motion.div
      className="bg-white rounded-lg card-shadow p-4 transition-all duration-300 hover:scale-105"
      whileHover={{ y: -2 }}
    >
      {/* love icon */}
      <div
        onClick={(() => handleLoveClick(product._id))}
        className="absolute top-6 right-6">
        <Heart className="w-6 h-6 text-red-400 cursor-pointer" />
      </div>
      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
        <img alt={product.name} className="w-full h-full object-cover rounded-lg" src={product?.thumbnail} />
      </div>
      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
      <div className="flex items-center justify-between mb-3 min-h-[28px]">
        {isMember ? (
          <span className="text-lg font-bold text-gray-800">{product.price}</span>
        ) : (
          <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
            <Lock size={16} />
            <span>সদস্যদের জন্য</span>
          </div>
        )}
        <div className="flex items-center">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-500 ml-1">৪.৫</span>
        </div>
      </div>
      {isMember ? (
        <Button
          className="w-full"
          onClick={showToast}
        >
          অর্ডার করুন
        </Button>
      ) : (
        <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
          <Link to="/membership">
            দাম দেখতে মেম্বার হোন
          </Link>
        </Button>
      )}
    </motion.div>
  );
};

export default ProductCard;