// src/api/projectService.js
import axiosInstance from './axiosInstance';

/**
 * @file API service for Project Management related calls.
 * @description This service is organized to mirror the modular backend routes.
 * It handles CRUD operations and complex queries for all project-related resources.
 */

const projectService = {
  // --- Project Management API Calls (kemri_projects) ---
  projects: {
    getProjects: async (filters = {}) => {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString ? `/projects?${queryString}` : '/projects';
      const response = await axiosInstance.get(url);
      return response.data;
    },
    getProjectById: async (projectId) => {
      const response = await axiosInstance.get(`/projects/${projectId}`);
      return response.data;
    },
    createProject: async (projectData) => {
      const response = await axiosInstance.post('/projects', projectData);
      return response.data;
    },
    updateProject: async (projectId, projectData) => {
      const response = await axiosInstance.put(`/projects/${projectId}`, projectData);
      return response.data;
    },
    deleteProject: async (projectId) => {
      const response = await axiosInstance.delete(`/projects/${projectId}`);
      return response.data;
    },
    
    // NEW: Function to apply a milestone template to an existing project
    applyMilestoneTemplate: async (projectId) => {
        const response = await axiosInstance.post(`/projects/apply-template/${projectId}`);
        return response.data;
    },
  },

  // --- Project Analytics API Calls ---
  analytics: {
    getProjectStatusCounts: async () => {
      const response = await axiosInstance.get('/projects/status-counts');
      return response.data;
    },
    getProjectsByDirectorateCounts: async () => {
      const response = await axiosInstance.get('/projects/directorate-counts');
      return response.data;
    },
    getProjectFundingOverview: async () => {
      const response = await axiosInstance.get('/projects/funding-overview');
      return response.data;
    },
    getProjectsByPICounts: async () => {
      const response = await axiosInstance.get('/projects/pi-counts');
      return response.data;
    },
    getParticipantsPerProject: async () => {
      const response = await axiosInstance.get('/projects/participants-per-project');
      return response.data;
    },
  },

  // --- Task Management API Calls (kemri_tasks) ---
  tasks: {
    getAllTasks: async () => {
      const response = await axiosInstance.get('/tasks');
      return response.data;
    },
    getTasksForProject: async (projectId) => {
      const response = await axiosInstance.get(`/tasks/project/${projectId}`);
      return response.data;
    },
    getTaskById: async (taskId) => {
      const response = await axiosInstance.get(`/tasks/${taskId}`);
      return response.data;
    },
    createTask: async (taskData) => {
      const response = await axiosInstance.post('/tasks', taskData);
      return response.data;
    },
    updateTask: async (taskId, taskData) => {
      const response = await axiosInstance.put(`/tasks/${taskId}`, taskData);
      return response.data;
    },
    deleteTask: async (taskId) => {
      const response = await axiosInstance.delete(`/tasks/${taskId}`);
      return response.data;
    },
  },

  // --- Milestone Management API Calls (kemri_project_milestones) ---
  milestones: {
    getAllMilestones: async () => {
      const response = await axiosInstance.get('/milestones');
      return response.data;
    },
    getMilestonesForProject: async (projectId) => {
      const response = await axiosInstance.get(`/milestones/project/${projectId}`);
      return response.data;
    },
    getMilestoneById: async (milestoneId) => {
      const response = await axiosInstance.get(`/milestones/${milestoneId}`);
      return response.data;
    },
    createMilestone: async (milestoneData) => {
      const response = await axiosInstance.post('/milestones', milestoneData);
      return response.data;
    },
    updateMilestone: async (milestoneId, milestoneData) => {
      const response = await axiosInstance.put(`/milestones/${milestoneId}`, milestoneData);
      return response.data;
    },
    deleteMilestone: async (milestoneId) => {
      const response = await axiosInstance.delete(`/milestones/${milestoneId}`);
      return response.data;
    },
  },

  // --- Task Assignees API Calls (kemri_task_assignees) ---
  taskAssignees: {
    getAllTaskAssignees: async () => {
      const response = await axiosInstance.get('/task_assignees');
      return response.data;
    },
    getTaskAssigneesForTask: async (taskId) => {
      const response = await axiosInstance.get(`/task_assignees/by-task/${taskId}`);
      return response.data;
    },
    getTaskAssigneeById: async (taskAssigneeId) => {
      const response = await axiosInstance.get(`/task_assignees/${taskAssigneeId}`);
      return response.data;
    },
    createTaskAssignee: async (assigneeData) => {
      const response = await axiosInstance.post('/task_assignees', assigneeData);
      return response.data;
    },
    updateTaskAssignee: async (taskAssigneeId, assigneeData) => {
      const response = await axiosInstance.put(`/task_assignees/${taskAssigneeId}`, assigneeData);
      return response.data;
    },
    deleteTaskAssignee: async (taskAssigneeId) => {
      const response = await axiosInstance.delete(`/task_assignees/${taskAssigneeId}`);
      return response.data;
    },
  },

  // --- Task Dependencies API Calls (kemri_task_dependencies) ---
  taskDependencies: {
    getAllTaskDependencies: async () => {
      const response = await axiosInstance.get('/task_dependencies');
      return response.data;
    },
    getTaskDependenciesForTask: async (taskId) => {
      const response = await axiosInstance.get(`/task_dependencies/by-task/${taskId}`);
      return response.data;
    },
    getTaskDependencyById: async (dependencyId) => {
      const response = await axiosInstance.get(`/task_dependencies/${dependencyId}`);
      return response.data;
    },
    createTaskDependency: async (dependencyData) => {
      const response = await axiosInstance.post('/task_dependencies', dependencyData);
      return response.data;
    },
    updateTaskDependency: async (dependencyId, dependencyData) => {
      const response = await axiosInstance.put(`/task_dependencies/${dependencyId}`, dependencyData);
      return response.data;
    },
    deleteTaskDependency: async (dependencyId) => {
      const response = await axiosInstance.delete(`/task_dependencies/${dependencyId}`);
      return response.data;
    },
  },

  // --- Project-Location Junction Table API Calls ---
  junctions: {
    getProjectCounties: async (projectId) => {
      const response = await axiosInstance.get(`/projects/${projectId}/counties`);
      return response.data;
    },
    addProjectCounty: async (projectId, countyId) => {
      const response = await axiosInstance.post(`/projects/${projectId}/counties`, { countyId });
      return response.data;
    },
    removeProjectCounty: async (projectId, countyId) => {
      const response = await axiosInstance.delete(`/projects/${projectId}/counties/${countyId}`);
      return response.data;
    },
    getProjectSubcounties: async (projectId) => {
      const response = await axiosInstance.get(`/projects/${projectId}/subcounties`);
      return response.data;
    },
    addProjectSubcounty: async (projectId, subcountyId) => {
      const response = await axiosInstance.post(`/projects/${projectId}/subcounties`, { subcountyId });
      return response.data;
    },
    removeProjectSubcounty: async (projectId, subcountyId) => {
      const response = await axiosInstance.delete(`/projects/${projectId}/subcounties/${subcountyId}`);
      return response.data;
    },
    getProjectWards: async (projectId) => {
      const response = await axiosInstance.get(`/projects/${projectId}/wards`);
      return response.data;
    },
    addProjectWard: async (projectId, wardId) => {
      const response = await axiosInstance.post(`/projects/${projectId}/wards`, { wardId });
      return response.data;
    },
    removeProjectWard: async (projectId, wardId) => {
      const response = await axiosInstance.delete(`/projects/${projectId}/wards/${wardId}`);
      return response.data;
    },
  },
};

export default projectService;
