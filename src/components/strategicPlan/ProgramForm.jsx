// src/components/strategicPlan/ProgramForm.jsx
import React from 'react';
import { Box, TextField, Grid } from '@mui/material';

/**
 * Form component for creating and editing a Program.
 * It uses standard Material-UI TextFields for data entry.
 *
 * @param {object} props - The component props.
 * @param {object} props.formData - The current form data.
 * @param {function} props.handleFormChange - The change handler for form inputs.
 */
function ProgramForm({ formData, handleFormChange }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="programme"
            label="Program Name"
            fullWidth
            value={formData.programme || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="needsPriorities"
            label="Needs & Priorities"
            fullWidth
            multiline
            rows={4}
            value={formData.needsPriorities || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="strategies"
            label="Strategies"
            fullWidth
            multiline
            rows={4}
            value={formData.strategies || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="objectives"
            label="Objectives"
            fullWidth
            multiline
            rows={4}
            value={formData.objectives || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="outcomes"
            label="Outcomes"
            fullWidth
            multiline
            rows={4}
            value={formData.outcomes || ''}
            onChange={handleFormChange}
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
        {/* Fields like departmentId, sectionId, voided, voidedBy would likely be handled
            by other components or in the submission logic, not directly in this form. */}
      </Grid>
    </Box>
  );
}

export default ProgramForm;
