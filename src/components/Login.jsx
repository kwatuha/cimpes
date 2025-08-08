// src/components/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../api';
import logo from '../assets/logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log('Login.jsx: Attempting login with username:', username);
        try {
            const data = await apiService.auth.login(username, password);
            console.log('Login.jsx: Login API response data:', data);

            if (data && data.token) {
                console.log('Login.jsx: Token received, calling AuthContext login:', data.token);
                login(data.token);
                console.log('Login.jsx: Login successful, navigating to dashboard.');
                navigate('/', { replace: true });
            } else {
                setError('Login successful, but no token property received in response.');
                console.error('Login.jsx: Login successful, but no token property in response data:', data);
            }
        } catch (err) {
            console.error('Login.jsx: Error caught during login API call:', err);
            setError(err.message || err.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
            console.log('Login.jsx: Login attempt finished. Loading set to false.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-gradient-to-br from-gray-50 to-gray-200 p-4">
            <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300 ease-in-out">
                {/* Logo and Title Section */}
                <div className="flex flex-col items-center mb-6">
                    <img
                        src={logo}
                        alt="IPMES Logo"
                        className="h-20 w-auto mb-2"
                    />
                    <h1 className="text-4xl font-extrabold text-blue-900 tracking-wider">IPMES</h1>
                    <p className="text-gray-500 text-center mt-2 text-sm">
                        Integrated Project Monitoring & Evaluation System | Please Login
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
                            Username/Email
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-200 ease-in-out"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-200 ease-in-out"
                            value={password}
                            onChange={(e) => e.target.value.length <= 50 ? setPassword(e.target.value) : null}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* NEW: Remember Me & Forgot Password Section */}
                    <div className="flex items-center justify-between mb-6 text-sm">
                        <label className="flex items-center text-gray-600 cursor-pointer">
                            <input type="checkbox" className="mr-2" />
                            Remember me
                        </label>
                        <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                            Forgot Password?
                        </a>
                    </div>

                    {error && (
                        <p className="text-red-600 text-xs italic mb-4 text-center">{error}</p>
                    )}
                    <div className="flex items-center justify-center">
                        <button
                            type="submit"
                            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Logging In...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;