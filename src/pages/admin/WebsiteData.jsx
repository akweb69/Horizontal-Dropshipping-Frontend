import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContactInfo from './ContactInfo';

const WebsiteData = () => {
    const [logo, setLogo] = useState({});
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [runningLogo, setRunningLogo] = useState(null);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

    // Load data
    useEffect(() => {
        setLoading(true);
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/website-logo`)
            .then((res) => {
                setLogo(res.data);
                setPreview(res.data.logo);
                setRunningLogo(res.data.logo);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching logo:', err);
                setError('Failed to load logo. Please try again.');
                setLoading(false);
            });
    }, []);

    // Upload image to ImgBB
    const uploadToImgbb = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return axios.post(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            formData
        );
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file)); // Show local preview immediately
        setError(null);
    };

    // Handle upload to ImgBB
    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await uploadToImgbb(selectedFile);
            const newLogoUrl = res.data.data.url;
            setLogo({ ...logo, logo: newLogoUrl });
            setPreview(newLogoUrl);
            setSelectedFile(null); // Clear selected file after upload
            setLoading(false);
        } catch (err) {
            console.error('Error uploading logo:', err);
            setError('Failed to upload logo. Please try again.');
            setLoading(false);
        }
    };

    // Handle update to backend
    const handleUpdate = async () => {
        if (!logo.logo || logo.logo === runningLogo) {
            setError('No new logo to update.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/website-logo`, {
                logo: logo.logo,
            });
            setRunningLogo(logo.logo);
            setLoading(false);
        } catch (err) {
            console.error('Error updating logo:', err);
            setError('Failed to update logo on server. Please try again.');
            setLoading(false);
        }
    };

    // Handle reset logo
    const handleReset = () => {
        setLogo({ ...logo, logo: runningLogo });
        setPreview(runningLogo);
        setSelectedFile(null);
        setError(null);
    };

    return (
        <div className='w-full md:grid md:grid-cols-2 gap-6 space-y-6 md:space-y-0'>
            <div className="w-full p-4 sm:p-6 md:p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Logo Image Management
                </h2>
                <p className="text-gray-600 text-sm sm:text-base mb-6">
                    Manage the website logo image here.
                </p>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/* Upload Section */}
                <div className="mb-6">
                    <label
                        htmlFor="logo"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Upload Logo
                    </label>
                    <input
                        type="file"
                        id="logo"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        disabled={loading}
                    />
                </div>

                {/* Preview and Running Logo Sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Preview */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                            Preview
                        </h3>
                        <div className="flex justify-center sm:justify-start">
                            <img
                                src={preview || '/placeholder.svg'}
                                alt="Preview"
                                className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-md border border-gray-200"
                            />
                        </div>
                    </div>

                    {/* Running Logo */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                            Running Logo
                        </h3>
                        <div className="flex justify-center sm:justify-start">
                            <img
                                src={runningLogo || '/placeholder.svg'}
                                alt="Running Logo"
                                className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-md border border-gray-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-start gap-4">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
                        disabled={loading || (preview === runningLogo && !selectedFile)}
                    >
                        Reset Logo
                    </button>
                    <button
                        onClick={selectedFile ? handleUpload : handleUpdate}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading
                            ? 'Processing...'
                            : selectedFile
                                ? 'Upload Logo'
                                : 'Update Logo'}
                    </button>
                </div>
            </div>
            {/* contact info section */}
            <div className="w-full p-4 sm:p-6 md:p-8 bg-white shadow-lg rounded-lg">
                <ContactInfo />
            </div>
        </div>
    );
};

export default WebsiteData;