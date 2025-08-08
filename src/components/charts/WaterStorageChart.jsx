import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function WaterStorageChart({ data }) {
  const chartData = {
    labels: data.map(item => item.water_storage_practices),
    datasets: [
      {
        label: 'Number of Households',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
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
        text: 'Water Storage Practices Distribution',
        font: { size: 16 }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Water Storage Practice'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Households'
        }
      }
    }
  };

  return (
    <Card raised>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Water Storage Practices Distribution
        </Typography>
        <Box sx={{ height: 300 }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default WaterStorageChart;