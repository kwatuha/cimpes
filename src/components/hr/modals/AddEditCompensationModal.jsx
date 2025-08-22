import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditCompensationModal({
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
        baseSalary: '',
        allowances: '',
        bonuses: '',
        payFrequency: 'Monthly' // Default value
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
    const action = isEditMode ? 'updateCompensation' : 'addCompensation';
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
      showNotification(`Compensation record ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      
      // CHANGED: Corrected refresh order
      refreshData();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} compensation record.`, 'error');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Compensation' : 'Add New Compensation'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="compensation-form">
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
              <TextField fullWidth name="baseSalary" label="Base Salary" type="number" value={formData?.baseSalary || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth name="allowances" label="Allowances" type="number" value={formData?.allowances || ''} onChange={handleFormChange} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth name="bonuses" label="Bonuses" type="number" value={formData?.bonuses || ''} onChange={handleFormChange} />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth required sx={{ minWidth: 200 }}>
                <InputLabel>Pay Frequency</InputLabel>
                <Select name="payFrequency" value={formData?.payFrequency || ''} onChange={handleFormChange} label="Pay Frequency">
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Bi-Weekly">Bi-Weekly</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
        <Button type="submit" form="compensation-form" variant="contained" color="success">
          {isEditMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}