// src/components/tables/ReportDataTable.jsx

import React from 'react';
import {
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
} from '@mui/material';
import useTableSort from '../../hooks/useTableSort';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 2,
});

const getFormattedValue = (columnId, value) => {
  switch (columnId) {
    case 'totalBudget':
    case 'totalPaid':
    case 'totalContractSum':
    case 'costOfProject': // Added for ProjectSummaryReport
    case 'paidOut':       // Added for ProjectSummaryReport
      return !isNaN(parseFloat(value)) ? currencyFormatter.format(parseFloat(value)) : 'N/A';
    case 'absorptionRate':
      return !isNaN(parseFloat(value)) ? `${(parseFloat(value) * 100).toFixed(2)}%` : 'N/A';
    default:
      return value || 'N/A';
  }
};

// Now accepts a 'columns' prop
const ReportDataTable = ({ data, columns }) => {
  const { order, orderBy, handleRequestSort, sortedData } = useTableSort(data, columns[0].id);

  if (!data || data.length === 0) {
    return <Typography>No data to display in the table.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Detailed Data</Typography>
      <TableContainer component={Paper} elevation={1}>
        <Table stickyHeader aria-label="report data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sortDirection={orderBy === column.id ? order : false}
                  sx={{ minWidth: column.minWidth, fontWeight: 'bold' }}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={(event) => handleRequestSort(event, column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow key={index} hover>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {getFormattedValue(column.id, row[column.id])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReportDataTable;