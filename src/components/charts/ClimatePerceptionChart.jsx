import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function ClimatePerceptionChart({ data }) {
  const chartData = {
    labels: data.map(item => item.climate_perception),
    datasets: [
      {
        label: 'Number of Participants',
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
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
        text: 'Climate Change Perception Distribution',
        font: { size: 16 }
      },
    },
  };

  return (
    <Card raised>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Climate Change Perception Distribution
        </Typography>
        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Pie data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default ClimatePerceptionChart;