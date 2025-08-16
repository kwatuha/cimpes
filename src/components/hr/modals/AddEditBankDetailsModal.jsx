import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditBankDetailsModal({
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
      bankName: '',
      accountNumber: '',
      branchName: '',
      isPrimary: 0
    });
  }, [isEditMode, editedItem]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? 'updateBankDetails' : 'addBankDetails';
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
      showNotification(`Bank details ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      onClose();
      refreshData();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} bank details.`, 'error');
    }
  };
  
  const renderEmployeeValue = (selectedId) => {
    const employee = employees.find(emp => String(emp.staffId) === String(selectedId));
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Bank Details' : 'Add New Bank Details'}
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
              <TextField fullWidth margin="dense" name="bankName" label="Bank Name" type="text" value={formData?.bankName || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="accountNumber" label="Account Number" type="text" value={formData?.accountNumber || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="branchName" label="Branch Name" type="text" value={formData?.branchName || ''} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}>
                <InputLabel>Is Primary?</InputLabel>
                <Select name="isPrimary" value={formData?.isPrimary || 0} onChange={handleFormChange} label="Is Primary?">
                  <MenuItem value={0}>No</MenuItem>
                  <MenuItem value={1}>Yes</MenuItem>
                </Select>
              </FormControl>
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
