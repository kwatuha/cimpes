import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function HouseholdSizeChart({ data }) {
  const chartData = {
    labels: data.map(item => item.household_size_group),
    datasets: [
      {
        label: 'Number of Households',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
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
        text: 'Household Size Distribution',
        font: { size: 16 }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Household Size Group'
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
          Household Size Distribution
        </Typography>
        <Box sx={{ height: 300 }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default HouseholdSizeChart;