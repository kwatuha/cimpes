// src/pages/RawDataPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Button,
  Stack,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import apiService from '../api'; // Correctly imports the consolidated apiService
import FilterPanel from '../components/FilterPanel';

function RawDataPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRows, setTotalRows] = useState(0);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting states
  const [orderBy, setOrderBy] = useState('individualId'); // Default sort by individualId
  const [order, setOrder] = useState('asc');

  // Filter state
  const [filters, setFilters] = useState({});

  // Export loading states
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Define column headers and their corresponding database keys (now camelCase)
  const tableColumns = [
    { id: 'individualId', label: 'Individual ID' },
    { id: 'householdId', label: 'Household ID' },
    { id: 'gpsLatitudeIndividual', label: 'Latitude' },
    { id: 'gpsLongitudeIndividual', label: 'Longitude' },
    { id: 'county', label: 'County' },
    { id: 'subCounty', label: 'Sub-County' },
    { id: 'gender', label: 'Gender' },
    { id: 'age', label: 'Age' },
    { id: 'occupation', label: 'Occupation' },
    { id: 'educationLevel', label: 'Education Level' },
    { id: 'diseaseStatusMalaria', label: 'Malaria Status' },
    { id: 'diseaseStatusDengue', label: 'Dengue Status' },
    { id: 'mosquitoNetUse', label: 'Mosquito Net Use' },
    { id: 'waterStoragePractices', label: 'Water Storage' },
    { id: 'climatePerception', label: 'Climate Perception' },
    { id: 'recentRainfall', label: 'Recent Rainfall' },
    { id: 'averageTemperatureC', label: 'Avg. Temp (°C)' },
    { id: 'householdSize', label: 'Household Size' },
    { id: 'accessToHealthcare', label: 'Healthcare Access' },
    { id: 'projectId', label: 'Project ID' },
  ];

  // Helper function to fetch data with current state
  const fetchRawData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.participants.getStudyParticipants(
        filters,
        page + 1, // API expects 1-indexed page
        rowsPerPage,
        orderBy,
        order.toUpperCase() // API expects 'ASC' or 'DESC'
      );
      setParticipants(response.data);
      setTotalRows(response.totalCount);
    } catch (err) {
      setError("Failed to load raw data. Please try again later.");
      console.error("Failed to fetch raw participant data:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, rowsPerPage, orderBy, order]);

  useEffect(() => {
    fetchRawData();
  }, [fetchRawData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const excelHeadersMapping = tableColumns.reduce((acc, col) => {
        acc[col.id] = col.label; // Key is the camelCase DB column name, value is the human-readable label
        return acc;
      }, {});

      // Corrected API call: apiService.participants.exportStudyParticipantsToExcel
      const data = await apiService.participants.exportStudyParticipantsToExcel(
        filters,
        excelHeadersMapping,
        orderBy,
        order.toUpperCase()
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
      // Fetch all data for PDF export using the participants service
      const allParticipantsResponse = await apiService.participants.getStudyParticipants(
        filters,
        1, // Start from page 1
        totalRows > 0 ? totalRows : 100000, // Fetch all rows
        orderBy,
        order.toUpperCase()
      );
      const allParticipants = allParticipantsResponse.data;

      let tableHtml = `
        <style>
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9pt; }
          th, td { border: 1px solid #EEEEEE; padding: 8px; text-align: left; }
          th { background-color: #ADD8E6; color: #0A2342; font-weight: bold; }
          tr:nth-child(even) { background-color: #F9F9F9; }
        </style>
        <table>
          <thead>
            <tr>
              ${tableColumns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${allParticipants.map(participant => `
              <tr>
                ${tableColumns.map(col => `<td>${participant[col.id] !== null && participant[col.id] !== undefined ? String(participant[col.id]) : 'N/A'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      // Corrected API call: apiService.participants.exportStudyParticipantsToPdf
      const data = await apiService.participants.exportStudyParticipantsToPdf(
        filters,
        tableHtml,
        orderBy,
        order.toUpperCase()
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Raw Participant Data
      </Typography>

      <FilterPanel onApplyFilters={handleApplyFilters} />

      <Stack direction="row" spacing={2} sx={{ my: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportExcel}
          disabled={loading || participants.length === 0 || exportingExcel}
          startIcon={exportingExcel ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
        >
          {exportingExcel ? 'Exporting...' : 'Export to Excel'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExportPdf}
          disabled={loading || participants.length === 0 || exportingPdf}
          startIcon={exportingPdf ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
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
        <Paper sx={{ width: '100%', mb: 2 }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader aria-label="raw participant data table" size="small">
              <TableHead>
                <TableRow>
                  {tableColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      sortDirection={orderBy === column.id ? order : false}
                      sx={{ fontWeight: 'bold' }}
                    >
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                        {orderBy === column.id ? (
                          <Box component="span" sx={{
                            border: 0,
                            clip: 'rect(0 0 0 0)',
                            height: 1,
                            margin: -1,
                            overflow: 'hidden',
                            padding: 0,
                            position: 'absolute',
                            top: 20,
                            width: 1,
                          }}>
                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow hover key={participant.individualId || index}>
                    {tableColumns.map((column) => (
                      <TableCell key={column.id}>
                        {participant[column.id] !== null && participant[column.id] !== undefined
                          ? String(participant[column.id])
                          : 'N/A'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalRows}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
}

export default RawDataPage;
