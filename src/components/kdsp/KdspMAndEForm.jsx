// src/components/kdsp/KdspMAndEForm.jsx
import React from 'react';
import { Box, TextField, Grid } from '@mui/material';

function KdspMAndEForm({ formData, handleFormChange }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
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
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="mechanismsInPlace"
            label="Mechanisms in Place"
            fullWidth
            multiline
            rows={4}
            value={formData.mechanismsInPlace || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="resourcesBudgetary"
            label="Budgetary Resources"
            fullWidth
            multiline
            rows={2}
            value={formData.resourcesBudgetary || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="resourcesHuman"
            label="Human Resources"
            fullWidth
            multiline
            rows={2}
            value={formData.resourcesHuman || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="dataGatheringMethod"
            label="Data Gathering Method"
            fullWidth
            multiline
            rows={2}
            value={formData.dataGatheringMethod || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="reportingChannels"
            label="Reporting Channels"
            fullWidth
            multiline
            rows={2}
            value={formData.reportingChannels || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="lessonsLearnedProcess"
            label="Lessons Learned Process"
            fullWidth
            multiline
            rows={2}
            value={formData.lessonsLearnedProcess || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspMAndEForm;