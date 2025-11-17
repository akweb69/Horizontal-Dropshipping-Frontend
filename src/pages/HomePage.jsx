import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import HeroSection from '@/components/sections/HeroSection';
import PromoCarousel from '@/components/sections/PromoCarousel';
import CategoriesSection from '@/components/sections/CategoriesSection';
import ProductSection from '@/components/sections/ProductSection';
import ReferralSection from '@/components/sections/ReferralSection';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader11 from '../components/layout/Loader11';
// import useProduct from '../components/sections/useProduct';

const HomePage = () => {
  const { user, loading: authLoading, showHomePage, productLoading, products, refetch, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // useProduct hook থেকে সবকিছু নেওয়া হচ্ছে
  // const { products, productLoading, error, refetch } = useProduct();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  // Redirect if user not allowed
  useEffect(() => {
    if (!showHomePage && !authLoading && !productLoading) {
      navigate('/signup', { replace: true });
    }
  }, [showHomePage, authLoading, productLoading, navigate]);

  // Loading states
  if (authLoading || productLoading) {
    return <Loader11 />;
  }

  // Error state (optional: show error UI)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600">প্রোডাক্ট লোড করতে সমস্যা হয়েছে: {error}</p>
        <button
          onClick={refetch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>UnicDropex - আপনার চূড়ান্ত শপিং গন্তব্য</title>
        <meta
          name="description"
          content="আকর্ষণীয় ডিল সহ দারুণ সব পণ্য আবিষ্কার করুন। ঘরে বসে কেনাকাটা করুন এবং আমাদের রেফারেল প্রোগ্রামের মাধ্যমে বড় সঞ্চয় করুন!"
        />
      </Helmet>

      <div>
        <div className="max-w-7xl mx-auto px-4 py-6 bangla">
          <HeroSection />
        </div>
        <PromoCarousel />
        <CategoriesSection />
        <div className="max-w-7xl min-h-screen mx-auto px-4 py-8">
          <ProductSection products={products} />
        </div>
        {products.length > 0 && <ReferralSection />}
      </div>
    </>
  );
};

export default HomePage;