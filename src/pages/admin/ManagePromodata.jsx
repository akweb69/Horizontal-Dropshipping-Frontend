import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Zap, Truck, Gift, Plus, Edit2, Trash2, X } from 'lucide-react';

const ManagePromodata = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        discount: '',
        cta: '',
        icon: 'Zap',
        bgColor: '#1a1a1a',
        textColor: '#ffffff',
        buttonColor: '#fbbf24',
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        try {
            const response = await axios.get(`${base_url}/promo-data`);
            setPromos(response.data);
            setLoading(false);
        } catch (err) {
            alert('Failed to load promos');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.patch(`${base_url}/promo-data/${editingId}`, formData);
                setEditingId(null);
            } else {
                await axios.post(`${base_url}/promo-data`, formData);
            }
            resetForm();
            fetchPromos();
        } catch (err) {
            alert('Save failed');
        }
    };

    const resetForm = () => {
        setFormData({
            discount: '',
            cta: '',
            icon: 'Zap',
            bgColor: '#1a1a1a',
            textColor: '#ffffff',
            buttonColor: '#fbbf24',
        });
        setEditingId(null);
    };

    const handleEdit = (promo) => {
        setFormData({
            discount: promo.discount,
            cta: promo.cta,
            icon: promo.icon,
            bgColor: promo.bgColor,
            textColor: promo.textColor,
            buttonColor: promo.buttonColor,
        });
        setEditingId(promo._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this promo?')) {
            try {
                await axios.delete(`${base_url}/promo-data/${id}`);
                fetchPromos();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const getIcon = (name) => {
        switch (name) {
            case 'Zap': return <Zap className="w-6 h-6" />;
            case 'Truck': return <Truck className="w-6 h-6" />;
            case 'Gift': return <Gift className="w-6 h-6" />;
            default: return <Zap className="w-6 h-6" />;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                        Promo Manager
                    </h1>
                    <p className="text-gray-600">Create and manage promotional banners</p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Form + Live Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Form Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                            <div className="flex items-center gap-2 mb-6">
                                {editingId ? (
                                    <Edit2 className="w-5 h-5 text-amber-600" />
                                ) : (
                                    <Plus className="w-5 h-5 text-green-600" />
                                )}
                                <h2 className="text-xl font-semibold">
                                    {editingId ? 'Edit Promo' : 'Add New Promo'}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Text</label>
                                    <input
                                        type="text"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        placeholder="e.g., ২০% ছাড়!"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                                    <input
                                        type="text"
                                        name="cta"
                                        value={formData.cta}
                                        onChange={handleChange}
                                        placeholder="e.g., এখানে কিনুন!"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Zap', 'Truck', 'Gift'].map((icon) => (
                                            <label
                                                key={icon}
                                                className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.icon === icon
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="icon"
                                                    value={icon}
                                                    checked={formData.icon === icon}
                                                    onChange={handleChange}
                                                    className="sr-only"
                                                />
                                                {getIcon(icon)}
                                                <span className="text-xs mt-1">{icon}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['bgColor', 'textColor', 'buttonColor'].map((field) => (
                                        <div key={field}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                                {field === 'bgColor' ? 'Background' : field === 'textColor' ? 'Text' : 'Button'} Color
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    name={field}
                                                    value={formData[field]}
                                                    onChange={handleChange}
                                                    className="w-16 h-12 rounded-lg cursor-pointer border border-gray-300"
                                                />
                                                <div
                                                    className="flex-1 h-12 rounded-lg border border-gray-300"
                                                    style={{ backgroundColor: formData[field] }}
                                                />
                                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                                    {formData[field]}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <motion.button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium shadow-md"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {editingId ? 'Update Promo' : 'Create Promo'}
                                    </motion.button>
                                    {editingId && (
                                        <motion.button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center gap-2"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <X className="w-4 h-4" /> Cancel
                                        </motion.button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Live Preview Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
                        >
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">Live Preview</h3>
                            <div
                                className="rounded-xl p-6 text-center shadow-inner"
                                style={{ backgroundColor: formData.bgColor, color: formData.textColor }}
                            >
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <div style={{ filter: formData.textColor === '#ffffff' ? 'brightness(0) invert(1)' : 'none' }}>
                                        {getIcon(formData.icon)}
                                    </div>
                                    <span className="text-2xl font-bold">{formData.discount || 'Your Discount'}</span>
                                </div>
                                <motion.button
                                    className="px-6 py-2.5 rounded-full font-semibold shadow-md"
                                    style={{
                                        backgroundColor: formData.buttonColor,
                                        color: formData.textColor === '#000000' ? '#ffffff' : '#000000',
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {formData.cta || 'Click Here'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Promo List */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">All Promos</h2>
                        {promos.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl shadow">
                                <p className="text-gray-500">No promos created yet.</p>
                                <p className="text-sm text-gray-400 mt-1">Create your first promo!</p>
                            </div>
                        ) : (
                            promos.map((promo, idx) => (
                                <motion.div
                                    key={promo._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className=" bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                                >
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg">{promo.discount}</h3>
                                                <p className="text-sm text-gray-600">{promo.cta}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.button
                                                    onClick={() => handleEdit(promo)}
                                                    className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => handleDelete(promo._id)}
                                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        </div>
                                        <div
                                            className="rounded-lg p-4 mt-3 flex items-center justify-center gap-3"
                                            style={{ backgroundColor: promo.bgColor, color: promo.textColor }}
                                        >
                                            {getIcon(promo.icon)}
                                            <span className="font-bold">{promo.discount}</span>
                                            <span
                                                className="px-4 py-1 rounded-full text-sm font-medium"
                                                style={{
                                                    backgroundColor: promo.buttonColor,
                                                    color: promo.textColor === '#000000' ? '#fff' : '#000',
                                                }}
                                            >
                                                {promo.cta}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ManagePromodata;