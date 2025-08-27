// src/components/ProjectSummaryReport.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';

import DonutChart from './charts/DonutChart';
import ReportDataTable from './tables/ReportDataTable'; // Import the table component
import apiService from '../api';

// Define the columns for this specific report's table
const projectTableColumns = [
    { id: 'projectName', label: 'Project Name', minWidth: 200 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'departmentName', label: 'Department', minWidth: 150 },
    { id: 'projectCategory', label: 'Project Category', minWidth: 150 },
    { id: 'financialYearName', label: 'Financial Year', minWidth: 120 },
    { id: 'costOfProject', label: 'Budget', minWidth: 120 },
    { id: 'paidOut', label: 'Amount Paid', minWidth: 120 },
];

const ProjectSummaryReport = ({ filters }) => {
    const [statusData, setStatusData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [projectData, setProjectData] = useState([]); // State for the detailed table data
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch all data in parallel to improve performance
                const [fetchedStatusData, fetchedCategoryData, fetchedProjectData] = await Promise.all([
                    apiService.reports.getProjectStatusSummary(filters),
                    apiService.reports.getProjectCategorySummary(filters),
                    apiService.reports.getDetailedProjectList(filters), // New API call
                ]);
                setStatusData(fetchedStatusData);
                setCategoryData(fetchedCategoryData);
                setProjectData(fetchedProjectData);
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

    return (
        <Box>
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                    <DonutChart title="# of Projects by Status" data={statusData} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <DonutChart title="# of Projects by Category" data={categoryData} />
                </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
                <ReportDataTable data={projectData} columns={projectTableColumns} />
            </Box>
        </Box>
    );
};

export default ProjectSummaryReport;