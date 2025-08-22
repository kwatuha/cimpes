import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditLoansModal({
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
        loanAmount: '',
        loanDate: new Date().toISOString().slice(0, 10), // Default to today
        repaymentSchedule: '',
        status: 'Pending', // Default status
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

    const action = isEditMode ? 'updateLoan' : 'addLoan';
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
      showNotification(`Loan record ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      
      // CHANGED: Corrected refresh order
      refreshData();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} loan record.`, 'error');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Loan Record' : 'Add New Loan Record'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="loan-form">
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
              <TextField fullWidth name="loanAmount" label="Loan Amount" type="number" value={formData?.loanAmount || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth name="loanDate" label="Loan Date" type="date" value={formData?.loanDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid xs={12} sm={6}>
               <FormControl fullWidth required sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData?.status || ''} onChange={handleFormChange} label="Status">
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Repaying">Repaying</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
             <Grid xs={12}>
              <TextField fullWidth name="repaymentSchedule" label="Repayment Schedule / Comments" multiline rows={2} value={formData?.repaymentSchedule || ''} onChange={handleFormChange} />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
        <Button type="submit" form="loan-form" variant="contained" color="success">
          {isEditMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}