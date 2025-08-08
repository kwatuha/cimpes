// src/components/strategicPlan/StrategicPlanForm.jsx
import React from 'react';
import { Box, TextField, Grid } from '@mui/material';
import { formatNumberForInput } from '../../utils/helpers';

/**
 * Form component for creating and editing a Strategic Plan.
 * It uses standard Material-UI TextFields for data entry.
 *
 * @param {object} props - The component props.
 * @param {object} props.formData - The current form data.
 * @param {function} props.handleFormChange - The change handler for form inputs.
 */
function StrategicPlanForm({ formData, handleFormChange }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="planName"
            label="Plan Name"
            fullWidth
            value={formData.planName || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="startYear"
            label="Start Year"
            fullWidth
            type="text" // Use type text to allow formatting, as our handleFormChange will parse it
            value={formatNumberForInput(formData.startYear)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }} // Custom data attribute for number parsing
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="endYear"
            label="End Year"
            fullWidth
            type="text"
            value={formatNumberForInput(formData.endYear)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StrategicPlanForm;
