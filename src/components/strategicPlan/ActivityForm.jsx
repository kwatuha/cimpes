// src/components/strategicPlan/ActivityForm.jsx
import React, { useState, useEffect } from 'react';
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

const ActivityForm = React.memo(({ formData, handleFormChange, workPlans, milestones, hideWorkplanSelector }) => {
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [workplanActivities, setWorkplanActivities] = useState([]);
  const [loadingWorkplanActivities, setLoadingWorkplanActivities] = useState(false);

  useEffect(() => {
    const fetchStaffData = async () => {
      setLoadingStaff(true);
      try {
        const staffData = await apiService.users.getStaff();
        setStaff(staffData.map(s => ({ staffId: s.staffId, name: `${s.firstName} ${s.lastName}` })));
      } catch (err) {
        console.error("Error fetching staff data:", err);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaffData();
  }, []);
  
  // New useEffect to fetch activities for the selected work plan
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

  // Filter milestones based on the project ID provided from the parent component
  const relevantMilestones = milestones.filter(m => String(m.projectId) === String(formData.projectId));

  const selectedWorkPlan = workPlans.find(wp => wp.workplanId === formData.workplanId);

  // Calculate the total budget of activities already added to this work plan
  const totalMappedBudget = workplanActivities.reduce((sum, activity) => sum + (parseFloat(activity.budgetAllocated) || 0), 0);

  return (
    <Box sx={{ mt: 2, p: 2 }}>
      <Grid container spacing={2}>
        {/* Row 1: Work Plan, Activity Name, Status */}
        {!hideWorkplanSelector && (
          <Grid item xs={12} sm={6}>
              <Autocomplete
                  fullWidth
                  options={workPlans}
                  getOptionLabel={(option) => option.workplanName || ''}
                  isOptionEqualToValue={(option, value) => option.workplanId === value}
                  value={selectedWorkPlan || null}
                  onChange={(event, newValue) => {
                      const workplanId = newValue ? newValue.workplanId : null;
                      handleFormChange({ target: { name: 'workplanId', value: workplanId } });
                      if (!newValue) {
                        handleFormChange({ target: { name: 'milestoneIds', value: [] } });
                      }
                  }}
                  loading={false}
                  renderInput={(params) => (
                      <TextField
                          {...params}
                          label="Select Work Plan"
                          variant="outlined"
                          margin="dense"
                          InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                  <>
                                      {false ? <CircularProgress color="inherit" size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                  </>
                              ),
                          }}
                      />
                  )}
              />
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
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Activity Status</InputLabel>
            <Select
              name="activityStatus"
              label="Activity Status"
              value={formData.activityStatus || ''}
              onChange={handleFormChange}
            >
              {activityStatusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Row 2: Dates */}
        <Grid item xs={12} sm={6}>
          <TextField
            name="startDate"
            label="Start Date"
            type="date"
            fullWidth
            variant="outlined"
            margin="dense"
            value={formData.startDate || ''}
            onChange={handleFormChange}
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
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Row 3: Contributes to Milestones */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            fullWidth
            options={relevantMilestones}
            getOptionLabel={(option) => option.milestoneName || ''}
            isOptionEqualToValue={(option, value) => option.milestoneId === value.milestoneId}
            value={relevantMilestones.filter(m => (formData.milestoneIds || []).includes(m.milestoneId))}
            onChange={(event, newValue) => {
              handleFormChange({ target: { name: 'milestoneIds', value: newValue.map(m => m.milestoneId) } });
            }}
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

        {/* Row 4: Responsible Officer */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            fullWidth
            options={staff}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.staffId === value.staffId}
            value={staff.find(s => s.staffId === formData.responsibleOfficer) || null}
            onChange={(event, newValue) => {
              handleFormChange({ target: { name: 'responsibleOfficer', value: newValue ? newValue.staffId : null } });
            }}
            loading={loadingStaff}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Responsible Officer"
                variant="outlined"
                margin="dense"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingStaff ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Row 5: Financials & Progress */}
        <Grid item xs={12} sm={4}>
          <TextField
            name="budgetAllocated"
            label="Budget Allocated"
            type="number"
            fullWidth
            variant="outlined"
            margin="dense"
            value={formData.budgetAllocated || ''}
            onChange={handleFormChange}
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
            onChange={handleFormChange}
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
            onChange={handleFormChange}
          />
        </Grid>

        {/* Row 6: Descriptions and Remarks */}
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
            onChange={handleFormChange}
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
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
      
      {/* New section for work plan details */}
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

export default ActivityForm;
