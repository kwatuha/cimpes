// src/components/kdsp/KdspSustainabilityForm.jsx
import React from 'react';
import {
  Box, TextField, Grid, FormControlLabel, Switch
} from '@mui/material';
import { formatNumberForInput } from '../../utils/helpers';

function KdspSustainabilityForm({ formData, handleFormChange }) {
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
            name="owningOrganization"
            label="Owning Organization"
            fullWidth
            value={formData.owningOrganization || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.hasAssetRegister || false}
                onChange={handleFormChange}
                name="hasAssetRegister"
              />
            }
            label="Has an updated asset register?"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="technicalCapacityAdequacy"
            label="Technical Capacity Adequacy"
            fullWidth
            multiline
            rows={2}
            value={formData.technicalCapacityAdequacy || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="managerialCapacityAdequacy"
            label="Managerial Capacity Adequacy"
            fullWidth
            multiline
            rows={2}
            value={formData.managerialCapacityAdequacy || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="financialCapacityAdequacy"
            label="Financial Capacity Adequacy"
            fullWidth
            multiline
            rows={2}
            value={formData.financialCapacityAdequacy || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="avgAnnualPersonnelCost"
            label="Average Annual Personnel Cost"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.avgAnnualPersonnelCost)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }} // Custom data attribute to hint for number parsing
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="annualOperationMaintenanceCost"
            label="Annual Operation & Maintenance Cost"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.annualOperationMaintenanceCost)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="otherOperatingCosts"
            label="Other Operating Costs"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.otherOperatingCosts)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="revenueSources"
            label="Revenue Sources"
            fullWidth
            multiline
            rows={2}
            value={formData.revenueSources || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.operationalCostsCoveredByRevenue || false}
                onChange={handleFormChange}
                name="operationalCostsCoveredByRevenue"
              />
            }
            label="Operational costs covered by revenue?"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspSustainabilityForm;