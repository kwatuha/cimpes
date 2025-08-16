import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditMembershipsModal({
  isOpen,
  onClose,
  editedItem,
  employees,
  showNotification,
  refreshData
}) {
  const [formData, setFormData] = useState({});
  const isEditMode = !!editedItem;

  useEffect(() => {
    setFormData(isEditMode ? editedItem : {
      staffId: '',
      organizationName: '',
      membershipNumber: '',
      startDate: '',
      endDate: ''
    });
  }, [isEditMode, editedItem]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? 'updateMembership' : 'addMembership';
    const apiFunction = apiService.hr[`${action.charAt(0).toLowerCase() + action.slice(1)}`];

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
      showNotification(`Membership record ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      onClose();
      refreshData();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} membership record.`, 'error');
    }
  };

  const renderEmployeeValue = (selectedId) => {
    const employee = employees.find(emp => String(emp.staffId) === String(selectedId));
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Membership' : 'Add New Membership'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}>
                <InputLabel>Select Employee</InputLabel>
                <Select
                  name="staffId"
                  value={formData?.staffId || ''}
                  onChange={handleFormChange}
                  label="Select Employee"
                  renderValue={renderEmployeeValue}
                >
                  <MenuItem value=""><em>Select an employee...</em></MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="organizationName" label="Organization Name" type="text" value={formData?.organizationName || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="membershipNumber" label="Membership Number" type="text" value={formData?.membershipNumber || ''} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="startDate" label="Start Date" type="date" value={formData?.startDate?.slice(0, 10) || ''} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="endDate" label="End Date" type="date" value={formData?.endDate?.slice(0, 10) || ''} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
          <DialogActions>
            <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
            <Button type="submit" variant="contained" color="success">
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
