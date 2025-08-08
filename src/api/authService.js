// src/api/authService.js
import axiosInstance from './axiosInstance';

/**
 * @file API service for authentication and user profile related calls.
 * @description Contains methods for user login and fetching user profile.
 * Note: These routes (/auth/login, /auth/profile) need to be implemented
 * in your backend's authentication module.
 */

const authService = {
  /**
   * Authenticates a user with username and password.
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @returns {Promise<Object>} The response data from the login endpoint (e.g., token, user info).
   */
  login: async (username, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  /**
   * Fetches the profile of the currently authenticated user.
   * @returns {Promise<Object>} The user's profile data.
   */
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
};

export default authService;
