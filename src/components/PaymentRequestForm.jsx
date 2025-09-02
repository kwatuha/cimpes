import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  CircularProgress, Alert, Box, FormControl, InputLabel, Select, MenuItem,
  Chip, Checkbox, ListItemText, Typography, Paper, Stack, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../pages/dashboard/theme.js';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../api';
import PropTypes from 'prop-types';

const PaymentRequestForm = ({ open, onClose, projectId, projectName, onSubmit, accomplishedActivities, totalJustifiedAmount }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 20px 40px rgba(0,0,0,0.8)' 
            : '0 20px 40px rgba(0,0,0,0.15)',
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: `linear-gradient(135deg, ${colors.blueAccent[400]}, ${colors.primary[500]})`,
          color: 'white',
          fontWeight: 700,
          fontSize: '1.3rem',
          borderBottom: `3px solid ${colors.blueAccent[300]}`,
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            💰
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              Request Payment
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Project: {projectName}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent 
          dividers 
          sx={{ 
            p: 3,
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[50],
            '& .MuiDivider-root': {
              borderColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[200]
            }
          }}
        >
          {/* Summary Section */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2.5,
              mb: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
              border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? `0 2px 8px ${colors.primary[400]}20`
                : `0 2px 8px ${colors.grey[200]}30`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.grey[800], mb: 2 }}>
              📊 Payment Summary
            </Typography>
            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.grey[700] }}>
                  Total Amount:
                </Typography>
                <Chip 
                  label={`KES ${totalJustifiedAmount?.toFixed(2) || '0.00'}`} 
                  color="success" 
                  sx={{ fontWeight: 700, fontSize: '1rem' }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.grey[700] }}>
                  Activities:
                </Typography>
                <Chip 
                  label={accomplishedActivities?.length || 0} 
                  color="primary" 
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: colors.grey[700] }}>
                  Avg. Budget:
                </Typography>
                <Chip 
                  label={`KES ${((totalJustifiedAmount / (accomplishedActivities?.length || 1)) || 0).toFixed(2)}`} 
                  color="warning" 
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Stack>
          </Paper>

          {/* Form Fields */}
          <Stack spacing={3}>
            <TextField
              label="Amount (KES)"
              name="amount"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={handleChange}
              error={!!formErrors.amount}
              helperText={formErrors.amount}
              InputProps={{
                readOnly: true,
                sx: {
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: colors.greenAccent[600]
                }
              }}
              InputLabelProps={{
                sx: { fontWeight: 600, color: colors.grey[700] }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.blueAccent[400]
                  }
                }
              }}
            />
            
            <TextField
              label="Description"
              name="description"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={handleChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
              InputLabelProps={{
                sx: { fontWeight: 600, color: colors.grey[700] }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.blueAccent[400]
                  }
                }
              }}
            />
            
            <FormControl 
              fullWidth 
              error={!!formErrors.activities} 
              sx={{ minWidth: 250 }}
            >
              <InputLabel sx={{ fontWeight: 600, color: colors.grey[700] }}>
                Accomplished Activities
              </InputLabel>
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
                        <Chip 
                          key={value} 
                          label={activity?.activityName || `ID: ${value}`} 
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      );
                    })}
                  </Box>
                )}
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 250,
                    },
                  },
                }}
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'white',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.blueAccent[400]
                  }
                }}
              >
                {accomplishedActivities.map((activity) => (
                  <MenuItem key={activity.activityId} value={activity.activityId}>
                    <Checkbox checked={formData.activities.indexOf(activity.activityId) > -1} />
                    <ListItemText 
                      primary={
                        <Typography sx={{ fontWeight: 600, color: colors.grey[800] }}>
                          {activity.activityName}
                        </Typography>
                      } 
                      secondary={
                        <Typography sx={{ color: colors.greenAccent[600], fontWeight: 600 }}>
                          Budget: KES {parseFloat(activity.budgetAllocated).toFixed(2)}
                        </Typography>
                      } 
                    />
                  </MenuItem>
                ))}
              </Select>
              {formErrors.activities && (
                <Typography color="error" variant="caption" sx={{ mt: 1, fontWeight: 600 }}>
                  {formErrors.activities}
                </Typography>
              )}
            </FormControl>
            
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.blueAccent[50],
                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.blueAccent[200]}`,
                '& .MuiAlert-message': {
                  fontWeight: 600,
                  color: colors.grey[700],
                  fontSize: '0.95rem'
                }
              }}
            >
              📎 You will be able to attach documents (invoice, inspection report) and photos after the request is reviewed.
            </Alert>
          </Stack>
        </DialogContent>
        
        <DialogActions 
          sx={{ 
            p: 3,
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[100],
            borderTop: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`
          }}
        >
          <Button 
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: colors.grey[400],
              color: colors.grey[700],
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                borderColor: colors.grey[600],
                backgroundColor: colors.grey[100]
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{
              backgroundColor: colors.greenAccent[500],
              fontWeight: 700,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: colors.greenAccent[600]
              },
              '&:disabled': {
                backgroundColor: colors.grey[400]
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
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