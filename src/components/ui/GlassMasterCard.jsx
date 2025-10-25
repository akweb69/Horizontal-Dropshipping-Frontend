import React from 'react';
import { motion } from 'framer-motion';

// Orange Glassmorphism MasterCard
export default function GlassMasterCard({
    cardHolder = 'ABU KALAM',
    cardNumber = '1234 5678 9012 3456',
    expiry = '11/29',
    cvv = '123',
    balance = '$4,320.50',
    className = '',
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className={`w-full mx-auto  ${className}`}
        >
            <div className="relative">
                {/* glowing border */}
                <div className="absolute -inset-2 rounded-3xl bg-white blur-2xl opacity-70 pointer-events-none" />

                {/* main card */}
                <div className="relative rounded-3xl p-6 min-h-[220px] overflow-hidden border border-white/10 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-orange-500/30 via-amber-400/20 to-yellow-400/20">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {/* chip */}
                            <div className="w-12 h-8 bg-gradient-to-br from-yellow-300/90 to-orange-500/90 rounded-md flex items-center justify-center shadow-inner">
                                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="0.5" y="0.5" width="19" height="13" rx="2.5" stroke="rgba(255,255,255,0.2)" />
                                    <path d="M4 3H16" stroke="white" strokeOpacity="0.25" strokeWidth="0.8" />
                                    <path d="M4 7H16" stroke="white" strokeOpacity="0.15" strokeWidth="0.6" />
                                </svg>
                            </div>
                            <div className="text-xs md:text-base text-yellow-800">LetsDropShip · PREMIUM</div>
                        </div>

                        {/* MasterCard style logo */}
                        <div className="flex items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 -mr-2" />
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" />
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="tracking-widest text-xl sm:text-2xl font-mono text-teal-500 select-all">{cardNumber}</div>
                        <div className="mt-4 flex items-center justify-between text-sm text-white/70">
                            <div>
                                <div className="text-[10px] uppercase text-orange-500">Card Holder</div>
                                <div className="font-semibold text-teal-500">{cardHolder}</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-teal-700">Expires</div>
                                <div className="font-semibold text-pink-700">{expiry}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="md:text-2xl  text-xl font-semibold text-orange-600">My Revenue</div>
                        <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-600"> ৳ {balance}</div>
                    </div>

                    {/* glowing pattern */}
                    <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full opacity-10" viewBox="0 0 600 400">
                            <defs>
                                <linearGradient id="oglow" x1="0" x2="1">
                                    <stop offset="0%" stopColor="#ff8800" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="#ffbb33" stopOpacity="0.05" />
                                </linearGradient>
                            </defs>
                            <rect width="600" height="400" fill="url(#oglow)" />
                        </svg>
                    </div>
                </div>
            </div>


        </motion.div>
    );
}
