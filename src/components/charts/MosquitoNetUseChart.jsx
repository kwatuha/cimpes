import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function MosquitoNetUseChart({ data }) {
  const chartData = {
    labels: data.map(item => item.mosquito_net_use),
    datasets: [
      {
        label: 'Number of Participants',
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', // Yes
          'rgba(54, 162, 235, 0.6)', // No
          'rgba(255, 206, 86, 0.6)', // Don't know / N/A
        ],
        borderColor: [
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
        text: 'Mosquito Net Use Distribution',
        font: { size: 16 }
      },
    },
  };

  return (
    <Card raised>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Mosquito Net Use Distribution
        </Typography>
        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Pie data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default MosquitoNetUseChart;