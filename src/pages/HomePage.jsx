import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import HeroSection from '@/components/sections/HeroSection';
import PromoCarousel from '@/components/sections/PromoCarousel';
import CategoriesSection from '@/components/sections/CategoriesSection';
import ProductSection from '@/components/sections/ProductSection';
import ReferralSection from '@/components/sections/ReferralSection';
import { allProducts as products } from '@/data/products';
import axios from 'axios';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState([]);
  const base_url = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    axios.get(`${base_url}/products`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <>
      <Helmet>
        <title>লেটসড্রপশিপ - আপনার চূড়ান্ত শপিং গন্তব্য</title>
        <meta name="description" content="আকর্ষণীয় ডিল সহ দারুণ সব পণ্য আবিষ্কার করুন। ঘরে বসে কেনাকাটা করুন এবং আমাদের রেফারেল প্রোগ্রামের মাধ্যমে বড় সঞ্চয় করুন!" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <HeroSection />
      </div>

      <PromoCarousel />

      <CategoriesSection />
      {
        loading ? <div className='flex justify-center items-center py-30'>Loading...</div> : null
      }
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductSection
          title="নতুন পণ্য"
          products={product.slice(0, 4)}
          emoji="🆕"
        />

        <ProductSection
          title="সর্বাধিক বিক্রিত পণ্য"
          products={product.sort((a, b) => b.totalSell - a.totalSell).slice(0, 4)}
          emoji="📈"
        />

        <ProductSection
          title="অফার প্যাক"
          products={product.filter(p => p.sectionName === "অফার প্যাক")}
          emoji="🎁"
        />

        <ProductSection
          title="ছেলেদের ফ্যাশন"
          products={product.filter(p => p.sectionName === "ছেলেদের ফ্যাশন").slice(0, 4)}
          emoji="👕"
        />

        <ProductSection
          title="মেয়েদের ফ্যাশন"
          products={product.filter(p => p.sectionName === "মেয়েদের ফ্যাশন").slice(0, 4)}
          emoji="👗"
        />

        <ProductSection
          title="ঘর ও লাইফস্টাইল"
          products={product.filter(p => p.sectionName === "ঘর ও লাইফস্টাইল").slice(0, 4)}
          emoji="🏡"
        />

        <ProductSection
          title="গ্যাজেট ও ইলেকট্রনিক্স"
          products={product.filter(p => p.sectionName === "গ্যাজেট ও ইলেকট্রনিক্স").slice(0, 4)}
          emoji="📱"
        />

        <ProductSection
          title="কিডস জোন"
          products={product.filter(p => p.sectionName === "কিডস জোন").slice(0, 4)}
          emoji="👶"
        />

        <ProductSection
          title="কম্বো প্যাক ও গিফট প্যাক"
          products={product.filter(p => p.sectionName === "কম্বো প্যাক ও গিফট প্যাক").slice(0, 4)}
          emoji="🎀"
        />

        <ProductSection
          title="কাস্টমার গিফট জোন"
          products={product.filter(p => p.sectionName === "কাস্টমার গিফট জোন").slice(0, 4)}
          emoji="🛍"
        />
      </div>

      <ReferralSection />
    </>
  );
};

export default HomePage;