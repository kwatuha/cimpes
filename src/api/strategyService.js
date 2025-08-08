// src/api/strategyService.js
import axiosInstance from './axiosInstance';

const strategyService = {
  // --- Strategic Plans (kemri_strategicPlans) ---
  getStrategicPlans: async () => {
    try {
      const response = await axiosInstance.get('/strategy/strategic_plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching strategic plans:', error);
      throw error;
    }
  },
  getStrategicPlanById: async (planId) => {
    try {
      const response = await axiosInstance.get(`/strategy/strategic_plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching strategic plan with ID ${planId}:`, error);
      throw error;
    }
  },
  createStrategicPlan: async (planData) => {
    try {
      const response = await axiosInstance.post('/strategy/strategic_plans', planData);
      return response.data;
    } catch (error) {
      console.error('Error creating strategic plan:', error);
      throw error;
    }
  },
  updateStrategicPlan: async (planId, planData) => {
    try {
      const response = await axiosInstance.put(`/strategy/strategic_plans/${planId}`, planData);
      return response.data;
    } catch (error) {
      console.error(`Error updating strategic plan with ID ${planId}:`, error);
      throw error;
    }
  },
  deleteStrategicPlan: async (planId) => {
    try {
      const response = await axiosInstance.delete(`/strategy/strategic_plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting strategic plan with ID ${planId}:`, error);
      throw error;
    }
  },

  // --- Programs ---
  getPrograms: async () => {
    try {
      const response = await axiosInstance.get('/strategy/programs');
      return response.data;
    } catch (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
  },
  getProgramById: async (programId) => {
    try {
      const response = await axiosInstance.get(`/strategy/programs/${programId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching program with ID ${programId}:`, error);
      throw error;
    }
  },
  getProgramsByPlanId: async (planCidpId) => {
    try {
        const response = await axiosInstance.get(`/strategy/programs/by-plan/${planCidpId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching programs for plan ${planCidpId}:`, error);
        throw error;
    }
  },
  createProgram: async (programData) => {
    try {
      const response = await axiosInstance.post('/strategy/programs', programData);
      return response.data;
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  },
  updateProgram: async (programId, programData) => {
    try {
      const response = await axiosInstance.put(`/strategy/programs/${programId}`, programData);
      return response.data;
    } catch (error) {
      console.error(`Error updating program with ID ${programId}:`, error);
      throw error;
    }
  },
  deleteProgram: async (programId) => {
    try {
      const response = await axiosInstance.delete(`/strategy/programs/${programId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting program with ID ${programId}:`, error);
      throw error;
    }
  },

  // --- Subprograms ---
  getSubprograms: async () => {
    try {
      const response = await axiosInstance.get('/strategy/subprograms');
      return response.data;
    } catch (error) {
      console.error('Error fetching subprograms:', error);
      throw error;
    }
  },
  getSubprogramById: async (subProgramId) => {
    try {
      const response = await axiosInstance.get(`/strategy/subprograms/${subProgramId}`);
      return response.data;
    }
    catch (error) {
      console.error(`Error fetching subprogram with ID ${subProgramId}:`, error);
      throw error;
    }
  },
  getSubprogramsByProgramId: async (programId) => {
    try {
        const response = await axiosInstance.get(`/strategy/subprograms/by-program/${programId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching subprograms for program ${programId}:`, error);
        throw error;
    }
  },
  createSubprogram: async (subprogramData) => {
    try {
      const response = await axiosInstance.post('/strategy/subprograms', subprogramData);
      return response.data;
    } catch (error) {
      console.error('Error creating subprogram:', error);
      throw error;
    }
  },
  updateSubprogram: async (subProgramId, subprogramData) => {
    try {
      const response = await axiosInstance.put(`/strategy/subprograms/${subProgramId}`, subprogramData);
      return response.data;
    } catch (error) {
      console.error(`Error updating subprogram with ID ${subProgramId}:`, error);
      throw error;
    }
  },
  deleteSubprogram: async (subProgramId) => {
    try {
      const response = await axiosInstance.delete(`/strategy/subprograms/${subProgramId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subprogram with ID ${subProgramId}:`, error);
      throw error;
    }
  },

  // --- Planning Documents (kemri_planningDocuments) ---
  getPlanningDocuments: async () => {
    try {
      const response = await axiosInstance.get('/strategy/attachments');
      return response.data;
    } catch (error) {
      console.error('Error fetching planning documents:', error);
      throw error;
    }
  },
  getPlanningDocumentById: async (attachmentId) => {
    try {
      const response = await axiosInstance.get(`/strategy/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching planning document with ID ${attachmentId}:`, error);
      throw error;
    }
  },
  getPlanningDocumentsForEntity: async (entityType, entityId) => {
    try {
      const response = await axiosInstance.get(`/strategy/attachments/by-entity/${entityType}/${entityId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching planning documents for entity ${entityType}:${entityId}:`, error);
      throw error;
    }
  },
  uploadPlanningDocument: async (formData) => {
    try {
      const response = await axiosInstance.post('/strategy/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading planning document:', error);
      throw error;
    }
  },
  deletePlanningDocument: async (attachmentId) => {
    try {
      const response = await axiosInstance.delete(`/strategy/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting planning document with ID ${attachmentId}:`, error);
      throw error;
    }
  },

  // --- New methods for previewing and confirming strategic plan data import ---
  previewStrategicPlanData: async (formData) => {
    try {
      const response = await axiosInstance.post('/strategy/import-cidp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error previewing strategic plan data:', error);
      throw error;
    }
  },
  confirmImportStrategicPlanData: async (dataPayload) => {
    try {
      const response = await axiosInstance.post('/strategy/confirm-import-cidp', dataPayload);
      return response.data;
    } catch (error) {
      console.error('Error confirming strategic plan data import:', error);
      throw error;
    }
  },

  // --- NEW: PDF Download Methods ---
  downloadPlanPdf: async (planId) => {
    try {
      const response = await axiosInstance.get(`/strategy/strategic_plans/${planId}/export-pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Error downloading PDF for strategic plan ${planId}:`, error);
      throw error;
    }
  },
  downloadProgramPdf: async (programId) => {
    try {
      const response = await axiosInstance.get(`/strategy/programs/${programId}/export-pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Error downloading PDF for program ${programId}:`, error);
      throw error;
    }
  },

  // --- Placeholder for Filter Options ---
  getFilterOptions: async (filterType) => {
    console.warn(`apiService.strategy.getFilterOptions called for type: ${filterType}. This is a placeholder and needs implementation.`);
    try {
      return [];
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
  },
};

export default strategyService;
