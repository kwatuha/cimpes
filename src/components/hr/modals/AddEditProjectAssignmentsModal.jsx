import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditProjectAssignmentsModal({
  isOpen,
  onClose,
  editedItem,
  employees,
  currentEmployeeInView, // CHANGED: Added prop
  showNotification,
  refreshData
}) {
  const [formData, setFormData] = useState({});
  const isEditMode = !!editedItem;

  // CHANGED: useEffect logic updated
  useEffect(() => {
    if (isEditMode && editedItem) {
      setFormData(editedItem);
    } else {
      setFormData({
        staffId: currentEmployeeInView ? currentEmployeeInView.staffId : '', // Pre-fill employee
        projectId: '',
        milestoneName: '',
        role: '',
        status: 'Not Started', // Default status
        dueDate: ''
      });
    }
  }, [isOpen, isEditMode, editedItem, currentEmployeeInView]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId) {
        showNotification('An employee must be selected.', 'error');
        return;
    }

    const action = isEditMode ? 'updateProjectAssignment' : 'addProjectAssignment';
    const apiFunction = apiService.hr[action];

    if (!apiFunction) {
      showNotification(`API function for ${action} not found.`, 'error');
      return;
    }

    try {
      const payload = { ...formData, userId: 1 };
      if (isEditMode) {
        await apiFunction(editedItem.id, payload);
      } else {
        await apiFunction(payload);
      }
      showNotification(`Project assignment record ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      
      // CHANGED: Corrected refresh order
      refreshData();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} project assignment record.`, 'error');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Project Assignment' : 'Add New Project Assignment'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="project-assignment-form">
          {/* UPDATED: Grid v2 syntax and spacing */}
          <Grid container spacing={2} sx={{ pt: 1 }}>

            {/* CHANGED: Conditionally render the employee selector */}
            {!currentEmployeeInView && (
              <Grid xs={12}>
                <FormControl fullWidth required sx={{ minWidth: 200 }}>
                  <InputLabel>Select Employee</InputLabel>
                  <Select
                    name="staffId"
                    value={formData?.staffId || ''}
                    onChange={handleFormChange}
                    label="Select Employee"
                  >
                    {employees && employees.map((emp) => (
                      <MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid xs={12} sm={6}>
              <TextField fullWidth name="projectId" label="Project ID / Name" value={formData?.projectId || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth name="milestoneName" label="Milestone Name" value={formData?.milestoneName || ''} onChange={handleFormChange} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth name="role" label="Role" value={formData?.role || ''} onChange={handleFormChange} />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth required sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData?.status || ''} onChange={handleFormChange} label="Status">
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth name="dueDate" label="Due Date" type="date" value={formData?.dueDate?.slice(0, 10) || ''} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
        <Button type="submit" form="project-assignment-form" variant="contained" color="success">
          {isEditMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}