// src/components/kdsp/KdspImplementationPlanForm.jsx
import React from 'react';
import { Box, TextField, Grid } from '@mui/material';
import JsonInputList from '../common/JsonInputList.jsx'; // Adjust path if needed

function KdspImplementationPlanForm({ formData, handleFormChange, setFormData }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth multiline rows={4}
            value={formData.description || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <JsonInputList
            label="Key Performance Indicators"
            items={formData.keyPerformanceIndicators}
            onChange={(newItems) => setFormData(prev => ({ ...prev, keyPerformanceIndicators: newItems }))}
          />
        </Grid>
        <Grid item xs={12}>
          <JsonInputList
            label="Responsible Persons"
            items={formData.responsiblePersons}
            onChange={(newItems) => setFormData(prev => ({ ...prev, responsiblePersons: newItems }))}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspImplementationPlanForm;