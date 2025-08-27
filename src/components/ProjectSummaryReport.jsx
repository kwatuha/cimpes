// src/components/ProjectSummaryReport.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';

import ReportDataTable from './tables/ReportDataTable';
import apiService from '../api';
import ExportButtons from './ExportButtons';
import DonutChart from './charts/DonutChart';
import BarLineChart from './charts/BarLineChart';

// Define columns for the detailed project list table with the corrected ID
const projectListColumns = [
    { id: 'projectName', label: 'Project Title', minWidth: 200 }, // 👈 Fix is here
    { id: 'financialYearName', label: 'Financial Year', minWidth: 100 },
    { id: 'departmentName', label: 'Department', minWidth: 150 },
    { id: 'countyName', label: 'County', minWidth: 120 },
    { id: 'subCountyName', label: 'Subcounty', minWidth: 120 },
    { id: 'wardName', label: 'Ward', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'costOfProject', label: 'Budget', minWidth: 120 },
    { id: 'paidOut', label: 'Paid Amount', minWidth: 120 },
];

const ProjectSummaryReport = ({ filters }) => {
    const [reportData, setReportData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch the detailed project list for the table
                const fetchedProjectData = await apiService.reports.getDetailedProjectList(filters);
                setReportData(Array.isArray(fetchedProjectData) ? fetchedProjectData : []);
                
                // Fetch project status summary for the chart
                const fetchedStatusData = await apiService.reports.getProjectStatusSummary(filters);
                setStatusData(Array.isArray(fetchedStatusData) ? fetchedStatusData : []);
                
                // Fetch project category summary for the chart
                const fetchedCategoryData = await apiService.reports.getProjectCategorySummary(filters);
                setCategoryData(Array.isArray(fetchedCategoryData) ? fetchedCategoryData : []);
            } catch (err) {
                setError("Failed to load project summary report data.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [filters]);

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

    if (reportData.length === 0) {
        return <Alert severity="info" sx={{ mt: 2 }}>No data found for the selected filters.</Alert>;
    }

    // Process data for charts
    const donutChartData = statusData.map(item => ({ name: item.name, value: item.value }));
    const barLineChartData = categoryData.map(item => ({ name: item.name, value: item.value }));

    return (
        <Box>
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <DonutChart title="# of Projects by Status" data={donutChartData} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <BarLineChart title="# of Projects by Category" data={barLineChartData} />
                </Grid>
            </Grid>
            
            <ExportButtons tableData={reportData} columns={projectListColumns} />

            <Box>
                <ReportDataTable data={reportData} columns={projectListColumns} />
            </Box>
        </Box>
    );
};

export default ProjectSummaryReport;