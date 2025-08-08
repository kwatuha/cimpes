// src/api/dashboardService.js
import axiosInstance from './axiosInstance';

/**
 * @file API service for Dashboard Data Endpoints.
 * @description Contains methods for fetching various analytical and reporting data
 * for dashboard visualizations, including filter options, summary statistics,
 * demographic data, disease prevalence, heatmap data, and export functionalities.
 * Note: These endpoints are typically custom analytical queries on your backend,
 * not direct CRUD operations.
 */

const dashboardService = {
  getFilterOptions: async () => {
    try {
      const response = await axiosInstance.get('/dashboard/filters/options');
      return response.data;
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
  },

  getSummaryStatistics: async (filters) => {
    try {
      const response = await axiosInstance.post('/dashboard/summary', { filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching summary statistics:', error);
      throw error;
    }
  },

  getDemographicData: async (filters) => {
    try {
      const response = await axiosInstance.post('/dashboard/demographics', { filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching demographic data:', error);
      throw error;
    }
  },

  getDiseasePrevalenceData: async (filters) => {
    try {
      const response = await axiosInstance.post('/dashboard/disease-prevalence', { filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching disease prevalence data:', error);
      throw error;
    }
  },

  getHeatmapData: async (filters) => {
    try {
      const response = await axiosInstance.post('/dashboard/heatmap-data', { filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      throw error;
    }
  },

  // This getParticipants is likely for a dashboard table/report, distinct from participantService's CRUD
  getParticipants: async (filters, page, pageSize, sortBy, sortOrder) => {
    try {
      const response = await axiosInstance.post('/dashboard/participants', {
        filters,
        page,
        pageSize,
        sortBy,
        sortOrder,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching participants data for dashboard:', error);
      throw error;
    }
  },

  exportToExcel: async (filters, excelHeadersMapping) => {
    try {
      const response = await axiosInstance.post('/dashboard/export/excel', { filters, excelHeadersMapping }, {
        responseType: 'blob', // Important for file downloads
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  },

  exportToPdf: async (filters, tableHtml) => {
    try {
      const response = await axiosInstance.post('/dashboard/export/pdf', { filters, tableHtml }, {
        responseType: 'blob', // Important for file downloads
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  },

  // NEW FUNCTIONS FOR ADDITIONAL CHARTS
  getHouseholdSizeData: async (filters) => {
    try {
      const response = await axiosInstance.post('/dashboard/household-size-distribution', { filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching household size data:', error);
      throw error;
    }
  },

  getHealthcareAccessData: async (filters) => {
    try {
      const response = await axiosInstance.post('/dashboard/healthcare-access-distribution', { filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching healthcare access data:', error);
      throw error;
    }
  },

  getWaterStorageData: async (filters) => {
    try {
      const response = await axiosInstance.post('/dashboard/water-storage-distribution', { filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching water storage data:', error);
      throw error;
    }
  },

  getClimatePerceptionData: async (filters) => {
    try {
      const response = await axiosInstance.post('/dashboard/climate-perception-distribution', { filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching climate perception data:', error);
      throw error;
    }
  },
};

export default dashboardService;
