import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ImagePlus, Loader2, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UploadSignUpBanner = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    const imgbb_api_key = import.meta.env.VITE_IMGBB_API_KEY;

    const [bannerPreview, setBannerPreview] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadedBanner, setUploadedBanner] = useState(null);

    // Fetch latest banner
    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await axios.get(`${base_url}/sign_up_banner`);
                setUploadedBanner(res.data);
            } catch (err) {
                console.error("Failed to fetch banner:", err);
            }
        };
        fetchBanner();
    }, [base_url]);

    // Handle image select
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    // Handle upload
    const handleUpload = async () => {
        if (!bannerFile) {
            alert("Please select a banner image first!");
            return;
        }

        setLoading(true);
        try {
            // Upload image to ImgBB
            const formData = new FormData();
            formData.append("image", bannerFile);

            const imgbbRes = await axios.post(
                `https://api.imgbb.com/1/upload?key=${imgbb_api_key}`,
                formData
            );

            const imageUrl = imgbbRes.data.data.url;

            // Save to your MongoDB backend
            const saveRes = await axios.post(`${base_url}/sign_up_banner`, {
                image: imageUrl,
                uploadedAt: new Date(),
            });

            if (saveRes.data.insertedId) {
                setUploadedBanner({ image: imageUrl });
                setBannerFile(null);
                setBannerPreview(null);
                alert("Banner uploaded successfully!");
            }
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed! Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className=" flex flex-col items-center justify-center w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full  bg-white rounded-2xl shadow-lg p-6"
            >
                <h2 className="text-2xl font-semibold  mb-6">
                    Upload Sign Up Banner
                </h2>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-700 font-medium">Select Banner Image:</span>
                        <Input
                            type="file"
                            accept="image/*"
                            className="mt-2"
                            onChange={handleFileChange}
                        />
                    </label>

                    {bannerPreview && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-4"
                        >
                            <img
                                src={bannerPreview}
                                alt="Preview"
                                className="w-full rounded-xl shadow-md"
                            />
                        </motion.div>
                    )}

                    <Button
                        onClick={handleUpload}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5" /> Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-5 w-5" /> Upload Banner
                            </>
                        )}
                    </Button>
                </div>

                {uploadedBanner?.image && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Current Sign Up Banner
                            </h3>
                        </div>
                        <img
                            src={uploadedBanner.image}
                            alt="Current Banner"
                            className="w-full max-h-[250px] object-contain rounded-xl border border-gray-200 shadow-sm"
                        />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default UploadSignUpBanner;
