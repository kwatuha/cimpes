import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, TextField, Typography
} from '@mui/material';
import apiService from '../../../api';

export default function AddEditPerformanceReviewModal({
  isOpen,
  onClose,
  editedItem,
  currentEmployeeInView,
  showNotification,
  refreshData
}) {
  const [formData, setFormData] = useState({});
  const isEditMode = !!editedItem;

  useEffect(() => {
    setFormData(isEditMode ? editedItem : {
      staffId: currentEmployeeInView?.staffId || '',
      reviewDate: '',
      reviewScore: '',
      comments: ''
    });
  }, [isEditMode, editedItem, currentEmployeeInView]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditMode ? 'updatePerformanceReview' : 'addPerformanceReview';
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
      showNotification(`Performance review ${isEditMode ? 'updated' : 'added'} successfully.`, 'success');
      onClose();
      refreshData();
    } catch (error) {
      showNotification(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} performance review.`, 'error');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
        {isEditMode ? 'Edit Performance Review' : 'Add New Performance Review'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 2 }}>Review for: <strong>{currentEmployeeInView?.firstName} {currentEmployeeInView?.lastName}</strong></Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth margin="normal" name="reviewDate" label="Review Date" type="date" value={formData?.reviewDate?.slice(0, 10) || ''} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth margin="normal" name="reviewScore" label="Review Score (1-100)" type="number" inputProps={{ min: 1, max: 100 }} value={formData?.reviewScore || ''} onChange={handleFormChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth margin="normal" name="comments" label="Comments" multiline rows={4} value={formData?.comments || ''} onChange={handleFormChange} />
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
