// src/components/kdsp/KdspNeedsAssessmentForm.jsx
import React from 'react';
import { Box, TextField, Grid } from '@mui/material';

function KdspNeedsAssessmentForm({ formData, handleFormChange }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="targetBeneficiaries"
            label="Target Beneficiaries"
            fullWidth
            multiline
            rows={4}
            value={formData.targetBeneficiaries || ''}
            onChange={handleFormChange}
            helperText="Enter each target group on a new line."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="estimateEndUsers"
            label="Estimate of End Users"
            fullWidth
            multiline
            rows={2}
            value={formData.estimateEndUsers || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="physicalDemandCompletion"
            label="Physical Demand on Completion"
            fullWidth
            multiline
            rows={2}
            value={formData.physicalDemandCompletion || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="proposedPhysicalCapacity"
            label="Proposed Physical Capacity"
            fullWidth
            multiline
            rows={2}
            value={formData.proposedPhysicalCapacity || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="mainBenefitsAsset"
            label="Main Benefits of the Asset"
            fullWidth
            multiline
            rows={2}
            value={formData.mainBenefitsAsset || ''}
            onChange={handleFormChange}
            helperText="Enter each benefit on a new line."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="significantExternalBenefitsNegativeEffects"
            label="Significant External Effects"
            fullWidth
            multiline
            rows={2}
            value={formData.significantExternalBenefitsNegativeEffects || ''}
            onChange={handleFormChange}
            helperText="Enter each effect on a new line."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="significantDifferencesBenefitsAlternatives"
            label="Differences in Benefits Between Alternatives"
            fullWidth
            multiline
            rows={2}
            value={formData.significantDifferencesBenefitsAlternatives || ''}
            onChange={handleFormChange}
            helperText="Enter each difference on a new line."
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspNeedsAssessmentForm;