import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Phone, Mail, Clock, Loader2, Send } from 'lucide-react';
import axios from 'axios';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({});

  // Load contact info
  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_BASE_URL}/contact-info`)
      .then(res => setContactInfo(res.data || {}))
      .catch(err => {
        console.error('Contact info load failed:', err);
        toast({
          title: 'তথ্য লোড করতে সমস্যা',
          description: 'যোগাযোগের তথ্য দেখাতে ব্যর্থ।',
          variant: 'destructive'
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      message: e.target.message.value.trim(),
      submittedAt: new Date().toISOString()
    };

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'সব তথ্য পূরণ করুন',
        description: 'নাম, ইমেইল এবং বার্তা আবশ্যক।',
        variant: 'destructive'
      });
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/contact-us`, formData);

      if (response.data.acknowledged) {
        toast({
          title: 'বার্তা পাঠানো হয়েছে!',
          description: 'ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
        });
        e.target.reset();
      }
    } catch (err) {
      console.error('Submit failed:', err);
      toast({
        title: 'বার্তা পাঠাতে ব্যর্থ',
        description: 'ইন্টারনেট সংযোগ চেক করুন অথবা পরে আবার চেষ্টা করুন।',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>যোগাযোগ - UnicDropex</title>
        <meta name="description" content="সাহায্য প্রয়োজন? আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন। আমরা আপনাকে সহায়তা করার জন্য ২৪/৭ আছি।" />
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        {/* Hero Section */}
        <section className="py-16 md:py-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              সাহায্য প্রয়োজন?
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              আমরা আপনার জন্য সবসময় উপলব্ধ। নিচের যেকোনো মাধ্যমে আমাদের সাথে যোগাযোগ করুন।
            </p>
          </motion.div>
        </section>

        {/* Contact Grid */}
        <section className="pb-16 px-4 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

            {/* Contact Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                যোগাযোগের তথ্য
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
                  <Phone className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">ফোন</h3>
                    <a href={`tel:${contactInfo.phone}`} className="text-orange-600 hover:underline font-medium">
                      {contactInfo.phone || 'উপলব্ধ নেই'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">ইমেইল</h3>
                    <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline font-medium break-all">
                      {contactInfo.email || 'উপলব্ধ নেই'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <Clock className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">সাপোর্ট সময়</h3>
                    <p className="text-gray-600">
                      {contactInfo.supportTime || '২৪/৭ উপলব্ধ - উত্তর: ২ ঘন্টার মধ্যে'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-1">অফিসের অবস্থান</h3>
                  <p className="text-gray-600 text-sm">
                    {contactInfo.location || 'অনলাইন সাপোর্ট টিম - সরাসরি যোগাযোগ করুন।'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                আমাদের বার্তা পাঠান
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="আপনার পুরো নাম লিখুন"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    ইমেইল ঠিকানা *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="example@domain.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    আপনার বার্তা *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required
                    placeholder="আপনার সমস্যা বা প্রশ্ন বিস্তারিত লিখুন..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-base font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      পাঠানো হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      বার্তা পাঠান
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;