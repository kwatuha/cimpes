// src/components/DepartmentSummaryReport.jsx

import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

// Import our new DonutChart component
import DonutChart from './charts/DonutChart'; 

// We will build these components in the next steps
import BarLineChart from './charts/BarLineChart';
import ReportDataTable from './tables/ReportDataTable';

const DepartmentSummaryReport = ({ data }) => {
    if (!data || data.length === 0) {
        return <Typography>No data to display for this report.</Typography>;
    }

    // Process the raw data for the charts
    const projectCountData = data.map(item => ({
        name: item.departmentName,
        value: item.projectCount,
    }));
    
    // Process the data for the bar/line chart (still a placeholder)
    const barLineChartData = data.map(item => ({
        name: item.departmentName,
        budget: parseFloat(item.totalBudget),
        paid: parseFloat(item.totalPaid),
        absorptionRate: parseFloat(item.absorptionRate),
    }));

    return (
        <Box>
            {/* Donut Charts Section */}
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <DonutChart title="# of Projects by Department" data={projectCountData} />
                </Grid>
                {/* You can add another donut chart here once we have the data,
                    for example, a chart showing total budget by department */}
            </Grid>

            {/* Main Bar/Line Chart Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>Project Budget/Contract Sum</Typography>
                <BarLineChart data={barLineChartData} />
            </Box>

            {/* Data Table Section */}
            <Box>
                <ReportDataTable data={data} />
            </Box>
        </Box>
    );
};

export default DepartmentSummaryReport;