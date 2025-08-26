import axiosInstance from './axiosInstance';

/**
 * @file API service for Project Workflows and Stages related calls.
 * @description This service handles CRUD operations for project stages, workflows, and their steps.
 */
const projectWorkFlowService = {

    // --- Project Stages API Calls ---

    /**
     * Fetches all available project stages from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of project stage objects.
     */
    getAllStages: async () => {
        const response = await axiosInstance.get('/workflows/stages');
        return response.data;
    },

    /**
     * Creates a new project stage.
     * @param {object} stageData - An object containing the stageName and description.
     * @returns {Promise<object>} A promise that resolves to the new stage's ID.
     */
    createStage: async (stageData) => {
        const response = await axiosInstance.post('/workflows/stages', stageData);
        return response.data;
    },

    /**
     * Updates an existing project stage.
     * @param {number} stageId - The ID of the stage to update.
     * @param {object} stageData - The updated stage data.
     * @returns {Promise<object>} A promise that resolves to a success message.
     */
    updateStage: async (stageId, stageData) => {
        const response = await axiosInstance.put(`/workflows/stages/${stageId}`, stageData);
        return response.data;
    },

    /**
     * Deletes a project stage.
     * @param {number} stageId - The ID of the stage to delete.
     * @returns {Promise<object>} A promise that resolves to a success message.
     */
    deleteStage: async (stageId) => {
        const response = await axiosInstance.delete(`/workflows/stages/${stageId}`);
        return response.data;
    },

    // --- Project Workflows API Calls ---

    /**
     * Fetches all project workflows.
     * @returns {Promise<Array>} A promise that resolves to an array of workflow objects.
     */
    getAllWorkflows: async () => {
        const response = await axiosInstance.get('/workflows/workflows');
        return response.data;
    },

    /**
     * Fetches a specific workflow by its ID, including its ordered steps.
     * @param {number} workflowId - The ID of the workflow.
     * @returns {Promise<object>} A promise that resolves to a detailed workflow object.
     */
    getWorkflowById: async (workflowId) => {
        const response = await axiosInstance.get(`/workflows/workflows/${workflowId}`);
        return response.data;
    },

    /**
     * Creates a new project workflow.
     * @param {object} workflowData - An object containing the workflowName and description.
     * @returns {Promise<object>} A promise that resolves to the new workflow's ID.
     */
    createWorkflow: async (workflowData) => {
        const response = await axiosInstance.post('/workflows/workflows', workflowData);
        return response.data;
    },
    
    /**
     * Updates an existing project workflow.
     * @param {number} workflowId - The ID of the workflow to update.
     * @param {object} workflowData - The updated workflow data.
     * @returns {Promise<object>} A promise that resolves to a success message.
     */
    updateWorkflow: async (workflowId, workflowData) => {
        const response = await axiosInstance.put(`/workflows/workflows/${workflowId}`, workflowData);
        return response.data;
    },
    
    /**
     * Deletes a project workflow and its associated steps.
     * @param {number} workflowId - The ID of the workflow to delete.
     * @returns {Promise<object>} A promise that resolves to a success message.
     */
    deleteWorkflow: async (workflowId) => {
        const response = await axiosInstance.delete(`/workflows/workflows/${workflowId}`);
        return response.data;
    },

    // --- Workflow Steps API Calls ---
    
    /**
     * Adds a new step (stage) to a workflow.
     * @param {number} workflowId - The ID of the workflow to add the step to.
     * @param {object} stepData - An object containing stageId and stepOrder.
     * @returns {Promise<object>} A promise that resolves to a success message.
     */
    addStepToWorkflow: async (workflowId, stepData) => {
        const response = await axiosInstance.post(`/workflows/workflows/${workflowId}/steps`, stepData);
        return response.data;
    },

    /**
     * Updates an existing step within a workflow.
     * @param {number} workflowId - The ID of the workflow.
     * @param {number} stepId - The ID of the step to update.
     * @param {object} stepData - The updated step data (e.g., new stepOrder).
     * @returns {Promise<object>} A promise that resolves to a success message.
     */
    updateWorkflowStep: async (workflowId, stepId, stepData) => {
        const response = await axiosInstance.put(`/workflows/workflows/${workflowId}/steps/${stepId}`, stepData);
        return response.data;
    },

    /**
     * Removes a step from a workflow.
     * @param {number} workflowId - The ID of the workflow.
     * @param {number} stepId - The ID of the step to remove.
     * @returns {Promise<object>} A promise that resolves to a success message.
     */
    deleteWorkflowStep: async (workflowId, stepId) => {
        const response = await axiosInstance.delete(`/workflows/workflows/${workflowId}/steps/${stepId}`);
        return response.data;
    },
};

export default projectWorkFlowService;