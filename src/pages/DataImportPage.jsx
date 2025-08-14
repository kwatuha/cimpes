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

  const handleDownloadTemplate = async () => {
    setLoading(true);
    try {
        const response = await apiService.strategy.downloadTemplate();
        // Create a blob URL and a link to download the file
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'strategic_plan_template.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setSnackbar({ open: true, message: 'Template downloaded successfully!', severity: 'success' });
    } catch (error) {
        setSnackbar({ open: true, message: 'Failed to download template file.', severity: 'error' });
        console.error('Download error:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };
  
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
              disabled={loading}
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
