import axios from "axios";
import { useEffect, useState, useCallback } from "react";

const useSliders = () => {
    const [sliders, setSliders] = useState([]);
    const [slidersLoading, setSlidersLoading] = useState(true);
    const [error, setError] = useState(null);
    const base_url = import.meta.env.VITE_BASE_URL;

    const fetchSliders = useCallback(async () => {
        setSlidersLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${base_url}/hero-section-banner`);
            setSliders(res.data || []);
        } catch (err) {
            console.error("Failed to fetch sliders:", err);
            setError(err.response?.data?.message || err.message || "Failed to fetch sliders");
            setSliders([]);
        } finally {
            setSlidersLoading(false);
        }
    }, [base_url]);

    useEffect(() => {
        fetchSliders();
    }, [fetchSliders]);

    return { sliders, slidersLoading, error, refetch: fetchSliders };
};

export default useSliders;
