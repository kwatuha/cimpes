import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Color palette for multiple bars
const BAR_COLORS = ['#3f51b5', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];

// Function to format large numbers for the Y-axis
const formatLargeNumber = (value) => {
  if (value === null) return 'N/A';
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return value.toLocaleString();
};

const BarChart = ({ title, data, xDataKey, yDataKey, yAxisLabel, horizontal = false }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
        <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          No data available.
        </Typography>
      </Box>
    );
  }

  // Determine if we are using a single or multiple bars
  const dataKeys = Array.isArray(yDataKey) ? yDataKey : [yDataKey];

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {horizontal ? (
            <XAxis type="number" label={{ value: yAxisLabel, angle: 0, position: 'bottom' }} />
          ) : (
            <XAxis
              dataKey={xDataKey}
              interval={0} // Ensure all labels are displayed
              angle={-45} // Rotate labels to prevent overlap
              textAnchor="end" // Align text to the end after rotation
              height={80} // Increase height to prevent labels from being cut off
            />
          )}
          {horizontal ? (
            <YAxis dataKey={xDataKey} type="category" />
          ) : (
            <YAxis
              type="number"
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              tickFormatter={formatLargeNumber}
            />
          )}
          <Tooltip formatter={(value) => formatLargeNumber(value)} />
          <Legend />
          {/* Render a bar for each data key */}
          {dataKeys.map((key, index) => (
            <Bar key={key} dataKey={key} fill={BAR_COLORS[index % BAR_COLORS.length]} />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChart;