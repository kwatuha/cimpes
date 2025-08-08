// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode
import apiService from '../api'; // Import the apiService

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // New loading state for AuthContext

    // Function to set user and token after successful login
    const login = useCallback((newToken) => {
        localStorage.setItem('jwtToken', newToken);
        setToken(newToken);
        try {
            const decodedUser = jwtDecode(newToken);
            setUser(decodedUser.user); // Assuming the token payload has a 'user' object
        } catch (error) {
            console.error("Failed to decode token on login:", error);
            // If token is invalid, clear it
            localStorage.removeItem('jwtToken');
            setToken(null);
            setUser(null);
        }
    }, []);

    // Function to clear user and token on logout
    const logout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        setToken(null);
        setUser(null);
        // Optionally, redirect to login page after logout
        // window.location.href = '/login';
    }, []);

    // Function to check if user has a specific privilege
    const hasPrivilege = useCallback((privilegeName) => {
        // Ensure user and user.privileges exist and privileges is an array
        return user && user.privileges && Array.isArray(user.privileges) && user.privileges.includes(privilegeName);
    }, [user]); // Re-create if user object changes

    // Effect to load user from token on initial mount or token change
    useEffect(() => {
        const loadUserFromToken = async () => {
            setLoading(true); // Start loading
            const storedToken = localStorage.getItem('jwtToken');
            if (storedToken) {
                try {
                    const decoded = jwtDecode(storedToken);
                    // Check if token is expired
                    if (decoded.exp * 1000 < Date.now()) {
                        console.warn("Token expired. Logging out.");
                        logout();
                    } else {
                        // Optionally, fetch full user profile from backend for most up-to-date info
                        // This assumes you have a /api/auth/profile endpoint
                        // For now, rely on token payload for simplicity and to avoid extra API call on every page load
                        setUser(decoded.user); // Set user from decoded token
                        setToken(storedToken); // Ensure token state is consistent
                    }
                } catch (error) {
                    console.error("AuthContext: Error decoding or verifying token:", error);
                    logout(); // Clear invalid token
                }
            } else {
                setUser(null); // No token, no user
            }
            setLoading(false); // End loading after checking token
        };

        loadUserFromToken();
    }, [logout]); // Dependency on logout to ensure it's stable

    // Provide the context value to children
    const contextValue = {
        token,
        user,
        loading, // Expose loading state
        login,
        logout,
        hasPrivilege,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
