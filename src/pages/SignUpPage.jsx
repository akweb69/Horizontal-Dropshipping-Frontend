import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { User, Mail, Lock, UserPlus, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.search.split('?redirect=')[1] || '/';

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const success = await signup(email, password, name); // Firebase signup ফাংশন কল
      if (success) {
        // send user data to database--->
        axios.post(`${import.meta.env.VITE_BASE_URL}/users`, {
          name,
          email,
          phone,
          reference: null,
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
          myReferralCode: null,
          myReferralUser: [],
          referIncome: 0,
          myStore: null,

        })
          .then((response) => {
            console.log(response.data);
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
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mt-4">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
            <p className="text-gray-600">আমাদের কমিউনিটিতে যোগ দিন!</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-600">
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
            </div>
            <Button
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              type="submit"
            >
              <UserPlus className="w-5 h-5" />
              সাইন আপ
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{' '}
            <Link to={`/login?redirect=${from}`} className="font-semibold text-orange-600 hover:underline">
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;