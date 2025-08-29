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

const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#fd7e14', '#6610f2'];

const getColorForKey = (key) => {
  const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
};

const BarLineChart = ({ title, data, barKeys = [], lineKeys = [], xDataKey = 'name', yAxisLabel = '', horizontal = false }) => {
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

  const allDataKeys = Object.keys(data[0]);
  const resolvedBarKeys = barKeys.length > 0 ? barKeys : allDataKeys.filter(key => key !== xDataKey && data.every(d => typeof d[key] === 'number'));
  const resolvedLineKeys = lineKeys.length > 0 ? lineKeys : [];

  const hasBars = resolvedBarKeys.length > 0;
  const hasLines = resolvedLineKeys.length > 0;

  const chartLayout = horizontal ? 'vertical' : 'horizontal';
  const margin = horizontal ? { top: 20, right: 30, left: 100, bottom: 20 } : { top: 20, right: 30, left: 20, bottom: 60 };

  const renderXAxis = () => (
    <XAxis
      dataKey={horizontal ? undefined : xDataKey}
      type={horizontal ? 'number' : 'category'}
      angle={horizontal ? 0 : -45}
      textAnchor={horizontal ? 'middle' : 'end'}
      height={horizontal ? 30 : 70}
      interval={0}
    />
  );

  const renderYAxis = () => (
    <YAxis
      dataKey={horizontal ? xDataKey : undefined}
      type={horizontal ? 'category' : 'number'}
      label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
    />
  );

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} layout={chartLayout} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" />
          {renderXAxis()}
          {renderYAxis()}
          <Tooltip />
          <Legend />
          {hasBars && resolvedBarKeys.map(key => (
            <Bar key={key} dataKey={key} fill={getColorForKey(key)} />
          ))}
          {hasLines && resolvedLineKeys.map(key => (
            <Line key={key} type="monotone" dataKey={key} stroke={getColorForKey(key)} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarLineChart;