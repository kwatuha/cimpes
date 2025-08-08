// src/components/charts/GenderChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function GenderChart({ data }) {
  const theme = useTheme();

  const chartData = {
    labels: data.map(item => item.gender || 'Unknown'), // Handle potential null/empty
    datasets: [
      {
        label: 'Number of Participants',
        data: data.map(item => item.count),
        backgroundColor: [
          theme.palette.primary.main, // KEMRI Blue
          theme.palette.secondary.main, // Lighter blue
          '#9E9E9E', // Grey for "Other/Unknown"
        ],
        borderColor: [
          theme.palette.primary.dark,
          theme.palette.secondary.dark,
          '#616161',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows the chart to fill the parent container
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.primary,
        }
      },
      title: {
        display: true,
        text: 'Gender Distribution',
        color: theme.palette.primary.main,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: theme.palette.text.secondary,
          precision: 0 // Ensure whole numbers for counts
        },
        title: {
          display: true,
          text: 'Count',
          color: theme.palette.primary.main,
        },
      },
    },
  };

  return (
    <Card raised sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
        {data.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: theme.palette.text.secondary }}>
            <Typography variant="body1">No gender data available for selected filters.</Typography>
          </Box>
        ) : (
          <Box sx={{ height: '350px' }}> {/* Fixed height for the chart container */}
            <Bar data={chartData} options={options} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default GenderChart;