import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditAssignedAssetsModal({
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
      assetName: '',
      serialNumber: '',
      assignmentDate: '',
      returnDate: '',
      condition: ''
    });
  }, [isEditMode, editedItem]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? 'updateAssignedAsset' : 'addAssignedAsset';
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
      showNotification(`Asset assignment record ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      onClose();
      refreshData();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} asset assignment record.`, 'error');
    }
  };

  const renderEmployeeValue = (selectedId) => {
    const employee = employees.find(emp => String(emp.staffId) === String(selectedId));
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Asset Assignment' : 'Add New Asset Assignment'}
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
              <TextField fullWidth margin="dense" name="assetName" label="Asset Name" type="text" value={formData?.assetName || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="serialNumber" label="Serial Number" type="text" value={formData?.serialNumber || ''} onChange={handleFormChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="assignmentDate" label="Assignment Date" type="date" value={formData?.assignmentDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="returnDate" label="Return Date" type="date" value={formData?.returnDate?.slice(0, 10) || ''} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="condition" label="Condition" type="text" value={formData?.condition || ''} onChange={handleFormChange} />
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
