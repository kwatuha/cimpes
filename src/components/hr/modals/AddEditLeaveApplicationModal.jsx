import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditLeaveApplicationModal({
  isOpen,
  onClose,
  editedItem,
  employees,
  leaveTypes,
  showNotification,
  refreshData
}) {
  const [formData, setFormData] = useState({});
  const isEditMode = !!editedItem;

  useEffect(() => {
    setFormData(isEditMode ? editedItem : {
      staffId: '',
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      numberOfDays: '',
      reason: '',
      handoverStaffId: '',
      handoverComments: ''
    });
  }, [isEditMode, editedItem]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? 'updateLeaveApplication' : 'addLeaveApplication';
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
      showNotification(`Leave application ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      onClose();
      refreshData();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} leave application.`, 'error');
    }
  };

  const renderEmployeeValue = (selectedId) => {
    const employee = employees.find(emp => String(emp.staffId) === String(selectedId));
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  };
  
  const renderLeaveTypeValue = (selectedId) => {
    const type = leaveTypes.find(t => String(t.id) === String(selectedId));
    return type ? type.name : '';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Leave Application' : 'Add New Leave Application'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}>
                <InputLabel>Select Employee</InputLabel>
                <Select name="staffId" value={formData?.staffId || ''} onChange={handleFormChange} label="Select Employee" renderValue={renderEmployeeValue}>
                  <MenuItem value=""><em>Select an employee...</em></MenuItem>
                  {employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}>
                <InputLabel>Select Leave Type</InputLabel>
                <Select name="leaveTypeId" value={formData?.leaveTypeId || ''} onChange={handleFormChange} label="Select Leave Type" renderValue={renderLeaveTypeValue}>
                  <MenuItem value=""><em>Select a leave type...</em></MenuItem>
                  {leaveTypes.map((type) => (<MenuItem key={type.id} value={String(type.id)}>{type.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="normal" name="startDate" label="Start Date" type="date" value={formData?.startDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="normal" name="endDate" label="End Date" type="date" value={formData?.endDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth margin="normal" name="numberOfDays" label="Number of Days" type="number" value={formData?.numberOfDays || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}>
                <InputLabel>Select Responsibility Handover</InputLabel>
                <Select name="handoverStaffId" value={formData?.handoverStaffId || ''} onChange={handleFormChange} label="Select Responsibility Handover" renderValue={renderEmployeeValue}>
                  <MenuItem value=""><em>Select an employee...</em></MenuItem>
                  {employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth margin="normal" name="handoverComments" label="Handover Comments" multiline rows={3} value={formData?.handoverComments || ''} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth margin="normal" name="reason" label="Reason for Leave" multiline rows={3} value={formData?.reason || ''} onChange={handleFormChange} required />
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
