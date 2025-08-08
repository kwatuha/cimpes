// src/api/index.js

import axiosInstance from './axiosInstance';

import authService from './authService';
import userService from './userService';
import projectService from './projectService'; // The module containing projects, tasks, etc.
import organizationService from './organizationService';
import strategyService from './strategyService';
import participantService from './participantService';
import generalService from './generalService';
import dashboardService from './dashboardService';
import metaDataService from './metaDataService';
import kdspIIService from './kdspIIService';

// Export the base URL for API calls (used by axiosInstance)
export const API_BASE_URL = 'http://192.168.100.12:3000/api';

// Export the base URL for directly accessing static files (e.g., uploaded documents)
export const FILE_SERVER_BASE_URL = 'http://192.168.100.12:3000';

const apiService = {
  // Use the spread syntax to merge all top-level properties from projectService
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

export default apiService;