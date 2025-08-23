import React, { useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Stack, IconButton, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, FileDownload as FileDownloadIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AddEditEmployeeModal from './modals/AddEditEmployeeModal';
import apiService from '../../api'; // Assuming a similar apiService structure

export default function EmployeeSection({
    employees,
    handleOpenDeleteConfirmModal,
    fetchEmployee360View,
    showNotification,
    refreshData,
    handleOpenAddEmployeeModal,
    handleOpenEditEmployeeModal
}) {
    const { hasPrivilege } = useAuth();
    
    // Export loading states
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);

    // Define columns for the employee table, including new fields.
    const employeeTableColumns = [
        { id: 'firstName', label: 'First Name' },
        { id: 'lastName', label: 'Last Name' },
        { id: 'email', label: 'Email' },
        { id: 'phoneNumber', label: 'Phone' },
        { id: 'department', label: 'Department' },
        { id: 'title', label: 'Job Title' },
        { id: 'employmentType', label: 'Employment Type' },
        { id: 'startDate', label: 'Start Date' },
        { id: 'employmentStatus', label: 'Status' },
        { id: 'manager', label: 'Manager' },
        { id: 'nationalId', label: 'National ID' },
        { id: 'kraPin', label: 'KRA PIN' },
    ];

    const handleExportExcel = async () => {
        setExportingExcel(true);
        try {
            const excelHeadersMapping = employeeTableColumns.reduce((acc, col) => {
                acc[col.id] = col.label;
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
                    ${employeeTableColumns.map(col => `<th>${col.label}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${allEmployees.map(employee => `
                    <tr>
                      ${employeeTableColumns.map(col => `<td>${employee[col.id] !== null && employee[col.id] !== undefined ? String(employee[col.id]) : 'N/A'}</td>`).join('')}
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

            <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                <Table aria-label="employees table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            {employeeTableColumns.map((column) => (
                                <TableCell key={column.id} sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {column.label}
                                </TableCell>
                            ))}
                            {(hasPrivilege('employee.update') || hasPrivilege('employee.delete') || hasPrivilege('employee.read_360')) && (
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees && employees.length > 0 ? (
                            employees.map((employee) => (
                                <TableRow hover key={employee.staffId} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                                    {employeeTableColumns.map((column) => (
                                        <TableCell key={column.id}>
                                            {employee[column.id] !== null && employee[column.id] !== undefined
                                                ? String(employee[column.id])
                                                : 'N/A'}
                                        </TableCell>
                                    ))}
                                    {(hasPrivilege('employee.update') || hasPrivilege('employee.delete') || hasPrivilege('employee.read_360')) && (
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                {hasPrivilege('employee.update') && (
                                                    <IconButton color="primary" onClick={() => handleOpenEditEmployeeModal(employee)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                )}
                                                {hasPrivilege('employee.delete') && (
                                                    <IconButton color="error" onClick={() => handleOpenDeleteConfirmModal(employee.staffId, `${employee.firstName} ${employee.lastName}`, 'employee')}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                                {hasPrivilege('employee.read_360') && (
                                                    <IconButton color="info" onClick={() => fetchEmployee360View(employee.staffId)}>
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={employeeTableColumns.length + 1} align="center">No employees found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}