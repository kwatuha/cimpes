// src/components/gis/MapNavigation.jsx
import React from 'react';
import { Box, Paper } from '@mui/material';
import MapFilterRow from './MapFilterRow';

/**
 * A component to handle all map navigation and filtering controls.
 * This version only includes the standard geographical filter row.
 * @param {object} props
 * @param {Array<object>} props.counties - List of all counties.
 * @param {Array<object>} props.subcounties - List of subcounties for the selected county.
 * @param {Array<object>} props.wards - List of wards for the selected subcounty.
 * @param {string} props.filterCountyId - The currently selected county ID.
 * @param {string} props.filterSubcountyId - The currently selected subcounty ID.
 * @param {string} props.filterWardId - The currently selected ward ID.
 * @param {function} props.onGeographicalFilterChange - Handler for when a geographical filter changes.
 * @param {function} props.onGoToArea - Handler to pan the map to the selected area.
 */
function MapNavigation({
  counties,
  subcounties,
  wards,
  filterCountyId,
  filterSubcountyId,
  filterWardId,
  onGeographicalFilterChange,
  onGoToArea,
}) {
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <MapFilterRow
        counties={counties}
        subcounties={subcounties}
        wards={wards}
        filterCountyId={filterCountyId}
        filterSubcountyId={filterSubcountyId}
        filterWardId={filterWardId}
        onGeographicalFilterChange={onGeographicalFilterChange}
        onGoToArea={onGoToArea}
        // The props for `visibleLayers` and `onLayerToggle` are no longer passed here.
      />
    </Paper>
  );
}

export default MapNavigation;