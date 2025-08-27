// src/components/charts/BarLineChart.jsx

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value;
};

const formatPercentage = (value) => {
    return `${(value * 100).toFixed(0)}%`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const budgetEntry = payload.find(p => p.dataKey === 'budget');
    const paidEntry = payload.find(p => p.dataKey === 'paid');
    const absorptionRateEntry = payload.find(p => p.dataKey === 'absorptionRate');

    return (
      <Paper elevation={3} sx={{ p: 1.5, minWidth: 200 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{`Department: ${label}`}</Typography>
        <Typography variant="body2" color="#8884d8">{`Budget: ${formatCurrency(budgetEntry?.value || 0)}`}</Typography>
        <Typography variant="body2" color="#82ca9d">{`Paid: ${formatCurrency(paidEntry?.value || 0)}`}</Typography>
        <Typography variant="body2" color="#ff7300">{`Absorption Rate: ${formatPercentage(absorptionRateEntry?.value || 0)}`}</Typography>
      </Paper>
    );
  }
  return null;
};

const BarLineChart = ({ data }) => {
  return (
    <Box sx={{ p: 2, minHeight: 400 }}>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" tickFormatter={formatCurrency} label={{ value: 'Budget / Amount Paid', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={formatPercentage} domain={[0, 1]} label={{ value: 'Absorption Rate', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar yAxisId="left" dataKey="budget" name="Total Budget" fill="#8884d8" />
          <Bar yAxisId="left" dataKey="paid" name="Total Paid" fill="#82ca9d" />
          <Line yAxisId="right" dataKey="absorptionRate" name="Absorption Rate" stroke="#ff7300" />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarLineChart;