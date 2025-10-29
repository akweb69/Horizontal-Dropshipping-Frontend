import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Mail, Lock, LogIn, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Keno from "./Keno";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.search.split("?redirect=")[1] || "/dashboard";


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
    return <div className="min-h-screen"></div>
  }

  return (
    <>
      <Helmet>
        <title>লগইন - UniDropEx</title>
        <meta name="description" content="UniDropEx-এ লগইন করে আপনার ড্যাশবোর্ডে প্রবেশ করুন।" />
      </Helmet>

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

      <p className="mt-8 text-center text-gray-100 text-sm">
        অ্যাকাউন্ট নেই?{" "}
        <Link
          to={`/signup?redirect=${from}`}
          className="font-semibold text-orange-600 hover:underline"
        >
          হোম এ ফিরে যান
        </Link>
      </p>




    </>
  );
};

export default LoginPage;
