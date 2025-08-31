// src/components/tables/ReportDataTable.jsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const ReportDataTable = ({ data, columns, getRowId }) => {
  // Define dataGridColumns here, at the top level of the function
  const dataGridColumns = columns.map(col => ({
    field: col.id,
    headerName: col.label,
    minWidth: col.minWidth,
    flex: 1,
    valueFormatter: col.format ? (params) => col.format(params.value) : undefined,
  }));

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
    <Box sx={{ height: 400, width: '100%', mt: 2 }}>
      <DataGrid
        rows={data}
        columns={dataGridColumns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        disableSelectionOnClick
        getRowId={getRowId}
        autoHeight
      />
    </Box>
  );
};

export default ReportDataTable;