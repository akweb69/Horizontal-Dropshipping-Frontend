import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { User, Mail, Lock, UserPlus, Phone, LogIn, Menu, X } from 'lucide-react';
import { Truck, CheckCircle, MessageSquare, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import Kivabe from './Kivabe';
import Amader from './Amader';

const SignUpPage = () => {
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // UI States
  const [logo, setLogo] = useState(null);
  const [uploadedBanner, setUploadedBanner] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openLoginForm, setOpenLoginForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero'); // hero, kaj, amader

  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const base_url = import.meta.env.VITE_BASE_URL;

  // Fetch Banner & Logo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannerRes, logoRes] = await Promise.all([
          axios.get(`${base_url}/sign_up_banner`),
          axios.get(`${base_url}/website-logo`)
        ]);
        setUploadedBanner(bannerRes?.data?.image);
        setLogo(logoRes?.data?.logo);
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      }
    };
    fetchData();
  }, [base_url]);

  // Animation Variants
  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
  const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
  const scaleUp = { hidden: { scale: 0.8, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } } };

  // Section Handler
  const goToSection = (section) => {
    setActiveSection(section);
    setOpenForm(false);
    setOpenLoginForm(false);
    setMobileMenuOpen(false);
  };

  // Sign Up Handler
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || phone.length < 11 || password.length < 6) {
      toast({ variant: "destructive", title: "সব তথ্য সঠিকভাবে পূরণ করুন" });
      return;
    }

    setLoading(true);
    try {
      const success = await signup(email, password, name);
      if (!success) throw new Error("Firebase signup failed");

      const urlParams = new URLSearchParams(location.search);
      const reference = urlParams.get('ref') || urlParams.get('reference') || null;
      const referralCode = name.slice(0, 2).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

      await axios.post(`${base_url}/users`, {
        name: name.trim(),
        email: email.toLowerCase(),
        phone,
        isAuthenticated: true,
        reference,
        isAdmin: false,
        isMember: false,
        storeConnected: false,
        storeType: null,
        balance: 0,
        sellCount: 0,
        purchaseCount: 0,
        sellAmount: 0,
        purchaseAmount: 0,
        subscription: {
          plan: "No Plan",
          validUntil: new Date().toISOString(),
          importsRemaining: 100,
          importsTotal: 100,
          storeConnected: false,
          storeType: null,
        },
        myReferralCode: referralCode,
        myReferralUser: [],
        referIncome: 0,
        myStore: null,
        role: "user",
        date: new Date().toISOString(),
        isPuki: password
      });

      toast({ title: "সাইন আপ সফল!", description: `রেফারেল কোড: ${referralCode}` });
      navigate("/");
      window.location.reload();

    } catch (error) {
      const msg = error.code?.startsWith('auth/')
        ? {
          'auth/email-already-in-use': 'ইমেইলটি ইতিমধ্যে ব্যবহৃত',
          'auth/invalid-email': 'অবৈধ ইমেইল',
          'auth/weak-password': 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
        }[error.code] || 'অথেনটিকেশন সমস্যা'
        : error.response?.data?.message || 'সার্ভারে সমস্যা';

      toast({ variant: "destructive", title: "সাইন আপ ব্যর্থ", description: msg });
    } finally {
      setLoading(false);
    }
  };

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast({ title: "লগইন সফল!", description: "ড্যাশবোর্ডে যাচ্ছেন..." });
        navigate("/");
        window.location.reload();
      } else {
        toast({ variant: "destructive", title: "লগইন ব্যর্থ", description: "ইমেইল বা পাসওয়ার্ড ভুল" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "লগইন ব্যর্থ", description: error.message || "কিছু ভুল হয়েছে" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>সাইন আপ - UnicDropex</title>
        <meta name="description" content="নতুন অ্যাকাউন্ট তৈরি করে ড্রপশিপিং শুরু করুন।" />
      </Helmet>

      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-3 md:p-4">
          <img src={logo} alt="Logo" className="h-10 md:h-12" />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => goToSection('hero')} className="px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition">হোম</button>
            <button onClick={() => goToSection('kaj')} className="px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition">কাজ সম্পর্কে</button>
            <button onClick={() => goToSection('amader')} className="px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition">আমাদের সম্পর্কে</button>
            <button onClick={() => { setOpenForm(true); setMobileMenuOpen(false); }} className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600 transition">সাইন আপ</button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center  gap-2 md:hidden">
            <button onClick={() => { setOpenForm(true); setMobileMenuOpen(false); }} className="bg-orange-500 text-white py-2 px-2 rounded">সাইন আপ</button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className=" p-2  rounded  bg-orange-500 text-white">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 " />}
            </button>

          </div>

          {/*  */}

        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="flex flex-col p-4 space-y-2">
              <button onClick={() => goToSection('hero')} className="text-left py-2 hover:text-orange-500">হোম</button>
              <button onClick={() => goToSection('kaj')} className="text-left py-2 hover:text-orange-500">কাজ সম্পর্কে</button>
              <button onClick={() => goToSection('amader')} className="text-left py-2 hover:text-orange-500">আমাদের সম্পর্কে</button>
              <button onClick={() => { setOpenForm(true); setMobileMenuOpen(false); }} className="bg-orange-500 text-white py-2 rounded">সাইন আপ</button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      {activeSection === 'hero' && (
        <div>
          <div className="relative h-[94vh]">
            <img src={uploadedBanner} alt="Banner" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white bangla"
              >
                UnicDropex - ড্রপশিপিং করে আয় করুন <span className="block mt-2">বিনা পুঁজিতেই!</span>
              </motion.h1>
              <p className="mt-4 text-lg md:text-2xl text-gray-200 bangla">স্মার্ট অনলাইন আয়ের সহজ পথ</p>
              <button
                onClick={() => setOpenLoginForm(true)}
                className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-lg"
              >
                আজই শুরু করুন
              </button>
            </div>
          </div>

          {/* Why Choose Us */}
          <section className="py-16 px-4 max-w-6xl mx-auto text-center">
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-3xl font-bold mb-12">
              কেন আমাদের বেছে নেবেন?
            </motion.h2>
            <motion.div variants={fadeIn} initial="hidden" whileInView="visible" className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: MessageSquare, text: '২৪/৭ চ্যাট সাপোর্ট' },
                { icon: CheckCircle, text: 'যাচাইকৃত বিক্রেতা' },
                { icon: Truck, text: 'তাত্ক্ষণিক ডেলিভারি' },
                { icon: Award, text: 'রেফারেল বোনাস' },
              ].map((item, i) => (
                <motion.div key={i} variants={scaleUp} initial="hidden" whileInView="visible" transition={{ delay: i * 0.1 }}>
                  <item.icon className="w-12 h-12 mx-auto text-orange-500 mb-2" />
                  <p className="font-medium">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* CTA */}
          <section className="bg-slate-50 py-16">
            <motion.div
              variants={scaleUp}
              initial="hidden"
              whileInView="visible"
              className="max-w-3xl mx-auto text-center bg-white p-10 rounded-xl shadow-lg"
            >
              <h2 className="text-3xl font-bold mb-4">ড্রপশিপিং শুরু করতে প্রস্তুত?</h2>
              <p className="text-gray-600 mb-8">আজই আমাদের কমিউনিটিতে যোগ দিন!</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button size="lg" onClick={() => setOpenLoginForm(true)}>শুরু করুন</Button>
                <Button size="lg" variant="outline" onClick={() => setOpenForm(true)}>সদস্য হন</Button>
              </div>
            </motion.div>
          </section>
        </div>
      )}

      {/* Other Sections */}
      {activeSection === 'kaj' && <Kivabe />}
      {activeSection === 'amader' && <Amader />}

      {/* Sign Up Modal */}
      {openForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setOpenForm(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white/20 backdrop-blur p-6 md:p-8 rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-2xl md:text-3xl text-orange-500 font-bold text-center mb-2">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
            <p className="text-center text-gray-900 mb-6">আমাদের কমিউনিটিতে যোগ দিন!</p>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="পুরো নাম" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ইমেইল" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ফোন নম্বর" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="পাসওয়ার্ড" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500" />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" required className="accent-orange-500" />
                <span>আমি <a href="#" className="text-orange-600 underline">শর্তাবলী</a> মেনে চলব</span>
              </label>

              <Button type="submit" size="lg" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    সাইন আপ হচ্ছে...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    সাইন আপ
                  </>
                )}
              </Button>
            </form>

            <p className="text-center mt-4 text-sm">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <button onClick={() => { setOpenForm(false); setOpenLoginForm(true); }} className="text-orange-600 font-medium hover:underline">
                লগইন করুন
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Login Modal */}
      {openLoginForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setOpenLoginForm(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-white/20 backdrop-blur p-6 md:p-8 rounded-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-2xl md:text-3xl text-orange-500 font-bold text-center mb-2">স্বাগতম!</h1>
            <p className="text-center text-gray-900 mb-6">লগইন করে চালিয়ে যান</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ইমেইল" className="w-full pl-10 pr-4 py-3 border rounded-xl" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="পাসওয়ার্ড" className="w-full pl-10 pr-4 py-3 border rounded-xl" />
              </div>

              <div className="flex justify-between text-sm">
                <label className="flex items-center gap-1">
                  <input type="checkbox" className="accent-orange-500 " />
                  <span className='text-gray-900'>মনে রাখুন</span>
                </label>
                <button type="button" onClick={() => toast({ title: "হেল্পলাইনে যোগাযোগ করুন" })} className="text-orange-600 hover:underline">
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>

              <Button type="submit" size="lg" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
                {loading ? 'লগইন হচ্ছে...' : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    লগইন
                  </>
                )}
              </Button>
            </form>

            <p className="text-center mt-4 text-sm">
              অ্যাকাউন্ট নেই?{' '}
              <button onClick={() => goToSection('hero')} className="text-orange-600 font-medium hover:underline">
                হোমে ফিরুন
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default SignUpPage;