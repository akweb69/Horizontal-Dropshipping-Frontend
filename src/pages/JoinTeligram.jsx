import React, { useState, useEffect } from "react";
import axios from "axios";

const JoinTeligram = () => {
    const [groupLink, setGroupLink] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const base_url = import.meta.env.VITE_BASE_URL;

    const fetchGroupLink = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get(`${base_url}/telegram_group`);

            if (res.data?.link) {
                setGroupLink(res.data.link);
            } else {
                setError("No group link found. Coming soon!");
            }
        } catch (err) {
            console.error("Failed to fetch group link:", err);
            setError("Failed to load group. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupLink();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchGroupLink, 30_000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full  flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full shadow-2xl mb-6 animate-pulse">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 8.785l-1.32 6.222c-.097.446-.36.556-.607.346l-2.003-1.478-1.085 1.043c-.12.116-.22.213-.45.213l.153-2.18 3.946-3.567c.172-.156-.038-.244-.267-.088l-4.87 3.066-1.876-.586c-.408-.127-.416-.45.086-.667l7.76-2.992c.342-.13.642.084.537.512z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-orange-700">
                        Join Our Telegram
                    </h1>
                    <p className="text-xl text-orange-600 mt-3">
                        Live Updates • Exclusive Content • Community Chat
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-orange-300">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                            <p className="text-orange-600 mt-4 text-lg">Loading group link...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 text-lg font-medium">{error}</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-700 mb-8 text-lg">
                                Click below to join our <span className="font-bold text-orange-600">official Telegram group</span>
                            </p>

                            <a
                                href={groupLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-2xl py-6 px-10 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                            >
                                <svg className="w-10 h-10 mr-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.75 4.294L2.403 10.52c-1.124.49-.99 1.182.188 1.495l4.313 1.344 10.048-6.313c.47-.313.9-.146.546.194L9.74 15.626v3.813c.57 0 .82-.256.66-.576L12.25 16.8l3.375 2.5c.623.344 1.07.156 1.25-.563l2.25-10.625c.28-.938-.094-1.375-.875-1.818z" />
                                </svg>
                                JOIN NOW
                            </a>

                            <p className="text-xs text-orange-500 mt-6">
                                🔄 Auto-updates every 30 seconds
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-orange-700 font-medium">
                        10,000+ members already joined! 🚀
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JoinTeligram;