import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
    Truck,
    CheckCircle,
    MessageSquare,
    Award,
    ShoppingCart,
    ListChecks,
    PackageCheck,
} from 'lucide-react';

const cardVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

const Kivabe = () => {
    return (
        <>
            <Helmet>
                <title>আমাদের সম্পর্কে - UnicDropex</title>
                <meta
                    name="description"
                    content="ড্রপশিপিং এর মাধ্যমে বাংলাদেশী বিক্রেতা এবং ক্রেতাদের ক্ষমতায়ন। আমাদের লক্ষ্য এবং কার্যপদ্ধতি সম্পর্কে আরও জানুন।"
                />
            </Helmet>

            <div className="bg-slate-50 min-h-screen flex justify-center items-center bangla">
                <section className="bg-slate-50 py-16">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">কিভাবে কাজ করে</h2>
                        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
                            আপনার উদ্যোক্তা যাত্রা শুরু করার জন্য একটি সহজ, সুবিন্যস্ত প্রক্রিয়া।
                        </p>

                        {/* Grid – unchanged except motion wrappers */}
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <motion.div
                                className="bg-white p-8 rounded-xl shadow-md"
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-100px' }}   // start animating a bit earlier
                            >
                                <ShoppingCart className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">১. পণ্য ব্রাউজ করুন</h3>
                                <p className="text-gray-600">
                                    আমাদের বিশাল ক্যাটালগ অন্বেষণ করুন এবং আপনার দোকানে বিক্রি করার জন্য পণ্য নির্বাচন করুন।
                                </p>
                            </motion.div>

                            {/* Card 2 */}
                            <motion.div
                                className="bg-white p-8 rounded-xl shadow-md"
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-100px' }}
                            >
                                <ListChecks className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">২. অর্ডার দিন</h3>
                                <p className="text-gray-600">
                                    যখন আপনি একটি বিক্রয় পাবেন, তখন আমাদের কাছে পাইকারি মূল্যে অর্ডার দিন।
                                </p>
                            </motion.div>

                            {/* Card 3 */}
                            <motion.div
                                className="bg-white p-8 rounded-xl shadow-md"
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-100px' }}
                            >
                                <PackageCheck className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">৩. গ্রাহকের কাছে ড্রপশিপ</h3>
                                <p className="text-gray-600">
                                    আমরা আপনার ব্র্যান্ডিং সহ সরাসরি আপনার গ্রাহকের কাছে পণ্য প্রেরণ করি।
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Kivabe;