// src/components/kdsp/KdspFinancialsForm.jsx
import React from 'react';
import {
  Box, TextField, Grid, Divider, FormControl, InputLabel,
  Select, MenuItem, FormControlLabel, Switch
} from '@mui/material';
import { formatNumberForInput, financingSources } from '../../utils/helpers';

function KdspFinancialsForm({ formData, handleFormChange }) {
  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="capitalCostConsultancy"
            label="Capital Cost: Consultancy"
            type="text" // Use text to allow formatted input
            fullWidth
            value={formatNumberForInput(formData.capitalCostConsultancy)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }} // Custom data attribute to hint for number parsing
            helperText="Enter numbers only. Commas will be added automatically on display."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="capitalCostLandAcquisition"
            label="Capital Cost: Land Acquisition"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.capitalCostLandAcquisition)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="capitalCostSitePrep"
            label="Capital Cost: Site Prep"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.capitalCostSitePrep)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="capitalCostConstruction"
            label="Capital Cost: Construction"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.capitalCostConstruction)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="capitalCostPlantEquipment"
            label="Capital Cost: Plant & Equipment"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.capitalCostPlantEquipment)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="capitalCostFixturesFittings"
            label="Capital Cost: Fixtures & Fittings"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.capitalCostFixturesFittings)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="capitalCostOther"
            label="Capital Cost: Other"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.capitalCostOther)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="recurrentCostLabor"
            label="Recurrent Cost: Labor"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.recurrentCostLabor)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="recurrentCostOperating"
            label="Recurrent Cost: Operating"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.recurrentCostOperating)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="recurrentCostMaintenance"
            label="Recurrent Cost: Maintenance"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.recurrentCostMaintenance)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin="dense"
            name="recurrentCostOther"
            label="Recurrent Cost: Other"
            type="text"
            fullWidth
            value={formatNumberForInput(formData.recurrentCostOther)}
            onChange={handleFormChange}
            inputProps={{ 'data-type': 'number' }}
            helperText="Enter numbers only."
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth margin="dense">
            <InputLabel>Proposed Source of Financing</InputLabel>
            <Select
              name="proposedSourceFinancing"
              value={formData.proposedSourceFinancing || ''}
              onChange={handleFormChange}
              label="Proposed Source of Financing"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {financingSources.map(source => (
                <MenuItem key={source} value={source}>{source}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="costImplicationsRelatedProjects"
            label="Cost Implications to Related Projects"
            fullWidth
            multiline
            rows={2}
            value={formData.costImplicationsRelatedProjects || ''}
            onChange={handleFormChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.landExpropriationRequired || false}
                onChange={handleFormChange}
                name="landExpropriationRequired"
              />
            }
            label="Land Expropriation Required?"
          />
        </Grid>
        {formData.landExpropriationRequired && (
          <Grid item xs={12}>
            <TextField
              margin="dense"
              name="landExpropriationExpenses"
              label="Land Expropriation Expenses"
              type="text"
              fullWidth
              value={formatNumberForInput(formData.landExpropriationExpenses)}
              onChange={handleFormChange}
              inputProps={{ 'data-type': 'number' }}
              helperText="Enter numbers only."
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.compensationRequired || false}
                onChange={handleFormChange}
                name="compensationRequired"
              />
            }
            label="Compensation Required?"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            name="otherAttendantCosts"
            label="Other Attendant Costs"
            fullWidth
            multiline
            rows={2}
            value={formData.otherAttendantCosts || ''}
            onChange={handleFormChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default KdspFinancialsForm;