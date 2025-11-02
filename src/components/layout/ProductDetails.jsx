import axios from "axios";
import { Loader, Copy, Download, Heart, ShoppingCart, ZoomIn, Star, ChevronLeft, ChevronRight } from "lucide-react";
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
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { user, setLoveData, setCartData } = useAuth();
    const [seeMore, setSeeMore] = useState(false);
    const [colorSelected, setColorSelected] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/products`);
                const found = res.data.find((item) => item._id === id);
                setData(found || {});
                console.log("ad------>", found.colors)

                // Set default selected size (first available size)
                if (found?.sizes && found.sizes.length > 0) {
                    setSelectedSize(found.sizes[0]);
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
        const sizeDetails = data.sizes
            ? data.sizes.map(s => `${s.size}: ৳${s.price} (Stock: ${s.stock})`).join("\n")
            : "N/A";

        const details = `
Name: ${data.name}
Price Range: ${getPriceRange()}
Category: ${data.category}
Section: ${data.sectionName}
Total Stock: ${getTotalStock()}
Sizes & Prices:
${sizeDetails}
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

        const sizeStock = parseInt(selectedSize.stock, 10);
        if (sizeStock <= 0) {
            toast.warning(`Sorry, ${selectedSize.size} is out of stock!`);
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/cart`, {
                productId,
                email: user.email,
                size: selectedSize.size,
                price: selectedSize.price,
                profit: selectedSize.profit,
                SelectColor: colorSelected
            });

            if (res.data) {
                const cartRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/cart`);
                setCartData(cartRes.data.filter((item) => item.email === user.email));
                toast.success(`Added ${selectedSize.size} to cart!`);
            }
        } catch (error) {
            toast.error("Failed to add to cart!");
        }
    };

    const renderStars = (rating) => {
        const num = rating || 0;
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={18}
                className={i < Math.floor(num) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            />
        ));
    };

    // Helper: Get price range
    const getPriceRange = () => {
        if (!data.sizes || data.sizes.length === 0) return "N/A";
        const prices = data.sizes.map(s => parseFloat(s.price));
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === min ? `৳${min}` : `৳${min}`;
    };

    // Helper: Get total stock
    const getTotalStock = () => {
        if (!data.sizes || data.sizes.length === 0) return 0;
        return data.sizes.reduce((sum, s) => sum + parseInt(s.stock, 10), 0);
    };

    // Helper: Check stock status
    const isOutOfStock = getTotalStock() === 0;
    const isLowStock = getTotalStock() > 0 && getTotalStock() < 10;

    // Slider navigation
    const images = [data.thumbnail, ...(data.sliderImages || [])].filter(Boolean); // Combine thumbnail and slider images
    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    // handle select color---->
    const handleSelectColor = (color) => {
        setColorSelected(color);
    }

    if (loading) {
        return (
            <div className="container mx-auto min-h-screen px-4 py-12 max-w-7xl">
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

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl min-h-screen mt-16">
            <ToastContainer position="top-center" autoClose={2000} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start"
            >
                {/* Image Section with Slider */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative group overflow-hidden rounded-2xl shadow-xl"
                >
                    {/* Main Image Display */}
                    <div className="relative w-full h-96 md:h-[500px]">
                        <img
                            src={images[currentImageIndex] || "https://via.placeholder.com/600"}
                            alt={`${data.name} ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => (e.target.src = "https://via.placeholder.com/600")}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Navigation Buttons */}
                        {images.length > 1 && (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-orange-600 p-2 rounded-full shadow-lg hover:bg-white transition-all"
                                    title="Previous Image"
                                >
                                    <ChevronLeft size={22} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-orange-600 p-2 rounded-full shadow-lg hover:bg-white transition-all"
                                    title="Next Image"
                                >
                                    <ChevronRight size={22} />
                                </motion.button>
                            </>
                        )}

                        {/* Download Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDownload(images[currentImageIndex], `${data.name}-image-${currentImageIndex + 1}.jpg`)}
                            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-orange-600 p-3 rounded-full shadow-lg hover:bg-white transition-all"
                            title="Download Image"
                        >
                            <Download size={22} />
                        </motion.button>

                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <ZoomIn size={16} /> Hover to zoom
                        </div>
                    </div>

                    {/* Thumbnail Preview */}
                    {images.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {images.map((img, index) => (
                                <motion.img
                                    key={index}
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`h-16 w-16 object-cover rounded-lg cursor-pointer border-2 ${currentImageIndex === index ? "border-orange-600" : "border-gray-200"}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
                                />
                            ))}
                        </div>
                    )}
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

                    {/* Price & Stock Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <p className="text-3xl font-bold text-orange-600">
                            {getPriceRange()}
                        </p>
                        {isOutOfStock && (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                                Out of Stock
                            </span>
                        )}
                        {isLowStock && !isOutOfStock && (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                                Only {getTotalStock()} left!
                            </span>
                        )}
                    </motion.div>

                    {/* Category & Section */}
                    <div className="flex flex-wrap gap-3">
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                            {data.category}
                        </span>
                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                            {data.sectionName}
                        </span>
                    </div>

                    {/* Size Selector with Price & Stock */}
                    {data.sizes && data.sizes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-3"
                        >
                            <p className="font-semibold text-gray-700">Select Size:</p>
                            <div className="flex items-center gap-3">
                                {data.sizes.map((s, i) => {
                                    const inStock = parseInt(s.stock, 10) > 0;
                                    return (
                                        <motion.button
                                            key={i}
                                            whileHover={inStock ? { scale: 1.05 } : {}}
                                            whileTap={inStock ? { scale: 0.95 } : {}}
                                            onClick={() => inStock && setSelectedSize(s)}
                                            disabled={!inStock}
                                            className={`p-2 rounded-xl border-2 font-medium transition-all relative ${selectedSize?.size === s.size
                                                ? "border-orange-600 bg-orange-500  shadow-md text-white"
                                                : inStock
                                                    ? "border-gray-300 bg-white hover:border-orange-400 hover:bg-orange-50"
                                                    : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            <div className="text-sm font-bold">{s.size}</div>
                                            <div className="text-xs mt-1">৳{s.price}</div>
                                            {/* <div className="text-xs text-gray-100">
                                                Stock: {s.stock}
                                            </div> */}
                                            {!inStock && (
                                                <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                                                    <span className="text-xs font-medium text-red-600">Sold Out</span>
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                    {/* available colors */}
                    {
                        data.colors && data.colors.length > 0 && <div className="">
                            <p className="mb-2">Available Colors</p>
                            {
                                data.colors.map((color, i) => (
                                    <span
                                        onClick={() => handleSelectColor(color)}
                                        key={i} className={` py-1  rounded-full text-sm font-medium text-black border px-4 ${colorSelected === color ? 'bg-orange-500 text-white' : ''} border-orange-500  hover:bg-orange-600 cursor-pointer mr-2`}>{color}</span>
                                ))
                            }
                        </div>
                    }

                    {/* Total Stock */}
                    <div className="space-y-1">
                        <p className="text-gray-600">
                            <span className="font-semibold">Total Stock:</span> {getTotalStock()} units
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                        {!seeMore &&
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{data?.description?.slice(0, 60)} <span
                                onClick={() => setSeeMore(true)}
                                className="font-semibold text-orange-500 cursor-pointer ml-2 hover:underline">Show More</span> </p>}
                        {
                            seeMore &&
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{data?.description} <span
                                onClick={() => setSeeMore(false)}
                                className="font-semibold text-orange-500 cursor-pointer ml-2 hover:underline">Show less</span> </p>}
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
                            disabled={isOutOfStock || !selectedSize}
                            className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${isOutOfStock || !selectedSize
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                                }`}
                        >
                            <ShoppingCart size={20} />
                            {isOutOfStock ? "Out of Stock" : !selectedSize ? "Select Size" : "Add to Cart"}
                        </motion.button>

                        {/* <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLoveClick(data._id)}
                            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-orange-500 hover:text-orange-600 transition-all"
                        >
                            <Heart size={20} className={`transition-all ${user?.love?.includes(data._id) ? "fill-orange-600 text-orange-600" : ""}`} />
                            Wishlist
                        </motion.button> */}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProductDetails;