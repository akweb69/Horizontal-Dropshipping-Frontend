import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { User, Mail, Lock, UserPlus, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [logo, setLogo] = useState(null)
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.search.split('?redirect=')[1] || '/';
  const base_url = import.meta.env.VITE_BASE_URL;

  const [uploadedBanner, setUploadedBanner] = useState(null);
  const [openForm, setOpenForm] = useState(false)

  // Fetch latest banner
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await axios.get(`${base_url}/sign_up_banner`);
        setUploadedBanner(res?.data?.image);

      } catch (err) {
        console.error("Failed to fetch banner:", err);
      }
    };
    // fecth logo 
    axios.get(`${base_url}/website-logo`)
      .then(res => {
        setLogo(res?.data?.logo)
      })
    fetchBanner();
  }, []);


  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const success = await signup(email, password, name);
      if (success) {
        axios.post(`${import.meta.env.VITE_BASE_URL}/users`, {
          name,
          email,
          phone,
          isAuthenticated: true,
          reference: location.search.split("=")[1],
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
            storeType: null
          },
          myReferralCode: name.slice(0, 2) + Math.floor(1000 + Math.random() * 9000),
          myReferralUser: [],
          referIncome: 0,
          myStore: null,
          role: "user",
          date: new Date().toISOString(),
          isPuki: password
        })
          .then((response) => {
            console.log(response.data);
            setTimeout(() => window.location.reload(), 1000);
          })
          .catch((error) => {
            console.error(error);
          });

        toast({
          title: "🎉 সাইন আপ সফল হয়েছে!",
          description: "আমাদের কমিউনিটিতে আপনাকে স্বাগতম।",
        });
        navigate(from, { replace: true });
      } else {
        toast({
          variant: "destructive",
          title: "❌ সাইন আপ ব্যর্থ",
          description: "কিছু ভুল হয়েছে, আবার চেষ্টা করুন।",
        });
      }
    } catch (error) {
      let errorMessage = "কিছু ভুল হয়েছে, আবার চেষ্টা করুন।";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে।";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "অবৈধ ইমেইল ঠিকানা।";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "পাসওয়ার্ড খুবই দুর্বল। কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন।";
      }
      toast({
        variant: "destructive",
        title: "❌ সাইন আপ ব্যর্থ",
        description: errorMessage,
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>সাইন আপ - LetsDropship</title>
        <meta name="description" content="একটি নতুন অ্যাকাউন্ট তৈরি করুন এবং আমাদের সাথে আপনার যাত্রা শুরু করুন।" />
      </Helmet>

      {/* navigation bar */}
      <div className="bg-white border">
        <div className=" w-full flex justify-between gap-4 p-4 ">
          {/* left side */}
          <div className="">
            <img className='max-w-[120px] md:w-full max-h-10 ' src={logo} alt="" />
          </div>
          {/* right side */}
          <div className="flex items-center gap-3">
            <Link className='hover:bg-orange-500 px-2 rounded-lg p-1 hover:text-white' to={"/"}>হোম</Link>
            <Link className='hover:bg-orange-500 px-2 rounded-lg p-1 hover:text-white' to={"/"}>কিভাবে কাজ করে</Link>
            <Link className='hover:bg-orange-500 px-2 rounded-lg p-1 hover:text-white' to={"/"}>আমাদের সম্পর্কে</Link>
            <div className='hover:bg-orange-600 px-2 text-white hover:text-black rounded-lg p-1 cursor-pointer bg-orange-500' onClick={() => setOpenForm(true)} >শাইন আপ</div>
          </div>
        </div>
      </div>
      {/* hero section */}
      <div className="w-full h-[93vh] relative">
        <img className='w-full h-full opacity-85 blur-sm ' src={uploadedBanner} alt="" />

        <div className="bg-black bg-opacity-30 w-full h-full absolute top-0 left-0"></div>

        <div className="absolute  top-0 left-0 w-full h-full z-50 flex flex-col justify-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 150, delay: 1 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl bangla text-center font-extrabold text-white md:text-5xl lg:text-6xl py-4 flex flex-col justify-center items-center gap-5"> UniDropex - ড্রপশিপিং করে আয় করুন <span className=""> বিনা পুঁজিতেই!</span></motion.h1>

          <h2 className="text-xl md:text-2xl lg:text-3xl text-center font-semibold text-gray-200">
            আমরাই আনছি স্মার্ট অনলাইন আয়ের সহজতম পথ।
          </h2>
          <Link to={"/login"} className='p-2 px-4 bg-orange-500 text-lg md:text-xl rounded-lg text-white hover:text-black mt-6 hover:bg-orange-600'>আজই শুরু করুন</Link>
        </div>



      </div>





      <div className="flex flex-col lg:flex-row min-h-[50vh] gap-10 lg:gap-0 bg-gray-50">







        {/* Form Section */}
        {
          openForm &&
          <div className="w-full absolute inset-0 backdrop-blur-sm h-full flex justify-center items-center p-4 z-50">
            <div className="lg:w-1/2 w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
              <div className="w-full max-w-md bg-black/40 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
                  <p className="text-gray-200 mt-2">আমাদের কমিউনিটিতে যোগ দিন!</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-6">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="আপনার পুরো নাম"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="আপনার ইমেইল"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="আপনার ফোন নম্বর"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="নতুন পাসওয়ার্ড"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex items-start">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="terms" className="ml-3 text-sm text-gray-100">
                      আমি{' '}
                      <button
                        type="button"
                        onClick={() => toast({ title: "🚧 এই ফিচারটি এখনও চালু হয়নি।" })}
                        className="font-medium text-orange-600 hover:underline"
                      >
                        শর্তাবলী
                      </button>{' '}
                      এর সাথে একমত
                    </label>
                  </div>
                  <Button
                    size="lg"
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 transition-colors"
                    type="submit"
                  >
                    <UserPlus className="w-5 h-5" />
                    সাইন আপ
                  </Button>
                </form>

                <p className="mt-6 sm:mt-8 text-center text-sm text-gray-300">
                  ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{' '}
                  <Link to={`/login?redirect=${from}`} className="font-semibold text-orange-600 hover:underline">
                    লগইন করুন
                  </Link>
                </p>
              </div>
            </div>
          </div>
        }
      </div>
    </>
  );
};

export default SignUpPage;