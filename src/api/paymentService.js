// src/api/paymentService.js
import axiosInstance from './axiosInstance';

/**
 * @file API service for Payment Request related calls.
 * @description This service handles CRUD operations for payment requests and their associated resources.
 */

const paymentService = {
  // --- Payment Request API Calls (kemri_project_payment_requests) ---

  /**
   * Fetches all payment requests for a specific project.
   * @param {number} projectId - The ID of the project.
   * @returns {Promise<Array>} A promise that resolves to an array of payment requests.
   */
  getRequestsForProject: async (projectId) => {
    const response = await axiosInstance.get(`/payment-requests/project/${projectId}`);
    return response.data;
  },

  /**
   * Submits a new payment request.
   * @param {object} requestData - The data for the new payment request.
   * @returns {Promise<object>} A promise that resolves to the new request's ID.
   */
  createRequest: async (requestData) => {
    const response = await axiosInstance.post('/payment-requests', requestData);
    return response.data;
  },

  /**
   * Updates the status of a payment request.
   * @param {number} requestId - The ID of the request to update.
   * @param {object} statusData - An object containing the new status and optional rejection reason.
   * @returns {Promise<object>} A promise that resolves to a success message.
   */
  updateStatus: async (requestId, statusData) => {
    const response = await axiosInstance.put(`/payment-requests/${requestId}/status`, statusData);
    return response.data;
  },

  /**
   * Fetches a single payment request with all its related details by its ID.
   * @param {number} requestId - The ID of the request to fetch.
   * @returns {Promise<object>} A promise that resolves to the request data.
   */
  getRequestById: async (requestId) => {
    const response = await axiosInstance.get(`/payment-requests/request/${requestId}`);
    return response.data;
  },

  // --- Payment Request Milestone API Calls (kemri_payment_request_milestones) ---
  createMilestoneRecord: async (milestoneData) => {
    const response = await axiosInstance.post('/payment-requests/milestones', milestoneData);
    return response.data;
  },
  updateMilestoneRecord: async (milestoneId, milestoneData) => {
    const response = await axiosInstance.put(`/payment-requests/milestones/${milestoneId}`, milestoneData);
    return response.data;
  },
  deleteMilestoneRecord: async (milestoneId) => {
    const response = await axiosInstance.delete(`/payment-requests/milestones/${milestoneId}`);
    return response.data;
  },

  // ⬅️ NOTE: All document-related API calls have been moved to projectService.js

  // --- Payment Transaction API Calls (kemri_payment_transactions) ---
  createPaymentTransaction: async (transactionData) => {
    const response = await axiosInstance.post('/payment-transactions', transactionData);
    return response.data;
  },
  getTransactionsForRequest: async (requestId) => {
    const response = await axiosInstance.get(`/payment-transactions/request/${requestId}`);
    return response.data;
  },
};

export default paymentService;
