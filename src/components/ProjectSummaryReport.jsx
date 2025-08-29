import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert, Card, CardContent } from '@mui/material';

import ReportDataTable from './tables/ReportDataTable';
import apiService from '../api';
import ExportButtons from './ExportButtons';

import ProjectStatusDonutChart from './charts/ProjectStatusDonutChart';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';
import StackedBarChart from './charts/StackedBarChart';

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

    const hasData = reportData.detailedList.length > 0 ||
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
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Comprehensive Project Overview
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }} justifyContent="center">
            {/* Projects by Status - Donut Chart (smaller container) */}
            <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: '100%', width: '100%' }}> {/* Add width: '100%' */}
                    <CardContent>
                        {donutChartData.length > 0 ? (
                            <ProjectStatusDonutChart title="# of Projects by Status" data={donutChartData} />
                        ) : (
                            <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                                <Typography variant="h6" align="center" gutterBottom># of Projects by Status</Typography>
                                <Typography variant="body2" align="center" color="text.secondary">No status data available.</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* Budget & Paid by Status (wider container) */}
            <Grid item xs={12} md={6} lg={8}>
                <Card sx={{ height: '100%', width: '100%', bgcolor: '#f5f5dc' }}> {/* Add width: '100%' and background color */}
                    <CardContent>
                        {reportData.financialStatusByProjectStatus.length > 0 ? (
                            <BarChart
                                title="Budget & Paid by Status"
                                data={reportData.financialStatusByProjectStatus}
                                xDataKey="status"
                                yDataKey={['totalBudget', 'totalPaid']}
                                yAxisLabel="Amount (Ksh)"
                            />
                        ) : (
                            <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                                <Typography variant="h6" align="center" gutterBottom>Budget & Paid by Status</Typography>
                                <Typography variant="body2" align="center" color="text.secondary">No financial data available.</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        
        {/* Second Row for other charts */}
        <Grid container spacing={4} sx={{ mb: 4 }} justifyContent="center">
            {/* Projects by Status and Year (50% width) */}
            <Grid item xs={12} md={6} lg={6}>
                <Card sx={{ height: '100%', width: '100%' }}> {/* Add width: '100%' */}
                    <CardContent>
                        {transformedData.length > 0 ? (
                            <StackedBarChart
                                title="Projects by Status and Year"
                                data={transformedData}
                                xDataKey="year"
                                barKeys={allStatuses}
                                yAxisLabel="Projects"
                            />
                        ) : (
                            <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                                <Typography variant="h6" align="center" gutterBottom>Projects by Status and Year</Typography>
                                <Typography variant="body2" align="center" color="text.secondary">No data available for this chart.</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            {/* Projects Over Time (50% width) */}
            <Grid item xs={12} md={6} lg={6}>
                <Card sx={{ height: '100%', width: '100%' }}> {/* Add width: '100%' */}
                    <CardContent>
                        {reportData.projectsStatusOverTime.length > 0 ? (
                            <LineChart
                                title="Projects Over Time"
                                data={reportData.projectsStatusOverTime}
                                xDataKey="year"
                                yDataKey="projectCount"
                                yAxisLabel="Projects"
                            />
                        ) : (
                            <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                                <Typography variant="h6" align="center" gutterBottom>Projects Over Time</Typography>
                                <Typography variant="body2" align="center" color="text.secondary">No trend data available.</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
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