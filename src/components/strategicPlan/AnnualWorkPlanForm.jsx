// src/components/strategicPlan/AnnualWorkPlanForm.jsx
import React from 'react';
import { Box, TextField, Typography, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

/**
 * Form component for creating and editing an Annual Work Plan.
 * It uses a clean and responsive grid layout for optimal user experience.
 *
 * @param {object} props - The component props.
 * @param {object} props.formData - The current form data.
 * @param {function} props.handleFormChange - The change handler for form inputs.
 */
const AnnualWorkPlanForm = React.memo(({ formData, handleFormChange }) => {
  const approvalStatusOptions = ['draft', 'submitted', 'approved', 'rejected'];

  return (
    <Box sx={{ mt: 2, p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            autoFocus
            margin="dense"
            name="workplanName"
            label="Work Plan Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.workplanName || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="financialYear"
            label="Financial Year (e.g., 2024/2025)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.financialYear || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="totalBudget"
            label="Total Budget"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.totalBudget || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Approval Status</InputLabel>
            <Select
              name="approvalStatus"
              label="Approval Status"
              value={formData.approvalStatus || ''}
              onChange={handleFormChange}
            >
              {approvalStatusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="workplanDescription"
            label="Work Plan Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.workplanDescription || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Additional Details</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="actualExpenditure"
            label="Actual Expenditure"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.actualExpenditure || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="performanceScore"
            label="Performance Score"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.performanceScore || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="challenges"
            label="Challenges"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.challenges || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="lessons"
            label="Lessons Learned"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.lessons || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="recommendations"
            label="Recommendations"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.recommendations || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

export default AnnualWorkPlanForm;