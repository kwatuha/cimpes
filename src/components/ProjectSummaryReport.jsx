import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import apiService from '../api';

import ProjectStatusDonutChart from './charts/ProjectStatusDonutChart';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';
import StackedBarChart from './charts/StackedBarChart';

// Define columns for the detailed project list table
const projectListColumns = [
    { field: 'projectName', headerName: 'Project Title', minWidth: 200, flex: 1 },
    { field: 'financialYearName', headerName: 'Financial Year', minWidth: 100 },
    { field: 'departmentName', headerName: 'Department', minWidth: 150 },
    { field: 'countyName', headerName: 'County', minWidth: 120 },
    { field: 'subcountyName', headerName: 'Subcounty', minWidth: 120 },
    { field: 'wardName', headerName: 'Ward', minWidth: 120 },
    { field: 'status', headerName: 'Status', minWidth: 100 },
    {
        field: 'costOfProject',
        headerName: 'Budget',
        minWidth: 120,
        type: 'number',
        valueFormatter: (params) => {
            if (params.value == null) {
                return '';
            }
            return `KES ${parseFloat(params.value).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    },
    {
        field: 'paidOut',
        headerName: 'Paid Amount',
        minWidth: 120,
        type: 'number',
        valueFormatter: (params) => {
            if (params.value == null) {
                return '';
            }
            return `KES ${parseFloat(params.value).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    },
];

const ProjectSummaryReport = ({ filters }) => {
    const [reportData, setReportData] = useState({
        detailedList: [],
        statusSummary: [],
        projectsStatusOverTime: [],
        projectsByStatusAndYear: [],
        financialStatusByProjectStatus: [],
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
                    fetchedStatusOverTime,
                    fetchedFinancialStatus,
                    fetchedStatusAndYear
                ] = await Promise.all([
                    apiService.reports.getDetailedProjectList(filters),
                    apiService.reports.getProjectStatusSummary(filters),
                    apiService.reports.getProjectStatusOverTime(filters),
                    apiService.reports.getFinancialStatusByProjectStatus(filters),
                    apiService.reports.getProjectsByStatusAndYear(filters)
                ]);

                setReportData({
                    detailedList: Array.isArray(fetchedProjectData) ? fetchedProjectData : [],
                    statusSummary: Array.isArray(fetchedStatusData) ? fetchedStatusData : [],
                    projectsStatusOverTime: Array.isArray(fetchedStatusOverTime) ? fetchedStatusOverTime : [],
                    financialStatusByProjectStatus: Array.isArray(fetchedFinancialStatus) ? fetchedFinancialStatus : [],
                    projectsByStatusAndYear: Array.isArray(fetchedStatusAndYear) ? fetchedStatusAndYear : [],
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

    // `DataGrid` requires an `id` field, so we must add it if it doesn't exist
    const detailedListWithIds = reportData.detailedList.map((row, index) => ({
        ...row,
        id: row.projectId || index,
    }));

    const hasData = detailedListWithIds.length > 0 ||
                    reportData.statusSummary.length > 0 ||
                    reportData.projectsStatusOverTime.length > 0 ||
                    reportData.financialStatusByProjectStatus.length > 0 ||
                    reportData.projectsByStatusAndYear.length > 0;

    if (!hasData) {
        return <Alert severity="info" sx={{ mt: 2 }}>No data found for the selected filters.</Alert>;
    }

    // Process data for charts
    const donutChartData = reportData.statusSummary.map(item => ({
        name: item.name || item.statusName,
        value: item.value || item.count
    }));

    const stackedBarChartData = reportData.projectsByStatusAndYear;

    const allStatuses = [...new Set(stackedBarChartData.map(item => item.status))];

    const transformedData = Object.values(
      stackedBarChartData.reduce((acc, item) => {
        if (!acc[item.year]) {
          acc[item.year] = { year: item.year };
        }
        acc[item.year][item.status] = item.projectCount;
        return acc;
      }, {})
    );

    return (
        <Box sx={{ p: 3, maxWidth: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Comprehensive Project Overview
            </Typography>

            {/* First Row with better width distribution */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Projects by Status - Donut Chart (1/3 width) */}
                <Grid item xs={12} md={5} lg={4}>
                    <Card sx={{ height: '400px' }}>
                        <CardContent sx={{ height: '100%' }}>
                            {donutChartData.length > 0 ? (
                                <ProjectStatusDonutChart title="# of Projects by Status" data={donutChartData} />
                            ) : (
                                <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography variant="h6" align="center" gutterBottom># of Projects by Status</Typography>
                                    <Typography variant="body2" align="center" color="text.secondary">No status data available.</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Budget & Paid by Status (2/3 width) */}
                <Grid item xs={12} md={7} lg={8}>
                    <Card sx={{ height: '400px', bgcolor: '#f5f5dc' }}>
                        <CardContent sx={{ height: '100%', p: 2 }}>
                            {reportData.financialStatusByProjectStatus.length > 0 ? (
                                <Box sx={{ width: '100%', height: '100%' }}>
                                    <BarChart
                                        title="Budget & Paid by Status"
                                        data={reportData.financialStatusByProjectStatus}
                                        xDataKey="status"
                                        yDataKey={['totalBudget', 'totalPaid']}
                                        yAxisLabel="Amount (Ksh)"
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography variant="h6" align="center" gutterBottom>Budget & Paid by Status</Typography>
                                    <Typography variant="body2" align="center" color="text.secondary">No financial data available.</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Second Row for other charts (equal width) */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Projects by Status and Year */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '400px' }}>
                        <CardContent sx={{ height: '100%', p: 2 }}>
                            {transformedData.length > 0 ? (
                                <Box sx={{ width: '100%', height: '100%' }}>
                                    <StackedBarChart
                                        title="Projects by Status and Year"
                                        data={transformedData}
                                        xDataKey="year"
                                        barKeys={allStatuses}
                                        yAxisLabel="Projects"
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography variant="h6" align="center" gutterBottom>Projects by Status and Year</Typography>
                                    <Typography variant="body2" align="center" color="text.secondary">No data available for this chart.</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Projects Over Time */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '400px' }}>
                        <CardContent sx={{ height: '100%', p: 2 }}>
                            {reportData.projectsStatusOverTime.length > 0 ? (
                                <Box sx={{ width: '100%', height: '100%' }}>
                                    <LineChart
                                        title="Projects Over Time"
                                        data={reportData.projectsStatusOverTime}
                                        xDataKey="year"
                                        yDataKey="projectCount"
                                        yAxisLabel="Projects"
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography variant="h6" align="center" gutterBottom>Projects Over Time</Typography>
                                    <Typography variant="body2" align="center" color="text.secondary">No trend data available.</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Detailed Project List
                </Typography>
                <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={detailedListWithIds}
                        columns={projectListColumns}
                        pageSizeOptions={[5, 10, 25]}
                        disableRowSelectionOnClick
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default ProjectSummaryReport;