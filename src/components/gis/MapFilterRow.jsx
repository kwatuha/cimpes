// src/components/gis/MapFilterRow.jsx
import React from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Place as PlaceIcon } from '@mui/icons-material';
import { PROJECT_TYPES } from '../../configs/appConfig';

/**
 * MapFilterRow component for displaying core map filters on a single line.
 * @param {object} props
 * @param {Array<object>} props.counties - List of all counties.
 * @param {Array<object>} props.subcounties - List of subcounties for the selected county.
 * @param {Array<object>} props.wards - List of wards for the selected subcounty.
 * @param {string} props.filterCountyId - The currently selected county ID.
 * @param {string} props.filterSubcountyId - The currently selected subcounty ID.
 * @param {string} props.filterWardId - The currently selected ward ID.
 * @param {string} props.filterProjectType - The currently selected project type.
 * @param {function} props.onGeographicalFilterChange - Handler for when a geographical filter changes.
 * @param {function} props.onGoToArea - Handler to pan the map to the selected area.
 * @param {function} props.onProjectTypeChange - Handler for when the project type filter changes.
 * @param {object} props.visibleLayers - The state of which layers are visible.
 * @param {function} props.onLayerToggle - Handler to toggle a layer's visibility.
 */
function MapFilterRow({
  counties,
  subcounties,
  wards,
  filterCountyId,
  filterSubcountyId,
  filterWardId,
  onGeographicalFilterChange,
  onGoToArea,
  filterProjectType,
  onProjectTypeChange,
  visibleLayers,
  onLayerToggle,
}) {
  return (
    <Box component={Paper} elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="body1" sx={{ fontWeight: 'bold', flexShrink: 0 }}>Filters:</Typography>
      
      <Grid container spacing={1} alignItems="center" wrap="nowrap" sx={{ flexGrow: 1 }}>
        {/* County Filter */}
        <Grid item>
          <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel shrink>County</InputLabel>
            <Select
              name="countyId"
              value={filterCountyId}
              label="County"
              onChange={onGeographicalFilterChange}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {counties?.map(county => (
                <MenuItem key={county.countyId} value={String(county.countyId)}>
                  {county.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Sub-county Filter */}
        <Grid item>
          <FormControl size="small" variant="outlined" disabled={!filterCountyId} sx={{ minWidth: 120 }}>
            <InputLabel shrink>Sub-County</InputLabel>
            <Select
              name="subcountyId"
              value={filterSubcountyId}
              label="Sub-County"
              onChange={onGeographicalFilterChange}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {subcounties?.map(subc => (
                <MenuItem key={subc.subcountyId} value={String(subc.subcountyId)}>
                  {subc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Ward Filter */}
        <Grid item>
          <FormControl size="small" variant="outlined" disabled={!filterSubcountyId} sx={{ minWidth: 120 }}>
            <InputLabel shrink>Ward</InputLabel>
            <Select
              name="wardId"
              value={filterWardId}
              label="Ward"
              onChange={onGeographicalFilterChange}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {wards?.map(ward => (
                <MenuItem key={ward.wardId} value={String(ward.wardId)}>
                  {ward.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Conditional Project Type Filter */}
        {onProjectTypeChange && (
          <Grid item>
            <FormControl size="small" variant="outlined" sx={{ minWidth: 150 }}>
              <InputLabel shrink>Project Type</InputLabel>
              <Select
                name="projectType"
                value={filterProjectType}
                label="Project Type"
                onChange={onProjectTypeChange}
              >
                {PROJECT_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Go to Area Button */}
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={onGoToArea}
            disabled={!filterCountyId && !filterSubcountyId && !filterWardId}
            startIcon={<PlaceIcon />}
            size="medium"
          >
            Go
          </Button>
        </Grid>
      </Grid>
      
      {/* Layer Visibility Toggles Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          <FormControlLabel
              control={
                  <Checkbox
                      checked={visibleLayers?.projects}
                      onChange={() => onLayerToggle('projects')}
                      size="small"
                  />
              }
              label="Projects"
          />
          <FormControlLabel
              control={
                  <Checkbox
                      checked={visibleLayers?.poles}
                      onChange={() => onLayerToggle('poles')}
                      size="small"
                  />
              }
              label="Poles"
          />
      </Box>
    </Box>
  );
}

export default MapFilterRow;