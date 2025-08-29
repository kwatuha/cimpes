import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

import { getProjectStatusBackgroundColor } from '../../utils/projectStatusColors';

const ProjectStatusDonutChart = ({ title, data }) => {
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
            nameKey="name" // Important for the Legend to work
            // Removed the `label` prop to prevent label overlap
          >
            {/* Use the specific color utility for status-based coloring */}
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getProjectStatusBackgroundColor(entry.name)} />
            ))}
          </Pie>
          {/* Use a custom formatter for a clear tooltip */}
          <Tooltip formatter={(value, name) => [value, name]} />
          {/* Add a Legend to clearly identify each segment */}
          <Legend layout="horizontal" align="center" verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ProjectStatusDonutChart;