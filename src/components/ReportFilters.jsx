// src/components/ReportFilters.jsx

import React from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  useTheme,
  Tooltip,
  Paper // 👈 Add the Paper import here
} from '@mui/material';
import { FilterList as FilterListIcon, Clear as ClearIcon } from '@mui/icons-material';

const ReportFilters = ({ filterState, handleFilterChange, handleApplyFilters, handleClearFilters, allMetadata }) => {
  const theme = useTheme();

  return (
    <Box
      component={Paper}
      elevation={2}
      sx={{ p: 2, mb: 3, borderRadius: '12px' }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        {/* Financial Year Filter */}
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel id="fin-year-label">Financial Year</InputLabel>
          <Select
            labelId="fin-year-label"
            id="finYearId"
            name="finYearId"
            value={filterState.finYearId || ''}
            onChange={handleFilterChange}
            label="Financial Year"
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {allMetadata.financialYears && allMetadata.financialYears.map(year => (
              <MenuItem key={year.finYearId} value={year.finYearId}>
                {year.finYearName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Project Status Filter */}
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel id="status-label">Project Status</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            name="status"
            value={filterState.status || ''}
            onChange={handleFilterChange}
            label="Project Status"
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {/* You will need a way to get all possible project statuses, 
                likely from your allMetadata object */}
            {allMetadata.projectStatuses && allMetadata.projectStatuses.map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
          sx={{ borderColor: theme.palette.grey[400] }}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
          onClick={handleApplyFilters}
          sx={{ backgroundColor: theme.palette.primary.main }}
        >
          Apply Filters
        </Button>
      </Stack>
    </Box>
  );
};

export default ReportFilters;