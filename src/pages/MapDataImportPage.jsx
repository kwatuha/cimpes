import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  // NEW: Import Autocomplete component from Material-UI
  Autocomplete
} from '@mui/material';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
// CORRECTED: Use the central apiService
import apiService from '../api';
import metaDataService from '../api/metaDataService';

// NEW: Import configuration from appConfig.js
import { INITIAL_MAP_POSITION, RESOURCE_TYPES } from '../configs/appConfig';

import GoogleMapComponent from '../components/gis/GoogleMapComponent';
import { MarkerF, PolylineF } from '@react-google-maps/api';
import MapNavigation from '../components/gis/MapNavigation';


function MapDataImportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState('manual');
  const [manualGeometryType, setManualGeometryType] = useState('Point');
  const [excelFile, setExcelFile] = useState(null);
  const [manualData, setManualData] = useState({
    resourceType: '',
    resourceId: '',
    resourceName: '',
    latitude: '',
    longitude: '',
    multiPointData: '' // for LineString or Polygon
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [tempMarkerPosition, setTempMarkerPosition] = useState(null);
  const [markerIcon, setMarkerIcon] = useState(null);

  const [mapCenter, setMapCenter] = useState({ lat: INITIAL_MAP_POSITION[0], lng: INITIAL_MAP_POSITION[1] });
  const [mapZoom, setMapZoom] = useState(6);

  // State for the list of projects fetched from the API
  const [projects, setProjects] = useState([]);
  // State for the loading status of the project list
  const [projectsLoading, setProjectsLoading] = useState(false);

  // States for geographical filter dropdowns
  const [filterCountyId, setFilterCountyId] = useState('');
  const [filterSubcountyId, setFilterSubcountyId] = useState('');
  const [filterWardId, setFilterWardId] = useState('');

  // States for dropdown options data
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);

  // useEffect to fetch the list of projects when the component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        // CORRECTED: Call the projects sub-service directly
        const allProjects = await apiService.projects.getProjects();
        // The project objects should have a 'name' property
        setProjects(allProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load project list. Please try again.");
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setManualData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setInputMode(newMode);
      setError('');
      setSuccess('');
    }
  };

  const handleGeometryTypeChange = (event, newType) => {
    if (newType !== null) {
      setManualGeometryType(newType);
      setError('');
      setSuccess('');
    }
  };

  const handleManualDataSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!user || !user.privileges || !user.privileges.includes('projects.create_map_data')) {
        setError('You do not have permission to create map data.');
        setLoading(false);
        return;
      }

      const { resourceType, resourceId, resourceName, latitude, longitude, multiPointData } = manualData;
      let geojson;
      let payload;

      if (manualGeometryType === 'Point') {
        if (!resourceType || (!resourceId && !resourceName) || !latitude || !longitude) {
          setError('Please fill all required fields for a single point.');
          setLoading(false);
          return;
        }
        geojson = JSON.stringify({
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": { "name": "Imported Location" },
              "geometry": {
                "type": "Point",
                "coordinates": [parseFloat(longitude), parseFloat(latitude)]
              }
            }
          ]
        });
      } else if (manualGeometryType === 'MultiPoint') {
        if (!resourceType || (!resourceId && !resourceName) || !multiPointData) {
          setError('Please fill all required fields for multi-point data.');
          setLoading(false);
          return;
        }

        const lines = multiPointData.split('\n').filter(line => line.trim() !== '');
        const coordinates = lines.map(line => {
          const parts = line.split(',').map(part => parseFloat(part.trim()));
          if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
            throw new Error(`Invalid coordinate format: ${line}. Expected "longitude, latitude"`);
          }
          return parts;
        });

        if (coordinates.length < 2) {
            throw new Error("Multi-point data requires at least two coordinate pairs.");
        }
        
        geojson = JSON.stringify({
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": { "name": "Imported Multi-Point Feature" },
              "geometry": {
                "type": "LineString", // Using LineString for multi-point entry
                "coordinates": coordinates
              }
            }
          ]
        });
      }
      
      payload = { resourceType, geojson };
      if (resourceType === 'projects') {
          payload.resourceName = resourceName;
      } else {
          payload.resourceId = resourceId;
      }

      await apiService.projectMaps.importMapData(payload); // CORRECTED: Use apiService.projectMaps
      setSuccess('Map data imported successfully!');
      setManualData({
        resourceType: '',
        resourceId: '',
        resourceName: '',
        latitude: '',
        longitude: '',
        multiPointData: ''
      });
    } catch (err) {
      console.error('Error importing map data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to import map data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelDataSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setLoading(true);
  
      if (!manualData.resourceType || !excelFile) {
        setError('Please select a Resource Type and upload an Excel file.');
        setLoading(false);
        return;
      }
  
      try {
        if (!user || !user.privileges || !user.privileges.includes('projects.create_map_data')) {
          setError('You do not have permission to create map data.');
          setLoading(false);
          return;
        }
  
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
  
            let successfulImports = 0;
            let failedImports = 0;
            let importErrors = [];
  
            for (const row of json) {
              const { resourceId, latitude, longitude, projectName } = row;
  
              const identifier = projectName || resourceId;
  
              if (!identifier || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
                failedImports++;
                importErrors.push(`Skipped row due to missing or invalid data: ${JSON.stringify(row)}`);
                continue;
              }
  
              try {
                const geojson = JSON.stringify({
                  "type": "FeatureCollection",
                  "features": [
                    {
                      "type": "Feature",
                      "properties": { "name": "Imported Location" },
                      "geometry": {
                        "type": "Point",
                        "coordinates": [parseFloat(longitude), parseFloat(latitude)]
                      }
                    }
                  ]
                });
                
                const payload = {
                  resourceType: manualData.resourceType,
                  geojson,
                };
  
                if (projectName) {
                  payload.resourceName = projectName;
                } else {
                  payload.resourceId = resourceId;
                }
  
                await apiService.projectMaps.importMapData(payload); // CORRECTED: Use apiService.projectMaps
                successfulImports++;
              } catch (err) {
                console.error('Error importing data for row:', row, err);
                failedImports++;
                importErrors.push(`Failed to import data for identifier "${identifier}": ${err.response?.data?.message || err.message}`);
              }
            }
  
            if (failedImports > 0) {
              setError(`Successfully imported ${successfulImports} records. Failed to import ${failedImports} records.`);
              console.error('Detailed import errors:', importErrors);
            } else {
              setSuccess(`Successfully imported ${successfulImports} records!`);
            }
          } catch (fileError) {
            setError(`Error processing file: ${fileError.message}`);
          } finally {
            setLoading(false);
          }
        };
  
        reader.readAsBinaryString(excelFile);
      } catch (err) {
        console.error('Error handling file upload:', err);
        setError(err.message || 'An unexpected error occurred during file upload.');
        setLoading(false);
      }
    };

  const handleMapClick = useCallback((e) => {
    const clickedLat = e.latLng.lat();
    const clickedLng = e.latLng.lng();
    console.log(`[Map Click] Map clicked at: Lat=${clickedLat}, Lng=${clickedLng}`);
    console.log(`[Map Click] Current geometry type: ${manualGeometryType}`);

    if (manualGeometryType === 'Point') {
      setManualData(prev => {
        const newManualData = {
          ...prev,
          latitude: clickedLat.toFixed(6),
          longitude: clickedLng.toFixed(6)
        };
        console.log("[Map Click] Setting single point data:", newManualData);
        return newManualData;
      });
    } else { // MultiPoint
      const newPoint = `${clickedLng.toFixed(6)}, ${clickedLat.toFixed(6)}`;
      setManualData(prev => {
        const existingData = prev.multiPointData.trim();
        const updatedData = existingData ? `${existingData}\n${newPoint}` : newPoint;
        console.log("[Map Click] Adding multi-point data:", updatedData);
        return {
          ...prev,
          multiPointData: updatedData
        };
      });
    }
    setTempMarkerPosition([clickedLat, clickedLng]);
    console.log(`[Map Click] Temporary marker set at: [${clickedLat}, ${clickedLng}]`);
  }, [manualGeometryType, setManualData, setTempMarkerPosition]);


  // Helper function to parse multi-point data from the textarea
  const getMultiPointCoordinates = () => {
    if (!manualData.multiPointData) return [];
    return manualData.multiPointData
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const parts = line.split(',').map(part => parseFloat(part.trim()));
        // Google Maps Polyline expects { lat, lng } objects
        return { lat: parts[1], lng: parts[0] };
      });
  };
  
  const handleSearchPlaceChanged = useCallback((place) => {
    if (place && place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const zoom = 15; // Default zoom for searched place

      setMapCenter({ lat, lng });
      setMapZoom(zoom);

      if (mapRef.current) {
        mapRef.current.setCenter({ lat, lng });
        mapRef.current.setZoom(zoom);
      }
      setSuccess(`Map moved to: ${place.name || place.formatted_address}`);
      setTempMarkerPosition([lat, lng]);
      setTimeout(() => setTempMarkerPosition(null), 10000);
    } else {
      setError("Could not find coordinates for the searched place.");
    }
  }, []);

  // --- Geographical Filter Logic ---

  useEffect(() => {
    const fetchInitialCounties = async () => {
      try {
        const fetchedCounties = await metaDataService.counties.getAllCounties();
        setCounties(fetchedCounties);
      } catch (err) {
        console.error("Error fetching initial counties:", err);
        setCounties([]);
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
          const currentSubcountyIsValid = subs.some(subc => String(subc.subcountyId) === filterSubcountyId);
          if (!currentSubcountyIsValid && filterSubcountyId !== '') {
            setFilterSubcountyId('');
            setFilterWardId('');
          }
        } catch (err) {
          console.error(`Error fetching sub-counties for county ${filterCountyId}:`, err);
          setSubcounties([]);
          setFilterSubcountyId('');
          setFilterWardId('');
        }
      } else {
        setSubcounties([]);
        setFilterSubcountyId('');
        setFilterWardId('');
      }
    };
    fetchSubcounties();
  }, [filterCountyId, filterSubcountyId]);

  useEffect(() => {
    const fetchWards = async () => {
      if (filterSubcountyId) {
        try {
          const w = await metaDataService.subcounties.getWardsBySubcounty(filterSubcountyId);
          setWards(w);
          const currentWardIsValid = w.some(ward => String(ward.wardId) === filterWardId);
          if (!currentWardIsValid && filterWardId !== '') {
            setFilterWardId('');
          }
        } catch (err) {
          console.error(`Error fetching wards for sub-county ${filterSubcountyId}:`, err);
          setWards([]);
          setFilterWardId('');
        }
      } else {
        setWards([]);
        setFilterWardId('');
      }
    };
    fetchWards();
  }, [filterSubcountyId, filterWardId]);

  const handleGeographicalFilterChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setSuccess('');
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
  };

  const handleGoToArea = () => {
    setError('');
    setSuccess('');
    if (!mapRef.current) {
      setError("Map not initialized. Please wait a moment.");
      return;
    }

    let targetLat, targetLng, targetZoom;
    let selectedAreaName = "selected area";

    const selectedWard = wards.find(w => String(w.wardId) === filterWardId);
    const selectedSubcounty = subcounties.find(sc => String(sc.subcountyId) === filterSubcountyId);
    const selectedCounty = counties.find(c => String(c.countyId) === filterCountyId);

    if (selectedWard && selectedWard.geoLat !== null && selectedWard.geoLon !== null) {
      targetLat = parseFloat(selectedWard.geoLat);
      targetLng = parseFloat(selectedWard.geoLon);
      targetZoom = 15;
      selectedAreaName = selectedWard.name;
    } else if (selectedSubcounty && selectedSubcounty.geoLat !== null && selectedSubcounty.geoLon !== null) {
      targetLat = parseFloat(selectedSubcounty.geoLat);
      targetLng = parseFloat(selectedSubcounty.geoLon);
      targetZoom = 13;
      selectedAreaName = selectedSubcounty.name;
    } else if (selectedCounty && selectedCounty.geoLat !== null && selectedCounty.geoLon !== null) {
      targetLat = parseFloat(selectedCounty.geoLat);
      targetLng = parseFloat(selectedCounty.geoLon);
      targetZoom = 11;
      selectedAreaName = selectedCounty.name;
    } else {
      setError("Selected area does not have valid geographical coordinates from the API.");
      return;
    }

    if (!isNaN(targetLat) && !isNaN(targetLng) && mapRef.current) {
      setMapCenter({ lat: targetLat, lng: targetLng });
      setMapZoom(targetZoom);
      mapRef.current.setCenter({ lat: targetLat, lng: targetLng });
      mapRef.current.setZoom(targetZoom);
      setSuccess(`Map moved to: ${selectedAreaName}`);
      setTempMarkerPosition([targetLat, lng]);
      setTimeout(() => setTempMarkerPosition(null), 10000);
    } else {
      setError("Invalid coordinates for selected area.");
    }
  };

  const renderManualEntryForm = () => (
    <form onSubmit={handleManualDataSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="body1" sx={{ mb: 1 }}>Geometry Type:</Typography>
          <ToggleButtonGroup
            value={manualGeometryType}
            exclusive
            onChange={handleGeometryTypeChange}
            color="primary"
            disabled={loading}
          >
            <ToggleButton value="Point">Single Point (lat/lng)</ToggleButton>
            <ToggleButton value="MultiPoint">Multi-Point (Line/Polygon)</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="resource-type-label">Resource Type</InputLabel>
            <Select
              labelId="resource-type-label"
              name="resourceType"
              value={manualData.resourceType}
              label="Resource Type"
              onChange={handleChange}
              disabled={loading}
            >
              {RESOURCE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Select the type of data you are importing.</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          {manualData.resourceType === 'projects' ? (
            <Autocomplete
              fullWidth
              id="project-name-autocomplete"
              options={projects}
              getOptionLabel={(option) => option.projectName || ""}
              value={projects.find(p => p.projectName === manualData.resourceName) || null}
              onChange={(event, newValue) => {
                setManualData(prev => ({
                  ...prev,
                  resourceName: newValue ? newValue.projectName : '',
                }));
              }}
              loading={projectsLoading}
              disabled={loading || projectsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Project Name"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {projectsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          ) : (
            <TextField
              fullWidth
              label="Resource ID"
              name="resourceId"
              value={manualData.resourceId}
              onChange={handleChange}
              placeholder="e.g., 12345"
              required
              disabled={loading}
            />
          )}
          <FormHelperText>
            {manualData.resourceType === 'projects'
              ? "Select the project from the searchable list."
              : "Enter the unique ID of the resource."}
          </FormHelperText>
        </Grid>
        {manualGeometryType === 'Point' ? (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                value={manualData.latitude}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                value={manualData.longitude}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Multi-Point Data"
              name="multiPointData"
              value={manualData.multiPointData}
              onChange={handleChange}
              placeholder='Enter one coordinate pair per line, separated by a comma (e.g., "34.7617, -0.1022")'
              required
              disabled={loading}
            />
            <FormHelperText>
              Enter `longitude, latitude` pairs, one per line. For a polygon, ensure the first and last points are the same.
            </FormHelperText>
          </Grid>
        )}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        {success && (
          <Grid item xs={12}>
            <Alert severity="success">{success}</Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit Data'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  const renderExcelImportForm = () => (
    <form onSubmit={handleExcelDataSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="resource-type-label">Resource Type</InputLabel>
            <Select
              labelId="resource-type-label"
              id="resource-type-select"
              name="resourceType"
              value={manualData.resourceType}
              label="Resource Type"
              onChange={handleChange}
              disabled={loading}
            >
              {RESOURCE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Select the type of data you are importing.</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="excel-file-upload"
            />
            <label htmlFor="excel-file-upload">
              <Button variant="outlined" component="span" disabled={loading} fullWidth>
                {excelFile ? excelFile.name : 'Choose Excel File'}
              </Button>
            </label>
            <FormHelperText>Upload a file with columns: `resourceId` or `projectName`, `latitude`, `longitude`</FormHelperText>
          </FormControl>
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        {success && (
          <Grid item xs={12}>
            <Alert severity="success">{success}</Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !excelFile || !manualData.resourceType}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Importing...' : 'Start Import'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Map Data Entry
      </Typography>
      
      {inputMode === 'manual' && (
        <>
          <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom>Map Navigation</Typography>
            <MapNavigation
              counties={counties}
              subcounties={subcounties}
              wards={wards}
              filterCountyId={filterCountyId}
              filterSubcountyId={filterSubcountyId}
              filterWardId={filterWardId}
              onGeographicalFilterChange={handleGeographicalFilterChange}
              onGoToArea={handleGoToArea}
            />
            <Box sx={{ my: 3 }}>
              <Typography variant="h6" gutterBottom>Manual Entry Map</Typography>
              <Paper elevation={3}>
                <GoogleMapComponent
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '70vh', width: '100%' }}
                  onCreated={map => {
                    console.log("[MapDataImportPage] GoogleMapComponent onCreated callback fired!");
                    mapRef.current = map;
                    setMapReady(true);
                    console.log("[MapDataImportPage] mapRef.current set:", mapRef.current);
                    console.log("[MapDataImportPage] mapReady set to true.");

                    if (window.google && window.google.maps) {
                      setMarkerIcon({
                        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                        scaledSize: new window.google.maps.Size(32, 32),
                      });
                      map.setCenter({ lat: INITIAL_MAP_POSITION[0], lng: INITIAL_MAP_POSITION[1] });
                      map.setZoom(6);
                      setMapCenter({ lat: INITIAL_MAP_POSITION[0], lng: INITIAL_MAP_POSITION[1] });
                      setMapZoom(6);
                    }
                  }}
                  onClick={handleMapClick}
                  onSearchPlaceChanged={handleSearchPlaceChanged}
                >
                  {manualGeometryType === 'Point' && manualData.latitude && manualData.longitude && markerIcon && (
                    <MarkerF
                      position={{ lat: parseFloat(manualData.latitude), lng: parseFloat(manualData.longitude) }}
                      icon={markerIcon}
                    />
                  )}
                  {tempMarkerPosition && markerIcon && (
                    <MarkerF
                      position={{ lat: tempMarkerPosition[0], lng: tempMarkerPosition[1] }}
                      icon={markerIcon}
                    />
                  )}
                  {manualGeometryType === 'MultiPoint' && manualData.multiPointData && (
                    <PolylineF
                      path={getMultiPointCoordinates()}
                      options={{ strokeColor: "#0000FF", strokeWeight: 4, strokeOpacity: 0.8 }}
                    />
                  )}
                </GoogleMapComponent>
              </Paper>
              <FormHelperText sx={{ mt: 1, textAlign: 'center' }}>
                Click on the map to select coordinates.
              </FormHelperText>
            </Box>
          </Box>
        </>
      )}

      <Box component={Paper} elevation={3} sx={{ p: 4, my: 3 }}>
        <Grid container alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="h5">Input Method:</Typography>
          </Grid>
          <Grid item>
            <ToggleButtonGroup
              value={inputMode}
              exclusive
              onChange={handleModeChange}
              color="primary"
              disabled={loading}
            >
              <ToggleButton value="manual">Manual Entry</ToggleButton>
              <ToggleButton value="excel">Excel Import</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
        {inputMode === 'manual' ? (
            <>
                <Typography variant="h6" gutterBottom>Manual Entry Form</Typography>
                {renderManualEntryForm()}
            </>
        ) : (
            <>
                <Typography variant="h6" gutterBottom>Excel Import Form</Typography>
                {renderExcelImportForm()}
            </>
        )}
      </Box>
    </Box>
  );
}

export default MapDataImportPage;