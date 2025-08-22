import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditPublicHolidayModal({
  isOpen,
  onClose,
  editedItem,
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
        holidayName: '',
        holidayDate: ''
      });
    }
  }, [isOpen, isEditMode, editedItem]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? 'updatePublicHoliday' : 'addPublicHoliday';
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
      showNotification(`Public holiday ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      
      refreshData();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save public holiday.', 'error');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Public Holiday' : 'Add New Public Holiday'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="holiday-form">
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField autoFocus name="holidayName" label="Holiday Name" fullWidth value={formData?.holidayName || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField name="holidayDate" label="Holiday Date" type="date" fullWidth value={formData?.holidayDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">Cancel</Button>
        <Button type="submit" form="holiday-form" variant="contained" color="success">
          {isEditMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}