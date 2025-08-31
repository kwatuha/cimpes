// src/components/SubcountySummaryReport.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import DonutChart from './charts/DonutChart';
import BarLineChart from './charts/BarLineChart';
import apiService from '../api';

// Define columns for the detailed project list table
const subcountyTableColumns = [
    { field: 'name', headerName: 'Subcounty Name', minWidth: 170, flex: 1.2 },
    { field: 'countyName', headerName: 'County', minWidth: 150, flex: 1 },
    { field: 'projectCount', headerName: 'Total Projects', minWidth: 100, type: 'number', flex: 0.8 },
    {
        field: 'totalBudget',
        headerName: 'Total Budget',
        minWidth: 150,
        type: 'number',
        flex: 1,
        valueFormatter: (params) => {
            if (params.value === null || params.value === undefined) {
                return 'N/A';
            }
            // Format as KES currency
            return `KES ${parseFloat(params.value).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    },
    {
        field: 'totalPaid',
        headerName: 'Total Paid',
        minWidth: 150,
        type: 'number',
        flex: 1,
        valueFormatter: (params) => {
            if (params.value === null || params.value === undefined) {
                return 'N/A';
            }
            // Format as KES currency
            return `KES ${parseFloat(params.value).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    },
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
                // Map over the fetched data to add a unique 'id' field
                const dataWithIds = fetchedData.map((row, index) => ({
                    ...row,
                    id: row.subcountyId ? row.subcountyId : index,
                }));
                setReportData(dataWithIds);
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
                <Grid item xs={12} sm={6}>
                    <BarLineChart title="Budget & Payments by Subcounty" data={barLineChartData} />
                </Grid>
            </Grid>

            <Box sx={{ height: 600, width: '100%', mt: 4 }}>
                <DataGrid
                    rows={reportData}
                    columns={subcountyTableColumns}
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
    );
};

export default SubcountySummaryReport;