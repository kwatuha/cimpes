// src/components/kdsp/KdspReadinessForm.jsx
import React from 'react';
import {
  Box, Grid, FormControlLabel, Switch
} from '@mui/material';
import JsonInputList from '../common/JsonInputList.jsx'; // Adjust path if needed

function KdspReadinessForm({ formData, handleFormChange, setFormData }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.designsPreparedApproved || false}
                onChange={handleFormChange}
                name="designsPreparedApproved"
              />
            }
            label="Designs prepared and approved?"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.landAcquiredSiteReady || false}
                onChange={handleFormChange}
                name="landAcquiredSiteReady"
              />
            }
            label="Land acquired or site ready?"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.regulatoryApprovalsObtained || false}
                onChange={handleFormChange}
                name="regulatoryApprovalsObtained"
              />
            }
            label="Regulatory approvals obtained?"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.consultationsUndertaken || false}
                onChange={handleFormChange}
                name="consultationsUndertaken"
              />
            }
            label="Consultations undertaken?"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.canBePhasedScaledDown || false}
                onChange={handleFormChange}
                name="canBePhasedScaledDown"
              />
            }
            label="Can the project be phased or scaled down?"
          />
        </Grid>
        <Grid item xs={12}>
          <JsonInputList
            label="Government Agencies Involved"
            items={formData.governmentAgenciesInvolved}
            onChange={(newItems) => setFormData(prev => ({ ...prev, governmentAgenciesInvolved: newItems }))}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspReadinessForm;