import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditAssignedAssetsModal({
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
        assetName: '',
        serialNumber: '',
        assignmentDate: new Date().toISOString().slice(0, 10), // Default to today
        returnDate: '',
        condition: ''
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
        showNotification('Employee is required.', 'error');
        return;
    }

    const action = isEditMode ? 'updateAssignedAsset' : 'addAssignedAsset';
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
      showNotification(`Asset assignment record ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      
      // CHANGED: Corrected refresh order
      refreshData();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} asset assignment record.`, 'error');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Asset Assignment' : 'Add New Asset Assignment'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="asset-form">
          <Grid container spacing={2} sx={{ pt: 1 }}>
            
            {/* CHANGED: Conditionally render the employee selector */}
            {!currentEmployeeInView && (
                <Grid item xs={12}>
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

            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="assetName" label="Asset Name" value={formData?.assetName || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="serialNumber" label="Serial Number" value={formData?.serialNumber || ''} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="assignmentDate" label="Assignment Date" type="date" value={formData?.assignmentDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="returnDate" label="Return Date" type="date" value={formData?.returnDate?.slice(0, 10) || ''} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth name="condition" label="Condition" value={formData?.condition || ''} onChange={handleFormChange} />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
        <Button type="submit" form="asset-form" variant="contained" color="success">
          {isEditMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}