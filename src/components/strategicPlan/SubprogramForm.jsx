// src/components/strategicPlan/SubprogramForm.jsx
import React, { useEffect } from 'react';
import { Box, TextField, Grid, Divider, Typography } from '@mui/material';
import { formatNumberForInput } from '../../utils/helpers';

/**
 * Form component for creating and editing a Subprogram.
 * It includes fields for program details, KPIs, targets, and budgets.
 *
 * @param {object} props - The component props.
 * @param {object} props.formData - The current form data.
 * @param {function} props.handleFormChange - The change handler for form inputs.
 * @param {function} props.setFormData - The direct setter for the form data state.
 */
function SubprogramForm({ formData, handleFormChange, setFormData }) {
  // useEffect hook to automatically calculate totalBudget
  useEffect(() => {
    const total = ['yr1Budget', 'yr2Budget', 'yr3Budget', 'yr4Budget', 'yr5Budget']
      .map(year => (typeof formData[year] === 'number' ? formData[year] : 0))
      .reduce((sum, current) => sum + current, 0);

    // Update totalBudget only if it has changed to avoid infinite loops
    if (total !== formData.totalBudget) {
      setFormData(prev => ({ ...prev, totalBudget: total }));
    }
  }, [
    formData.yr1Budget,
    formData.yr2Budget,
    formData.yr3Budget,
    formData.yr4Budget,
    formData.yr5Budget,
    formData.totalBudget,
    setFormData
  ]);

  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="subProgramme"
            label="Subprogram Name"
            fullWidth
            value={formData.subProgramme || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="keyOutcome"
            label="Key Outcome"
            fullWidth
            multiline
            rows={3}
            value={formData.keyOutcome || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="kpi"
            label="KPI"
            fullWidth
            multiline
            rows={2}
            value={formData.kpi || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="baseline"
            label="Baseline"
            fullWidth
            value={formData.baseline || ''}
            onChange={handleFormChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Yearly Targets</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="yr1Targets"
            label="Year 1 Targets"
            fullWidth
            value={formData.yr1Targets || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="yr2Targets"
            label="Year 2 Targets"
            fullWidth
            value={formData.yr2Targets || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="yr3Targets"
            label="Year 3 Targets"
            fullWidth
            value={formData.yr3Targets || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="yr4Targets"
            label="Year 4 Targets"
            fullWidth
            value={formData.yr4Targets || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="yr5Targets"
            label="Year 5 Targets"
            fullWidth
            value={formData.yr5Targets || ''}
            onChange={handleFormChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Yearly Budgets</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="yr1Budget"
            label="Year 1 Budget"
            fullWidth
            type="text"
            value={formatNumberForInput(formData.yr1Budget)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="yr2Budget"
            label="Year 2 Budget"
            fullWidth
            type="text"
            value={formatNumberForInput(formData.yr2Budget)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="yr3Budget"
            label="Year 3 Budget"
            fullWidth
            type="text"
            value={formatNumberForInput(formData.yr3Budget)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="yr4Budget"
            label="Year 4 Budget"
            fullWidth
            type="text"
            value={formatNumberForInput(formData.yr4Budget)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="yr5Budget"
            label="Year 5 Budget"
            fullWidth
            type="text"
            value={formatNumberForInput(formData.yr5Budget)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="totalBudget"
            label="Total Budget"
            fullWidth
            type="text"
            value={formatNumberForInput(formData.totalBudget)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Calculated from yearly budgets if not provided."
            disabled // This field is now auto-calculated
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="remarks"
            label="Remarks"
            fullWidth
            multiline
            rows={4}
            value={formData.remarks || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default SubprogramForm;
