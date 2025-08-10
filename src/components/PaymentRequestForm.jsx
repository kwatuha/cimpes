import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Button, CircularProgress, Alert
} from '@mui/material';

const PaymentRequestForm = ({ open, onClose, projectId, projectName, onSubmit }) => {
  const [formData, setFormData] = useState({ amount: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(projectId, formData);
      setFormData({ amount: '', description: '' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ amount: '', description: '' });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New Payment Request for: {projectName}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            name="amount"
            label="Amount (KES)"
            type="number"
            fullWidth
            required
            value={formData.amount}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description of Work Done"
            type="text"
            multiline
            rows={4}
            fullWidth
            required
            value={formData.description}
            onChange={handleFormChange}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={24} /> : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentRequestForm;