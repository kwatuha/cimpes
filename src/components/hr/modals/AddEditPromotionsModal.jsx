import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditPromotionsModal({
  isOpen,
  onClose,
  editedItem,
  employees,
  jobGroups,
  currentEmployeeInView,
  showNotification,
  refreshData
}) {
  // --- Debugging Log ---
  // This will run every time the component renders. Check your browser console.
  console.log('--- Debugging jobGroups Prop ---');
  console.log('Value:', jobGroups);
  console.log('Is it an array?', Array.isArray(jobGroups));
  console.log('--------------------------------');

  const [formData, setFormData] = useState({});
  const isEditMode = !!editedItem;

  useEffect(() => {
    if (isEditMode && editedItem) {
      setFormData(editedItem);
    } else {
      setFormData({
        staffId: currentEmployeeInView ? currentEmployeeInView.staffId : '',
        oldJobGroupId: currentEmployeeInView ? currentEmployeeInView.jobGroupId : '',
        newJobGroupId: '',
        promotionDate: new Date().toISOString().slice(0, 10),
        comments: ''
      });
    }
  }, [isOpen, isEditMode, editedItem, currentEmployeeInView]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId || !formData.newJobGroupId) {
        showNotification('Employee and New Job Group are required.', 'error');
        return;
    }

    const action = isEditMode ? 'updatePromotion' : 'addPromotion';
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
      showNotification(`Promotion record ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      
      refreshData();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} promotion record.`, 'error');
    }
  };
  
  const renderJobGroupValue = (selectedId) => {
    if (!Array.isArray(jobGroups) || jobGroups.length === 0) return '';
    const group = jobGroups.find(g => String(g.id) === String(selectedId));
    return group ? group.groupName : '';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Promotion Record' : 'Add New Promotion Record'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="promotion-form">
          <Grid container spacing={2} sx={{ pt: 1 }}>

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
                    {Array.isArray(employees) && employees.map((emp) => (
                      <MenuItem key={emp.staffId} value={String(emp.staffId)}>{emp.firstName} {emp.lastName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!!currentEmployeeInView} sx={{ minWidth: 200 }}>
                <InputLabel>Previous Job Group</InputLabel>
                <Select
                  name="oldJobGroupId"
                  value={formData?.oldJobGroupId || ''}
                  onChange={handleFormChange}
                  label="Previous Job Group"
                  renderValue={renderJobGroupValue}
                >
                  {Array.isArray(jobGroups) && jobGroups.map((group) => (
                    <MenuItem key={group.id} value={String(group.id)}>{group.groupName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required sx={{ minWidth: 200 }}>
                <InputLabel>New Job Group</InputLabel>
                <Select
                  name="newJobGroupId"
                  value={formData?.newJobGroupId || ''}
                  onChange={handleFormChange}
                  label="New Job Group"
                  renderValue={renderJobGroupValue}
                >
                  {Array.isArray(jobGroups) && jobGroups.map((group) => (
                    <MenuItem key={group.id} value={String(group.id)}>{group.groupName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="promotionDate" label="Promotion Date" type="date" value={formData?.promotionDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth name="comments" label="Comments" multiline rows={2} value={formData?.comments || ''} onChange={handleFormChange} />
            </Grid>

          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
        <Button type="submit" form="promotion-form" variant="contained" color="success">
          {isEditMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}