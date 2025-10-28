// ContactInfo.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactInfo = () => {
    // State for form inputs
    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        supportTime: '',
        location: '',
    });

    // State for fetched contact info
    const [contactInfo, setContactInfo] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch latest contact info on component mount
    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/contact-info`);
            setContactInfo(response.data);
        } catch (err) {
            setError('Failed to fetch contact information');
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/contact-info`, formData);
            setSuccess('Contact information saved successfully!');
            setFormData({ phone: '', email: '', supportTime: '', location: '' }); // Reset form
            fetchContactInfo(); // Refresh displayed data
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save contact information');
        }
    };


    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Contact Information</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone
                    </label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter phone number"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email address"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="supportTime" className="block text-sm font-medium text-gray-700">
                        Support Time
                    </label>
                    <input
                        type="text"
                        id="supportTime"
                        name="supportTime"
                        value={formData.supportTime}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 9 AM - 5 PM"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter location"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-orange-600 text-white p-2 rounded-md hover:bg-orange-700 transition"
                >
                    Submit
                </button>
            </form>

            {/* Feedback Messages */}
            {success && <p className="mt-4 text-green-600">{success}</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}

            {/* Display Latest Contact Info */}
            {contactInfo && (
                <div className="mt-8 p-4 border border-gray-200 rounded-md">
                    <h3 className="text-lg font-semibold text-gray-800">Latest Contact Information</h3>
                    <p><strong>Phone:</strong> {contactInfo.phone}</p>
                    <p><strong>Email:</strong> {contactInfo.email}</p>
                    <p><strong>Support Time:</strong> {contactInfo.supportTime}</p>
                    <p><strong>Location:</strong> {contactInfo.location}</p>
                </div>
            )}
        </div>
    );
};

export default ContactInfo;