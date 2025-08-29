import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#fd7e14', '#6610f2'];

const GenericBarChart = ({ title, data, xDataKey, yDataKey, yAxisLabel, showLegend = true }) => {
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
        <BarChart
          data={data}
          // Adjusted bottom margin to give more space for angled labels
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60, // Increased from 5 to 60
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xDataKey} 
            angle={-45} // Increased angle for more separation
            textAnchor="end" 
            height={70} // Increased height for the labels
            interval={0} 
          />
          <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} tickFormatter={formatYAxis} />
          <Tooltip />
          {showLegend && <Legend />}
          <Bar dataKey={yDataKey}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default GenericBarChart;