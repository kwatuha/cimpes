// src/pages/RawDataPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import apiService from '../api';
import FilterPanel from '../components/FilterPanel';
import Header from "./dashboard/Header";
import { tokens } from "./dashboard/theme";

function RawDataPage() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRows, setTotalRows] = useState(0);

  // Pagination states
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  
  // Sorting states
  const [sortModel, setSortModel] = useState([
    { field: 'individualId', sort: 'asc' },
  ]);

  // Filter state
  const [filters, setFilters] = useState({});

  // Export loading states
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Define columns for DataGrid
  const columns = [
    { field: 'individualId', headerName: 'Individual ID', flex: 1, minWidth: 120 },
    { field: 'householdId', headerName: 'Household ID', flex: 1, minWidth: 120 },
    { field: 'gpsLatitudeIndividual', headerName: 'Latitude', flex: 1, minWidth: 100 },
    { field: 'gpsLongitudeIndividual', headerName: 'Longitude', flex: 1, minWidth: 100 },
    { field: 'county', headerName: 'County', flex: 1, minWidth: 100 },
    { field: 'subCounty', headerName: 'Sub-County', flex: 1, minWidth: 120 },
    { field: 'gender', headerName: 'Gender', flex: 1, minWidth: 80 },
    { field: 'age', headerName: 'Age', type: 'number', flex: 0.5, minWidth: 60 },
    { field: 'occupation', headerName: 'Occupation', flex: 1, minWidth: 120 },
    { field: 'educationLevel', headerName: 'Education Level', flex: 1, minWidth: 140 },
    { field: 'diseaseStatusMalaria', headerName: 'Malaria Status', flex: 1, minWidth: 130 },
    { field: 'diseaseStatusDengue', headerName: 'Dengue Status', flex: 1, minWidth: 130 },
    { field: 'mosquitoNetUse', headerName: 'Mosquito Net Use', flex: 1, minWidth: 150 },
    { field: 'waterStoragePractices', headerName: 'Water Storage', flex: 1, minWidth: 140 },
    { field: 'climatePerception', headerName: 'Climate Perception', flex: 1, minWidth: 160 },
    { field: 'recentRainfall', headerName: 'Recent Rainfall', flex: 1, minWidth: 130 },
    { field: 'averageTemperatureC', headerName: 'Avg. Temp (°C)', type: 'number', flex: 1, minWidth: 150 },
    { field: 'householdSize', headerName: 'Household Size', type: 'number', flex: 0.5, minWidth: 120 },
    { field: 'accessToHealthcare', headerName: 'Healthcare Access', flex: 1, minWidth: 160 },
    { field: 'projectId', headerName: 'Project ID', flex: 1, minWidth: 100 },
  ];

  const fetchRawData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.participants.getStudyParticipants(
        filters,
        paginationModel.page + 1,
        paginationModel.pageSize,
        sortModel[0]?.field,
        sortModel[0]?.sort?.toUpperCase()
      );
      setParticipants(response.data);
      setTotalRows(response.totalCount);
    } catch (err) {
      setError("Failed to load raw data. Please try again later.");
      console.error("Failed to fetch raw participant data:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, paginationModel, sortModel]);

  useEffect(() => {
    fetchRawData();
  }, [fetchRawData]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const excelHeadersMapping = columns.reduce((acc, col) => {
        acc[col.field] = col.headerName;
        return acc;
      }, {});
      const data = await apiService.participants.exportStudyParticipantsToExcel(
        filters,
        excelHeadersMapping,
        sortModel[0]?.field,
        sortModel[0]?.sort?.toUpperCase()
      );
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kemri_participants_export.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export data to Excel. Please try again.');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const allParticipantsResponse = await apiService.participants.getStudyParticipants(
        filters,
        1,
        totalRows > 0 ? totalRows : 100000,
        sortModel[0]?.field,
        sortModel[0]?.sort?.toUpperCase()
      );
      const allParticipants = allParticipantsResponse.data;

      const headers = columns.map(col => col.headerName);
      const dataRows = allParticipants.map(participant =>
        columns.map(col => participant[col.field] !== null && participant[col.field] !== undefined ? String(participant[col.field]) : 'N/A')
      );
      
      const data = await apiService.participants.exportStudyParticipantsToPdf(
        headers,
        dataRows,
      );

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kemri_participants_report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      alert('Failed to export data to PDF. Please try again.');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <Box m="20px">
      <Header title="RAW DATA" subtitle="List of Raw Participant Data" />

      <FilterPanel onApplyFilters={handleApplyFilters} />

      <Stack direction="row" spacing={2} sx={{ my: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleExportExcel}
          disabled={loading || participants.length === 0 || exportingExcel}
          startIcon={exportingExcel ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: 'white',
            '&:hover': {
              backgroundColor: colors.blueAccent[600],
            },
            fontWeight: 'bold',
            borderRadius: '8px',
            px: 3,
            py: 1.5,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {exportingExcel ? 'Exporting...' : 'Export to Excel'}
        </Button>
        <Button
          variant="contained"
          onClick={handleExportPdf}
          disabled={loading || participants.length === 0 || exportingPdf}
          startIcon={exportingPdf ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
          sx={{
            backgroundColor: colors.greenAccent[600],
            color: 'white',
            '&:hover': {
              backgroundColor: colors.greenAccent[700],
            },
            fontWeight: 'bold',
            borderRadius: '8px',
            px: 3,
            py: 1.5,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {exportingPdf ? 'Generating PDF...' : 'Export to PDF'}
        </Button>
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', mt: 2 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading Raw Data...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}

      {!loading && !error && participants.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>No raw data available for the selected filters.</Alert>
      )}

      {!loading && !error && participants.length > 0 && (
        <Box
          m="40px 0 0 0"
          height="75vh"
          width="100%"
          sx={{
            overflow: "hidden",
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: `${colors.blueAccent[700]} !important`,
              borderBottom: "none",
              minHeight: "56px",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: `${colors.blueAccent[700]} !important`,
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              color: "white !important",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: `${colors.blueAccent[700]} !important`,
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
          }}
        >
          <DataGrid
            rows={participants}
            columns={columns}
            rowCount={totalRows}
            loading={loading}
            pageSizeOptions={[5, 10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            paginationMode="server"
            sortingMode="server"
            onSortModelChange={setSortModel}
            sortModel={sortModel}
            getRowId={(row) => row.individualId}
            disableRowSelectionOnClick
          />
        </Box>
      )}
    </Box>
  );
}

export default RawDataPage;