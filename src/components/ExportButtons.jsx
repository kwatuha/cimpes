// src/components/ExportButtons.jsx

import React from 'react';
import { Box, Tooltip, IconButton } from '@mui/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import DescriptionIcon from '@mui/icons-material/Description'; // Generic document for PDF
import TableChartIcon from '@mui/icons-material/TableChart'; // Excel/spreadsheet icon

const ExportButtons = ({ tableData, columns }) => {

  const exportToExcel = () => {
    const dataToExport = tableData.map(item => {
      const row = {};
      columns.forEach(col => {
        row[col.label] = item[col.id];
      });
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const headers = columns.map(col => col.label);
    const data = tableData.map(item => columns.map(col => item[col.id]));
    
    doc.autoTable({
      head: [headers],
      body: data,
    });
    
    doc.save("report.pdf");
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <Tooltip title="Export to PDF">
        <IconButton
          variant="outlined"
          onClick={exportToPDF}
          sx={{ color: '#E11D48' }} // Red color often associated with PDF
        >
          <DescriptionIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export to Excel">
        <IconButton
          variant="outlined"
          onClick={exportToExcel}
          sx={{ color: '#276E4B' }} // Green color often associated with Excel
        >
          <TableChartIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ExportButtons;