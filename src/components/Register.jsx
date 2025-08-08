// src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Import useNavigate and RouterLink
import apiService from '../api'; // Your API service for making requests

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        // role: 'user' // Default role, can be hardcoded or made selectable if needed
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate for redirection

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        // Basic client-side validation for required fields
        if (!formData.username || !formData.email || !formData.password || !formData.first_name || !formData.last_name) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        try {
            // Call the register API endpoint
            const data = await apiService.post('/register', formData); // Using apiService.post directly
            setSuccessMessage(data.message || 'Registration successful! You can now log in.');
            // Optionally, clear form or redirect to login after successful registration
            setFormData({
                username: '',
                email: '',
                password: '',
                first_name: '',
                last_name: '',
            });
            // Redirect to login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Registration API error:', err);
            setError(err.error || err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-indigo-800 mb-6">Register for KEMRI Dashboard</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-500"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-500"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-500"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-500"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-500"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>
                    )}
                    {successMessage && (
                        <p className="text-green-500 text-xs italic mb-4 text-center">{successMessage}</p>
                    )}

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out w-full disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                    <div className="text-center mt-4">
                        <RouterLink to="/login" className="font-bold text-sm text-indigo-600 hover:text-indigo-800">
                            Already have an account? Login here.
                        </RouterLink>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
