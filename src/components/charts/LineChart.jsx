// src/components/charts/LineChart.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Define a new, sharper color palette for generic line charts
const COLORS = [
  '#007bff', // Bright Blue
  '#dc3545', // Bright Red
  '#ffc107', // Bright Yellow/Orange
  '#28a745', // Bright Green
  '#6f42c1', // Bright Purple
  '#17a2b8', // Bright Cyan
  '#fd7e14', // Bright Orange
  '#6610f2'  // Deep Purple
];

const GenericLineChart = ({ title, data, xDataKey, yDataKey, yAxisLabel, showLegend = true }) => {
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

  const formatYAxis = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value;
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xDataKey} angle={-30} textAnchor="end" height={60} interval={0} />
          <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} tickFormatter={formatYAxis} />
          <Tooltip />
          {showLegend && <Legend />}
          <Line type="monotone" dataKey={yDataKey} stroke={COLORS[0]} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default GenericLineChart;