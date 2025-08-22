import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditLeaveApplicationModal({
  isOpen,
  onClose,
  editedItem,
  employees,
  leaveTypes,
  leaveBalances,
  currentEmployeeInView,
  showNotification,
  refreshData
}) {
  const [formData, setFormData] = useState({});
  const [currentBalance, setCurrentBalance] = useState(null);
  const isEditMode = !!editedItem;

  useEffect(() => {
    if (isEditMode && editedItem) {
      setFormData(editedItem);
    } else {
      setFormData({
        staffId: currentEmployeeInView ? currentEmployeeInView.staffId : '',
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        numberOfDays: 0,
        reason: '',
        handoverStaffId: '',      // ADDED: Restored field
        handoverComments: ''  // ADDED: Restored field
      });
    }
  }, [isOpen, isEditMode, editedItem, currentEmployeeInView]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end >= start) {
        const fetchWorkingDays = async () => {
          try {
            const response = await apiService.hr.calculateWorkingDays(formData.startDate, formData.endDate);
            setFormData(prev => ({ ...prev, numberOfDays: response.workingDays }));
          } catch (error) {
            console.error("Failed to calculate working days", error);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setFormData(prev => ({ ...prev, numberOfDays: diffDays }));
          }
        };
        fetchWorkingDays();
      }
    }
  }, [formData.startDate, formData.endDate]);
  
  useEffect(() => {
    if (formData.leaveTypeId && Array.isArray(leaveBalances)) {
      const balance = leaveBalances.find(b => String(b.leaveTypeId) === String(formData.leaveTypeId));
      setCurrentBalance(balance);
    } else {
      setCurrentBalance(null);
    }
  }, [formData.leaveTypeId, leaveBalances]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId || !formData.leaveTypeId) {
        showNotification('Employee and Leave Type are required.', 'error');
        return;
    }
    
    const action = isEditMode ? 'updateLeaveApplication' : 'addLeaveApplication';
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
      showNotification(`Leave application ${isEditMode ? 'updated' : 'submitted'} successfully.`, 'success');
      
      refreshData();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to submit leave application.`, 'error');
    }
  };

  const renderLeaveTypeValue = (selectedId) => {
    if (!Array.isArray(leaveTypes)) return '';
    const type = leaveTypes.find(t => String(t.id) === String(selectedId));
    return type ? type.name : '';
  };
  
  const renderEmployeeValue = (selectedId) => {
    if (!Array.isArray(employees)) return '';
    const employee = employees.find(emp => String(emp.staffId) === String(selectedId));
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Leave Application' : 'Apply for Leave'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="leave-app-form">
          <Grid container spacing={2} sx={{ pt: 1 }}>

            {!currentEmployeeInView && (
              <Grid xs={12}>
                <FormControl fullWidth required sx={{ minWidth: 200 }}>
                  <InputLabel>Select Employee</InputLabel>
                  <Select name="staffId" value={formData?.staffId || ''} onChange={handleFormChange} label="Select Employee" renderValue={renderEmployeeValue}>
                    {Array.isArray(employees) && employees.map((emp) => (
                      <MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid xs={12} sm={6}>
                <FormControl fullWidth required sx={{ minWidth: 200 }}>
                  <InputLabel>Leave Type</InputLabel>
                  <Select name="leaveTypeId" value={formData?.leaveTypeId || ''} onChange={handleFormChange} label="Leave Type" renderValue={renderLeaveTypeValue}>
                    {Array.isArray(leaveTypes) && leaveTypes.map((type) => (
                      <MenuItem key={type.id} value={String(type.id)}>{type.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
            </Grid>
            <Grid xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                {currentBalance && (
                    <Alert severity="info" sx={{ width: '100%', mt: 0 }}>
                        Available Balance: <strong>{currentBalance.balance}</strong> days
                    </Alert>
                )}
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField fullWidth name="startDate" label="Start Date" type="date" value={formData?.startDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField fullWidth name="endDate" label="End Date" type="date" value={formData?.endDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid xs={12} sm={4}>
                <TextField
                    fullWidth
                    disabled
                    name="numberOfDays"
                    label="Working Days"
                    type="number"
                    value={formData?.numberOfDays || 0}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid xs={12}>
              <TextField fullWidth name="reason" label="Reason for Leave" multiline rows={2} value={formData?.reason || ''} onChange={handleFormChange} required />
            </Grid>
            
            {/* ADDED: Restored Handover fields */}
            <Grid xs={12} sm={6}>
                <FormControl fullWidth sx={{ minWidth: 200 }}>
                  <InputLabel>Handover To (Optional)</InputLabel>
                  <Select name="handoverStaffId" value={formData?.handoverStaffId || ''} onChange={handleFormChange} label="Handover To (Optional)" renderValue={renderEmployeeValue}>
                     {Array.isArray(employees) && employees.map((emp) => (
                      <MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
            </Grid>
            <Grid xs={12}>
              <TextField fullWidth name="handoverComments" label="Handover Comments" multiline rows={2} value={formData?.handoverComments || ''} onChange={handleFormChange} />
            </Grid>

          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
            <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
            <Button type="submit" form="leave-app-form" variant="contained" color="success">
                {isEditMode ? 'Update' : 'Submit Application'}
            </Button>
      </DialogActions>
    </Dialog>
  );
}