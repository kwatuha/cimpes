// src/components/tables/ReportDataTable.jsx

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';

// Function to format numbers as currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const ReportDataTable = ({ data, columns }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          No data available to display.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto', borderRadius: '8px' }}>
      <Table stickyHeader aria-label="report table">
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={column.id}
                sx={{
                  minWidth: column.minWidth,
                  fontWeight: 'bold',
                  backgroundColor: 'white',
                  color: 'text.primary',
                  position: 'sticky',
                  top: 0,
                  left: index === 0 ? 0 : 'auto',
                  zIndex: index === 0 ? 3 : 1,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow hover key={rowIndex}>
              {columns.map((column, colIndex) => {
                let value = row[column.id] !== undefined && row[column.id] !== null ? row[column.id] : 'N/A';

                // Format financial columns
                if (column.id === 'costOfProject' || column.id === 'paidOut') {
                  value = formatCurrency(value);
                }

                return (
                  <TableCell
                    key={column.id}
                    sx={{
                      position: colIndex === 0 ? 'sticky' : 'static',
                      left: colIndex === 0 ? 0 : 'auto',
                      zIndex: colIndex === 0 ? 2 : 'auto',
                      bgcolor: 'background.paper',
                      borderRight: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportDataTable;