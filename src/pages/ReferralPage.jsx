
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Share2, Copy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const ReferralPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [referralLink, setReferralLink] = useState('');

  const handleGenerateLink = () => {
    if (!isAuthenticated) {
      toast({
        title: "লগইন করুন",
        description: "রেফারেল লিংক তৈরি করতে অনুগ্রহ করে লগইন করুন।",
        variant: "destructive",
      });
      navigate('/login');
    } else {
      // Assuming the user object has a referralCode property
      const link = `${window.location.origin}/signup?ref=${user?.referralCode || 'newuser'}`;
      setReferralLink(link);
      toast({
        title: "লিংক তৈরি হয়েছে!",
        description: "আপনার রেফারেল লিংক সফলভাবে তৈরি করা হয়েছে।",
      });
    }
  };

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
        .then(() => {
          toast({
            title: "কপি করা হয়েছে!",
            description: "রেফারেল লিংক আপনার ক্লিপবোর্ডে কপি করা হয়েছে।",
          });
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast({
            title: "কপি করতে ব্যর্থ",
            description: "লিংকটি কপি করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <>
      <Helmet>
        <title>রেফারেল প্রোগ্রাম - LetsDropship</title>
        <meta name="description" content="LetsDropship রেফারেল প্রোগ্রামে যোগ দিন এবং আয় করুন।" />
      </Helmet>
      <div className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }}></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight"
          >
            বন্ধুদের রেফার করুন, উপার্জন করুন!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          >
            আপনার বন্ধুদের LetsDropship-এ রেফার করুন এবং প্রতিটি সফল সাইনআপ বা কেনাকাটার জন্য বিশেষ পুরস্কার ও কমিশন পান।
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-xl mx-auto"
          >
            {!referralLink ? (
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-bold rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg transform hover:-translate-y-1"
                onClick={handleGenerateLink}
              >
                <Share2 className="mr-3 h-6 w-6" />
                রেফারেল লিংক তৈরি করুন
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-black/30 rounded-xl border border-white/20"
              >
                <Input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="w-full text-center sm:text-left font-mono bg-transparent text-white border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-gray-400"
                  placeholder="আপনার রেফারেল লিংক..."
                />
                <Button
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto px-6 py-3 text-base bg-orange-500 hover:bg-orange-600 rounded-lg shrink-0"
                >
                  <Copy className="mr-2 h-5 w-5" />
                  কপি
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">কিভাবে কাজ করে?</h2>
          <p className="text-gray-600 mt-2">মাত্র ৩টি সহজ ধাপে আয় শুরু করুন।</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border"
          >
            <div className="p-4 bg-orange-100 rounded-full inline-block mb-4">
              <Share2 className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">শেয়ার করুন</h3>
            <p className="text-gray-600">আপনার অনন্য রেফারেল লিংক বন্ধু এবং পরিবারের সাথে শেয়ার করুন।</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border"
          >
            <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
              <img alt="People signing up" class="w-8 h-8 text-blue-500" src="https://images.unsplash.com/photo-1643101447193-9c59d5db2771" />
            </div>
            <h3 className="text-xl font-semibold mb-2">তারা সাইনআপ করুক</h3>
            <p className="text-gray-600">আপনার রেফারেল লিংক ব্যবহার করে যখন কেউ সাইনআপ করবে।</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border"
          >
            <div className="p-4 bg-green-100 rounded-full inline-block mb-4">
              <img alt="Money bag icon" class="w-8 h-8 text-green-500" src="https://images.unsplash.com/photo-1638913971789-667874197280" />
            </div>
            <h3 className="text-xl font-semibold mb-2">উপার্জন করুন</h3>
            <p className="text-gray-600">প্রতিটি সফল রেফারেলে নগদ টাকা বা ডিসকাউন্ট পান।</p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ReferralPage;
