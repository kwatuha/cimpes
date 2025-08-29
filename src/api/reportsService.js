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

  // --- NEW: Functions to support updated ProjectSummaryReport.jsx ---
  getProjectCostByDepartment: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/project-cost-by-department', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch project cost by department:", error);
      throw error;
    }
  },
  getProjectsOverTime: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/projects-over-time', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch projects over time:", error);
      throw error;
    }
  },
  
  // New function to fetch projects at risk budget
  getProjectsAtRiskBudget: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/projects-at-risk-budget', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch projects at risk budget:", error);
      throw error;
    }
  },

  // New function to fetch project status trends over time
  getProjectStatusOverTime: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/project-status-over-time', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch project status over time:", error);
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

  // --- Other Reports ---
  getYearlyTrendsReport: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/yearly-trends', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch yearly trends report:", error);
      throw error;
    }
  },

  getSummaryKpis: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/reports/summary-kpis', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch summary KPIs:", error);
      throw error;
    }
  },
  getProjectsByStatusAndYear: async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/reports/projects-by-status-and-year', { params: filters });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects by status and year:", error);
    throw error;
  }
},
getFinancialStatusByProjectStatus: async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/reports/financial-status-by-project-status', { params: filters });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch financial status by project status:", error);
    throw error;
  }
},
};

export default reportsService;