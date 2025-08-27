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
import useTableSort from '../../hooks/useTableSort'; // Adjust path if needed

// Define the columns for the Department Summary table
const reportTableColumnsConfig = [
  { id: 'departmentName', label: 'Department', minWidth: 150 },
  { id: 'projectCount', label: '# of Projects', minWidth: 100 },
  { id: 'totalBudget', label: 'Total Budget', minWidth: 150 },
  { id: 'totalPaid', label: 'Total Paid', minWidth: 150 },
  { id: 'absorptionRate', label: 'Absorption Rate', minWidth: 100 },
  { id: 'totalContractSum', label: 'Contract Sum', minWidth: 150 },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KES', // Assuming Kenyan Shillings as per your context
  minimumFractionDigits: 2,
});

const getFormattedValue = (columnId, value) => {
  switch (columnId) {
    case 'totalBudget':
    case 'totalPaid':
    case 'totalContractSum':
      return !isNaN(parseFloat(value)) ? currencyFormatter.format(parseFloat(value)) : 'N/A';
    case 'absorptionRate':
      return !isNaN(parseFloat(value)) ? `${(parseFloat(value) * 100).toFixed(2)}%` : 'N/A';
    default:
      return value || 'N/A';
  }
};

const ReportDataTable = ({ data }) => {
  const { order, orderBy, handleRequestSort, sortedData } = useTableSort(data, reportTableColumnsConfig[0].id);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Detailed Data</Typography>
      <TableContainer component={Paper} elevation={1}>
        <Table stickyHeader aria-label="report data table">
          <TableHead>
            <TableRow>
              {reportTableColumnsConfig.map((column) => (
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
                {reportTableColumnsConfig.map((column) => (
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