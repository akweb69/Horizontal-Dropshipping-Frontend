import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const NotFoundPage404 = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center px-6">
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
            >
                <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-7xl font-bold mb-3"
            >
                404
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg text-gray-400 mb-8 max-w-md"
            >
                Oops! The page you're looking for doesn’t exist or has been moved.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
            >
                <Link
                    to="/"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-all rounded-2xl font-semibold shadow-lg"
                >
                    Go Back Home
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFoundPage404;
