import axios from "axios";
import { Loader, Copy, Download, Heart, ShoppingCart, ZoomIn, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const ProductDetails = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({});
    const [selectedSize, setSelectedSize] = useState("");
    const { user, setLoveData, setCartData } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/products`);
                const found = res.data.find((item) => item._id === id);
                setData(found || {});
                if (found?.availableSizes) {
                    setSelectedSize(found.availableSizes.split(",")[0].trim());
                }
                if (!found) toast.warning("Product not found");
            } catch (error) {
                console.error(error);
                toast.error("Failed to load product details");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleDownload = async () => {
        try {
            const response = await fetch(data.thumbnail);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${data.name}-thumbnail.jpg`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success("Thumbnail downloaded!");
        } catch (error) {
            toast.error("Download failed");
        }
    };

    const handleCopy = () => {
        const details = `
Name: ${data.name}
Price: ${data.price} টাকা
Category: ${data.category}
Section: ${data.sectionName}
Stock: ${data.stock}
Sizes: ${data.availableSizes}
Rating: ${data.rating}/5
Sales: ${data.totalSell}
Description: ${data.description}
    `.trim();

        navigator.clipboard.writeText(details)
            .then(() => toast.success("Details copied!"))
            .catch(() => toast.error("Copy failed"));
    };

    const handleLoveClick = async (productId) => {
        if (!user?.email) {
            toast.warning("Please log in first!");
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/love`, {
                productId,
                email: user.email,
            });

            if (res.data?.acknowledged) {
                const loveRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/love`);
                setLoveData(loveRes.data.filter((item) => item.email === user.email));
                Swal.fire({ position: "top-end", icon: "success", title: "Added to wishlist!", showConfirmButton: false, timer: 1000 });
            } else if (res.data?.message === "Already in favorites") {
                toast.info("Already in wishlist!");
            }
        } catch (error) {
            toast.error("Something went wrong!");
        }
    };

    const handleAddToCart = async (productId) => {
        if (!user?.email) {
            toast.warning("Please log in first!");
            return;
        }

        if (!selectedSize) {
            toast.warning("Please select a size!");
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/cart`, {
                productId,
                email: user.email,
                size: selectedSize,
            });

            if (res.data) {
                const cartRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/cart`);
                setCartData(cartRes.data.filter((item) => item.email === user.email));
                toast.success("Added to cart!");
            }
        } catch (error) {
            toast.error("Failed to add to cart!");
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={18}
                className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            />
        ));
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-gray-200 animate-pulse rounded-xl h-96" />
                    <div className="space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
                        <div className="h-24 bg-gray-200 rounded animate-pulse" />
                        <div className="flex gap-3">
                            <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
                <div className="text-6xl mb-4">Not Found</div>
                <p className="text-xl">Product not found</p>
            </div>
        );
    }

    const sizes = data.availableSizes?.split(",").map(s => s.trim()) || [];
    const isLowStock = data.stock < 10;
    const isOutOfStock = data.stock === 0;

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl min-h-screen">
            <ToastContainer position="top-center" autoClose={2000} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start"
            >

                {/* Image Section */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative group overflow-hidden rounded-2xl shadow-xl"
                >
                    <img
                        src={data.thumbnail}
                        alt={data.name}
                        className="w-full h-96 md:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/600")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleDownload}
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-orange-600 p-3 rounded-full shadow-lg hover:bg-white transition-all"
                        title="Download Image"
                    >
                        <Download size={22} />
                    </motion.button>

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <ZoomIn size={16} /> Hover to zoom
                    </div>
                </motion.div>

                {/* Details Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl md:text-4xl font-bold text-gray-800"
                        >
                            {data.name}
                        </motion.h1>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCopy}
                            className="bg-gray-100 p-2.5 rounded-full hover:bg-gray-200 transition-all"
                            title="Copy Details"
                        >
                            <Copy size={20} />
                        </motion.button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <p className="text-3xl font-bold text-orange-600">
                            {parseFloat(data.price).toFixed(2)} টাকা
                        </p>
                        {isOutOfStock && (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                                Out of Stock
                            </span>
                        )}
                        {isLowStock && !isOutOfStock && (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                                Only {data.stock} left!
                            </span>
                        )}
                    </motion.div>



                    <div className="flex flex-wrap gap-3">
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                            {data.category}
                        </span>
                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                            {data.sectionName}
                        </span>
                    </div>

                    {/* Size Selector */}
                    {sizes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-2"
                        >
                            <p className="font-semibold text-gray-700">Select Size:</p>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size) => (
                                    <motion.button
                                        key={size}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedSize === size
                                            ? "bg-orange-600 text-white shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {size}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        <p className="text-gray-600">
                            <span className="font-semibold">Stock:</span> {data.stock} units
                        </p>

                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{data.description}</p>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row gap-4 pt-4"
                    >
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAddToCart(data._id)}
                            disabled={isOutOfStock}
                            className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${isOutOfStock
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                                }`}
                        >
                            <ShoppingCart size={20} />
                            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLoveClick(data._id)}
                            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-orange-500 hover:text-orange-600 transition-all"
                        >
                            <Heart size={20} className="transition-all" />
                            Wishlist
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductDetails;