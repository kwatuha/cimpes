import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

import { getProjectStatusBackgroundColor } from '../../utils/projectStatusColors';

const ProjectStatusDonutChart = ({ title, data }) => {
  // If there's no data, display a placeholder message
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

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label
          >
            {/* Use the specific color utility for status-based coloring */}
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getProjectStatusBackgroundColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ProjectStatusDonutChart;