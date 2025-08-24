import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  CircularProgress, Alert, Box, FormControl, InputLabel, Select, MenuItem,
  Chip, Checkbox, ListItemText, Typography
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../api';
import PropTypes from 'prop-types';

const PaymentRequestForm = ({ open, onClose, projectId, projectName, onSubmit, accomplishedActivities, totalJustifiedAmount }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    activities: [], // Array of activity IDs
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && accomplishedActivities && totalJustifiedAmount) {
      setFormData({
        activities: accomplishedActivities.map(a => a.activityId),
        amount: totalJustifiedAmount.toFixed(2),
        description: `Payment request for completed activities associated with the following milestones: \n\n${accomplishedActivities.map(a => `- ${a.activityName} (Budget: KES ${parseFloat(a.budgetAllocated).toFixed(2)})`).join('\n')}`,
      });
    }
  }, [open, accomplishedActivities, totalJustifiedAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleActivitiesChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      activities: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const validate = () => {
    let errors = {};
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valid amount is required.';
    }
    if (!formData.description) {
      errors.description = 'Description is required.';
    }
    if (!formData.activities || formData.activities.length === 0) {
      errors.activities = 'At least one accomplished activity must be selected.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(projectId, formData);
      onClose(); // Close modal on success
      setFormData({ amount: '', description: '', activities: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request Payment for {projectName}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <TextField
            label="Amount (KES)"
            name="amount"
            type="number"
            fullWidth
            margin="normal"
            value={formData.amount}
            onChange={handleChange}
            error={!!formErrors.amount}
            helperText={formErrors.amount}
            InputProps={{
              readOnly: true, 
            }}
          />
          <TextField
            label="Description"
            name="description"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={formData.description}
            onChange={handleChange}
            error={!!formErrors.description}
            helperText={formErrors.description}
          />
          
          <FormControl fullWidth margin="normal" error={!!formErrors.activities}>
            <InputLabel>Accomplished Activities</InputLabel>
            <Select
              name="activities"
              multiple
              value={formData.activities}
              onChange={handleActivitiesChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const activity = accomplishedActivities.find(a => a.activityId === value);
                    return (
                      <Chip key={value} label={activity?.activityName || `ID: ${value}`} />
                    );
                  })}
                </Box>
              )}
            >
              {accomplishedActivities.map((activity) => (
                <MenuItem key={activity.activityId} value={activity.activityId}>
                  <Checkbox checked={formData.activities.indexOf(activity.activityId) > -1} />
                  <ListItemText primary={activity.activityName} secondary={`Budget: KES ${parseFloat(activity.budgetAllocated).toFixed(2)}`} />
                </MenuItem>
              ))}
            </Select>
            {formErrors.activities && <Typography color="error" variant="caption">{formErrors.activities}</Typography>}
          </FormControl>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            You will be able to attach documents (invoice, inspection report) and photos after the request is reviewed.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

PaymentRequestForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.number,
  projectName: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  accomplishedActivities: PropTypes.array,
  totalJustifiedAmount: PropTypes.number,
};

PaymentRequestForm.defaultProps = {
    accomplishedActivities: [],
    totalJustifiedAmount: 0,
};

export default PaymentRequestForm;