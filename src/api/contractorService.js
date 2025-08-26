// src/api/contractorService.js
import axiosInstance from './axiosInstance';

/**
 * @file API service for Contractor Management related calls.
 * @description This service handles all operations for contractors, including their assigned projects,
 * photos, and payment requests.
 */

const contractorService = {
  // --- Contractor Management API Calls (kemri_contractors) ---
  getAllContractors: async () => {
    const response = await axiosInstance.get('/contractors');
    return response.data;
  },
  getContractorById: async (contractorId) => {
    const response = await axiosInstance.get(`/contractors/${contractorId}`);
    return response.data;
  },
  createContractor: async (contractorData) => {
    const response = await axiosInstance.post('/contractors', contractorData);
    return response.data;
  },
  updateContractor: async (contractorId, contractorData) => {
    const response = await axiosInstance.put(`/contractors/${contractorId}`, contractorData);
    return response.data;
  },
  deleteContractor: async (contractorId) => {
    const response = await axiosInstance.delete(`/contractors/${contractorId}`);
    return response.data;
  },
  
  // --- Project, Payment, and Photo Retrieval for a Contractor ---
  getProjectsByContractor: async (contractorId) => {
    const response = await axiosInstance.get(`/contractors/${contractorId}/projects`);
    return response.data;
  },
  getPaymentRequestsByContractor: async (contractorId) => {
    const response = await axiosInstance.get(`/contractors/${contractorId}/payment-requests`);
    return response.data;
  },
  getPhotosByContractor: async (contractorId) => {
    const response = await axiosInstance.get(`/contractors/${contractorId}/photos`);
    return response.data;
  },
  
  // --- Photo Upload for Contractor Dashboard ---
  uploadPhoto: async (contractorId, formData) => {
    const response = await axiosInstance.post(`/contractors/${contractorId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // --- Other Contractor-related Calls ---
  linkToUser: async (contractorId, userId) => {
    const response = await axiosInstance.post(`/contractors/${contractorId}/link-user`, { userId });
    return response.data;
  },
};

export default contractorService;