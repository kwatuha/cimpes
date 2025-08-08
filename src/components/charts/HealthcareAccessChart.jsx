import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function HealthcareAccessChart({ data }) {
  const chartData = {
    labels: data.map(item => item.access_to_healthcare),
    datasets: [
      {
        label: 'Number of Participants',
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Access to Healthcare Distribution',
        font: { size: 16 }
      },
    },
  };

  return (
    <Card raised>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Access to Healthcare Distribution
        </Typography>
        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Pie data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default HealthcareAccessChart;