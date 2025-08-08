import React from 'react';
import { Bar } from 'react-chartjs-2';
 
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function EducationLevelChart({ data }) {
  const chartData = {
    labels: data.map(item => item.education_level),
    datasets: [
      {
        label: 'Number of Participants',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
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
        text: 'Education Level Distribution',
        font: { size: 16 }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Education Level'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Participants'
        }
      }
    }
  };

  return (
    <Card raised>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Education Level Distribution
        </Typography>
        <Box sx={{ height: 300 }}> {/* Fixed height for consistency */}
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default EducationLevelChart;