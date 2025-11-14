import axios from "axios";
import { useEffect, useState, useCallback } from "react";

const useProduct = () => {
    const [products, setProducts] = useState([]);
    const [productLoading, setProductLoading] = useState(true);
    const [error, setError] = useState(null);
    const base_url = import.meta.env.VITE_BASE_URL;

    const fetchProducts = useCallback(async () => {
        setProductLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${base_url}/products`);
            setProducts(res.data || []);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError(err.response?.data?.message || err.message || "Failed to fetch products");
            setProducts([]); // Reset on error
        } finally {
            setProductLoading(false);
        }
    }, [base_url]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Optional: Allow refetching from outside
    return { products, productLoading, error, refetch: fetchProducts };
};

export default useProduct;