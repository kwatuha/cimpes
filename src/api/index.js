import axios from 'axios';

// Import the specific axios instance file
import axiosInstance from './axiosInstance';

import authService from './authService';
import userService from './userService';
import projectService from './projectService';
import organizationService from './organizationService';
import strategyService from './strategyService';
import participantService from './participantService';
import generalService from './generalService';
import dashboardService from './dashboardService';
import metaDataService from './metaDataService';
import kdspIIService from './kdspIIService';

// Export the base URL for API calls (used by axiosInstance)
// Use the VITE_API_BASE_URL environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Export the base URL for directly accessing static files
// Use the VITE_FILE_SERVER_BASE_URL environment variable
export const FILE_SERVER_BASE_URL = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://localhost:3000';

const apiService = {
  // Use the spread syntax to merge all top-level properties from projectService.
  // This automatically includes the new `projectPhotos` service.
  ...projectService,
  
  // These services are flat objects and can be assigned directly
  kdspIIService,
  auth: authService,
  users: userService,
  organization: organizationService,
  strategy: strategyService,
  participants: participantService,
  general: generalService,
  dashboard: dashboardService,
  metadata: metaDataService,
};

export { axiosInstance};

export default apiService;
