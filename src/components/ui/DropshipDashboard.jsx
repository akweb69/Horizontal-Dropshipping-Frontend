import React, { useEffect, useState } from "react";

const DropshipDashboard = () => {
    const [greeting, setGreeting] = useState("");
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        // Dynamic greeting message
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("শুভ সকাল 🌅");
        else if (hour < 18) setGreeting("শুভ অপরাহ্ন ☀️");
        else setGreeting("শুভ রাত্রি 🌙");

        // Subscription countdown
        const expiry = new Date("2025-11-25");
        const today = new Date();
        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        setDaysLeft(diff > 0 ? diff : 0);
    }, []);

    const premiumCards = [
        { title: "UnicDropex · PREMIUM", label: "বর্তমান ব্যালান্স", amount: "৳ ২০" },
        { title: "আজকের লাভ", label: "আজকের মোট ইনকাম", amount: "৳ ৫৫০" },
        { title: "গত ৭ দিন", label: "৭ দিনের মোট ইনকাম", amount: "৳ ১,২০০" },
        { title: "গত ১৪ দিন", label: "১৪ দিনের মোট ইনকাম", amount: "৳ ২,৫০০" },
        { title: "গত ১ মাস", label: "১ মাসের মোট ইনকাম", amount: "৳ ৪,৮০০" },
        { title: "সারা জীবন", label: "সারা জীবনের ইনকাম", amount: "৳ ২৫,০০০" },
    ];

    const metrics = [
        { logo: "⏳", color: "bg-orange-500", label: "পেন্ডিং সেলস ব্যালান্স", amount: "৳ ০", change: "০.০০%", type: "negative" },
        { logo: "💰", color: "bg-emerald-600", label: "মোট রেভিনিউ", amount: "৳ ২০", change: "+১.৫২%", type: "positive" },
        { logo: "📈", color: "bg-green-600", label: "মোট সেলস", amount: "৳ ১২০", change: "+৩.৯৯%", type: "positive" },
        { logo: "🚢", color: "bg-indigo-600", label: "ইমপোর্ট করা পণ্য", amount: "৳ ১০০", change: "-১.২০%", type: "negative" },
        { logo: "❌", color: "bg-red-500", label: "রিজেক্ট অর্ডার", amount: "৳ ১৫", change: "-১.০৫%", type: "negative" },
        { logo: "✅", color: "bg-blue-500", label: "মোট সাকসেস সেলস", amount: "৳ ১২০", change: "+২.৩০%", type: "positive" },
    ];

    const analytics = [
        { label: "সফল ডেলিভারি (৳)", percent: 80, color: "bg-green-500" },
        { label: "পেন্ডিং পেমেন্ট (৳)", percent: 25, color: "bg-orange-500" },
        { label: "রিজেক্ট অর্ডার (৳)", percent: 10, color: "bg-red-500" },
        { label: "নতুন ইমপোর্ট (পণ্য সংখ্যা)", percent: 50, color: "bg-blue-500" },
    ];

    return (
        <div className="bg-[#f0f2f5] min-h-screen flex flex-col items-center py-6 font-sans text-gray-800">
            {/* Greeting Section */}
            <div className="w-full max-w-md mb-4 px-4">
                <h2 className="text-2xl font-bold text-orange-500 drop-shadow-sm">{greeting}</h2>
                <p className="text-gray-700 mt-1">Boss, ড্যাশবোর্ডে আপনাকে স্বাগতম।</p>
            </div>

            {/* Scrollable Premium Cards */}
            <div className="w-full max-w-md overflow-x-auto pb-6 no-scrollbar scroll-smooth snap-x snap-mandatory">
                <div className="flex gap-4 px-4">
                    {premiumCards.map((card, i) => (
                        <div
                            key={i}
                            className="relative min-w-[320px] snap-start rounded-2xl bg-[#e0e5ec] p-6 shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:translate-y-[-2px] hover:shadow-[10px_10px_20px_#a3b1c6,-10px_-10px_20px_#ffffff] transition-all duration-300"
                        >
                            <div className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-semibold inline-block mb-3">
                                {card.title}
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-base font-medium text-gray-500">CARD HOLDER</span>
                                <span className="text-base font-bold">Boss</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-base font-medium text-gray-500">EXPIRES</span>
                                <span className="text-base font-bold">১১/২৯</span>
                            </div>
                            <div className="flex justify-between items-end mt-6">
                                <span className="text-gray-600 text-lg">{card.label}</span>
                                <span className="text-4xl font-bold text-orange-500">{card.amount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dashboard Metrics */}
            <div className="w-full max-w-md px-4">
                <h3 className="text-lg font-bold mb-1">ড্যাশবোর্ড মেট্রিক্স</h3>
                <hr className="border-t border-gray-200 mb-3" />
                <ul>
                    {metrics.map((m, i) => (
                        <li
                            key={i}
                            className={`flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all ${m.type === "negative" ? "pl-2 border-l-4 border-orange-500" : ""
                                }`}
                        >
                            <div className="flex items-center">
                                <div className={`w-9 h-9 ${m.color} rounded-full flex items-center justify-center text-white font-bold mr-3`}>
                                    {m.logo}
                                </div>
                                <div>
                                    <div className="text-sm font-bold">{m.label}</div>
                                    <div className="text-xs text-gray-500">বিস্তারিত তথ্য</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-sm">{m.amount}</div>
                                <div
                                    className={`text-xs font-semibold ${m.type === "positive" ? "text-green-500" : "text-red-500"
                                        }`}
                                >
                                    {m.change}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Analytics Dashboard */}
            <div className="w-full max-w-md mt-6 bg-[#e0e5ec] rounded-xl p-4 shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff]">
                <h3 className="text-lg font-bold mb-3">বিক্রয় অ্যানালিটিক্স (মাসিক)</h3>
                {analytics.map((a, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                            <span>{a.label}</span>
                            <span>{a.percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`${a.color} h-2 rounded-full transition-all duration-700`}
                                style={{ width: `${a.percent}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Subscription Card */}
            <div className="w-full max-w-md mt-6 bg-[#e0e5ec] rounded-xl p-5 shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff]">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-bold text-base text-gray-800">গোল্ড প্রিমিয়াম প্যাকেজ</h4>
                        <p className="text-xs text-gray-500">মেয়াদ: ১ বছর</p>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold">{daysLeft} দিন বাকি</div>
                        <div className="text-xs text-gray-500">মেয়াদ শেষ: ২০২৫/১১/২৫</div>
                    </div>
                </div>
                <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r from-green-500 via-orange-400 to-red-500 rounded-full`}
                        style={{ width: `${Math.max(0, (daysLeft / 365) * 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default DropshipDashboard;
