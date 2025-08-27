// src/components/charts/DonutChart.jsx

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28C56', '#9B59B6', '#34495E', '#16A085', '#27AE60'];

const DonutChart = ({ title, data }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: '12px' }}>
      <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
      <Box sx={{ height: 250, width: '100%' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
        {data.map((entry, index) => (
          <Box key={`legend-${index}`} sx={{ display: 'flex', alignItems: 'center', mx: 1, mb: 1 }}>
            <Box sx={{ width: 10, height: 10, bgcolor: COLORS[index % COLORS.length], mr: 0.5 }} />
            <Typography variant="body2">{entry.name}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default DonutChart;