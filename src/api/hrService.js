// services/hrService.js
import axiosInstance from './axiosInstance';

const hrService = {
  // --- Employee Management (kemri_staff) ---
  getEmployees: async () => {
    try {
      const response = await axiosInstance.get('/hr/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },
  addEmployee: async (employeeData) => {
    try {
      const response = await axiosInstance.post('/hr/employees', employeeData);
      return response.data;
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  },
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await axiosInstance.put(`/hr/employees/${id}`, employeeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  },
  deleteEmployee: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  },
  getEmployee360View: async (id) => {
    try {
      const response = await axiosInstance.get(`/hr/employees/${id}/360`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee 360 view for ${id}:`, error);
      throw error;
    }
  },
  addPerformanceReview: async (reviewData) => {
    try {
      const response = await axiosInstance.post('/hr/employees/performance', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error adding performance review:', error);
      throw error;
    }
  },
  updatePerformanceReview: async (id, reviewData) => {
    try {
      const response = await axiosInstance.put(`/hr/employees/performance/${id}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating performance review:', error);
      throw error;
    }
  },
  deletePerformanceReview: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employees/performance/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting performance review:', error);
      throw error;
    }
  },

  // --- Leave Types (kemri_leave_types) ---
  getLeaveTypes: async () => {
    try {
      const response = await axiosInstance.get('/hr/leave-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching leave types:', error);
      throw error;
    }
  },
  addLeaveType: async (leaveTypeData) => {
    try {
      const response = await axiosInstance.post('/hr/leave-types', leaveTypeData);
      return response.data;
    } catch (error) {
      console.error('Error adding leave type:', error);
      throw error;
    }
  },
  updateLeaveType: async (id, leaveTypeData) => {
    try {
      const response = await axiosInstance.put(`/hr/leave-types/${id}`, leaveTypeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating leave type ${id}:`, error);
      throw error;
    }
  },
  deleteLeaveType: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/leave-types/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting leave type ${id}:`, error);
      throw error;
    }
  },

  // --- Leave Applications (kemri_leave_applications) ---
  getLeaveApplications: async () => {
    try {
      const response = await axiosInstance.get('/hr/leave-applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      throw error;
    }
  },
  addLeaveApplication: async (leaveAppData) => {
    try {
      const response = await axiosInstance.post('/hr/leave-applications', leaveAppData);
      return response.data;
    } catch (error) {
      console.error('Error submitting leave application:', error);
      throw error;
    }
  },
  updateLeaveStatus: async (id, updateData) => {
    try {
      const response = await axiosInstance.put(`/hr/leave-applications/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating leave status for application ${id}:`, error);
      throw error;
    }
  },
  updateLeaveApplication: async (id, updateData) => {
    try {
      const response = await axiosInstance.put(`/hr/leave-applications/${id}/edit`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating leave application ${id}:`, error);
      throw error;
    }
  },
  recordActualReturn: async (id, returnData) => {
    try {
      const response = await axiosInstance.put(`/hr/leave-applications/${id}/return`, returnData);
      return response.data;
    } catch (error) {
      console.error(`Error recording actual return date for application ${id}:`, error);
      throw error;
    }
  },
  deleteLeaveApplication: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/leave-applications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting leave application ${id}:`, error);
      throw error;
    }
  },

  // --- Attendance Management (kemri_attendance) ---
  getTodayAttendance: async () => {
    try {
      const response = await axiosInstance.get('/hr/attendance/today');
      return response.data;
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
      throw error;
    }
  },
  addAttendanceCheckIn: async (checkInData) => {
    try {
      const response = await axiosInstance.post('/hr/attendance/check-in', checkInData);
      return response.data;
    } catch (error) {
      console.error('Error recording check-in:', error);
      throw error;
    }
  },
  addAttendanceCheckOut: async (id, checkOutData) => {
    try {
      const response = await axiosInstance.put(`/hr/attendance/check-out/${id}`, checkOutData);
      return response.data;
    } catch (error) {
      console.error('Error recording check-out:', error);
      throw error;
    }
  },
    
  // --- New Tables CRUD Methods ---

  // Employee Compensation
  addCompensation: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-compensation', data);
      return response.data;
    } catch (error) {
      console.error('Error adding compensation:', error);
      throw error;
    }
  },
  updateCompensation: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-compensation/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating compensation ${id}:`, error);
      throw error;
    }
  },
  deleteCompensation: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-compensation/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting compensation ${id}:`, error);
      throw error;
    }
  },

  // Employee Training
  addTraining: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-training', data);
      return response.data;
    } catch (error) {
      console.error('Error adding training:', error);
      throw error;
    }
  },
  updateTraining: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-training/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating training ${id}:`, error);
      throw error;
    }
  },
  deleteTraining: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-training/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting training ${id}:`, error);
      throw error;
    }
  },

  // Job Groups
  getJobGroups: async () => {
    try {
      const response = await axiosInstance.get('/hr/job-groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching job groups:', error);
      throw error;
    }
  },
  addJobGroup: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/job-groups', data);
      return response.data;
    } catch (error) {
      console.error('Error adding job group:', error);
      throw error;
    }
  },
  updateJobGroup: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/job-groups/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating job group ${id}:`, error);
      throw error;
    }
  },
  deleteJobGroup: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/job-groups/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting job group ${id}:`, error);
      throw error;
    }
  },

  // Employee Promotions
  addPromotion: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-promotions', data);
      return response.data;
    } catch (error) {
      console.error('Error adding promotion:', error);
      throw error;
    }
  },
  updatePromotion: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-promotions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating promotion ${id}:`, error);
      throw error;
    }
  },
  deletePromotion: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-promotions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting promotion ${id}:`, error);
      throw error;
    }
  },

  // Employee Disciplinary
  addDisciplinary: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-disciplinary', data);
      return response.data;
    } catch (error) {
      console.error('Error adding disciplinary record:', error);
      throw error;
    }
  },
  updateDisciplinary: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-disciplinary/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating disciplinary record ${id}:`, error);
      throw error;
    }
  },
  deleteDisciplinary: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-disciplinary/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting disciplinary record ${id}:`, error);
      throw error;
    }
  },

  // Employee Contracts
  addContract: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-contracts', data);
      return response.data;
    } catch (error) {
      console.error('Error adding contract:', error);
      throw error;
    }
  },
  updateContract: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-contracts/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating contract ${id}:`, error);
      throw error;
    }
  },
  deleteContract: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-contracts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting contract ${id}:`, error);
      throw error;
    }
  },

  // Employee Retirements
  addRetirement: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-retirements', data);
      return response.data;
    } catch (error) {
      console.error('Error adding retirement:', error);
      throw error;
    }
  },
  updateRetirement: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-retirements/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating retirement ${id}:`, error);
      throw error;
    }
  },
  deleteRetirement: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-retirements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting retirement ${id}:`, error);
      throw error;
    }
  },

  // Employee Loans
  addLoan: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-loans', data);
      return response.data;
    } catch (error) {
      console.error('Error adding loan:', error);
      throw error;
    }
  },
  updateLoan: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-loans/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating loan ${id}:`, error);
      throw error;
    }
  },
  deleteLoan: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-loans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting loan ${id}:`, error);
      throw error;
    }
  },
  
  // Monthly Payroll
  addPayroll: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/monthly-payroll', data);
      return response.data;
    } catch (error) {
      console.error('Error adding payroll:', error);
      throw error;
    }
  },
  updatePayroll: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/monthly-payroll/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating payroll ${id}:`, error);
      throw error;
    }
  },
  deletePayroll: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/monthly-payroll/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting payroll ${id}:`, error);
      throw error;
    }
  },

  // Employee Dependants
  addDependant: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-dependants', data);
      return response.data;
    } catch (error) {
      console.error('Error adding dependant:', error);
      throw error;
    }
  },
  updateDependant: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-dependants/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating dependant ${id}:`, error);
      throw error;
    }
  },
  deleteDependant: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-dependants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting dependant ${id}:`, error);
      throw error;
    }
  },

  // Employee Terminations
  addTermination: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-terminations', data);
      return response.data;
    } catch (error) {
      console.error('Error adding termination:', error);
      throw error;
    }
  },
  updateTermination: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-terminations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating termination ${id}:`, error);
      throw error;
    }
  },
  deleteTermination: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-terminations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting termination ${id}:`, error);
      throw error;
    }
  },

  // Employee Bank Details
  addBankDetails: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-bank-details', data);
      return response.data;
    } catch (error) {
      console.error('Error adding bank details:', error);
      throw error;
    }
  },
  updateBankDetails: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-bank-details/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating bank details ${id}:`, error);
      throw error;
    }
  },
  deleteBankDetails: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-bank-details/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting bank details ${id}:`, error);
      throw error;
    }
  },

  // Employee Memberships
  addMembership: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-memberships', data);
      return response.data;
    } catch (error) {
      console.error('Error adding membership:', error);
      throw error;
    }
  },
  updateMembership: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-memberships/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating membership ${id}:`, error);
      throw error;
    }
  },
  deleteMembership: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-memberships/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting membership ${id}:`, error);
      throw error;
    }
  },

  // Employee Benefits
  addBenefit: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/employee-benefits', data);
      return response.data;
    } catch (error) {
      console.error('Error adding benefit:', error);
      throw error;
    }
  },
  updateBenefit: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/employee-benefits/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating benefit ${id}:`, error);
      throw error;
    }
  },
  deleteBenefit: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/employee-benefits/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting benefit ${id}:`, error);
      throw error;
    }
  },
  
  // Assigned Assets
  addAssignedAsset: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/assigned-assets', data);
      return response.data;
    } catch (error) {
      console.error('Error adding assigned asset:', error);
      throw error;
    }
  },
  updateAssignedAsset: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/assigned-assets/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating assigned asset ${id}:`, error);
      throw error;
    }
  },
  deleteAssignedAsset: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/assigned-assets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting assigned asset ${id}:`, error);
      throw error;
    }
  },
  
  // Project Assignments
  addProjectAssignment: async (data) => {
    try {
      const response = await axiosInstance.post('/hr/project-assignments', data);
      return response.data;
    } catch (error) {
      console.error('Error adding project assignment:', error);
      throw error;
    }
  },
  updateProjectAssignment: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/hr/project-assignments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating project assignment ${id}:`, error);
      throw error;
    }
  },
  deleteProjectAssignment: async (id) => {
    try {
      const response = await axiosInstance.delete(`/hr/project-assignments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting project assignment ${id}:`, error);
      throw error;
    }
  },
};

export default hrService;
