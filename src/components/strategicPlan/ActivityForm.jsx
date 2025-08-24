// src/components/strategicPlan/ActivityForm.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import apiService from '../../api';

const activityStatusOptions = [
  'not_started',
  'in_progress',
  'completed',
  'delayed',
  'cancelled',
];

const ActivityForm = memo(({
  open,
  onClose,
  onSubmit,
  initialData,
  milestones,
  staff,
  formErrors,
  setFormErrors,
  selectedWorkplanName,
  isEditing,
  onChange,
  onMilestoneSelectionChange,
  workPlans
}) => {
  const [formData, setFormData] = useState(initialData);
  const [loadingWorkplanActivities, setLoadingWorkplanActivities] = useState(false);
  const [workplanActivities, setWorkplanActivities] = useState([]);
  
  // FIX: This state is no longer needed. The value is derived from formData.milestoneIds.
  // const [selectedMilestones, setSelectedMilestones] = useState([]);
  
  // The value for the Autocomplete should be derived directly from `formData.milestoneIds`
  const selectedMilestones = formData.milestoneIds?.map(id => milestones.find(m => m.milestoneId === id)).filter(Boolean) || [];

  useEffect(() => {
    // FIX: A single useEffect to sync formData with props
    setFormData(initialData);
  }, [initialData]);
  
  const handleLocalChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    onChange(e);
  }, [onChange]);

  const handleAutocompleteChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    onChange({ target: { name, value } });
  }, [onChange]);
  
  const handleMilestoneSelection = useCallback((event, newValue) => {
    // FIX: Update the formData directly
    const milestoneIds = newValue.map(m => m.milestoneId);
    setFormData(prev => ({ ...prev, milestoneIds }));
    onMilestoneSelectionChange(event, newValue);
  }, [onMilestoneSelectionChange]);
  
  useEffect(() => {
    const fetchWorkplanActivities = async () => {
      if (formData.workplanId) {
        setLoadingWorkplanActivities(true);
        try {
          const activities = await apiService.strategy.activities.getActivitiesByWorkPlanId(formData.workplanId);
          setWorkplanActivities(activities);
        } catch (err) {
          console.error("Error fetching activities for work plan:", err);
          setWorkplanActivities([]);
        } finally {
          setLoadingWorkplanActivities(false);
        }
      } else {
        setWorkplanActivities([]);
      }
    };
    fetchWorkplanActivities();
  }, [formData.workplanId]);

  const relevantMilestones = milestones.filter(m => String(m.projectId) === String(formData.projectId));

  const selectedWorkPlan = workPlans?.find(wp => wp.workplanId === formData.workplanId);
  const selectedResponsibleOfficer = staff.find(s => s.staffId === formData.responsibleOfficer);

  const totalMappedBudget = workplanActivities.reduce((sum, activity) => sum + (parseFloat(activity.budgetAllocated) || 0), 0);

  return (
    <Box sx={{ mt: 2, p: 2 }}>
      <Grid container spacing={2}>
        {selectedWorkplanName && (
          <Grid item xs={12} sm={12}>
            <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>
              <Chip label="Work Plan" sx={{ mr: 1 }} /> {selectedWorkplanName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This activity will be linked to the work plan selected in the main Project Details page.
            </Typography>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <TextField
            name="activityName"
            label="Activity Name"
            type="text"
            fullWidth
            variant="outlined"
            margin="dense"
            value={formData.activityName || ''}
            onChange={handleLocalChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="dense" variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Activity Status</InputLabel>
            <Select
              name="activityStatus"
              label="Activity Status"
              value={formData.activityStatus || ''}
              onChange={handleLocalChange}
            >
              {activityStatusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="startDate"
            label="Start Date"
            type="date"
            fullWidth
            variant="outlined"
            margin="dense"
            value={formData.startDate || ''}
            onChange={handleLocalChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="endDate"
            label="End Date"
            type="date"
            fullWidth
            variant="outlined"
            margin="dense"
            value={formData.endDate || ''}
            onChange={handleLocalChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            multiple
            fullWidth
            options={relevantMilestones}
            getOptionLabel={(option) => option.milestoneName || ''}
            isOptionEqualToValue={(option, value) => option.milestoneId === value.milestoneId}
            value={selectedMilestones} // FIX: Use the derived value
            onChange={handleMilestoneSelection}
            disabled={!formData.projectId}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Contributes to Milestones"
                variant="outlined"
                margin="dense"
                helperText={formData.projectId && relevantMilestones.length === 0 ? "No milestones found for this project." : ""}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            fullWidth
            options={staff}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.staffId === value.staffId}
            value={selectedResponsibleOfficer || null}
            onChange={(event, newValue) => handleAutocompleteChange('responsibleOfficer', newValue ? newValue.staffId : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Responsible Officer"
                variant="outlined"
                margin="dense"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            name="budgetAllocated"
            label="Budget Allocated"
            type="number"
            fullWidth
            variant="outlined"
            margin="dense"
            value={formData.budgetAllocated || ''}
            onChange={handleLocalChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="actualCost"
            label="Actual Cost"
            type="number"
            fullWidth
            variant="outlined"
            margin="dense"
            value={formData.actualCost || ''}
            onChange={handleLocalChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="percentageComplete"
            label="Percentage Complete (%)"
            type="number"
            fullWidth
            variant="outlined"
            margin="dense"
            value={formData.percentageComplete || ''}
            onChange={handleLocalChange}
            inputProps={{ min: 0, max: 100 }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="activityDescription"
            label="Activity Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            margin="dense"
            value={formData.activityDescription || ''}
            onChange={handleLocalChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="remarks"
            label="Remarks"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            margin="dense"
            value={formData.remarks || ''}
            onChange={handleLocalChange}
          />
        </Grid>
      </Grid>
      
      {selectedWorkPlan && (
        <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom>Work Plan Summary: {selectedWorkPlan.workplanName}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Work Plan Budget:</Typography>
              <Chip label={`KES ${selectedWorkPlan.totalBudget ? parseFloat(selectedWorkPlan.totalBudget).toFixed(2) : '0.00'}`} color="primary" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Budget of Mapped Activities:</Typography>
              <Chip label={`KES ${totalMappedBudget.toFixed(2)}`} color="secondary" />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Activities Already in this Work Plan:</Typography>
          {loadingWorkplanActivities ? (
            <CircularProgress size={20} />
          ) : workplanActivities.length > 0 ? (
            <List dense>
              {workplanActivities.map((activity) => (
                <ListItem key={activity.activityId} disablePadding>
                  <ListItemText
                    primary={activity.activityName}
                    secondary={`Budget: KES ${parseFloat(activity.budgetAllocated).toFixed(2)} | Status: ${activity.activityStatus.replace(/_/g, ' ')}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">No activities have been added to this work plan yet.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
});

ActivityForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  milestones: PropTypes.array.isRequired,
  staff: PropTypes.array.isRequired,
  formErrors: PropTypes.object,
  setFormErrors: PropTypes.func,
  selectedWorkplanName: PropTypes.string,
  isEditing: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onMilestoneSelectionChange: PropTypes.func.isRequired,
  workPlans: PropTypes.array.isRequired
};

ActivityForm.defaultProps = {
  initialData: {},
  formErrors: {},
  setFormErrors: () => {},
  selectedWorkplanName: '',
  workPlans: [],
};

export default ActivityForm;