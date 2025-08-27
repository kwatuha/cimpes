import axiosInstance from './axiosInstance';

/**
 * @file API service for Reporting dashboard calls.
 * @description This service handles data fetching for the comprehensive reports.
 */

const reportsService = {
  // --- Department Summary Report Calls ---
  getDepartmentSummaryReport: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/department-summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch department summary report:", error);
      throw error;
    }
  },

  // --- Project Summary Report Calls ---
  getProjectStatusSummary: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/project-status-summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch project status summary:", error);
      throw error;
    }
  },
  getProjectCategorySummary: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/project-category-summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch project category summary:", error);
      throw error;
    }
  },
  
  // --- Project List & Location Reports ---
  getDetailedProjectList: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/project-list-detailed', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch detailed project list:", error);
      throw error;
    }
  },
  getSubcountySummaryReport: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/subcounty-summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch subcounty summary report:", error);
      throw error;
    }
  },
  getWardSummaryReport: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/ward-summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch ward summary report:", error);
      throw error;
    }
  },
  
  // --- NEW: Yearly Trends Report Call ---
  getYearlyTrendsReport: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/yearly-trends', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch yearly trends report:", error);
      throw error;
    }
  },
};

export default reportsService;