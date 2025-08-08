import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, CircularProgress, Alert, Snackbar, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid,
  FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Download as DownloadIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Add as AddIcon, Place as PlaceIcon } from '@mui/icons-material';
import apiService, { FILE_SERVER_BASE_URL } from '../api';
import strategicPlanningLabels from '../configs/strategicPlanningLabels';
import { useAuth } from '../context/AuthContext.jsx';
import { INITIAL_MAP_POSITION, RESOURCE_TYPES } from '../configs/appConfig';
import metaDataService from '../api/metaDataService';

/**
 * Helper function to check if the user has a specific privilege.
 * @param {object | null} user - The user object from AuthContext.
 * @param {string} privilegeName - The name of the privilege to check.
 * @returns {boolean} True if the user has the privilege, false otherwise.
 */
const checkUserPrivilege = (user, privilegeName) => {
  return user && user.privileges && Array.isArray(user.privileges) && user.privileges.includes(privilegeName);
};

function DataImportPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [importReport, setImportReport] = useState(null);

  const [previewData, setPreviewData] = useState(null);
  const [parsedHeaders, setParsedHeaders] = useState([]);
  const [fullParsedData, setFullParsedData] = useState([]);
  
  const [goToLatitude, setGoToLatitude] = useState(INITIAL_MAP_POSITION[0].toFixed(6));
  const [goToLongitude, setGoToLongitude] = useState(INITIAL_MAP_POSITION[1].toFixed(6));
  
  const [mapCenter, setMapCenter] = useState({ lat: INITIAL_MAP_POSITION[0], lng: INITIAL_MAP_POSITION[1] });
  const [mapZoom, setMapZoom] = useState(6);
  const mapRef = useRef(null);
  
  // NEW: State for filters and filter data
  const [filterCountyId, setFilterCountyId] = useState('');
  const [filterSubcountyId, setFilterSubcountyId] = useState('');
  const [filterWardId, setFilterWardId] = useState('');
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading) {
      console.log('DataImportPage: Auth loading complete.');
      console.log('Current user object:', user);
      if (user && user.privileges) {
        console.log('User privileges:', user.privileges);
        console.log('Has strategic_plan.import privilege?', user.privileges.includes('strategic_plan.import'));
      } else {
        console.log('User object or privileges array is null/undefined.');
      }
    }
  }, [authLoading, user]);
  
  // NEW: Fetch initial counties list on component mount
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

  // NEW: Fetch subcounties when a county is selected
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

  // NEW: Fetch wards when a subcounty is selected
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


  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setImportReport(null);
    setPreviewData(null);
    setParsedHeaders([]);
    setFullParsedData([]);
  };

  const handleUploadForPreview = async () => {
    if (!checkUserPrivilege(user, 'strategic_plan.import')) {
      setSnackbar({ open: true, message: `You do not have permission to initiate data import.`, severity: 'error' });
      return;
    }
    if (!selectedFile) {
      setSnackbar({ open: true, message: 'Please select a file to import.', severity: 'warning' });
      return;
    }

    setLoading(true);
    setSnackbar({ open: true, message: 'Parsing file for preview...', severity: 'info' });
    setImportReport(null);
    setPreviewData(null);
    setParsedHeaders([]);
    setFullParsedData([]);

    const formData = new FormData();
    formData.append('importFile', selectedFile);

    try {
      const response = await apiService.strategy.previewStrategicPlanData(formData);
      console.log('Backend preview response:', response);
      setSnackbar({ open: true, message: response.message, severity: 'success' });
      setPreviewData(response.previewData);
      setParsedHeaders(response.headers);
      setFullParsedData(response.fullData);
      setImportReport({
        success: true,
        message: response.message,
        details: {
          unrecognizedHeaders: response.unrecognizedHeaders || [],
        }
      });

    } catch (err) {
      console.error('File parsing error:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to parse file for preview.', severity: 'error' });
      setImportReport({ success: false, message: err.message || 'Failed to parse file for preview.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!checkUserPrivilege(user, 'strategic_plan.import')) {
      setSnackbar({ open: true, message: `You do not have permission to confirm data import.`, severity: 'error' });
      return;
    }
    if (!fullParsedData || fullParsedData.length === 0) {
      setSnackbar({ open: true, message: 'No data to confirm import.', severity: 'warning' });
      return;
    }

    setLoading(true);
    setSnackbar({ open: true, message: 'Confirming import and saving data...', severity: 'info' });
    setImportReport(null);

    try {
      const response = await apiService.strategy.confirmImportStrategicPlanData({ dataToImport: fullParsedData });
      setSnackbar({ open: true, message: response.message, severity: 'success' });
      setImportReport(response);
      setSelectedFile(null);
      setPreviewData(null);
      setParsedHeaders([]);
      setFullParsedData([]);
    } catch (err) {
      console.error('Import confirmation error:', err);
      setSnackbar({ open: true, message: err.message || 'Failed to confirm import.', severity: 'error' });
      setImportReport({ success: false, message: err.message || 'Failed to confirm import.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelImport = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setParsedHeaders([]);
    setFullParsedData([]);
    setImportReport(null);
    setSnackbar({ open: true, message: 'Import process cancelled.', severity: 'info' });
  };

  const handleDownloadTemplate = () => {
    const templateURL = `${FILE_SERVER_BASE_URL}/api/strategy/download-template`;
    window.open(templateURL, '_blank');
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // NEW: Map navigation handlers and states
  const handleGoToCoordinates = () => {
    const lat = parseFloat(goToLatitude);
    const lng = parseFloat(goToLongitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      setMapCenter({ lat, lng });
      setMapZoom(12);
    } else {
      setSnackbar({ open: true, message: 'Please enter valid latitude and longitude.', severity: 'error' });
    }
  };

  const handleGoToArea = useCallback(() => {
    // This function will need to be implemented once you have the filtered data and bounding box
    // from your backend in this component. For now, it remains a placeholder.
    setSnackbar({ open: true, message: 'Go to Area functionality is a placeholder.', severity: 'info' });
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

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading user permissions...</Typography>
      </Box>
    );
  }

  const isUploadButtonDisabled = !selectedFile || loading || !checkUserPrivilege(user, 'strategic_plan.import');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Import {strategicPlanningLabels.strategicPlan.plural} Data</Typography>
      <Paper elevation={3} sx={{ p: 3, borderRadius: '8px' }}>
        <Typography variant="h6" gutterBottom>Upload Excel File (.xlsx)</Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              fullWidth
            >
              Download Template
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={8} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                type="file"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload-input"
                ref={fileInputRef}
              />
              <TextField
                fullWidth
                size="small"
                value={selectedFile ? selectedFile.name : ''}
                placeholder="No file selected"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Button 
                      component="label" 
                      htmlFor="file-upload-input" 
                      variant="text" 
                      startIcon={<AddIcon />}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Choose File
                    </Button>
                  ),
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            {!previewData && (
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadForPreview}
                disabled={isUploadButtonDisabled}
                fullWidth
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload & Preview'}
              </Button>
            )}

            {previewData && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleConfirmImport}
                  disabled={loading || !checkUserPrivilege(user, 'strategic_plan.import')}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelImport}
                  disabled={loading}
                  fullWidth
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
        
        {/* --- Corrected Map Navigation Section --- */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Map Navigation</Typography>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* County Filter */}
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel shrink>County</InputLabel>
                  <Select
                    value={filterCountyId}
                    onChange={handleGeographicalFilterChange}
                    label="County"
                    name="countyId"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {counties.map(county => (
                      <MenuItem key={county.countyId} value={String(county.countyId)}>{county.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Sub-County Filter */}
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small" variant="outlined" disabled={!filterCountyId}>
                  <InputLabel shrink>Sub-County</InputLabel>
                  <Select
                    value={filterSubcountyId}
                    onChange={handleGeographicalFilterChange}
                    label="Sub-County"
                    name="subcountyId"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {subcounties.map(subc => (
                      <MenuItem key={subc.subcountyId} value={String(subc.subcountyId)}>{subc.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Ward Filter */}
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small" variant="outlined" disabled={!filterSubcountyId}>
                  <InputLabel shrink>Ward</InputLabel>
                  <Select
                    value={filterWardId}
                    onChange={handleGeographicalFilterChange}
                    label="Ward"
                    name="wardId"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {wards.map(ward => (
                      <MenuItem key={ward.wardId} value={String(ward.wardId)}>{ward.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Go to Area Button */}
              <Grid item xs={12} sm={4} md={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGoToArea}
                  fullWidth
                  disabled={!filterCountyId && !filterSubcountyId && !filterWardId}
                  startIcon={<PlaceIcon />}
                >
                  Go to Area
                </Button>
              </Grid>
              {/* Go to Lat/Lng Inputs and Button */}
              <Grid item xs={12} sm={4} md={2}>
                <TextField
                  fullWidth
                  label="Go To Latitude"
                  value={goToLatitude}
                  onChange={(e) => setGoToLatitude(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <TextField
                  fullWidth
                  label="Go To Longitude"
                  value={goToLongitude}
                  onChange={(e) => setGoToLongitude(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={1}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleGoToCoordinates}
                  fullWidth
                >
                  Go
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        {/* End of Map Navigation Section */}
        
        {importReport && (
          <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: importReport.success ? 'success.main' : 'error.main', borderRadius: '8px' }}>
            <Typography variant="h6" color={importReport.success ? 'success.main' : 'error.main'}>
              Import Report: {importReport.success ? 'Success' : 'Failed'}
            </Typography>
            <Typography variant="body1">{importReport.message}</Typography>
            {importReport.details && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">Details:</Typography>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.8rem' }}>
                  {JSON.stringify(importReport.details, null, 2)}
                </pre>
              </Box>
            )}
          </Box>
        )}

        {previewData && previewData.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Data Preview (First {previewData.length} Rows)</Typography>
            <TableContainer component={Paper} elevation={2} sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {parsedHeaders.map((header, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {parsedHeaders.map((header, colIndex) => (
                        <TableCell key={`${rowIndex}-${colIndex}`}>{String(row[header] || '')}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {importReport && importReport.details && importReport.details.unrecognizedHeaders && importReport.details.unrecognizedHeaders.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Warning: The following headers were found in your file but are not recognized by the system: {importReport.details.unrecognizedHeaders.join(', ')}. Data in these columns will be ignored.
                </Alert>
            )}
          </Box>
        )}
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DataImportPage;