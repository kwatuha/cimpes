import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditLeaveEntitlementModal({
  isOpen,
  onClose,
  editedItem,
  currentEmployeeId,
  leaveTypes,
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
        staffId: currentEmployeeId || '',
        leaveTypeId: '',
        year: new Date().getFullYear(),
        allocatedDays: ''
      });
    }
  }, [isOpen, isEditMode, editedItem, currentEmployeeId]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? 'updateLeaveEntitlement' : 'addLeaveEntitlement';
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
      showNotification(`Leave entitlement ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      
      refreshData();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save leave entitlement.', 'error');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Leave Entitlement' : 'Add New Leave Entitlement'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="entitlement-form">
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid xs={12}>
              <FormControl fullWidth required sx={{ minWidth: 200 }}>
                <InputLabel>Leave Type</InputLabel>
                <Select name="leaveTypeId" value={formData?.leaveTypeId || ''} onChange={handleFormChange} label="Leave Type">
                  {Array.isArray(leaveTypes) && leaveTypes.map((type) => (
                    <MenuItem key={type.id} value={String(type.id)}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth name="year" label="Year" type="number" value={formData?.year || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth name="allocatedDays" label="Allocated Days" type="number" value={formData?.allocatedDays || ''} onChange={handleFormChange} required />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
        <Button type="submit" form="entitlement-form" variant="contained" color="success">
          {isEditMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}