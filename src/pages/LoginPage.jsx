import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Mail, Lock, LogIn, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.search.split("?redirect=")[1] || "/dashboard";
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Load logo dynamically
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/sign_up_banner`);
        setLogo(res?.data?.image);
      } catch (err) {
        console.error("Failed to fetch logo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogo();
  }, []);

  // 🔹 Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "🎉 লগইন সফল হয়েছে!",
          description: "আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।",
        });
        setTimeout(() => window.location.reload(), 1000);
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

  // 🔹 Loading Screen
  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-slate-100">
        <Loader className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>লগইন - UniDropEx</title>
        <meta name="description" content="UniDropEx-এ লগইন করে আপনার ড্যাশবোর্ডে প্রবেশ করুন।" />
      </Helmet>

      <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 overflow-hidden">
        {/* Background blur image */}
        {logo && (
          <img
            src={logo}
            alt="UniDropEx Logo"
            className="absolute inset-0 w-full h-full object-cover opacity-80 blur-sm"
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 bg-white/30 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl max-w-md w-full border border-orange-100"
        >
          <div className="text-center mb-8">
            {/* {logo && (
              <motion.img
                src={logo}
                alt="Logo"
                className="mx-auto w-20 h-20 rounded-full shadow-sm object-cover"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
            )} */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4">
              আবারও স্বাগতম!
            </h1>
            <p className="text-gray-600 mt-1">চালিয়ে যেতে লগইন করুন</p>
          </div>

          {/* 🔹 Login Form */}
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
                <span className="text-gray-700">আমাকে মনে রাখুন</span>
              </label>
              <button
                type="button"
                onClick={() => toast({ title: "🚧 এই ফিচারটি এখনও চালু হয়নি।" })}
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

          <p className="mt-8 text-center text-gray-600 text-sm">
            অ্যাকাউন্ট নেই?{" "}
            <Link
              to={`/signup?redirect=${from}`}
              className="font-semibold text-orange-600 hover:underline"
            >
              সাইন আপ করুন
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
