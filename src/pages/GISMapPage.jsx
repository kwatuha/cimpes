import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import GoogleMapComponent from '../components/gis/GoogleMapComponent';
import MapFilterRow from '../components/gis/MapFilterRow';
import ProjectsLayer from '../components/gis/ProjectsLayer';
import PolesLayer from '../components/gis/PolesLayer';
import useMapData from '../hooks/useMapData';
import metaDataService from '../api/metaDataService';
import { INITIAL_MAP_POSITION } from '../configs/appConfig';

function GISMapPage() {
  const [mapCenter, setMapCenter] = useState({ lat: INITIAL_MAP_POSITION[0], lng: INITIAL_MAP_POSITION[1] });
  const [mapZoom, setMapZoom] = useState(6);
  
  const [filterCountyId, setFilterCountyId] = useState('');
  const [filterSubcountyId, setFilterSubcountyId] = useState('');
  const [filterWardId, setFilterWardId] = useState('');
  const [filterProjectType, setFilterProjectType] = useState('all');

  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [visibleLayers, setVisibleLayers] = useState({ projects: true, poles: true });

  const filters = useMemo(() => ({
    countyId: filterCountyId,
    subcountyId: filterSubcountyId,
    wardId: filterWardId,
    projectType: filterProjectType,
  }), [filterCountyId, filterSubcountyId, filterWardId, filterProjectType]);

  const { data, loading, error } = useMapData(filters);

  useEffect(() => {
    const fetchInitialCounties = async () => {
      try {
        const fetchedCounties = await metaDataService.counties.getAllCounties();
        setCounties(fetchedCounties);
      } catch (err) {
        console.error("Error fetching initial counties:", err);
      }
    };
    fetchInitialCounties();
  }, []);

  useEffect(() => {
    const fetchSubcounties = async () => {
      if (filterCountyId) {
        try {
          const subs = await metaDataService.counties.getSubcountiesByCounty(filterCountyId);
          setSubcounties(subs);
        } catch (err) {
          console.error(`Error fetching sub-counties for county ${filterCountyId}:`, err);
          setSubcounties([]);
        }
      } else {
        setSubcounties([]);
        setFilterSubcountyId('');
        setFilterWardId('');
      }
    };
    fetchSubcounties();
  }, [filterCountyId]);

  useEffect(() => {
    const fetchWards = async () => {
      if (filterSubcountyId) {
        try {
          const w = await metaDataService.subcounties.getWardsBySubcounty(filterSubcountyId);
          setWards(w);
        } catch (err) {
          console.error(`Error fetching wards for sub-county ${filterSubcountyId}:`, err);
          setWards([]);
        }
      } else {
        setWards([]);
        setFilterWardId('');
      }
    };
    fetchWards();
  }, [filterSubcountyId]);

  const handleLayerToggle = useCallback((layerName) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  }, []);

  const handleGeographicalFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'countyId') {
      setFilterCountyId(value);
      setFilterSubcountyId('');
      setFilterWardId('');
    } else if (name === 'subcountyId') {
      setFilterSubcountyId(value);
      setFilterWardId('');
    } else if (name === 'wardId') {
      setFilterWardId(value);
    }
  }, []);

  const handleProjectTypeChange = useCallback((e) => {
    setFilterProjectType(e.target.value);
  }, []);

  const handleGoToArea = useCallback(() => {
    if (data && data.boundingBox) {
      const { minLat, minLng, maxLat, maxLng } = data.boundingBox;
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      setMapCenter({ lat: centerLat, lng: centerLng });

      const latDiff = Math.abs(maxLat - minLat);
      const lngDiff = Math.abs(maxLng - minLng);
      let zoomLevel = 15;
      if (latDiff > 1 || lngDiff > 1) zoomLevel = 10;
      if (latDiff > 5 || lngDiff > 5) zoomLevel = 6;
      setMapZoom(zoomLevel);
    }
  }, [data]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading map data...</Typography>
      </Box>
    );
  }

  if (error) {
    let errorMessage = 'An unexpected error occurred while loading map data.';
    if (error.response?.data?.message) {
      errorMessage = `Backend Error: ${error.response.data.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading map data: {errorMessage}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box 
        sx={{
          position: 'relative',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          p: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: 3,
        }}
      >
        <MapFilterRow
          counties={counties}
          subcounties={subcounties}
          wards={wards}
          filterCountyId={filterCountyId}
          filterSubcountyId={filterSubcountyId}
          filterWardId={filterWardId}
          onGeographicalFilterChange={handleGeographicalFilterChange}
          filterProjectType={filterProjectType}
          onProjectTypeChange={handleProjectTypeChange}
          onGoToArea={handleGoToArea}
          visibleLayers={visibleLayers}
          onLayerToggle={handleLayerToggle}
        />
      </Box>
      {/* UPDATED: The map container now takes the remaining vertical space */}
      <Box sx={{ flexGrow: 1 }}>
        <GoogleMapComponent
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
        >
          {visibleLayers.projects && data.projects && <ProjectsLayer data={data.projects} />}
          {visibleLayers.poles && data.projectMaps && <PolesLayer data={data.projectMaps} />}
        </GoogleMapComponent>
      </Box>
    </Box>
  );
}

export default GISMapPage;
