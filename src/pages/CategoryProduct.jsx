import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Loader11 from "../components/layout/Loader11";

const CategoryProduct = () => {
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState([]);
    const category = useParams().category;
    // load data--->
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/products`)
            .then(res => {
                console.log(category)
                console.log(res.data, "data------->")
                setProduct(res.data.filter(p => p.category === category));
                setLoading(false);
                console.log(res.data.filter(p => p.category === category));

            })
            .catch(err => console.log(err));
    }, [category])
    // check loading
    if (loading) {
        return (
            <Loader11></Loader11>
        );
    }
    return (
        <div className="w-full min-h-screen">
            <div className="w-11/12 mx-auto">
                {/* heading */}
                <h1 className="text-3xl md:text-5xl py-10 font-bold text-center text-gray-800">
                    {category}
                </h1>
                {/* main content card */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {product.map(product => (
                        <ProductCard key={product?._id} product={product} />
                    ))}
                </div>
            </div>


        </div>
    );
};

export default CategoryProduct;