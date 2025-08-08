// src/components/kdsp/KdspStakeholdersForm.jsx
import React from 'react';
import {
  Box, TextField, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { riskLevels } from '../../utils/helpers'; // Reusing riskLevels for influence levels

function KdspStakeholdersForm({ formData, handleFormChange }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="stakeholderName"
            label="Stakeholder Name"
            fullWidth
            value={formData.stakeholderName || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Level of Influence</InputLabel>
            <Select
              name="levelInfluence"
              value={formData.levelInfluence || ''}
              onChange={handleFormChange}
              label="Level of Influence"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {/* Reusing riskLevels array as levels of influence (High, Medium, Low) */}
              {riskLevels.map(level => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="engagementStrategy"
            label="Engagement Strategy"
            fullWidth
            multiline
            rows={3}
            value={formData.engagementStrategy || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspStakeholdersForm;