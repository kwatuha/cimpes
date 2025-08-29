import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';

import ReportDataTable from './tables/ReportDataTable';
import apiService from '../api';
import ExportButtons from './ExportButtons';

// Import the new and updated chart components
import DonutChart from './charts/DonutChart';
import ProjectStatusDonutChart from './charts/ProjectStatusDonutChart';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';

// Define columns for the detailed project list table
const projectListColumns = [
    { id: 'projectName', label: 'Project Title', minWidth: 200 },
    { id: 'financialYearName', label: 'Financial Year', minWidth: 100 },
    { id: 'departmentName', label: 'Department', minWidth: 150 },
    { id: 'countyName', label: 'County', minWidth: 120 },
    { id: 'subcountyName', label: 'Subcounty', minWidth: 120 },
    { id: 'wardName', label: 'Ward', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'costOfProject', label: 'Budget', minWidth: 120 },
    { id: 'paidOut', label: 'Paid Amount', minWidth: 120 },
];

const ProjectSummaryReport = ({ filters }) => {
    const [reportData, setReportData] = useState({
        detailedList: [],
        statusSummary: [],
        categorySummary: [],
        costByDepartment: [],
        projectsOverTime: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [
                    fetchedProjectData,
                    fetchedStatusData,
                    fetchedCategoryData,
                    fetchedCostByDepartment,
                    fetchedProjectsOverTime
                ] = await Promise.all([
                    apiService.reports.getDetailedProjectList(filters),
                    apiService.reports.getProjectStatusSummary(filters),
                    apiService.reports.getProjectCategorySummary(filters),
                    apiService.reports.getProjectCostByDepartment(filters),
                    apiService.reports.getProjectsOverTime(filters)
                ]);

                setReportData({
                    detailedList: Array.isArray(fetchedProjectData) ? fetchedProjectData : [],
                    statusSummary: Array.isArray(fetchedStatusData) ? fetchedStatusData : [],
                    categorySummary: Array.isArray(fetchedCategoryData) ? fetchedCategoryData : [],
                    costByDepartment: Array.isArray(fetchedCostByDepartment) ? fetchedCostByDepartment : [],
                    projectsOverTime: Array.isArray(fetchedProjectsOverTime) ? fetchedProjectsOverTime : []
                });
            } catch (err) {
                setError("Failed to load project summary report data.");
                console.error("API call failed:", err);
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

    const hasData = reportData.detailedList.length > 0 ||
                    reportData.statusSummary.length > 0 ||
                    reportData.categorySummary.length > 0 ||
                    reportData.costByDepartment.length > 0 ||
                    reportData.projectsOverTime.length > 0;

    if (!hasData) {
        return <Alert severity="info" sx={{ mt: 2 }}>No data found for the selected filters.</Alert>;
    }

    // Process data for charts
    const donutChartData = reportData.statusSummary.map(item => ({ 
        name: item.name || item.statusName, 
        value: item.value || item.count 
    }));
    
    const categoryBarChartData = reportData.categorySummary.map(item => ({ 
        name: item.name || item.categoryName, 
        value: item.value || item.count 
    }));

    const costByDepartmentChartData = reportData.costByDepartment
        .filter(item => item.departmentName !== null)
        .map(item => ({ 
            name: item.departmentName || 'Unknown Department', 
            value: parseFloat(item.totalBudget || 0)
        }));
    
    const projectsOverTimeChartData = reportData.projectsOverTime.map(item => ({ 
        name: item.name || item.period || item.date, 
        value: item.value || item.count || item.projectCount || 0
    }));

return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Comprehensive Project Overview
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }} justifyContent="center">
    {/* Projects by Status - Donut Chart (Use a larger grid size) */}
    <Grid item xs={12} md={6} lg={4}>
        {donutChartData.length > 0 ? (
            <ProjectStatusDonutChart title="# of Projects by Status" data={donutChartData} />
        ) : (
            <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                <Typography variant="h6" align="center" gutterBottom>
                    # of Projects by Status
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                    No status data available.
                </Typography>
            </Box>
        )}
    </Grid>

    {/* Projects by Category - Bar Chart (Use a larger grid size) */}
    <Grid item xs={12} md={6} lg={4}>
        {categoryBarChartData.length > 0 ? (
            <BarChart
                title="# of Projects by Category"
                data={categoryBarChartData}
                xDataKey="name"
                yDataKey="value"
            />
        ) : (
            <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                <Typography variant="h6" align="center" gutterBottom>
                    # of Projects by Category
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                    No category data available.
                </Typography>
            </Box>
        )}
    </Grid>

    {/* Total Budget by Department - Bar Chart (Use a larger grid size) */}
    <Grid item xs={12} md={6} lg={4}>
        {costByDepartmentChartData.length > 0 ? (
            <BarChart
                title="Total Budget by Department (Ksh)"
                data={costByDepartmentChartData}
                xDataKey="name"
                yDataKey="value"
                yAxisLabel="Budget (Ksh)"
            />
        ) : (
            <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                <Typography variant="h6" align="center" gutterBottom>
                    Total Budget by Department (Ksh)
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                    No cost by department data available.
                </Typography>
            </Box>
        )}
    </Grid>

    {/* Projects Over Time - Line Chart (Use a larger grid size) */}
    <Grid item xs={12} md={6} lg={4}>
        {projectsOverTimeChartData.length > 0 ? (
            <LineChart
                title="Projects Over Time"
                data={projectsOverTimeChartData}
                xDataKey="name"
                yDataKey="value"
                yAxisLabel="Projects"
            />
        ) : (
            <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                <Typography variant="h6" align="center" gutterBottom>
                    Projects Over Time
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                    No projects over time data available.
                </Typography>
            </Box>
        )}
    </Grid>
</Grid>

        <ExportButtons tableData={reportData.detailedList} columns={projectListColumns} />

        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Detailed Project List
            </Typography>
            <ReportDataTable data={reportData.detailedList} columns={projectListColumns} />
        </Box>
    </Box>
);
};

export default ProjectSummaryReport;