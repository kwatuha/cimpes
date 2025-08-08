// src/components/kdsp/KdspClimateRiskForm.jsx
import React from 'react';
import {
  Box, TextField, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { formatNumberForInput, riskLevels } from '../../utils/helpers'; // Assuming riskLevels is defined in helpers

function KdspClimateRiskForm({ formData, handleFormChange }) {
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
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Hazard Exposure</InputLabel>
            <Select
              name="hazardExposure"
              value={formData.hazardExposure || ''}
              onChange={handleFormChange}
              label="Hazard Exposure"
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
            <InputLabel>Vulnerability</InputLabel>
            <Select
              name="vulnerability"
              value={formData.vulnerability || ''}
              onChange={handleFormChange}
              label="Vulnerability"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {riskLevels.map(level => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Risk Level</InputLabel>
            <Select
              name="riskLevel"
              value={formData.riskLevel || ''}
              onChange={handleFormChange}
              label="Risk Level"
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
            name="riskReductionStrategies"
            label="Risk Reduction Strategies"
            fullWidth
            multiline
            rows={3}
            value={formData.riskReductionStrategies || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="riskReductionCosts"
            label="Risk Reduction Costs"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.riskReductionCosts)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }} // Custom data attribute to hint for number parsing
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="resourcesRequired"
            label="Resources Required"
            fullWidth
            multiline
            rows={2}
            value={formData.resourcesRequired || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspClimateRiskForm;