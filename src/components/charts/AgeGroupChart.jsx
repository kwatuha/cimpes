
// src/components/charts/AgeGroupChart.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function AgeGroupChart({ data }) {
  const theme = useTheme();

  const backgroundColors = [
    '#FFC107', // Amber
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#FF5722', // Deep Orange
  ];

  const chartData = {
    labels: data.map(item => item.age_group || 'Unknown'),
    datasets: [
      {
        label: 'Number of Participants',
        data: data.map(item => item.count),
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color), // Use same color for border
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // Place legend to the right for better space
        labels: {
          color: theme.palette.text.primary,
        }
      },
      title: {
        display: true,
        text: 'Age Group Distribution',
        color: theme.palette.primary.main,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-US').format(context.parsed) + ' participants';
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <Card raised sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
        {data.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: theme.palette.text.secondary }}>
            <Typography variant="body1">No age group data available for selected filters.</Typography>
          </Box>
        ) : (
          <Box sx={{ height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}> {/* Adjusted height for Pie chart */}
            <Pie data={chartData} options={options} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default AgeGroupChart;