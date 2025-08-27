import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const BarLineChart = ({ title, data, barKeys = [], lineKeys = [], xDataKey = 'name', yAxisLabel = '' }) => {
  // Defensive check for data
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
        <Typography variant="h6" align="center" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          No data available.
        </Typography>
      </Box>
    );
  }

  // Get all keys from the first data object to determine chart elements
  const allDataKeys = Object.keys(data[0]);

  // If no specific keys are provided, default to all non-x-axis keys
  const resolvedBarKeys = barKeys.length > 0 ? barKeys : allDataKeys.filter(key => key !== xDataKey);
  const resolvedLineKeys = lineKeys.length > 0 ? lineKeys : [];

  // Function to generate a random color for each bar/line
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const hasBars = resolvedBarKeys.length > 0;
  const hasLines = resolvedLineKeys.length > 0;

  // Use a ComposedChart to combine both bar and line charts
  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xDataKey} />
          <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {hasBars && resolvedBarKeys.map(key => (
            <Bar key={key} dataKey={key} fill={getRandomColor()} />
          ))}
          {hasLines && resolvedLineKeys.map(key => (
            <Line key={key} type="monotone" dataKey={key} stroke={getRandomColor()} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarLineChart;