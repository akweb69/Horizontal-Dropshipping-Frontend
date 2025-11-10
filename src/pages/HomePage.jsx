import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import HeroSection from '@/components/sections/HeroSection';
import PromoCarousel from '@/components/sections/PromoCarousel';
import CategoriesSection from '@/components/sections/CategoriesSection';
import ProductSection from '@/components/sections/ProductSection';
import ReferralSection from '@/components/sections/ReferralSection';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loader11 from '../components/layout/Loader11';
import BackToTop from '../components/layout/BackToTop';

const HomePage = () => {
  const [loading1, setLoading1] = useState(true);
  const [product, setProduct] = useState([]);
  const base_url = import.meta.env.VITE_BASE_URL;
  const { user, loading, showHomePage } = useAuth();
  const navigate = useNavigate();



  useEffect(() => {
    axios.get(`${base_url}/products`)
      .then(res => {
        setProduct(res.data);
        setLoading1(false);
      })
      .catch(err => {
        console.log(err)
        setLoading1(false);
      });
    setLoading1(false);
  }, []);


  if (!showHomePage && !loading && !loading1) {
    navigate('/signup');
  }




  return (
    <>
      <Helmet>
        <title>লেটসড্রপশিপ - আপনার চূড়ান্ত শপিং গন্তব্য</title>
        <meta name="description" content="আকর্ষণীয় ডিল সহ দারুণ সব পণ্য আবিষ্কার করুন। ঘরে বসে কেনাকাটা করুন এবং আমাদের রেফারেল প্রোগ্রামের মাধ্যমে বড় সঞ্চয় করুন!" />
      </Helmet>
      <BackToTop></BackToTop>
      {
        !loading1 && !loading ? <div className="">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <HeroSection />
          </div>
          <PromoCarousel />
          <CategoriesSection />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <ProductSection
              products={product}
            />
          </div>
          <ReferralSection />
        </div> : <div className="">
          <Loader11></Loader11>
        </div>

      }


    </>
  );
};

export default HomePage;