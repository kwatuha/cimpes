import axiosInstance from './axiosInstance';

/**
 * @file API service for Reporting dashboard calls.
 * @description This service handles data fetching for the comprehensive reports.
 */

const reportsService = {
  // --- Department Summary Report Calls ---
  /**
   * Fetches the department summary report data from the API.
   * @param {object} filters - Optional filters for the report.
   * @param {number} [filters.finYearId] - The ID of the financial year to filter by.
   * @param {string} [filters.status] - The project status to filter by.
   * @returns {Promise<Array>} A promise that resolves to an array of department summary objects.
   */
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
  /**
   * Fetches the count of projects by status.
   * @param {object} filters - Optional filters for the report.
   * @returns {Promise<Array>} A promise that resolves to an array of objects with 'name' and 'value' properties.
   */
  getProjectStatusSummary: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/project-status-summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch project status summary:", error);
      throw error;
    }
  },

  /**
   * Fetches the count of projects by category.
   * @param {object} filters - Optional filters for the report.
   * @returns {Promise<Array>} A promise that resolves to an array of objects with 'name' and 'value' properties.
   */
  getProjectCategorySummary: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/project-category-summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch project category summary:", error);
      throw error;
    }
  },

  // --- NEW: Detailed Project List Call ---
  /**
   * Fetches a detailed list of projects for a table display.
   * @param {object} filters - Optional filters for the report.
   * @returns {Promise<Array>} A promise that resolves to an array of project objects.
   */
  getDetailedProjectList: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/project-list-detailed', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch detailed project list:", error);
      throw error;
    }
  },
    /**
   * Fetches the count and financial metrics of projects by subcounty.
   * @param {object} filters - Optional filters for the report.
   * @returns {Promise<Array>} A promise that resolves to an array of objects.
   */
  getSubcountySummaryReport: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/subcounty-summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch subcounty summary report:", error);
      throw error;
    }
  },

    /**
   * Fetches the count and financial metrics of projects by ward.
   * @param {object} filters - Optional filters for the report.
   * @returns {Promise<Array>} A promise that resolves to an array of objects.
   */
  getWardSummaryReport: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/ward-summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch ward summary report:", error);
      throw error;
    }
  },

    getWardSummaryReport: async (filters = {}) => { /* ... */ },
  getDetailedProjectList: async (filters = {}) => { /* ... */ },
  
  // --- NEW: Yearly Trends Report Call ---
  /**
   * Fetches financial metrics grouped by financial year for trend analysis.
   * @param {object} filters - Optional filters for the report.
   * @returns {Promise<Array>} A promise that resolves to an array of objects.
   */
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