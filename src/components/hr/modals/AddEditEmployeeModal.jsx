import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditEmployeeModal({
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
    // Initialize form data based on whether it's an edit or add operation
    setFormData(isEditMode ? editedItem : {
      firstName: '', lastName: '', email: '', phoneNumber: '', department: '',
      title: '', gender: '', dateOfBirth: '', employmentStatus: 'Active',
      startDate: '', emergencyContactName: '', emergencyContactPhone: '',
      nationality: '', maritalStatus: '', employmentType: '', managerId: ''
    });
  }, [isEditMode, editedItem]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? 'updateEmployee' : 'addEmployee';
    const apiFunction = apiService.hr[`${action.charAt(0).toLowerCase() + action.slice(1)}`];

    if (!apiFunction) {
      showNotification(`API function for ${action} not found.`, 'error');
      return;
    }

    try {
      const payload = { ...formData, userId: 1 };
      if (isEditMode) {
        await apiFunction(editedItem.staffId, payload);
      } else {
        await apiFunction(payload);
      }
      showNotification(`Employee ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      onClose();
      refreshData();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} employee.`, 'error');
    }
  };

  const renderEmployeeValue = (selectedId) => {
    const employee = employees.find(emp => String(emp.staffId) === String(selectedId));
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Employee' : 'Add New Employee'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="firstName" label="First Name" type="text" value={formData?.firstName || ''} onChange={handleFormChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="lastName" label="Last Name" type="text" value={formData?.lastName || ''} onChange={handleFormChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="email" label="Email" type="email" value={formData?.email || ''} onChange={handleFormChange} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="phoneNumber" label="Phone Number" type="tel" value={formData?.phoneNumber || ''} onChange={handleFormChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="department" label="Department" type="text" value={formData?.department || ''} onChange={handleFormChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="title" label="Title" type="text" value={formData?.title || ''} onChange={handleFormChange} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Gender</InputLabel><Select name="gender" value={formData?.gender || ''} onChange={handleFormChange} label="Gender"><MenuItem value=""><em>Select gender...</em></MenuItem><MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="dateOfBirth" label="Date of Birth" type="date" value={formData?.dateOfBirth?.slice(0, 10) || ''} onChange={handleFormChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}><InputLabel>Employment Status</InputLabel><Select name="employmentStatus" value={formData?.employmentStatus || 'Active'} onChange={handleFormChange} label="Employment Status"><MenuItem value="Active">Active</MenuItem><MenuItem value="On Leave">On Leave</MenuItem><MenuItem value="Terminated">Terminated</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="startDate" label="Start Date" type="date" value={formData?.startDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="emergencyContactName" label="Emergency Contact Name" type="text" value={formData?.emergencyContactName || ''} onChange={handleFormChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="emergencyContactPhone" label="Emergency Contact Phone" type="tel" value={formData?.emergencyContactPhone || ''} onChange={handleFormChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth margin="normal" name="nationality" label="Nationality" type="text" value={formData?.nationality || ''} onChange={handleFormChange} /></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}><InputLabel>Marital Status</InputLabel><Select name="maritalStatus" value={formData?.maritalStatus || ''} onChange={handleFormChange} label="Marital Status"><MenuItem value=""><em>Select marital status...</em></MenuItem><MenuItem value="Single">Single</MenuItem><MenuItem value="Married">Married</MenuItem><MenuItem value="Divorced">Divorced</MenuItem><MenuItem value="Widowed">Widowed</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}><InputLabel>Employment Type</InputLabel><Select name="employmentType" value={formData?.employmentType || ''} onChange={handleFormChange} label="Employment Type"><MenuItem value=""><em>Select employment type...</em></MenuItem><MenuItem value="Full-time">Full-time</MenuItem><MenuItem value="Part-time">Part-time</MenuItem><MenuItem value="Contract">Contract</MenuItem><MenuItem value="Internship">Internship</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} sm={6}><FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}><InputLabel>Manager/Supervisor</InputLabel><Select name="managerId" value={formData?.managerId || ''} onChange={handleFormChange} label="Manager/Supervisor" renderValue={renderEmployeeValue}><MenuItem value=""><em>Select a manager...</em></MenuItem>{employees.map((emp) => (<MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>))}</Select></FormControl></Grid>
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
