// src/components/kdsp/KdspHazardAssessmentForm.jsx
import React from 'react';
import {
  Box, TextField, Grid, FormControlLabel, Switch
} from '@mui/material';

function KdspHazardAssessmentForm({ formData, handleFormChange }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="hazardName"
            label="Hazard Name"
            fullWidth
            value={formData.hazardName || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="question"
            label="Question"
            fullWidth
            multiline
            rows={2}
            value={formData.question || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.answerYesNo || false}
                onChange={handleFormChange}
                name="answerYesNo"
              />
            }
            label="Yes/No Answer"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="remarks"
            label="Remarks"
            fullWidth
            multiline
            rows={3}
            value={formData.remarks || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspHazardAssessmentForm;