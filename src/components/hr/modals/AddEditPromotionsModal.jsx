import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditPromotionsModal({
  isOpen,
  onClose,
  editedItem,
  employees,
  jobGroups,
  showNotification,
  refreshData
}) {
  const [formData, setFormData] = useState({});
  const isEditMode = !!editedItem;

  useEffect(() => {
    setFormData(isEditMode ? editedItem : {
      staffId: '',
      oldJobGroupId: '',
      newJobGroupId: '',
      promotionDate: '',
      comments: ''
    });
  }, [isEditMode, editedItem]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? 'updatePromotion' : 'addPromotion';
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
      showNotification(`Promotion record ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      onClose();
      refreshData();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} promotion record.`, 'error');
    }
  };

  const renderEmployeeValue = (selectedId) => {
    const employee = employees.find(emp => String(emp.staffId) === String(selectedId));
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  };
  
  const renderJobGroupValue = (selectedId) => {
    const group = jobGroups.find(g => String(g.id) === String(selectedId));
    return group ? group.groupName : '';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Promotion Record' : 'Add New Promotion Record'}
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
              <FormControl fullWidth margin="normal" sx={{ minWidth: 200 }}>
                <InputLabel>Previous Job Group</InputLabel>
                <Select
                  name="oldJobGroupId"
                  value={formData?.oldJobGroupId || ''}
                  onChange={handleFormChange}
                  label="Previous Job Group"
                  renderValue={renderJobGroupValue}
                >
                  <MenuItem value=""><em>Select job group...</em></MenuItem>
                  {jobGroups.map((group) => (
                    <MenuItem key={group.id} value={String(group.id)}>{group.groupName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required sx={{ minWidth: 200 }}>
                <InputLabel>New Job Group</InputLabel>
                <Select
                  name="newJobGroupId"
                  value={formData?.newJobGroupId || ''}
                  onChange={handleFormChange}
                  label="New Job Group"
                  renderValue={renderJobGroupValue}
                >
                  <MenuItem value=""><em>Select job group...</em></MenuItem>
                  {jobGroups.map((group) => (
                    <MenuItem key={group.id} value={String(group.id)}>{group.groupName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth margin="dense" name="promotionDate" label="Promotion Date" type="date" value={formData?.promotionDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth margin="dense" name="comments" label="Comments" type="text" multiline rows={2} value={formData?.comments || ''} onChange={handleFormChange} />
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
