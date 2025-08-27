// src/components/SubcountySummaryReport.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';

import DonutChart from './charts/DonutChart';
import BarLineChart from './charts/BarLineChart';
import ReportDataTable from './tables/ReportDataTable';
import apiService from '../api';

const subcountyTableColumns = [
    { id: 'name', label: 'Subcounty Name', minWidth: 170 },
    { id: 'countyName', label: 'County', minWidth: 150 },
    { id: 'projectCount', label: 'Total Projects', minWidth: 100 },
    { id: 'totalBudget', label: 'Total Budget', minWidth: 150 },
    { id: 'totalPaid', label: 'Total Paid', minWidth: 150 },
];

const SubcountySummaryReport = ({ filters }) => {
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedData = await apiService.reports.getSubcountySummaryReport(filters);
                setReportData(fetchedData);
            } catch (err) {
                setError("Failed to load subcounty summary report data.");
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

    // Process the data for the charts
    const donutChartData = reportData.map(item => ({
        name: item.name,
        value: item.projectCount,
    }));
    
    const barLineChartData = reportData.map(item => ({
        name: item.name,
        budget: parseFloat(item.totalBudget),
        paid: parseFloat(item.totalPaid),
    }));

    return (
        <Box>
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <DonutChart title="# of Projects by Subcounty" data={donutChartData} />
                </Grid>
                {/* Add a BarLineChart if you need to visualize budget vs paid */}
                <Grid item xs={12} sm={6}>
                    <BarLineChart title="Budget & Payments by Subcounty" data={barLineChartData} />
                </Grid>
            </Grid>

            <Box>
                <ReportDataTable data={reportData} columns={subcountyTableColumns} />
            </Box>
        </Box>
    );
};

export default SubcountySummaryReport;