import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { User, Mail, Lock, UserPlus, Phone, LogIn } from 'lucide-react';
import { Truck, CheckCircle, MessageSquare, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaBars } from 'react-icons/fa';
import LoginPage from './LoginPage';
import Kivabe from './Kivabe';
import Amader from './Amader';
import Keno from './Keno';
const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [logo, setLogo] = useState(null)
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.search.split('?redirect=')[1] || '/';
  const base_url = import.meta.env.VITE_BASE_URL;
  const [openNav, setOpenNav] = useState(false)
  const [openLoginForm, setOpenLoginForm] = useState(false)
  const [openAmaderSomporke, setOpenAmaderSomporke] = useState(false)
  const [openKaj, setOpenKaj] = useState(false)

  const [uploadedBanner, setUploadedBanner] = useState(null);
  const [openForm, setOpenForm] = useState(false)
  const [openHero, setOpenHero] = useState(true)

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

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const scaleUp = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };


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
            window.location.reload()

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

  // handle login------->
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "🎉 লগইন সফল হয়েছে!",
          description: "আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।",
        });
        window.location.reload()
        navigate(from, { replace: true });
      } else {
        toast({
          variant: "destructive",
          title: "❌ লগইন ব্যর্থ হয়েছে",
          description: "ইমেইল বা পাসওয়ার্ড ভুল।",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ লগইন ব্যর্থ হয়েছে",
        description: error.message || "কিছু ভুল হয়েছে, আবার চেষ্টা করুন।",
      });
    }
  };
  // handlelll
  const handlelll = () => {
    setOpenForm(false);
    setOpenLoginForm(true)
  }
  // handlenav 
  const handleProject = () => {
    setOpenHero(false)
    setOpenAmaderSomporke(false)
    setOpenKaj(true)
  }
  const handleKaj = () => {
    setOpenHero(false)
    setOpenKaj(false)
    setOpenAmaderSomporke(true)
  }

  const handlehOme = () => {
    setOpenHero(true)
    setOpenKaj(false)
    setOpenAmaderSomporke(false)
  }

  return (
    <>
      <Helmet>
        <title>সাইন আপ - UnicDropex</title>
        <meta name="description" content="একটি নতুন অ্যাকাউন্ট তৈরি করুন এবং আমাদের সাথে আপনার যাত্রা শুরু করুন।" />
      </Helmet>

      {/* navigation bar */}
      <div className="bg-white border">
        <div className=" w-full flex justify-between gap-2 md:p-4 py-3 px-1 ">
          {/* left side */}
          <div className="">
            <img className='max-w-[100px] md:max-w-[300px] md:w-full max-h-10 md:max-h-12 ' src={logo} alt="" />
          </div>
          {/* right side */}
          <div className=" items-center md:gap-2 flex">
            <Link className='hover:bg-orange-500  px-2 rounded-lg p-1 hover:text-white text-xs md:text-base'
              onClick={() => handlehOme()}>হোম</Link>
            <Link className='hover:bg-orange-500 text-xs md:text-base px-2 rounded-lg p-1 hover:text-white' onClick={() => handleProject()}>কাজ সম্পর্কে</Link>
            <Link className='hover:bg-orange-500 text-xs md:text-base px-2 rounded-lg p-1 hover:text-white'
              onClick={() => handleKaj()}
            >আমাদের সম্পর্কে</Link>
            <div className='hover:bg-orange-600 text-xs md:text-base px-2 text-white hover:text-black rounded-md md:rounded-lg p-1 cursor-pointer bg-orange-500' onClick={() => setOpenForm(true)} >সাইন আপ</div>
          </div>
          {/* icon */}
          {/* <div className="md:hidden flex items-center gap-4">

            <div className='hover:bg-orange-600 px-2 text-white hover:text-black rounded-lg p-1 cursor-pointer bg-orange-500' onClick={() => setOpenForm(true)} >সাইন আপ</div>
            <FaBars onClick={() => setOpen(true)} className='text-2xl cursor-pointer text-orange-500' />
          </div> */}

        </div>
      </div>
      {/* hero section */}
      {
        openHero && <div className="">
          <div className="w-full h-[95vh] md:h-[94vh] relative -mb-32 sm:-mb-12 md:-mb-0 ">
            <img className='w-full h-full opacity-90 object-cover  ' src={uploadedBanner} alt="" />

            <div className="bg-black bg-opacity-20 w-full h-full absolute top-0 left-0 backdrop-blur-[2px]"></div>

            <div className="absolute  top-0 left-0 w-full h-full z-50 flex flex-col justify-center items-center">
              <motion.h1
                initial={{ opacity: 0, y: 150, delay: 1 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl bangla text-center font-extrabold text-white md:text-5xl lg:text-6xl py-4 flex flex-col justify-center items-center gap-5"> UnicDropex - ড্রপশিপিং করে আয় করুন  <span className=""> বিনা পুঁজিতেই!</span></motion.h1>

              <h2 className="text-xl md:text-2xl lg:text-3xl text-center font-semibold text-gray-200 bangla">
                আমরাই এনেছি একটি স্মার্ট অনলাইন আয়ের সহজতম পথ।
              </h2>
              <div
                onClick={() => setOpenLoginForm(true)}
                className='p-2 px-4 bg-orange-500 text-lg md:text-xl rounded-lg text-white hover:text-black mt-6 hover:bg-orange-600 cursor-pointer'>আজই শুরু করুন</div>
            </div>

          </div>
          {/* keno */}
          <div className="mt-24 md:mt-16 lg:mt-6">

            <div className="bg-white">
              {/* Section 1 */}
              <motion.section
                className="py-16 px-4 max-w-6xl mx-auto text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <motion.h2
                  className="text-3xl font-bold text-gray-800 mb-12"
                  variants={fadeUp}
                >
                  কেন আমাদের বেছে নেবেন?
                </motion.h2>

                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 gap-8"
                  variants={fadeIn}
                >
                  {[
                    { icon: MessageSquare, text: '২৪/৭ চ্যাট সাপোর্ট' },
                    { icon: CheckCircle, text: 'যাচাইকৃত বিক্রেতা' },
                    { icon: Truck, text: 'তাত্ক্ষণিক অর্ডার স্ট্যাটাস' },
                    { icon: Award, text: 'রেফারেল বোনাস' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center"
                      variants={scaleUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        className="mb-3"
                      >
                        <item.icon className="w-10 h-10 text-orange-500" />
                      </motion.div>
                      <span className="font-semibold tracking-wide text-gray-700">
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>

              {/* Section 2 */}
              <motion.section
                className="bg-slate-50 py-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <motion.div
                  className="max-w-3xl mx-auto px-4 text-center bg-white p-10 rounded-xl shadow-lg"
                  variants={scaleUp}
                >
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    ড্রপশিপিং শুরু করতে প্রস্তুত?
                  </h2>
                  <p className="text-gray-600 mb-8">
                    আমাদের উদ্যোক্তাদের কমিউনিটিতে যোগ দিন এবং আজই আপনার সফল অনলাইন ব্যবসা শুরু করুন।
                  </p>
                  <motion.div
                    className="flex justify-center gap-4"
                    variants={fadeIn}
                  >
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Button size="lg" onClick={() => handlelll()}>
                        শুরু করুন
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Button size="lg" variant="outline"
                        onClick={() => setOpenForm(true)}>
                        সদস্য হন
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.section>
            </div>
          </div>

        </div>
      }

      {/* open kaj */}
      {
        openKaj && <div className="">
          <Kivabe></Kivabe>
        </div>
      }
      {
        openAmaderSomporke && <div className="">
          <Amader></Amader>
        </div>
      }

      {
        openForm &&
        <motion.div
          initial={{ opacity: 0, scale: 0.70 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}

          className="w-full absolute inset-0 backdrop-blur-sm h-full flex justify-center items-center p-4 z-50 ">
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

              <p className="mt-6 sm:mt-8 text-center  text-gray-300">
                ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{' '}
                <div
                  onClick={() => handlelll()}
                  className="font-semibold cursor-pointer mt-2 text-orange-600 hover:underline">
                  লগইন করুন
                </div>
              </p>
            </div>

          </div>
        </motion.div>
      }
      {/* login form */}
      {
        openLoginForm && <div className="">
          <motion.div
            initial={{ opacity: 0, scale: 0.70 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}

            className="w-full absolute inset-0 backdrop-blur-sm h-full flex justify-center items-center p-4 z-50 ">
            <div className="lg:w-1/2 w-full flex items-center justify-center p-4 sm:p-6 md:p-8">

              <div className="w-full max-w-md bg-black/40 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">স্বাগতম!</h1>
                  <p className="text-gray-200 mt-2"> চালিয়ে যেতে লগইন করুন</p>
                </div>

                {/* login form */}

                <div className="">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="আপনার ইমেইল"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        placeholder="আপনার পাসওয়ার্ড"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="accent-orange-500 h-4 w-4 rounded" />
                        <span className="text-gray-200">আমাকে মনে রাখুন</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toast({ title: "🚧 পাসওয়ার্ড পরিবর্তনের জন্য হেল্পলাইনে যোগাযোগ করুন ।" })}
                        className="text-orange-600 hover:text-orange-500 font-medium"
                      >
                        পাসওয়ার্ড ভুলে গেছেন?
                      </button>
                    </div>

                    <Button
                      size="lg"
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold rounded-xl shadow-md transition"
                      type="submit"
                    >
                      <LogIn className="w-5 h-5" />
                      লগইন
                    </Button>
                  </form>

                  <p className="mt-8 text-xl text-center text-gray-100 ">
                    অ্যাকাউন্ট নেই?{" "}
                    <div
                      onClick={() => {
                        setOpenLoginForm(false);
                        setOpenSignUpForm(false);
                      }}
                      className="font-semibold mt-2 text-sm cursor-pointer text-orange-600 hover:underline"
                    >
                      হোম এ ফিরে যান
                    </div>
                  </p>
                </div>


              </div>

            </div>
          </motion.div>
        </div>
      }
    </>
  );
};

export default SignUpPage;