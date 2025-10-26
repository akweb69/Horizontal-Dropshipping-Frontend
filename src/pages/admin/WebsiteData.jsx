import React, { useEffect, useState } from "react";
import axios from "axios";
import ContactInfo from "./ContactInfo";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { UploadCloud, RefreshCcw, CheckCircle, Loader2, Gift, Percent, DollarSign } from "lucide-react";

const WebsiteData = () => {
    const [logo, setLogo] = useState({});
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [runningLogo, setRunningLogo] = useState(null);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

    // Load data
    useEffect(() => {
        setLoading(true);
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/website-logo`)
            .then((res) => {
                setLogo(res.data);
                setPreview(res.data.logo);
                setRunningLogo(res.data.logo);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load logo. Please try again.");
                setLoading(false);
            });
    }, []);

    // Upload to ImgBB
    const uploadToImgbb = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return axios.post(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            formData
        );
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file to upload.");
            return;
        }

        setLoading(true);
        try {
            const res = await uploadToImgbb(selectedFile);
            const newLogoUrl = res.data.data.url;
            setLogo({ ...logo, logo: newLogoUrl });
            setPreview(newLogoUrl);
            setSelectedFile(null);
            setLoading(false);
        } catch {
            setError("Failed to upload logo. Please try again.");
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!logo.logo || logo.logo === runningLogo) {
            setError("No new logo to update.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/website-logo`, {
                logo: logo.logo,
            });
            setRunningLogo(logo.logo);
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Logo Updated Successfully!",
                showConfirmButton: false,
                timer: 1200,
            });
            setLoading(false);
        } catch {
            setError("Failed to update logo on server.");
            setLoading(false);
        }
    };

    const handleReset = () => {
        setLogo({ ...logo, logo: runningLogo });
        setPreview(runningLogo);
        setSelectedFile(null);
        setError(null);
    };

    // Referral Bonus + Discount + Withdraw
    const [referralBonus, setReferralBonus] = useState(0);
    const [runningBonus, setRunningBonus] = useState(0);
    const [addRefferDiscount, setAddRefferDiscount] = useState(0);
    const [runningDiscount, setRunningDiscount] = useState(0);
    const [minimumWithDraw, setMinimumWithdraw] = useState(0);
    const [RMinimumWithDraw, setRMMinimumWithdraw] = useState(0);
    const [btnLoading, setBtnLoading] = useState(false);

    const handleReferralBonus = (e) => {
        e.preventDefault();
        setBtnLoading(true);
        axios
            .post(`${import.meta.env.VITE_BASE_URL}/referral-bonus`, {
                bonus: parseInt(referralBonus),
            })
            .then(() => {
                axios
                    .get(`${import.meta.env.VITE_BASE_URL}/referral-bonus`)
                    .then((res) => setRunningBonus(res.data.bonus));
                Swal.fire({
                    icon: "success",
                    title: "Referral bonus added successfully",
                    showConfirmButton: false,
                    timer: 1500,
                });
            })
            .catch(() =>
                Swal.fire({ icon: "error", title: "Failed to add referral bonus" })
            )
            .finally(() => setBtnLoading(false));
    };

    const handleAddRefferDiscount = (e) => {
        e.preventDefault();
        setBtnLoading(true);
        const amount = parseInt(addRefferDiscount);
        axios
            .post(`${import.meta.env.VITE_BASE_URL}/addrefferdiscount`, { amount })
            .then(() => {
                axios
                    .get(`${import.meta.env.VITE_BASE_URL}/addrefferdiscount`)
                    .then((res) => setRunningDiscount(res.data?.amount));
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Updated Successfully!",
                    showConfirmButton: false,
                    timer: 1200,
                });
            })
            .catch(() => Swal.fire({ icon: "error", title: "Update Failed" }))
            .finally(() => setBtnLoading(false));
    };

    const handleAddMinimumWithdraw = (e) => {
        e.preventDefault();
        setBtnLoading(true);
        const amount = parseInt(minimumWithDraw);
        axios
            .post(`${import.meta.env.VITE_BASE_URL}/minimum_withdraw_amount`, {
                amount,
            })
            .then(() => {
                axios
                    .get(`${import.meta.env.VITE_BASE_URL}/minimum_withdraw_amount`)
                    .then((res) => setRMMinimumWithdraw(res.data?.amount));
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Updated Successfully!",
                    showConfirmButton: false,
                    timer: 1200,
                });
            })
            .catch(() => Swal.fire({ icon: "error", title: "Update Failed" }))
            .finally(() => setBtnLoading(false));
    };

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/referral-bonus`)
            .then((res) => setRunningBonus(res.data.bonus));
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/addrefferdiscount`)
            .then((res) => setRunningDiscount(res.data?.amount));
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/minimum_withdraw_amount`)
            .then((res) => setRMMinimumWithdraw(res.data?.amount));
    }, []);

    return (
        <div className="w-full md:grid md:grid-cols-2 gap-6 space-y-6 md:space-y-0">
            {/* Referral Bonus */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-white rounded-2xl shadow-xl"
            >
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800">
                    <Gift className="text-orange-500" /> Referral Bonus
                </h2>
                <p className="text-gray-600 mb-3">
                    Current Bonus:{" "}
                    <span className="font-semibold text-gray-900">
                        {runningBonus} TK
                    </span>
                </p>
                <form onSubmit={handleReferralBonus}>
                    <input
                        type="number"
                        placeholder="Enter Bonus Amount"
                        onChange={(e) => setReferralBonus(e.target.value)}
                        className="w-full border p-2 rounded-lg outline-orange-500"
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={btnLoading}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                        {btnLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} /> Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} /> Add Bonus
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>

            {/* Reffer Discount */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-white rounded-2xl shadow-xl"
            >
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800">
                    <Percent className="text-orange-500" /> Reffer Discount
                </h2>
                <p className="text-gray-600 mb-3">
                    Running Discount:{" "}
                    <span className="font-semibold text-gray-900">
                        {runningDiscount} TK
                    </span>
                </p>
                <form onSubmit={handleAddRefferDiscount}>
                    <input
                        type="number"
                        placeholder="Enter Discount Amount"
                        onChange={(e) => setAddRefferDiscount(e.target.value)}
                        className="w-full border p-2 rounded-lg outline-orange-500"
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={btnLoading}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                        {btnLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} /> Updating...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} /> Add Discount
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>

            {/* Minimum Withdraw */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-white rounded-2xl shadow-xl"
            >
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800">
                    <DollarSign className="text-orange-500" /> Minimum Withdraw
                </h2>
                <p className="text-gray-600 mb-3">
                    Running Amount:{" "}
                    <span className="font-semibold text-gray-900">
                        {RMinimumWithDraw} TK
                    </span>
                </p>
                <form onSubmit={handleAddMinimumWithdraw}>
                    <input
                        type="number"
                        placeholder="Enter Withdraw Amount"
                        onChange={(e) => setMinimumWithdraw(e.target.value)}
                        className="w-full border p-2 rounded-lg outline-orange-500"
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={btnLoading}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                        {btnLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} /> Updating...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} /> Update Amount
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
            {/* Logo Management */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white rounded-2xl shadow-xl"
            >
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <UploadCloud className="text-orange-500" /> Logo Management
                </h2>

                {error && (
                    <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={loading}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />

                <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                            Preview
                        </h3>
                        <img
                            src={preview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-28 h-28 rounded-md object-contain border"
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                            Running Logo
                        </h3>
                        <img
                            src={runningLogo || "/placeholder.svg"}
                            alt="Running Logo"
                            className="w-28 h-28 rounded-md object-contain border"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReset}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                    >
                        <RefreshCcw size={18} /> Reset
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={selectedFile ? handleUpload : handleUpdate}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} /> Processing...
                            </>
                        ) : selectedFile ? (
                            <>
                                <UploadCloud size={18} /> Upload
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} /> Update
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-white rounded-2xl shadow-xl"
            >
                <ContactInfo />
            </motion.div>


        </div>
    );
};

export default WebsiteData;
