import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiService from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = useCallback((newToken) => {
        localStorage.setItem('jwtToken', newToken);
        setToken(newToken);
        try {
            const decodedUser = jwtDecode(newToken);
            setUser(decodedUser.user);
            // console.log("LOGIN: Decoded user from token:", decodedUser.user);
            // console.log("LOGIN: User privileges from token:", decodedUser.user.privileges);
        } catch (error) {
            console.error("Failed to decode token on login:", error);
            localStorage.removeItem('jwtToken');
            setToken(null);
            setUser(null);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        setToken(null);
        setUser(null);
    }, []);

    const hasPrivilege = useCallback((privilegeName) => {
        // console.log("CHECK PRIVILEGE: Checking for:", privilegeName);
        // console.log("CHECK PRIVILEGE: User's privileges list:", user?.privileges);
        if (!user || !user.privileges) {
            return false;
        }
        return user.privileges.includes(privilegeName);
    }, [user]);

    useEffect(() => {
        const loadUserFromToken = async () => {
            setLoading(true);
            const storedToken = localStorage.getItem('jwtToken');
            if (storedToken) {
                try {
                    const decoded = jwtDecode(storedToken);
                    if (decoded.exp * 1000 < Date.now()) {
                        console.warn("Token expired. Logging out.");
                        logout();
                    } else {
                        setUser(decoded.user);
                        setToken(storedToken);
                        // console.log("EFFECT: User loaded from token:", decoded.user);
                        // console.log("EFFECT: User privileges loaded from token:", decoded.user.privileges);
                    }
                } catch (error) {
                    console.error("AuthContext: Error decoding or verifying token:", error);
                    logout();
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        loadUserFromToken();
    }, [logout]);

    const contextValue = {
        token,
        user,
        loading,
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