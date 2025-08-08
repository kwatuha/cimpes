// src/components/gis/FilterPanel.jsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Checkbox,
  FormControlLabel // 👈 Add this line
} from '@mui/material';
import { Layers as LayersIcon, Place as PlaceIcon } from '@mui/icons-material';

/**
 * FilterPanel component for filtering map data.
 * @param {object} props
 * @param {Array<object>} props.counties - List of all counties.
 * @param {Array<object>} props.subcounties - List of subcounties for the selected county.
 * @param {Array<object>} props.wards - List of wards for the selected subcounty.
 * @param {string} props.filterCountyId - The currently selected county ID.
 * @param {string} props.filterSubcountyId - The currently selected subcounty ID.
 * @param {string} props.filterWardId - The currently selected ward ID.
 * @param {function} props.onGeographicalFilterChange - Handler for when a geographical filter changes.
 * @param {function} props.onGoToArea - Handler to pan the map to the selected area.
 * @param {object} props.visibleLayers - The state of which layers are visible.
 * @param {function} props.onLayerToggle - Handler to toggle a layer's visibility.
 */
function FilterPanel({
  counties,
  subcounties,
  wards,
  filterCountyId,
  filterSubcountyId,
  filterWardId,
  onGeographicalFilterChange,
  onGoToArea,
  visibleLayers,
  onLayerToggle
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        width: 350,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: 3,
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <LayersIcon sx={{ mr: 1 }} />
        Map Layers & Filters
      </Typography>
      
      {/* Geographical Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* County Filter */}
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="county-filter-label">County</InputLabel>
            <Select
              labelId="county-filter-label"
              name="countyId"
              value={filterCountyId}
              label="County"
              onChange={onGeographicalFilterChange}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {counties.map(county => (
                <MenuItem key={county.countyId} value={String(county.countyId)}>
                  {county.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Sub-county Filter */}
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" disabled={!filterCountyId}>
            <InputLabel id="subcounty-filter-label">Sub-County</InputLabel>
            <Select
              labelId="subcounty-filter-label"
              name="subcountyId"
              value={filterSubcountyId}
              label="Sub-County"
              onChange={onGeographicalFilterChange}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {subcounties.map(subc => (
                <MenuItem key={subc.subcountyId} value={String(subc.subcountyId)}>
                  {subc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Ward Filter */}
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" disabled={!filterSubcountyId}>
            <InputLabel id="ward-filter-label">Ward</InputLabel>
            <Select
              labelId="ward-filter-label"
              name="wardId"
              value={filterWardId}
              label="Ward"
              onChange={onGeographicalFilterChange}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {wards.map(ward => (
                <MenuItem key={ward.wardId} value={String(ward.wardId)}>
                  {ward.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Go to Area Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onGoToArea}
            disabled={!filterCountyId && !filterSubcountyId && !filterWardId}
            startIcon={<PlaceIcon />}
          >
            Go to Area
          </Button>
        </Grid>
      </Grid>
      
      {/* Existing Layer Toggles */}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Layer Visibility
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={visibleLayers?.projects}
            onChange={() => onLayerToggle('projects')}
          />
        }
        label="Projects"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={visibleLayers?.poles}
            onChange={() => onLayerToggle('poles')}
          />
        }
        label="Poles"
      />
      {/* Add more filter controls here as needed */}
    </Box>
  );
}

export default FilterPanel;