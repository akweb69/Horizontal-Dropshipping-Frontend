import axios from "axios";
import { Loader, Copy, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const ProductDetails = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({});

    // ✅ Load product data by ID
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/products`);
                setData(res.data.find(item => item._id === id) || {});
                console.log(res.data.find(item => item._id === id));
            } catch (error) {
                console.error(error);
                toast.error("Failed to load product details");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // ✅ Handle thumbnail download
    const handleDownload = async () => {
        try {
            const response = await fetch(data.thumbnail);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${data.name}-thumbnail.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Thumbnail downloaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download thumbnail");
        }
    };

    // ✅ Handle copy product details
    const handleCopy = () => {
        const details = `
Name: ${data.name}
Price: ${data.price}
Category: ${data.category}
Stock: ${data.stock}
Section: ${data.sectionName}
Description: ${data.description}
Rating: ${data.rating}
Total Sales: ${data.totalSell}
        `.trim();

        navigator.clipboard
            .writeText(details)
            .then(() => toast.success("Product details copied to clipboard"))
            .catch(() => toast.error("Failed to copy product details"));
    };

    // ✅ Handle Add to Cart
    const handleAddToCart = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/cart`, {
                productId: id,
                quantity: 1,
            });
            toast.success("Added to cart successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add to cart");
        }
    };

    // ✅ Loading State
    if (loading) {
        return (
            <div className="flex w-full min-h-[80vh] items-center justify-center">
                <Loader className="animate-spin text-gray-600" size={48} />
            </div>
        );
    }

    // ✅ Product not found
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="flex w-full min-h-[80vh] items-center justify-center">
                <p className="text-xl text-gray-600">Product not found</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <ToastContainer />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                {/* ✅ Product Image Section */}
                <div className="relative">
                    <img
                        src={data.thumbnail}
                        alt={data.name}
                        className="w-full h-[400px] object-contain rounded-lg shadow-lg bg-gray-50"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/400")}
                    />
                    <button
                        onClick={handleDownload}
                        className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Download size={20} />
                        <span className="hidden sm:inline">Download Image</span>
                    </button>
                </div>

                {/* ✅ Product Details Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold text-gray-800">{data.name}</h1>
                        <button
                            onClick={handleCopy}
                            className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors"
                            title="Copy product details"
                        >
                            <Copy size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <p className="text-2xl text-blue-600 font-semibold">
                            ${parseFloat(data.price).toFixed(2)}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {data.category}
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                {data.sectionName}
                            </span>
                        </div>

                        <p className="text-gray-600">
                            <span className="font-semibold">Stock:</span> {data.stock}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-semibold">Rating:</span> {data.rating} / 5
                        </p>
                        <p className="text-gray-600">
                            <span className="font-semibold">Total Sales:</span> {data.totalSell}
                        </p>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Description</h3>
                            <p className="text-gray-600 whitespace-pre-line">{data.description}</p>
                        </div>
                    </div>

                    {/* ✅ Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={handleAddToCart}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add to Cart
                        </button>
                        <button className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            Add to Wishlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
