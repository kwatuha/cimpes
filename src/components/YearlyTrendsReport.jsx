// src/components/YearlyTrendsReport.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';

import BarLineChart from './charts/BarLineChart';
import ReportDataTable from './tables/ReportDataTable';
import apiService from '../api';

const yearlyTrendsTableColumns = [
    { id: 'name', label: 'Financial Year', minWidth: 150 },
    { id: 'projectCount', label: 'Total Projects', minWidth: 100 },
    { id: 'totalBudget', label: 'Total Budget', minWidth: 150 },
    { id: 'totalPaid', label: 'Total Paid', minWidth: 150 },
];

const YearlyTrendsReport = ({ filters }) => {
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedData = await apiService.reports.getYearlyTrendsReport(filters);
                setReportData(fetchedData);
            } catch (err) {
                setError("Failed to load yearly trends report data.");
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

    // Process the data for the chart
    const chartData = reportData.map(item => ({
        name: item.name,
        budget: parseFloat(item.totalBudget),
        paid: parseFloat(item.totalPaid),
    }));

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>Budget & Payments by Financial Year</Typography>
                <BarLineChart data={chartData} />
            </Box>

            <Box>
                <ReportDataTable data={reportData} columns={yearlyTrendsTableColumns} />
            </Box>
        </Box>
    );
};

export default YearlyTrendsReport;