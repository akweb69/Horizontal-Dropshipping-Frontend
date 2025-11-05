import axios from "axios";
import {
    Loader,
    Copy,
    Download,
    ShoppingCart,
    Star,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Loader11 from "./Loader11";

const ProductDetails = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({});
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { user, setCartData } = useAuth();
    const [seeMore, setSeeMore] = useState(false);
    const [colorSelected, setColorSelected] = useState("");

    // 🟢 Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/products`);
                const found = res.data.find((item) => item._id === id);
                setData(found || {});
                if (found?.sizes?.length > 0) setSelectedSize(found.sizes[0]);
                if (found?.colors?.length > 0) setColorSelected(found.colors[0]); // ✅ Default color select
                if (!found) toast.warning("Product not found");
            } catch {
                toast.error("Failed to load product details");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // 🟢 Fixed download function
    // ✅ এক ক্লিকে = একটা ইমেজ ডাউনলোড (ZIP ছাড়া)
    // 🟢 Fixed & Working Download Function
    const handleDownload = async (imageUrl, imageName) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = imageName || `${data.name}-image.jpg`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success("Image downloaded!");
        } catch (error) {
            toast.error("Download failed");
        }
    };


    const handleCopy = () => {
        const details = `
Name: ${data.name}
Price: ${getPriceRange()}
Category: ${data.category}
Section: ${data.sectionName}
Stock: ${getTotalStock()}
Description: ${data.description}
`.trim();
        navigator.clipboard
            .writeText(details)
            .then(() => toast.success("Details copied!"))
            .catch(() => toast.error("Copy failed"));
    };

    const handleAddToCart = async (productId) => {
        if (!user?.email) return toast.warning("Please log in first!");
        if (!selectedSize) return toast.warning("Please select a size!");
        const sizeStock = parseInt(selectedSize.stock, 10);
        if (sizeStock <= 0) return toast.warning("Out of stock!");

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/cart`, {
                productId,
                email: user.email,
                size: selectedSize.size,
                price: selectedSize.price,
                profit: selectedSize.profit,
                SelectColor: colorSelected,
            });

            if (res.data) {
                const cartRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/cart`);
                setCartData(cartRes.data.filter((item) => item.email === user.email));
                toast.success("Added to cart!");
            }
        } catch {
            toast.error("Failed to add to cart!");
        }
    };

    const renderStars = (rating) =>
        [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={18}
                className={i < Math.floor(rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            />
        ));

    const getSelectedPrice = () => {
        if (selectedSize?.price) {
            return `৳${selectedSize.price}`;
        }
        return "Select a size";
    };

    const getTotalStock = () =>
        data.sizes?.reduce((sum, s) => sum + parseInt(s.stock, 10), 0) || 0;

    const images = [data.thumbnail, ...(data.sliderImages || [])].filter(Boolean);

    // 🔁 Auto Slide every 1s
    useEffect(() => {
        if (images.length > 1) {
            const interval = setInterval(() => {
                setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [images]);

    const prevImage = () =>
        setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    const nextImage = () =>
        setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));

    if (loading)
        return (
            <Loader11></Loader11>
        );

    if (!data || Object.keys(data).length === 0)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
                <p className="text-3xl font-semibold mb-2">Product Not Found</p>
                <p className="text-gray-400">Please try again later.</p>
            </div>
        );

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl mt-10 md:mt-20">
            <ToastContainer position="top-center" autoClose={2000} />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
            >
                {/* 🖼️ Image Section */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                >
                    <img
                        src={images[currentImageIndex] || "https://via.placeholder.com/600"}
                        alt={data.name}
                        className="w-full h-[420px] md:h-[500px] object-cover transition-all duration-700"
                    />

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow-md hover:bg-white"
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow-md hover:bg-white"
                            >
                                <ChevronRight size={22} />
                            </button>
                        </>
                    )}


                    {/* ✅ মেইন ডাউনলোড বাটন - বর্তমান ইমেজ */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownload(images[currentImageIndex], `${data.name}-image-${currentImageIndex + 1}.jpg`)}
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-orange-600 p-3 rounded-full shadow-lg hover:bg-white transition-all"
                        title="Download Image"
                    >
                        <Download size={22} />
                    </motion.button>


                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex justify-center gap-3 py-3 bg-white/80 backdrop-blur-md border-t border-gray-200">
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`thumb-${index}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition-all duration-300 ${index === currentImageIndex
                                        ? "border-gray-900 scale-105"
                                        : "border-transparent opacity-70 hover:opacity-100"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* ℹ️ Info Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                            {data.name}
                        </h1>
                        <button
                            onClick={handleCopy}
                            className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full transition"
                        >
                            <Copy size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <p className="text-3xl font-semibold text-gray-900">
                            {getSelectedPrice()}
                        </p>
                        <div className="flex">{renderStars(4.5)}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                            {data.category}
                        </span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                            {data.sectionName}
                        </span>
                    </div>

                    {/* Sizes */}
                    {data.sizes?.length > 0 && (
                        <div>
                            <p className="font-medium text-gray-700 mb-2">Select Size:</p>
                            <div className="flex flex-wrap gap-3">
                                {data.sizes.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedSize(s)}
                                        disabled={parseInt(s.stock, 10) <= 0}
                                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${selectedSize?.size === s.size
                                            ? "bg-orange-500 text-white border-orange-600"
                                            : "border-gray-300 hover:border-gray-900"
                                            } ${parseInt(s.stock, 10) <= 0
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                    >
                                        {s.size} <span className="text-gray-300">৳{s.price}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Colors */}
                    {data.colors?.length > 0 && (
                        <div>
                            <p className="font-medium text-gray-700 mb-2">Available Colors:</p>
                            <div className="flex flex-wrap gap-2">
                                {data.colors.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setColorSelected(color)}
                                        className={`px-4 py-1.5 rounded-full border transition-all ${colorSelected === color
                                            ? "bg-orange-500 text-white border-orange-600"
                                            : "border-gray-300 hover:border-gray-900"
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {seeMore
                                ? data.description
                                : `${data.description?.slice(0, 80)}... `}
                            <span
                                onClick={() => setSeeMore(!seeMore)}
                                className="text-orange-500 font-medium cursor-pointer hover:underline"
                            >
                                {seeMore ? "Show less" : "Read more"}
                            </span>
                        </p>
                    </div>

                    {/* Add to Cart */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAddToCart(data._id)}
                        disabled={!selectedSize}
                        className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${!selectedSize
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                            }`}
                    >
                        <ShoppingCart size={20} />
                        {selectedSize ? "Add to Cart" : "Select Size"}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductDetails;
