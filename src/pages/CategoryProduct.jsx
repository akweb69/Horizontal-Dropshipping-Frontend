import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
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
                        <div key={product?._id} className="bg-white p-4 rounded-md shadow-md flex flex-col items-center justify-center">
                            <img src={product?.thumbnail} alt={product?.name} className="w-24 h-24 object-cover rounded-md" />
                            <h2 className="text-lg font-bold text-gray-800">{product?.name}</h2>
                            <p className="text-sm text-gray-600">${product?.price}</p>
                        </div>
                    ))}
                </div>
            </div>


        </div>
    );
};

export default CategoryProduct;