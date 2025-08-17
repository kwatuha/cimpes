import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditTrainingModal({
  isOpen,
  onClose,
  editedItem,
  employees,
  currentEmployeeInView,
  showNotification,
  refreshData
}) {
  const [formData, setFormData] = useState({});
  const isEditMode = !!editedItem;

  useEffect(() => {
    if (isEditMode && editedItem) {
      setFormData(editedItem);
    } else {
      setFormData({
        staffId: currentEmployeeInView ? currentEmployeeInView.staffId : '',
        courseName: '',
        institution: '',
        certificationName: '',
        completionDate: '',
        expiryDate: ''
      });
    }
  }, [isOpen, editedItem, isEditMode, currentEmployeeInView]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.staffId) {
        showNotification('Please select an employee.', 'error');
        return;
    }
    
    const action = isEditMode ? 'updateTraining' : 'addTraining';
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
      showNotification(`Training record ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      
      refreshData();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} training record.`, 'error');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Training Record' : 'Add New Training Record'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="training-form">
          <Grid container spacing={2} sx={{ pt: 1 }}>
            
            {!currentEmployeeInView && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select Employee</InputLabel>
                  <Select
                    name="staffId"
                    value={formData?.staffId || ''}
                    onChange={handleFormChange}
                    label="Select Employee"
                  >
                    <MenuItem value=""><em>Select an employee...</em></MenuItem>
                    {employees.map((emp) => (
                      <MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="courseName" label="Course Name" value={formData?.courseName || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="institution" label="Institution" value={formData?.institution || ''} onChange={handleFormChange} />
            </Grid> {/* <-- TYPO WAS HERE */}
            <Grid item xs={12}>
              <TextField fullWidth name="certificationName" label="Certification Name" value={formData?.certificationName || ''} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="completionDate" label="Completion Date" type="date" value={formData?.completionDate?.slice(0, 10) || ''} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="expiryDate" label="Expiry Date" type="date" value={formData?.expiryDate?.slice(0, 10) || ''} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
        <Button type="submit" form="training-form" variant="contained" color="success">
          {isEditMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}