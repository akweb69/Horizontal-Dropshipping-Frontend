import React from 'react';
import { motion } from 'framer-motion';


// Compact Orange Glassmorphism Card
export default function MiniGlassCard({
    cardHolder = 'ABU KALAM',
    cardNumber = '**** 3456',
    expiry = '11/29',
    balance = '$1,230.00',
    className = '',
    title = ""
}) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className={`w-full mx-auto ${className}`}
        >
            <div className="relative">
                {/* glow border */}
                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-orange-400/40 via-amber-300/20 to-yellow-400/30 blur-xl opacity-70 pointer-events-none" />

                {/* main card */}
                <div className="relative rounded-2xl p-4 min-h-[150px] border border-white/10 backdrop-blur-xl shadow-xl bg-gradient-to-br from-orange-500/30 via-amber-400/20 to-yellow-400/20">
                    <div className="flex items-center justify-between">
                        <div className="w-8 h-6 bg-gradient-to-br from-yellow-300/90 to-orange-500/90 rounded-md shadow-inner" />

                        {/* logo */}
                        <div className="flex items-center gap-0.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 -mr-1" />
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="tracking-widest text-base font-mono text-teal-500 select-all">{cardNumber}</div>
                        <div className="mt-1 flex items-center justify-between text-xs text-yellow-800">
                            <span>{cardHolder}</span>
                            <span>{expiry}</span>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-[10px] md:text-[13px] text-orange-700">{title}</div>
                        <div className="text-lg  font-bold text-orange-700">৳{balance}</div>
                    </div>

                    {/* subtle pattern */}
                    <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full opacity-10" viewBox="0 0 300 200">
                            <defs>
                                <linearGradient id="miniGlow" x1="0" x2="1">
                                    <stop offset="0%" stopColor="#ff8800" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="#ffbb33" stopOpacity="0.05" />
                                </linearGradient>
                            </defs>
                            <rect width="300" height="200" fill="url(#miniGlow)" />
                        </svg>
                    </div>
                </div>
            </div>


        </motion.div>
    );
}
