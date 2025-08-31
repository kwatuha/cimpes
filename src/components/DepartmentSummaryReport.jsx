import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';

import DonutChart from './charts/DonutChart';
import BarLineChart from './charts/BarLineChart';
import ReportDataTable from './tables/ReportDataTable';
import apiService from '../api';
 
// Define the columns for the department summary table
const departmentTableColumns = [
    { id: 'departmentName', label: 'Department Name', minWidth: 170 },
    { id: 'projectCount', label: 'Total Projects', minWidth: 100 },
    { 
        id: 'totalBudget', 
        label: 'Total Budget', 
        minWidth: 150, 
        format: (value) => {
            if (value === null || value === undefined) return 'N/A';
            return parseFloat(value).toLocaleString('en-KE', { style: 'currency', currency: 'KES' });
        } 
    },
    { 
        id: 'totalPaid', 
        label: 'Total Paid', 
        minWidth: 150, 
        format: (value) => {
            if (value === null || value === undefined) return 'N/A';
            return parseFloat(value).toLocaleString('en-KE', { style: 'currency', currency: 'KES' });
        }
    },
    { 
        id: 'absorptionRate', 
        label: 'Absorption Rate', 
        minWidth: 120, 
        format: (value) => {
            if (value === null || value === undefined) return 'N/A';
            return `${(value * 100).toFixed(2)}%`;
        } 
    },
];

const DepartmentSummaryReport = ({ filters }) => {
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedData = await apiService.reports.getDepartmentSummaryReport(filters);
            setReportData(fetchedData);
        } catch (err) {
            setError("Failed to load department summary report data.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const prepareProjectCountData = (data) => {
        return data.map(item => ({
            name: item.departmentName,
            value: item.projectCount,
        }));
    };

    const prepareBarLineChartData = (data) => {
        return data.map(item => ({
            name: item.departmentName,
            budget: parseFloat(item.totalBudget),
            paid: parseFloat(item.totalPaid),
            absorptionRate: parseFloat(item.absorptionRate) * 100, // Convert to percentage
        }));
    };

    const getRowId = (row) => `${row.departmentName}-${row.projectCount}`;

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading report data...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    if (!reportData || reportData.length === 0) {
        return <Alert severity="info" sx={{ mt: 2 }}>No data found for the selected filters.</Alert>;
    }

    const projectCountData = prepareProjectCountData(reportData);
    const barLineChartData = prepareBarLineChartData(reportData);

    return (
        <Box>
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <DonutChart title="# of Projects by Department" data={projectCountData} />
                </Grid>
            </Grid>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>Project Budget/Contract Sum</Typography>
                <BarLineChart data={barLineChartData} />
            </Box>

            <Box>
                <ReportDataTable data={reportData} columns={departmentTableColumns} getRowId={getRowId} />
            </Box>
        </Box>
    );
};

export default DepartmentSummaryReport;