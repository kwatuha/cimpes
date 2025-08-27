import axios from 'axios';
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
import hrService from './hrService';
import paymentService from './paymentService';
import projectWorkFlowService from './projectWorkFlowService';
import approvalService from './approvalService';
import contractorService from './contractorService'; 
import reportsService from './reportsService'; // 👈 Import the new service

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const FILE_SERVER_BASE_URL = import.meta.env.VITE_FILE_SERVER_BASE_URL || 'http://localhost:3000';

const apiService = {
  ...projectService,
  kdspIIService,
  auth: authService,
  users: userService,
  organization: organizationService,
  strategy: strategyService,
  participants: participantService,
  general: generalService,
  dashboard: dashboardService,
  metadata: metaDataService,
  hr: hrService,
  paymentRequests: paymentService,
  workflow: projectWorkFlowService,
  approval: approvalService,
  contractors: contractorService,
  reports: reportsService, // 👈 Mount the reportsService here
};

export { axiosInstance };

export default apiService;