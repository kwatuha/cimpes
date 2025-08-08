// src/components/charts/DiseasePrevalenceChart.jsx
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

function DiseasePrevalenceChart({ malariaData, dengueData }) {
  const theme = useTheme();

  // Helper to calculate prevalence
  const calculatePrevalence = (data) => {
    return data.map(item =>
      item.total_count > 0 ? ((item.positive_count / item.total_count) * 100).toFixed(2) : 0
    );
  };

  const labels = [...new Set([...malariaData.map(d => d.county), ...dengueData.map(d => d.county)])].sort();

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Malaria Prevalence (%)',
        data: labels.map(county => {
          const item = malariaData.find(d => d.county === county);
          return item ? calculatePrevalence([item])[0] : 0;
        }),
        backgroundColor: theme.palette.primary.main, // KEMRI Blue for Malaria
        borderColor: theme.palette.primary.dark,
        borderWidth: 1,
      },
      {
        label: 'Dengue Prevalence (%)',
        data: labels.map(county => {
          const item = dengueData.find(d => d.county === county);
          return item ? calculatePrevalence([item])[0] : 0;
        }),
        backgroundColor: theme.palette.secondary.main, // Lighter Blue for Dengue
        borderColor: theme.palette.secondary.dark,
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
        labels: {
          color: theme.palette.text.primary,
        }
      },
      title: {
        display: true,
        text: 'Malaria & Dengue Prevalence by County',
        color: theme.palette.primary.main,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y}%`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
        title: {
            display: true,
            text: 'County',
            color: theme.palette.primary.main,
        }
      },
      y: {
        beginAtZero: true,
        max: 100, // Prevalence is a percentage
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Prevalence (%)',
          color: theme.palette.primary.main,
        },
      },
    },
  };

  const hasData = malariaData.length > 0 || dengueData.length > 0;

  return (
    <Card raised sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
        {!hasData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: theme.palette.text.secondary }}>
            <Typography variant="body1">No prevalence data available for selected filters.</Typography>
          </Box>
        ) : (
          <Box sx={{ height: '350px' }}>
            <Bar data={chartData} options={options} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default DiseasePrevalenceChart;