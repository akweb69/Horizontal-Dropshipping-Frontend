import axios from 'axios';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader11 from './Loader11';

const Footer = () => {
  const [websiteData, setWebsiteData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const base_url = import.meta.env.VITE_BASE_URL;
  const date = new Date().getFullYear().toLocaleString('bn-BD');

  // laod data
  useEffect(() => {
    axios.get(`${base_url}/website-logo`)
      .then((response) => {
        setWebsiteData(response.data.logo);
        setLoading(false);
        console.log('Website logo fetched:', response.data.logo);
      })
      .catch((error) => {
        console.error('Error fetching website logo:', error);
        setLoading(false);
      });
  }, [])
  if (loading) {
    <Loader11></Loader11>
  }
  return (
    <footer className="bg-gray-800 text-white py-12 bangla">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img className='max-h-8' src={websiteData} alt="UnicDropex" />
            <p className="mt-4 text-gray-300 text-sm">আপনার ড্রপশিপিং ব্যবসার জন্য সেরা প্ল্যাটফর্ম।</p>
          </div>
          <div>
            <span className="font-semibold text-lg mb-4 block">কোম্পানি</span>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">আমাদের গল্প</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">ক্যারিয়ার</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">প্রেস</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-semibold text-lg mb-4 block">গ্রাহক সেবা</span>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">যোগাযোগ করুন</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">ফেরত নীতি</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">গোপনীয়তা নীতি</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-semibold text-lg mb-4 block">দ্রুত অ্যাক্সেস</span>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">অর্ডার ট্র্যাক করুন</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">উইশলিস্ট</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">সাপোর্ট</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300 text-sm">
          <p>&copy; {date} লেটসড্রপশিপ। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;