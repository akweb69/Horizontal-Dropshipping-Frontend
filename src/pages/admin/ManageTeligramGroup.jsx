import { useState, useEffect } from "react";
import axios from "axios";

const ManageTeligramGroup = () => {
    const [groupLink, setGroupLink] = useState("");
    const [currentGroup, setCurrentGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const base_url = import.meta.env.VITE_BASE_URL;

    // Fetch current group link
    const fetchCurrentGroup = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${base_url}/telegram_group`);
            setCurrentGroup(res.data);
            setGroupLink(res.data?.link || "");
        } catch (err) {
            console.error(err);
            setMessage("Failed to load current group.");
        } finally {
            setLoading(false);
        }
    };

    // Save new group link
    const handleSave = async () => {
        if (!groupLink.trim()) {
            setMessage("Please enter a valid Telegram group link!");
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            await axios.post(`${base_url}/telegram_group`, {
                link: groupLink.trim(),
                updatedAt: new Date().toISOString(),
            });

            setMessage("✅ Group link updated successfully!");
            fetchCurrentGroup(); // Refresh
        } catch (err) {
            console.error(err);
            setMessage("Failed to update. Try again.");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchCurrentGroup();
    }, []);

    return (
        <div className="w-full md:py-20 py-12 bg-gradient-to-br from-orange-50 to-amber-50 min-h-screen">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-orange-600">
                        Update Telegram Group Link
                    </h1>
                    <p className="text-orange-700 mt-2">Keep your community connected!</p>
                </div>

                {/* Current Group Display */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-orange-200">
                    <h2 className="text-2xl font-semibold text-orange-800 mb-4">
                        Current Running Group
                    </h2>

                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-6 bg-orange-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-orange-100 rounded w-1/2"></div>
                        </div>
                    ) : currentGroup ? (
                        <div>
                            <a
                                href={currentGroup.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xl text-orange-600 hover:text-orange-700 underline break-all font-medium"
                            >
                                {currentGroup.link}
                            </a>
                            <p className="text-sm text-orange-500 mt-2">
                                Last updated: {new Date(currentGroup.updatedAt || currentGroup._id.getTimestamp()).toLocaleString()}
                            </p>
                        </div>
                    ) : (
                        <p className="text-orange-600">No group link set yet.</p>
                    )}
                </div>

                {/* Update Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-300">
                    <label className="block text-xl font-semibold text-orange-800 mb-4">
                        New Telegram Group Link
                    </label>

                    <input
                        type="url"
                        value={groupLink}
                        onChange={(e) => setGroupLink(e.target.value)}
                        placeholder="https://t.me/yourgroup"
                        className="w-full px-5 py-4 border-2 border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none text-lg transition"
                    />

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="mt-6 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "🚀 Update Group Link"}
                    </button>

                    {message && (
                        <div
                            className={`mt-5 text-center font-medium py-3 px-6 rounded-lg ${message.includes("✅")
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : "bg-red-100 text-red-800 border border-red-300"
                                }`}
                        >
                            {message}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-10 text-orange-600">
                    <p>Only the latest group link will be shown to users.</p>
                </div>
            </div>
        </div>
    );
};

export default ManageTeligramGroup;