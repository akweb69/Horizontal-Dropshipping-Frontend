import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle, MessageSquare, Award, ShoppingCart, ListChecks, PackageCheck } from 'lucide-react';

const Amader = () => {
    const navigate = useNavigate();

    const handleNavigateToMembership = () => {
        navigate('/');
    };

    return (
        <>
            <Helmet>
                <title>আমাদের সম্পর্কে - UnicDropex</title>
                <meta name="description" content="ড্রপশিপিং এর মাধ্যমে বাংলাদেশী বিক্রেতা এবং ক্রেতাদের ক্ষমতায়ন। আমাদের লক্ষ্য এবং কার্যপদ্ধতি সম্পর্কে আরও জানুন।" />
            </Helmet>

            <div className="bg-white">
                <section className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold">আমরা কারা</h1>
                        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">ড্রপশিপিং এর মাধ্যমে বাংলাদেশী বিক্রেতা এবং ক্রেতাদের ক্ষমতায়ন</p>
                    </motion.div>
                </section>

                <section className="py-16 px-4 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">আমাদের লক্ষ্য</h2>
                            <p className="text-gray-600 mb-6">বাংলাদেশে একটি নির্বিঘ্ন এবং নির্ভরযোগ্য ড্রপশিপিং ইকোসিস্টেম তৈরি করতে আমরা নিবেদিত। আমাদের প্ল্যাটফর্ম স্থানীয় বিক্রেতাদের বিশাল পণ্যের ক্যাটালগের সাথে সংযুক্ত করে, যা তাদের শূন্য ইনভেন্টরি এবং ঝুঁকি ছাড়াই তাদের অনলাইন ব্যবসা শুরু করতে সক্ষম করে।</p>
                            <ul className="space-y-3">
                                <li className="flex items-center"><Truck className="w-5 h-5 text-orange-500 mr-3" /> দ্রুত এবং নির্ভরযোগ্য ডেলিভারি</li>
                                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-orange-500 mr-3" /> খাঁটি, উচ্চ-মানের পণ্য</li>
                                <li className="flex items-center"><MessageSquare className="w-5 h-5 text-orange-500 mr-3" /> নিবেদিত স্থানীয় সহায়তা</li>
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex justify-center"
                        >
                            <img class="rounded-xl shadow-lg w-full max-w-md" alt="একটি আধুনিক অফিসে বিভিন্ন পেশাদারদের একটি দল সহযোগিতা করছে" src="https://images.unsplash.com/photo-1566833546763-672775492199" />
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Amader;