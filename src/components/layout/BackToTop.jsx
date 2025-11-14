// src/components/BackToTop.jsx
import { useEffect } from "react";

const BackToTop = () => {

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    return null;
};

export default BackToTop;
