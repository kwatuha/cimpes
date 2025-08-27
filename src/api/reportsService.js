import axiosInstance from './axiosInstance';

/**
 * @file API service for Reporting dashboard calls.
 * @description This service handles data fetching for the comprehensive reports.
 */

const reportsService = {
  // --- Reporting API Calls (new report endpoints) ---

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

  // You can add other reporting functions here in the future
  // For example:
  // getYearlyTrendsReport: async (filters = {}) => {
  //   const response = await axiosInstance.get('/reports/yearly-trends', { params: filters });
  //   return response.data;
  // },

  // getWardSummaryReport: async (filters = {}) => {
  //   const response = await axiosInstance.get('/reports/ward-summary', { params: filters });
  //   return response.data;
  // },
};

export default reportsService;