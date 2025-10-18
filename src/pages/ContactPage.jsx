import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Phone, Mail, Clock, Loader } from 'lucide-react';
import axios from 'axios';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState([]);
  // load contact info
  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_BASE_URL}/contact-info`)
      .then(res => {
        setContactInfo(res.data);
        // console.log(res.data);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false))


  }, [])

  // 
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    toast({
      title: "📬 বার্তা পাঠানো হয়েছে!",
      description: "যোগাযোগ করার জন্য ধন্যবাদ। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
    });
    e.target.reset();
    setLoading(false);
  };
  if (loading) {
    return <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500">
        <Loader></Loader>
      </div>
    </div>
  }
  return (
    <>
      <Helmet>
        <title>যোগাযোগ - LetsDropship</title>
        <meta name="description" content="সাহায্য প্রয়োজন? আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন। আমরা আপনাকে সহায়তা করার জন্য ২৪/৭ আছি।" />
      </Helmet>

      <div className="bg-slate-50">
        <section className="py-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">সাহায্য প্রয়োজন?</h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">আমরা আপনাকে সহায়তা করতে এখানে আছি। নিচের যেকোনো মাধ্যমে আমাদের সাথে যোগাযোগ করুন।</p>
          </motion.div>
        </section>

        <section className="pb-16 px-4 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">যোগাযোগ করুন</h2>
              <div className="space-y-6">
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-orange-500 mr-4" />
                  <div>
                    <h3 className="font-semibold">ফোন</h3>
                    <a href={`tel:${contactInfo?.phone}`} className="text-gray-600 hover:text-orange-500">{contactInfo?.phone}</a>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-orange-500 mr-4" />
                  <div>
                    <h3 className="font-semibold">ইমেইল</h3>
                    <a href={`mailto:${contactInfo?.email}`} className="text-gray-600 hover:text-orange-500">{contactInfo?.email}</a>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-orange-500 mr-4" />
                  <div>
                    <h3 className="font-semibold">সাপোর্ট সময়</h3>
                    <p className="text-gray-600">{contactInfo?.supportTime || '২৪/৭ উপলব্ধ - উত্তর দেওয়ার সময়: ২ ঘন্টার মধ্যে'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${contactInfo?.mapBbox}&layer=mapnik&marker=${contactInfo?.mapMarker}`}
                  className="w-full h-64 rounded-xl border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="অফিসের অবস্থান"
                ></iframe>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">আমাদের বার্তা পাঠান</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">নাম</label>
                  <input type="text" id="name" name="name" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">ইমেইল</label>
                  <input type="email" id="email" name="email" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">বার্তা</label>
                  <textarea id="message" name="message" rows="4" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"></textarea>
                </div>
                <div>
                  <Button type="submit" variant="success" className="w-full py-3 text-base">
                    বার্তা পাঠান
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section >
      </div >
    </>
  );
};

export default ContactPage;