// src/components/FilterPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import apiService from '../api';

const initialFilters = {
  county: 'All',
  subCounty: 'All',
  gender: 'All',
  minAge: '',
  maxAge: '',
  occupation: 'All',
  educationLevel: 'All',
  malariaStatus: 'All',
  dengueStatus: 'All',
  mosquitoNetUse: 'All',
  minRainfall: '',
  maxRainfall: '',
  minTemp: '',
  maxTemp: '',
  minHouseholdSize: '',
  maxHouseholdSize: '',
  healthcareAccess: 'All',
  searchIndividualId: '',
};

function FilterPanel({ onApplyFilters }) {
  const [filters, setFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const options = await apiService.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleApply = () => {
    onApplyFilters({ ...filters });
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onApplyFilters(initialFilters);
  };

  if (loadingOptions) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Filters...</Typography>
      </Box>
    );
  }

  return (
    <Accordion defaultExpanded sx={{ mb: 3, boxShadow: 3 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="filter-panel-content"
        id="filter-panel-header"
        sx={{ backgroundColor: 'primary.main', color: 'white' }}
      >
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'white' }}>Filter Data</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Search by Individual ID */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Individual ID"
              name="searchIndividualId"
              value={filters.searchIndividualId}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          {/* Geographic Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>County</InputLabel>
              <Select
                name="county"
                value={filters.county}
                onChange={handleChange}
                label="County"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.counties?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sub-County</InputLabel>
              <Select
                name="subCounty"
                value={filters.subCounty}
                onChange={handleChange}
                label="Sub-County"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.subCounties?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Demographic Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={filters.gender}
                onChange={handleChange}
                label="Gender"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.genders?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Age"
              name="minAge"
              type="number"
              value={filters.minAge}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Age"
              name="maxAge"
              type="number"
              value={filters.maxAge}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Occupation</InputLabel>
              <Select
                name="occupation"
                value={filters.occupation}
                onChange={handleChange}
                label="Occupation"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.occupations?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Education Level</InputLabel>
              <Select
                name="educationLevel"
                value={filters.educationLevel}
                onChange={handleChange}
                label="Education Level"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.educationLevels?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Health Status Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Malaria Status</InputLabel>
              <Select
                name="malariaStatus"
                value={filters.malariaStatus}
                onChange={handleChange}
                label="Malaria Status"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.malariaStatuses?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Dengue Status</InputLabel>
              <Select
                name="dengueStatus"
                value={filters.dengueStatus}
                onChange={handleChange}
                label="Dengue Status"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.dengueStatuses?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Mosquito Net Use</InputLabel>
              <Select
                name="mosquitoNetUse"
                value={filters.mosquitoNetUse}
                onChange={handleChange}
                label="Mosquito Net Use"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.mosquitoNetUses?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Environmental Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Rainfall (mm)"
              name="minRainfall"
              type="number"
              value={filters.minRainfall}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Rainfall (mm)"
              name="maxRainfall"
              type="number"
              value={filters.maxRainfall}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Temp (°C)"
              name="minTemp"
              type="number"
              value={filters.minTemp}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Temp (°C)"
              name="maxTemp"
              type="number"
              value={filters.maxTemp}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          {/* Household Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Household Size"
              name="minHouseholdSize"
              type="number"
              value={filters.minHouseholdSize}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Household Size"
              name="maxHouseholdSize"
              type="number"
              value={filters.maxHouseholdSize}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Healthcare Access</InputLabel>
              <Select
                name="healthcareAccess"
                value={filters.healthcareAccess}
                onChange={handleChange}
                label="Healthcare Access"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.healthcareAccessOptions?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="contained"
              onClick={handleApply}
              startIcon={<FilterListIcon />}
              sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<ClearAllIcon />}
              color="secondary"
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

export default FilterPanel;