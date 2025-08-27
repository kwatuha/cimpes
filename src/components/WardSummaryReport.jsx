// src/components/WardSummaryReport.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';

import DonutChart from './charts/DonutChart';
import BarLineChart from './charts/BarLineChart';
import ReportDataTable from './tables/ReportDataTable';
import apiService from '../api';

const wardTableColumns = [
    { id: 'name', label: 'Ward Name', minWidth: 150 },
    { id: 'subcountyName', label: 'Subcounty', minWidth: 150 },
    { id: 'countyName', label: 'County', minWidth: 150 },
    { id: 'projectCount', label: 'Total Projects', minWidth: 100 },
    { id: 'totalBudget', label: 'Total Budget', minWidth: 150 },
    { id: 'totalPaid', label: 'Total Paid', minWidth: 150 },
];

const WardSummaryReport = ({ filters }) => {
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // This console log will help us debug if the API call is being triggered
        console.log('Fetching Ward Summary Report with filters:', filters);

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedData = await apiService.reports.getWardSummaryReport(filters);
                setReportData(Array.isArray(fetchedData) ? fetchedData : []);
            } catch (err) {
                setError("Failed to load ward summary report data.");
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
                    <DonutChart title="# of Projects by Ward" data={donutChartData} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <BarLineChart title="Budget & Payments by Ward" data={barLineChartData} />
                </Grid>
            </Grid>

            <Box>
                <ReportDataTable data={reportData} columns={wardTableColumns} />
            </Box>
        </Box>
    );
};

export default WardSummaryReport;