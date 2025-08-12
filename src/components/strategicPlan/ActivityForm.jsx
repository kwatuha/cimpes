// src/components/strategicPlan/ActivityForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress // CORRECTED: Import CircularProgress
} from '@mui/material';
import apiService from '../../api';

// Status options for the activity dropdown
const activityStatusOptions = [
  'not_started',
  'in_progress',
  'completed',
  'delayed',
  'cancelled',
];

/**
 * Form component for creating and editing an Activity.
 * It uses a clean and responsive grid layout for optimal user experience.
 *
 * @param {object} props - The component props.
 * @param {object} props.formData - The current form data.
 * @param {function} props.handleFormChange - The change handler for form inputs.
 */
const ActivityForm = React.memo(({ formData, handleFormChange }) => {
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Fetch projects and staff data for Autocomplete/dropdowns
  useEffect(() => {
    const fetchProjectsAndStaff = async () => {
      setLoadingProjects(true);
      setLoadingStaff(true);
      try {
        const [projectsData, staffData] = await Promise.all([
          apiService.projects.getProjects(),
          apiService.users.getStaff(),
        ]);
        setProjects(projectsData);
        setStaff(staffData.map(s => ({ staffId: s.staffId, name: `${s.firstName} ${s.lastName}` })));
      } catch (err) {
        console.error("Error fetching projects and staff data:", err);
      } finally {
        setLoadingProjects(false);
        setLoadingStaff(false);
      }
    };
    fetchProjectsAndStaff();
  }, []);

  return (
    <Box sx={{ mt: 2, p: 2 }}>
      <Grid container spacing={2}>
        {/* Top-level details */}
        <Grid item xs={12} sm={6}>
          <TextField
            autoFocus
            margin="dense"
            name="activityName"
            label="Activity Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.activityName || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            fullWidth
            margin="dense"
            options={projects}
            getOptionLabel={(option) => option.projectName || ''}
            value={projects.find(p => p.id === formData.projectId) || null}
            onChange={(event, newValue) => {
              handleFormChange({ target: { name: 'projectId', value: newValue ? newValue.id : null } });
            }}
            loading={loadingProjects}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Associated Project"
                variant="outlined"
                margin="dense"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingProjects ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Responsible Officer & Status */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            fullWidth
            margin="dense"
            options={staff}
            getOptionLabel={(option) => option.name || ''}
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

        {/* Dates */}
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="startDate"
            label="Start Date"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.startDate || ''}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="endDate"
            label="End Date"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.endDate || ''}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Financials & Progress */}
        <Grid item xs={12} sm={4}>
          <TextField
            margin="dense"
            name="budgetAllocated"
            label="Budget Allocated"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.budgetAllocated || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            margin="dense"
            name="actualCost"
            label="Actual Cost"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.actualCost || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            margin="dense"
            name="percentageComplete"
            label="Percentage Complete (%)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.percentageComplete || ''}
            onChange={handleFormChange}
          />
        </Grid>

        {/* Descriptions and Remarks */}
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="activityDescription"
            label="Activity Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.activityDescription || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="remarks"
            label="Remarks"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.remarks || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

export default ActivityForm;