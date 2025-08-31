import React, { useState } from 'react';
import {
    Box, Typography, Button, Stack, IconButton, CircularProgress, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, FileDownload as FileDownloadIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../api';
import { useTheme } from '@mui/material';
import { tokens } from "../../pages/dashboard/theme";

export default function EmployeeSection({
    employees,
    handleOpenDeleteConfirmModal,
    fetchEmployee360View,
    showNotification,
    refreshData,
    handleOpenAddEmployeeModal,
    handleOpenEditEmployeeModal
}) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { hasPrivilege } = useAuth();
    
    // Export loading states
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);

    // Define columns for the DataGrid
    const columns = [
        { field: 'firstName', headerName: 'First Name', flex: 1, minWidth: 150 },
        { field: 'lastName', headerName: 'Last Name', flex: 1, minWidth: 150 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
        { field: 'phoneNumber', headerName: 'Phone', flex: 1, minWidth: 150 },
        { field: 'department', headerName: 'Department', flex: 1, minWidth: 150, valueGetter: (params) => params?.row?.department?.name || 'N/A' },
        { field: 'jobTitle', headerName: 'Job Title', flex: 1, minWidth: 150, valueGetter: (params) => params?.row?.jobGroup?.jobTitle || 'N/A' },
        { field: 'employmentType', headerName: 'Employment Type', flex: 1, minWidth: 150 },
        { field: 'startDate', headerName: 'Start Date', flex: 1, minWidth: 150 },
        { field: 'employmentStatus', headerName: 'Status', flex: 1, minWidth: 120 },
        { field: 'manager', headerName: 'Manager', flex: 1, minWidth: 150, valueGetter: (params) => params?.row?.manager?.firstName ? `${params.row.manager.firstName} ${params.row.manager.lastName}` : 'N/A' },
        { field: 'nationalId', headerName: 'National ID', flex: 1, minWidth: 150 },
        { field: 'kraPin', headerName: 'KRA PIN', flex: 1, minWidth: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    {hasPrivilege('employee.update') && (
                        <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleOpenEditEmployeeModal(params.row)}><EditIcon /></IconButton></Tooltip>
                    )}
                    {hasPrivilege('employee.delete') && (
                        <Tooltip title="Delete"><IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(params.row.staffId, `${params.row.firstName} ${params.row.lastName}`, 'employee')}><DeleteIcon /></IconButton></Tooltip>
                    )}
                    {hasPrivilege('employee.read_360') && (
                        <Tooltip title="View Details"><IconButton color="info" onClick={() => fetchEmployee360View(params.row.staffId)}><VisibilityIcon /></IconButton></Tooltip>
                    )}
                </Box>
            ),
        },
    ];

    const handleExportExcel = async () => {
        setExportingExcel(true);
        try {
            const excelHeadersMapping = columns.reduce((acc, col) => {
                // Map DataGrid fields to their header labels for Excel export
                if (col.field !== 'actions' && col.field !== 'jobTitle' && col.field !== 'manager') {
                    acc[col.field] = col.headerName;
                }
                return acc;
            }, {});

            const data = await apiService.hr.exportEmployeesToExcel(excelHeadersMapping);
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'employees_export.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showNotification('Employee data exported to Excel.', 'success');
        } catch (err) {
            console.error('Error exporting to Excel:', err);
            showNotification('Failed to export employee data to Excel.', 'error');
        } finally {
            setExportingExcel(false);
        }
    };

    const handleExportPdf = async () => {
        setExportingPdf(true);
        try {
            const allEmployeesResponse = await apiService.hr.getEmployees();
            const allEmployees = allEmployeesResponse;

            const tableColumnsForPdf = columns.filter(col => col.field !== 'actions');

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
                    ${tableColumnsForPdf.map(col => `<th>${col.headerName}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${allEmployees.map(employee => `
                    <tr>
                      ${tableColumnsForPdf.map(col => {
                          let value;
                          if (col.field === 'jobTitle') {
                              value = employee.jobGroup?.jobTitle || 'N/A';
                          } else if (col.field === 'department') {
                              value = employee.department?.name || 'N/A';
                          } else if (col.field === 'manager') {
                              value = employee.manager?.firstName ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'N/A';
                          } else {
                              value = employee[col.field] !== null && employee[col.field] !== undefined ? String(employee[col.field]) : 'N/A';
                          }
                          return `<td>${value}</td>`;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;

            const data = await apiService.hr.exportEmployeesToPdf(tableHtml);
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'employees_report.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showNotification('Employee data exported to PDF.', 'success');
        } catch (err) {
            console.error('Error exporting to PDF:', err);
            showNotification('Failed to export employee data to PDF.', 'error');
        } finally {
            setExportingPdf(false);
        }
    };

    return (
        <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>All Employees</Typography>
                <Box>
                    {hasPrivilege('employee.create') && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenAddEmployeeModal()}
                            sx={{ mr: 2 }}
                        >
                            Add New Employee
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleExportExcel}
                        disabled={employees.length === 0 || exportingExcel}
                        startIcon={exportingExcel ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                        sx={{ mr: 1 }}
                    >
                        {exportingExcel ? 'Exporting...' : 'Export to Excel'}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleExportPdf}
                        disabled={employees.length === 0 || exportingPdf}
                        startIcon={exportingPdf ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
                    >
                        {exportingPdf ? 'Generating PDF...' : 'Export to PDF'}
                    </Button>
                </Box>
            </Stack>

            <Box
                m="20px 0 0 0"
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .name-column--cell": {
                        color: colors.greenAccent[300],
                    },
                }}
            >
                <DataGrid
                    rows={employees}
                    columns={columns}
                    getRowId={(row) => row.staffId}
                    loading={!employees.length}
                />
            </Box>
        </Box>
    );
}
