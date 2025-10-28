import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle, MessageSquare, Award } from 'lucide-react';

const Keno = () => {
    const navigate = useNavigate();

    const handleNavigateToMembership = () => {
        navigate('/');
    };
    const handleNavigateToMembership1 = () => {
        navigate('/');
    };

    // Animation variants
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6 } },
    };

    const scaleUp = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    return (
        <>
            <Helmet>
                <title>কেন আমাদের বেছে নেবেন?</title>
            </Helmet>

            <div className="bg-white">
                {/* Section 1 */}
                <motion.section
                    className="py-16 px-4 max-w-6xl mx-auto text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                >
                    <motion.h2
                        className="text-3xl font-bold text-gray-800 mb-12"
                        variants={fadeUp}
                    >
                        কেন আমাদের বেছে নেবেন?
                    </motion.h2>

                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                        variants={fadeIn}
                    >
                        {[
                            { icon: MessageSquare, text: '২৪/৭ চ্যাট সাপোর্ট' },
                            { icon: CheckCircle, text: 'যাচাইকৃত বিক্রেতা' },
                            { icon: Truck, text: 'তাত্ক্ষণিক অর্ডার স্ট্যাটাস' },
                            { icon: Award, text: 'রেফারেল বোনাস' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="flex flex-col items-center"
                                variants={scaleUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    className="mb-3"
                                >
                                    <item.icon className="w-10 h-10 text-orange-500" />
                                </motion.div>
                                <span className="font-semibold tracking-wide text-gray-700">
                                    {item.text}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>

                {/* Section 2 */}
                <motion.section
                    className="bg-slate-50 py-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <motion.div
                        className="max-w-3xl mx-auto px-4 text-center bg-white p-10 rounded-xl shadow-lg"
                        variants={scaleUp}
                    >
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            ড্রপশিপিং শুরু করতে প্রস্তুত?
                        </h2>
                        <p className="text-gray-600 mb-8">
                            আমাদের উদ্যোক্তাদের কমিউনিটিতে যোগ দিন এবং আজই আপনার সফল অনলাইন ব্যবসা শুরু করুন।
                        </p>
                        <motion.div
                            className="flex justify-center gap-4"
                            variants={fadeIn}
                        >
                            <motion.div whileHover={{ scale: 1.05 }}>
                                <Button size="lg" onClick={handleNavigateToMembership}>
                                    শুরু করুন
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }}>
                                <Button size="lg" variant="outline" onClick={handleNavigateToMembership1}>
                                    সদস্য হন
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.section>
            </div>
        </>
    );
};

export default Keno;
