// src/components/kdsp/KdspRisksForm.jsx
import React from 'react';
import {
  Box, TextField, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { riskLevels } from '../../utils/helpers'; // Assuming riskLevels is defined in helpers

function KdspRisksForm({ formData, handleFormChange }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="riskDescription"
            label="Risk Description"
            fullWidth
            multiline
            rows={3}
            value={formData.riskDescription || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Likelihood</InputLabel>
            <Select
              name="likelihood"
              value={formData.likelihood || ''}
              onChange={handleFormChange}
              label="Likelihood"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {riskLevels.map(level => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Impact</InputLabel>
            <Select
              name="impact"
              value={formData.impact || ''}
              onChange={handleFormChange}
              label="Impact"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {riskLevels.map(level => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="mitigationStrategy"
            label="Mitigation Strategy"
            fullWidth
            multiline
            rows={3}
            value={formData.mitigationStrategy || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspRisksForm;